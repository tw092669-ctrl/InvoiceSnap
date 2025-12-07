import React, { useState, useEffect } from 'react';
import { Key, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from './Button';
import { setApiKey, hasApiKey } from '../services/geminiService';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [apiKey, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setIsApiKeySet(hasApiKey());
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKeyInput(storedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      setSaveMessage({ type: 'error', text: '請輸入 API Key' });
      return;
    }

    try {
      setApiKey(apiKey.trim());
      setIsApiKeySet(true);
      setSaveMessage({ type: 'success', text: 'API Key 已成功儲存！' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: '儲存失敗，請重試' });
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKeyInput('');
    setIsApiKeySet(false);
    setSaveMessage({ type: 'success', text: 'API Key 已清除' });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-brand-400 to-accent-400 rounded-xl shadow-neon">
          <Key className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">設定</h2>
          <p className="text-gray-400 text-sm">管理您的 Gemini API Key</p>
        </div>
      </div>

      {/* Status Banner */}
      {isApiKeySet && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-300 font-medium">API Key 已設定</p>
            <p className="text-green-400/70 text-sm mt-1">您可以開始使用 AI 掃描功能</p>
          </div>
        </div>
      )}

      {/* API Key Input */}
      <div className="bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-700/50">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Gemini API Key
        </label>
        
        <div className="space-y-3">
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="輸入您的 Gemini API Key"
              className="block w-full px-4 py-3 pr-12 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSaveApiKey}
              variant="primary"
              className="flex-1"
            >
              儲存 API Key
            </Button>
            {isApiKeySet && (
              <Button
                onClick={handleClearApiKey}
                variant="secondary"
              >
                清除
              </Button>
            )}
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            saveMessage.type === 'success' 
              ? 'bg-green-900/20 border border-green-500/30 text-green-300' 
              : 'bg-red-900/20 border border-red-500/30 text-red-300'
          }`}>
            {saveMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{saveMessage.text}</span>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="text-blue-300 font-medium">如何取得 API Key？</p>
            <ol className="text-blue-400/80 space-y-1 list-decimal list-inside">
              <li>前往 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">Google AI Studio</a></li>
              <li>點擊「Create API Key」建立新的 API Key</li>
              <li>複製 API Key 並貼到上方欄位</li>
              <li>點擊「儲存 API Key」</li>
            </ol>
            <p className="text-blue-400/60 text-xs mt-3">
              注意：API Key 會儲存在您的瀏覽器本地儲存空間，不會上傳到任何伺服器
            </p>
          </div>
        </div>
      </div>

      {/* Close Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={onClose} variant="secondary">
          關閉
        </Button>
      </div>
    </div>
  );
};
