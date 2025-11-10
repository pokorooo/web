import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

interface HistoryItem {
  originalUrl: string;
  shortUrl: string;
  service: string;
  timestamp: number;
}

const UrlShortener: React.FC = () => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [selectedService, setSelectedService] = useState('tinyurl');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('urlShortenerHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const isValidUrl = (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const shortenUrl = async () => {
    if (!url.trim()) {
      setError('URLを入力してください');
      return;
    }

    if (!isValidUrl(url)) {
      setError('有効なURLを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');
    setShortUrl('');

    try {
      const encodedUrl = encodeURIComponent(url);
      let apiUrl = '';

      if (selectedService === 'tinyurl') {
        apiUrl = `https://tinyurl.com/api-create.php?url=${encodedUrl}`;
      } else if (selectedService === 'isgd') {
        apiUrl = `https://is.gd/create.php?format=simple&url=${encodedUrl}`;
      }

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('短縮URLの生成に失敗しました');
      }

      const result = await response.text();
      
      if (result.includes('Error') || result.includes('error')) {
        throw new Error('短縮URLの生成に失敗しました');
      }

      setShortUrl(result.trim());

      const historyItem: HistoryItem = {
        originalUrl: url,
        shortUrl: result.trim(),
        service: selectedService,
        timestamp: Date.now()
      };

      const newHistory = [historyItem, ...history.slice(0, 4)];
      setHistory(newHistory);
      localStorage.setItem('urlShortenerHistory', JSON.stringify(newHistory));

    } catch (err) {
      setError(err instanceof Error ? err.message : '短縮URLの生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyMessage('コピーしました');
      setTimeout(() => setCopyMessage(''), 2000);
    } catch (err) {
      setError('コピーに失敗しました');
    }
  };

  const handleHistoryClick = (item: HistoryItem) => {
    copyToClipboard(item.shortUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            URL短縮ツール
          </h1>

          <div className="space-y-6">
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                短縮サービス
              </label>
              <select
                id="service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="tinyurl">TinyURL</option>
                <option value="isgd">is.gd</option>
              </select>
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="ここにURLを入力してください"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={shortenUrl}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '生成中...' : '短縮する'}
            </button>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {copyMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-center">
                {copyMessage}
              </div>
            )}

            {shortUrl && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    短縮URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shortUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                    />
                    <button
                      onClick={() => copyToClipboard(shortUrl)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      コピー
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg border">
                    <QRCode value={shortUrl} size={128} />
                  </div>
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  履歴（最新5件）
                </h2>
                <div className="space-y-2">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleHistoryClick(item)}
                      className="bg-gray-50 p-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="text-sm text-gray-600 mb-1">
                        {item.service === 'tinyurl' ? 'TinyURL' : 'is.gd'} - {new Date(item.timestamp).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-800 truncate">
                        {item.originalUrl}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">
                        {item.shortUrl}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlShortener;