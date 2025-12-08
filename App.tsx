import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, FileText, ArrowLeft, Upload, LayoutDashboard, List, Settings as SettingsIcon, ScanLine, Edit2 } from 'lucide-react';
import { InvoiceData, InvoiceType, createEmptyInvoice } from './types';
import { InvoiceForm } from './components/InvoiceForm';
import { Dashboard } from './components/Dashboard';
import { DataManagement } from './components/DataManagement';
import { Settings } from './components/Settings';
import { Button } from './components/Button';
import { extractInvoiceData, hasApiKey } from './services/geminiService';

type ViewState = 'list' | 'dashboard' | 'edit' | 'settings' | 'data-management';

const App: React.FC = () => {
  // State
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [view, setView] = useState<ViewState>('list');
  const [currentInvoice, setCurrentInvoice] = useState<Partial<InvoiceData> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  
  // Refs
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('invoicesnap_data');
    if (saved) {
      try {
        setInvoices(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('invoicesnap_data', JSON.stringify(invoices));
  }, [invoices]);

  // Handle File Processing
  const processFile = async (file: File) => {
    // Check if API key is set
    if (!hasApiKey()) {
      alert('請先設定 Gemini API Key\n\n點擊右上角設定按鈕來設定您的 API Key');
      setView('settings');
      return;
    }

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target?.result as string;
        try {
          const extractedData = await extractInvoiceData(base64Image);
          const newInvoice: Partial<InvoiceData> = {
            ...createEmptyInvoice(),
            ...extractedData,
            imageUrl: base64Image,
          };
          setCurrentInvoice(newInvoice);
          setView('edit');
        } catch (err) {
          alert("AI 辨識失敗，請檢查 API Key 或重試。\n錯誤: " + (err as Error).message);
          if ((err as Error).message.includes('API Key')) {
            setView('settings');
          }
          const newInvoice: Partial<InvoiceData> = {
            ...createEmptyInvoice(),
            imageUrl: base64Image,
          };
          setCurrentInvoice(newInvoice);
          setView('edit');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      alert("讀取圖片失敗");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const handleManualAdd = () => {
    setCurrentInvoice(createEmptyInvoice());
    setView('edit');
  };

  const handleSaveInvoice = (data: InvoiceData) => {
    const invoiceToSave = {
      ...data,
      id: data.id || crypto.randomUUID(),
      createdAt: data.createdAt || Date.now()
    };

    setInvoices(prev => {
      const index = prev.findIndex(inv => inv.id === invoiceToSave.id);
      if (index >= 0) {
        const newArr = [...prev];
        newArr[index] = invoiceToSave;
        return newArr;
      } else {
        return [invoiceToSave, ...prev];
      }
    });

    setView('list');
    setCurrentInvoice(null);
  };

  const handleImportData = (importedData: InvoiceData[]) => {
    setInvoices(importedData);
  };

  const handleEdit = (invoice: InvoiceData) => {
    setCurrentInvoice(invoice);
    setView('edit');
  };

  const handleDelete = (id: string) => {
      if(confirm('確定要刪除?')) {
          setInvoices(p => p.filter(i => i.id !== id));
      }
  }

  const handleQuickUpdateName = (id: string, newName: string) => {
    setInvoices(prev => 
      prev.map(inv => 
        inv.id === id ? { ...inv, buyerName: newName } : inv
      )
    );
  };

  // Filtering
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.items?.some(item => item.description.includes(searchTerm)) ||
      inv.notes?.includes(searchTerm);
    
    const matchesType = filterType === 'all' || inv.type === filterType;
    return matchesSearch && matchesType;
  });

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard invoices={invoices} />;
      case 'settings':
        return <Settings onClose={() => setView('list')} />;
      case 'data-management':
        return (
          <DataManagement 
            invoices={invoices} 
            onImport={handleImportData} 
            onClose={() => setView('list')} 
          />
        );
      case 'edit':
        return (
          <InvoiceForm 
            initialData={currentInvoice || {}} 
            onSave={handleSaveInvoice} 
            onCancel={() => setView('list')} 
          />
        );
      case 'list':
      default:
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Search & Stats Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gray-800/60 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-gray-700/50">
              <div className="relative w-full md:w-96 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl leading-5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                  placeholder="搜尋公司、統編、品項..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-auto">
                    <select 
                       value={filterType} 
                       onChange={(e) => setFilterType(e.target.value)}
                       className="block w-full md:w-36 pl-3 pr-8 py-2.5 bg-gray-900/50 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 rounded-xl text-sm appearance-none"
                    >
                      <option value="all">所有類型</option>
                      <option value={InvoiceType.DUPLICATE}>二聯式</option>
                      <option value={InvoiceType.TRIPLICATE}>三聯式</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
              </div>
            </div>

            {/* List */}
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-24 bg-gray-800/40 rounded-3xl border border-dashed border-gray-700 backdrop-blur-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 mb-6 border border-gray-700 shadow-lg shadow-black/20">
                  <ScanLine className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="mt-2 text-lg font-bold text-gray-200">暫無相關發票</h3>
                <p className="mt-1 text-gray-400">
                  {searchTerm ? '嘗試不同的關鍵字搜尋' : '開始您的第一張發票記錄'}
                </p>
                {!searchTerm && (
                  <div className="mt-8 flex justify-center gap-4">
                     <Button variant="primary" onClick={() => uploadInputRef.current?.click()}>
                       <Upload className="w-4 h-4 mr-2" />
                       上傳發票圖片
                     </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {filteredInvoices.map((inv) => (
                  <div 
                    key={inv.id} 
                    className="group relative bg-gray-800/80 backdrop-blur-md rounded-2xl p-4 border border-gray-700/50 hover:border-brand-500/50 hover:bg-gray-800 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-300 flex gap-4 overflow-hidden"
                  >
                    {/* Glowing Accent on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-500/0 via-brand-500/0 to-brand-500/0 group-hover:via-brand-500/5 transition-all duration-500 pointer-events-none" />

                    {/* Thumbnail */}
                    <div 
                      onClick={() => handleEdit(inv)}
                      className="w-24 h-24 flex-shrink-0 bg-gray-900/80 rounded-xl overflow-hidden border border-gray-700 group-hover:border-gray-600 transition-colors relative cursor-pointer"
                    >
                      {inv.imageUrl ? (
                        <img src={inv.imageUrl} alt="invoice" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <FileText className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          {editingNameId === inv.id ? (
                            <input
                              type="text"
                              value={editingNameValue}
                              onChange={(e) => setEditingNameValue(e.target.value)}
                              onBlur={() => {
                                if (editingNameValue.trim()) {
                                  handleQuickUpdateName(inv.id, editingNameValue.trim());
                                }
                                setEditingNameId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  if (editingNameValue.trim()) {
                                    handleQuickUpdateName(inv.id, editingNameValue.trim());
                                  }
                                  setEditingNameId(null);
                                } else if (e.key === 'Escape') {
                                  setEditingNameId(null);
                                }
                              }}
                              autoFocus
                              className="flex-1 text-lg font-bold bg-gray-900/80 text-gray-100 px-2 py-1 rounded border border-brand-500 focus:outline-none focus:border-brand-400"
                              placeholder="輸入抬頭名稱"
                            />
                          ) : (
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <h3 
                                onClick={() => handleEdit(inv)}
                                className="text-lg font-bold text-gray-100 truncate group-hover:text-brand-400 transition-colors cursor-pointer"
                              >
                                {inv.buyerName || '未命名公司'}
                              </h3>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingNameId(inv.id);
                                  setEditingNameValue(inv.buyerName || '');
                                }}
                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-brand-400 transition-all p-1 hover:bg-gray-700/50 rounded"
                                title="編輯名稱"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                           <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${
                             inv.type === InvoiceType.TRIPLICATE 
                               ? 'bg-indigo-900/30 text-indigo-300 border-indigo-500/30' 
                               : 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30'
                           }`}>
                             {inv.type === InvoiceType.TRIPLICATE ? '三聯式' : '二聯式'}
                           </span>
                        </div>
                        <div 
                          onClick={() => handleEdit(inv)}
                          className="flex items-center gap-2 mt-1 cursor-pointer"
                        >
                            <span className="text-xs font-mono text-gray-400 bg-gray-900/50 px-1.5 py-0.5 rounded">{inv.date}</span>
                            <span className="text-xs font-mono text-gray-500">{inv.invoiceNumber}</span>
                        </div>
                      </div>
                      
                      <div 
                        onClick={() => handleEdit(inv)}
                        className="flex justify-between items-end mt-2 cursor-pointer"
                      >
                        <div className="text-sm text-gray-500 truncate max-w-[60%] group-hover:text-gray-400 transition-colors">
                           {inv.items?.length > 0 ? inv.items[0].description + (inv.items.length > 1 ? ` 等 ${inv.items.length} 項` : '') : '無品項'}
                        </div>
                        <span className="text-xl font-bold text-white font-mono tracking-tight group-hover:text-brand-300 group-hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] transition-all">
                          ${inv.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen text-gray-100 pb-28 font-sans selection:bg-brand-500/30">
      {/* Hidden Inputs */}
      <input 
        type="file" 
        accept="image/*" 
        ref={uploadInputRef} 
        className="hidden" 
        onChange={handleFileSelect} 
      />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(view === 'edit' || view === 'settings' || view === 'data-management') ? (
              <button onClick={() => setView('list')} className="p-2 hover:bg-white/10 rounded-full -ml-2 transition-colors text-gray-300 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white p-2 rounded-xl shadow-lg shadow-brand-500/20">
                <FileText className="w-5 h-5" />
              </div>
            )}
            <h1 className="text-xl font-bold tracking-tight text-white hidden xs:block font-mono">Invoice<span className="text-brand-400">Snap</span></h1>
            {(view === 'edit' || view === 'settings' || view === 'data-management') && (
              <h2 className="text-lg font-bold text-gray-200 sm:hidden">
                {view === 'settings' ? '設定' : view === 'data-management' ? '資料管理' : '發票明細'}
              </h2>
            )}
          </div>
          
          {(view !== 'edit' && view !== 'settings' && view !== 'data-management') && (
             <div className="flex items-center gap-2">
               <div className="bg-gray-800/50 p-1 rounded-xl flex items-center mr-2 border border-gray-700/50">
                 <button 
                   onClick={() => setView('list')}
                   className={`p-2 rounded-lg transition-all duration-300 ${view === 'list' ? 'bg-gray-700 text-brand-400 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                   title="列表模式"
                 >
                   <List className="w-5 h-5" />
                 </button>
                 <button 
                   onClick={() => setView('dashboard')}
                   className={`p-2 rounded-lg transition-all duration-300 ${view === 'dashboard' ? 'bg-gray-700 text-brand-400 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                   title="儀表板"
                 >
                   <LayoutDashboard className="w-5 h-5" />
                 </button>
               </div>

               <button 
                 onClick={() => setView('data-management')}
                 className="p-2.5 text-gray-400 hover:bg-white/5 hover:text-white rounded-full transition-colors"
                 title="資料管理"
               >
                 <FileText className="w-5 h-5" />
               </button>

               <button 
                 onClick={() => setView('settings')}
                 className="p-2.5 text-gray-400 hover:bg-white/5 hover:text-white rounded-full transition-colors"
                 title="設定"
               >
                 <SettingsIcon className="w-5 h-5" />
               </button>

               <div className="hidden sm:flex gap-3 ml-4">
                 <Button 
                   variant="primary" 
                   onClick={() => uploadInputRef.current?.click()}
                   isLoading={isProcessing}
                 >
                   <Upload className="w-4 h-4 mr-2" />
                   上傳
                 </Button>
                 
                 <Button 
                   variant="secondary"
                   onClick={handleManualAdd}
                   className="bg-gray-800/80 hover:bg-gray-700"
                 >
                   <Plus className="w-4 h-4 mr-2" />
                   新增
                 </Button>
               </div>
             </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-6">
        {renderContent()}
      </main>

      {/* Mobile Floating Action Buttons - Modern & Floating */}
      {(view !== 'edit' && view !== 'settings' && view !== 'data-management') && (
        <div className="fixed bottom-8 right-6 flex flex-col gap-4 sm:hidden z-30 items-end">
          <button 
            onClick={handleManualAdd}
            className="w-12 h-12 bg-gray-800 text-gray-300 rounded-2xl shadow-lg border border-gray-600 flex items-center justify-center focus:outline-none hover:bg-gray-700 active:scale-95 transition-all"
            title="手動新增"
          >
            <Plus className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => uploadInputRef.current?.click()}
            disabled={isProcessing}
            className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl shadow-2xl shadow-brand-500/40 flex items-center justify-center focus:outline-none disabled:opacity-75 disabled:cursor-wait active:scale-95 transition-all"
            title="上傳發票圖片"
          >
            {isProcessing ? (
              <div className="animate-spin h-7 w-7 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default App;