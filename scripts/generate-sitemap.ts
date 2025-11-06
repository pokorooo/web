#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';

const SITE_URL = 'https://www.pokoro.tech';
const MAX_URLS_PER_FILE = 50000;
const MAX_FILE_SIZE_MB = 50;
const OUTPUT_DIR = path.resolve(process.cwd());
const SITEMAPS_DIR = path.join(OUTPUT_DIR, 'sitemaps');

interface SitemapUrl {
  url: string;
  lastmod?: string;
  alternates?: Array<{ lang: string; url: string }>;
}

interface VercelRewrite {
  source: string;
  destination: string;
}

class SitemapGenerator {
  private urls: SitemapUrl[] = [];
  private seenUrls = new Set<string>();
  private duplicates = 0;

  async generate(): Promise<void> {
    console.log('🚀 Starting sitemap generation for pokoro.tech...');
    
    try {
      // 1. Collect all URLs
      await this.collectUrls();
      
      // 2. Validate and deduplicate
      this.validateUrls();
      
      // 3. Generate sitemap files
      await this.generateSitemapFiles();
      
      // 4. Update robots.txt
      await this.updateRobotsTxt();
      
      // 5. Log summary
      this.logSummary();
      
      console.log('✅ Sitemap generation completed successfully!');
    } catch (error) {
      console.error('❌ Sitemap generation failed:', error);
      process.exit(1);
    }
  }

  private async collectUrls(): Promise<void> {
    console.log('📂 Collecting URLs...');
    
    // Add homepage
    this.addUrl('/', await this.getLastModified('portfolio.html'));
    
    // Collect from static HTML files
    await this.collectStaticUrls();
    
    // Add URLs from Vercel rewrites
    await this.collectVercelRewrites();
  }

  private async collectStaticUrls(): Promise<void> {
    const directories = ['tool', 'game'];
    
    for (const dir of directories) {
      const dirPath = path.join(process.cwd(), dir);
      try {
        await this.scanDirectory(dirPath, `/${dir}`);
      } catch (error) {
        console.warn(`⚠️  Could not scan directory: ${dir}`);
      }
    }
  }

