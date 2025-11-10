import React, { useState } from 'react';

interface DiffResult {
  type: 'added' | 'removed' | 'modified' | 'equal';
  value: string;
  lineNumber: number;
}

const TextDiff: React.FC = () => {
  const [beforeText, setBeforeText] = useState('');
  const [afterText, setAfterText] = useState('');
  const [diffResult, setDiffResult] = useState<DiffResult[]>([]);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const simpleDiffLines = (oldText: string, newText: string, options: { ignoreWhitespace: boolean; ignoreCase: boolean }) => {
    let oldLines = oldText.split('\n');
    let newLines = newText.split('\n');

    if (options.ignoreCase) {
      oldLines = oldLines.map(line => line.toLowerCase());
      newLines = newLines.map(line => line.toLowerCase());
    }

    if (options.ignoreWhitespace) {
      oldLines = oldLines.map(line => line.replace(/\s+/g, ' ').trim());
      newLines = newLines.map(line => line.replace(/\s+/g, ' ').trim());
    }

    const result: DiffResult[] = [];
    let lineNumber = 1;
    let oldIndex = 0;
    let newIndex = 0;

    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      if (oldIndex >= oldLines.length) {
        result.push({
          type: 'added',
          value: newLines[newIndex],
          lineNumber: lineNumber++
        });
        newIndex++;
      } else if (newIndex >= newLines.length) {
        result.push({
          type: 'removed',
          value: oldLines[oldIndex],
          lineNumber: lineNumber++
        });
        oldIndex++;
      } else if (oldLines[oldIndex] === newLines[newIndex]) {
        result.push({
          type: 'equal',
          value: oldLines[oldIndex],
          lineNumber: lineNumber++
        });
        oldIndex++;
        newIndex++;
      } else {
        const foundInNew = newLines.slice(newIndex + 1).indexOf(oldLines[oldIndex]);
        const foundInOld = oldLines.slice(oldIndex + 1).indexOf(newLines[newIndex]);

        if (foundInNew !== -1 && (foundInOld === -1 || foundInNew < foundInOld)) {
          result.push({
            type: 'added',
            value: newLines[newIndex],
            lineNumber: lineNumber++
          });
          newIndex++;
        } else if (foundInOld !== -1) {
          result.push({
            type: 'removed',
            value: oldLines[oldIndex],
            lineNumber: lineNumber++
          });
          oldIndex++;
        } else {
          result.push({
            type: 'modified',
            value: `${oldLines[oldIndex]} → ${newLines[newIndex]}`,
            lineNumber: lineNumber++
          });
          oldIndex++;
          newIndex++;
        }
      }
    }

    return result;
  };

  const handleCompare = () => {
    const result = simpleDiffLines(beforeText, afterText, {
      ignoreWhitespace,
      ignoreCase
    });
    setDiffResult(result);
  };

  const getLineBackgroundColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-100';
      case 'removed':
        return 'bg-red-100';
      case 'modified':
        return 'bg-yellow-100';
      default:
        return 'bg-white';
    }
  };

  const getLinePrefix = (type: string) => {
    switch (type) {
      case 'added':
        return '+';
      case 'removed':
        return '-';
      case 'modified':
        return '~';
      default:
        return ' ';
    }
  };

  const copyToClipboard = async () => {
    const htmlContent = `<pre><code>${diffResult.map(line => 
      `<span class="${getLineBackgroundColor(line.type).replace('bg-', '').replace('-100', '')}">${getLinePrefix(line.type)} ${line.value}</span>`
    ).join('\n')}</code></pre>`;

    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopyMessage('コピーしました');
      setTimeout(() => setCopyMessage(''), 1500);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            テキスト差分ツール（Diff Viewer）
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="before" className="block text-sm font-medium text-gray-700 mb-2">
                Before (旧)
              </label>
              <textarea
                id="before"
                value={beforeText}
                onChange={(e) => setBeforeText(e.target.value)}
                placeholder="比較元のテキストを入力してください"
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              />
            </div>

            <div>
              <label htmlFor="after" className="block text-sm font-medium text-gray-700 mb-2">
                After (新)
              </label>
              <textarea
                id="after"
                value={afterText}
                onChange={(e) => setAfterText(e.target.value)}
                placeholder="比較先のテキストを入力してください"
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">空白の違いを無視</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ignoreCase}
                  onChange={(e) => setIgnoreCase(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">大文字小文字を無視</span>
              </label>
            </div>

            <button
              onClick={handleCompare}
              className="w-full sm:w-auto bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold text-lg"
            >
              比較する
            </button>
          </div>

          {copyMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-center">
              {copyMessage}
            </div>
          )}

          {diffResult.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  差分結果
                </h2>
                <button
                  onClick={copyToClipboard}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                >
                  コピー (HTML)
                </button>
              </div>

              <div className="bg-white border rounded-md max-h-96 overflow-auto">
                <div className="font-mono text-sm">
                  {diffResult.map((line, index) => (
                    <div
                      key={index}
                      className={`flex ${getLineBackgroundColor(line.type)} border-b border-gray-200 last:border-b-0`}
                    >
                      <div className="w-12 px-2 py-1 text-gray-500 text-right border-r border-gray-200 bg-gray-50 flex-shrink-0">
                        {line.lineNumber}
                      </div>
                      <div className="px-3 py-1 flex-1 whitespace-pre-wrap break-all">
                        <span className="inline-block w-4 text-center font-bold">
                          {getLinePrefix(line.type)}
                        </span>
                        {line.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-100 border mr-2"></div>
                    <span>+ 追加行</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-100 border mr-2"></div>
                    <span>- 削除行</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-100 border mr-2"></div>
                    <span>~ 変更行</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextDiff;