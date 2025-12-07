import React, { useRef } from 'react';
import { InvoiceData } from '../types';
import { Button } from './Button';
import { Download, Upload, Database, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DataManagementProps {
  invoices: InvoiceData[];
  onImport: (data: InvoiceData[]) => void;
  onClose: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ invoices, onImport, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(invoices, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json);
        
        if (Array.isArray(data)) {
          if (confirm(`確定要匯入 ${data.length} 筆資料嗎？\n注意：這將會覆蓋現有的同名資料。`)) {
            onImport(data);
            alert('資料匯入成功！');
            onClose();
          }
        } else {
          alert('檔案格式錯誤：內容不是有效的發票列表');
        }
      } catch (err) {
        console.error(err);
        alert('匯入失敗：檔案格式損毀或不正確');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-5 flex items-start gap-3 backdrop-blur-sm">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-100/90">
          <p className="font-bold mb-1 text-blue-300">關於資料保存</p>
          <p className="leading-relaxed">
            本應用程式將資料儲存在您的瀏覽器中。為了避免清理瀏覽器快取或更換手機導致資料遺失，建議您定期使用下方的「匯出備份」功能將資料下載保存。
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 shadow-xl backdrop-blur-md flex flex-col items-center text-center space-y-4 hover:border-brand-500/50 transition-colors">
          <div className="w-14 h-14 bg-gray-700/50 rounded-full flex items-center justify-center border border-gray-600">
            <Download className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">匯出備份</h3>
            <p className="text-sm text-gray-400 mt-1">將所有發票資料下載成檔案</p>
          </div>
          <Button onClick={handleExport} className="w-full">
            下載備份檔 (.json)
          </Button>
        </div>

        <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700 shadow-xl backdrop-blur-md flex flex-col items-center text-center space-y-4 hover:border-brand-500/50 transition-colors">
          <div className="w-14 h-14 bg-gray-700/50 rounded-full flex items-center justify-center border border-gray-600">
            <Upload className="w-6 h-6 text-accent-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">匯入備份</h3>
            <p className="text-sm text-gray-400 mt-1">從備份檔案還原資料</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".json" 
            className="hidden" 
            onChange={handleImport} 
          />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full">
            選擇備份檔
          </Button>
        </div>
      </div>

      <div className="bg-gray-800/40 p-5 rounded-2xl border border-gray-700/50">
        <h3 className="font-bold text-gray-200 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-brand-500" />
          目前狀態
        </h3>
        <div className="flex items-center justify-between text-sm p-4 bg-gray-900/50 rounded-xl border border-gray-700/50">
           <span className="text-gray-400">已儲存發票數量</span>
           <span className="font-bold text-white text-lg">{invoices.length} <span className="text-xs text-gray-500 font-normal">張</span></span>
        </div>
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
           <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-500/80" />
           <span>資料已自動儲存於本機瀏覽器 LocalStorage</span>
        </div>
      </div>
    </div>
  );
};