  private async scanDirectory(dirPath: string, urlPrefix: string): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && !this.shouldExcludeDirectory(entry.name)) {
          const subDirPath = path.join(dirPath, entry.name);
          const indexPath = path.join(subDirPath, 'index.html');

          // そのディレクトリ直下に index.html がある場合は、ディレクトリURLを追加
          try {
            await fs.access(indexPath);
            const urlPath = `${urlPrefix}/${entry.name}`;
            const lastmod = await this.getLastModified(path.relative(process.cwd(), indexPath));
            this.addUrl(urlPath, lastmod);
          } catch {
            // index.html が無くても引き続き再帰的に走査
          }

          // index.html の有無に関わらず、配下も走査（非 index の .html を拾うため）
          await this.scanDirectory(subDirPath, `${urlPrefix}/${entry.name}`);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
          // 直下の .html をURL化。index.html はディレクトリURLに正規化し、それ以外はファイル名を残す
          const isIndex = entry.name.toLowerCase() === 'index.html';
          const urlPath = isIndex ? urlPrefix : `${urlPrefix}/${entry.name}`;
          const filePath = path.relative(process.cwd(), path.join(dirPath, entry.name));
          const lastmod = await this.getLastModified(filePath);
          this.addUrl(urlPath, lastmod);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not read directory: ${dirPath}`);
    }
  }

  private async collectVercelRewrites(): Promise<void> {
    try {
      const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
      const vercelConfig = JSON.parse(await fs.readFile(vercelConfigPath, 'utf-8'));
      
      if (vercelConfig.rewrites) {
        for (const rewrite of vercelConfig.rewrites as VercelRewrite[]) {
          // Skip dynamic routes and API routes
          if (rewrite.source.includes('(.*)') || rewrite.source.includes('/api/')) {
            continue;
          }
          
          // Normalize source path
          const normalizedPath = this.normalizePath(rewrite.source);
          if (normalizedPath && !this.seenUrls.has(normalizedPath)) {
            const lastmod = await this.getLastModifiedFromDestination(rewrite.destination);
            this.addUrl(normalizedPath, lastmod);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not read vercel.json');
    }
  }

  private shouldExcludeDirectory(name: string): boolean {
    const excludePatterns = [
      'node_modules', '__tests__', 'test', 'tests', '.git', '.vercel',
      'draft', 'drafts', 'api', 'build', 'dist', '.next'
    ];
    return excludePatterns.some(pattern => name.includes(pattern));
  }

  private normalizePath(path: string): string {
    // Remove trailing slash except for root
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    // Ensure leading slash
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    return path;
  }

  private addUrl(path: string, lastmod?: string): void {
    const normalizedPath = this.normalizePath(path);
    const fullUrl = `${SITE_URL}${normalizedPath}`;
    
    if (this.seenUrls.has(normalizedPath)) {
      this.duplicates++;
      return;
    }
    
    this.seenUrls.add(normalizedPath);
    this.urls.push({
      url: fullUrl,
      lastmod
    });
  }

  private async getLastModified(filePath: string): Promise<string | undefined> {
    try {
      // Try to get last commit date for the file
      const gitCommand = `git log -1 --format=%cI "${filePath}" 2>/dev/null`;
      const gitDate = execSync(gitCommand, { encoding: 'utf-8' }).trim();
      
      if (gitDate) {
        return new Date(gitDate).toISOString().split('T')[0];
      }
    } catch {
      // Git command failed, fallback to file mtime
    }
    
    try {
      const stats = await fs.stat(path.join(process.cwd(), filePath));
      return stats.mtime.toISOString().split('T')[0];
    } catch {
      // File doesn't exist or can't be accessed
      return new Date().toISOString().split('T')[0];
    }
  }

  private async getLastModifiedFromDestination(destination: string): Promise<string | undefined> {
    // Extract file path from destination
    let filePath = destination;
    if (filePath.startsWith('/')) {
      filePath = filePath.slice(1);
    }
    
    return this.getLastModified(filePath);
  }

  private validateUrls(): void {
    console.log('🔍 Validating URLs...');
    
    // Remove any invalid URLs
    this.urls = this.urls.filter(urlData => {
      try {
        new URL(urlData.url);
        return true;
      } catch {
        console.warn(`⚠️  Invalid URL removed: ${urlData.url}`);
        return false;
      }
    });
    
    // Sort URLs alphabetically for consistent output
    this.urls.sort((a, b) => a.url.localeCompare(b.url));
  }

  private async generateSitemapFiles(): Promise<void> {
    console.log('📝 Generating sitemap files...');
    
    // Ensure sitemaps directory exists
    try {
      await fs.mkdir(SITEMAPS_DIR, { recursive: true });
    } catch {
      // Directory already exists
    }
    
    if (this.urls.length <= MAX_URLS_PER_FILE) {
      // Single sitemap file
      await this.generateSingleSitemap();
    } else {
      // Multiple sitemap files with index
      await this.generateMultipleSitemaps();
    }
  }

  private async generateSingleSitemap(): Promise<void> {
    const sitemapPath = path.join(OUTPUT_DIR, 'sitemap.xml');
    const content = this.generateSitemapXml(this.urls);
    
    await fs.writeFile(sitemapPath, content);
    console.log(`✅ Generated sitemap.xml with ${this.urls.length} URLs`);
    
    // Generate gzipped version
    await this.gzipFile(sitemapPath);
  }

  private async generateMultipleSitemaps(): Promise<void> {
    const chunks = this.chunkUrls(this.urls);
    const sitemapFiles: string[] = [];
    
    // Generate individual sitemap files
    for (let i = 0; i < chunks.length; i++) {
      const filename = `sitemap-${i + 1}.xml`;
      const filePath = path.join(SITEMAPS_DIR, filename);
      const content = this.generateSitemapXml(chunks[i]);
      
      await fs.writeFile(filePath, content);
      sitemapFiles.push(`${SITE_URL}/sitemaps/${filename}`);
      
      // Generate gzipped version
      await this.gzipFile(filePath);
    }
    
    // Generate sitemap index
    await this.generateSitemapIndex(sitemapFiles);
    
    console.log(`✅ Generated ${chunks.length} sitemap files with ${this.urls.length} total URLs`);
  }

  private chunkUrls(urls: SitemapUrl[]): SitemapUrl[][] {
    const chunks: SitemapUrl[][] = [];
    
    for (let i = 0; i < urls.length; i += MAX_URLS_PER_FILE) {
      chunks.push(urls.slice(i, i + MAX_URLS_PER_FILE));
    }
    
    return chunks;
  }

  private generateSitemapXml(urls: SitemapUrl[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    for (const urlData of urls) {
      xml += '  <url>\n';
      xml += `    <loc>${this.escapeXml(urlData.url)}</loc>\n`;
      
      if (urlData.lastmod) {
        xml += `    <lastmod>${urlData.lastmod}</lastmod>\n`;
      }
      
      xml += '  </url>\n';
    }
    
    xml += '</urlset>\n';
    return xml;
  }

  private async generateSitemapIndex(sitemapFiles: string[]): Promise<void> {
    const indexPath = path.join(OUTPUT_DIR, 'sitemap.xml');
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    for (const sitemapUrl of sitemapFiles) {
      xml += '  <sitemap>\n';
      xml += `    <loc>${this.escapeXml(sitemapUrl)}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += '  </sitemap>\n';
    }
    
    xml += '</sitemapindex>\n';
    
    await fs.writeFile(indexPath, xml);
    console.log('✅ Generated sitemap index');
  }

  private async gzipFile(filePath: string): Promise<void> {
    const gzipPath = `${filePath}.gz`;
    
    try {
      await pipeline(
        createReadStream(filePath),
        createGzip(),
        createWriteStream(gzipPath)
      );
      
      console.log(`✅ Generated ${path.basename(gzipPath)}`);
    } catch (error) {
      console.warn(`⚠️  Could not generate gzip for ${path.basename(filePath)}`);
    }
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private async updateRobotsTxt(): Promise<void> {
    console.log('🤖 Updating robots.txt...');
    
    const robotsPath = path.join(OUTPUT_DIR, 'robots.txt');
    const sitemapLine = `Sitemap: ${SITE_URL}/sitemap.xml`;
    
    try {
      let content = '';
      
      try {
        content = await fs.readFile(robotsPath, 'utf-8');
      } catch {
        // File doesn't exist, create new one
        content = 'User-agent: *\nAllow: /\n';
      }
      
      // Check if sitemap line already exists
      if (!content.includes(sitemapLine)) {
        // Add sitemap line at the end
        if (!content.endsWith('\n')) {
          content += '\n';
        }
        content += sitemapLine + '\n';
        
        await fs.writeFile(robotsPath, content);
        console.log('✅ Updated robots.txt with sitemap reference');
      } else {
        console.log('ℹ️  robots.txt already contains sitemap reference');
      }
    } catch (error) {
      console.warn('⚠️  Could not update robots.txt:', error);
    }
  }

  private logSummary(): void {
    console.log('\n📊 Generation Summary:');
    console.log(`   Total URLs: ${this.urls.length}`);
    console.log(`   Duplicates removed: ${this.duplicates}`);
    console.log(`   Files generated: ${this.urls.length > MAX_URLS_PER_FILE ? 'Multiple sitemaps + index' : 'Single sitemap'}`);
    
    if (this.urls.length > 0) {
      console.log(`   First URL: ${this.urls[0].url}`);
      console.log(`   Last URL: ${this.urls[this.urls.length - 1].url}`);
    }
    
    console.log(`   Output location: ${OUTPUT_DIR}`);
  }
}

// Run the generator
if (require.main === module) {
  const generator = new SitemapGenerator();
  generator.generate();
}

export default SitemapGenerator;
