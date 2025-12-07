import React, { useState, useEffect } from 'react';
import { InvoiceData, InvoiceType, InvoiceItem } from '../types';
import { Button } from './Button';
import { Save, Trash2, Plus, Calculator, X } from 'lucide-react';

interface InvoiceFormProps {
  initialData: Partial<InvoiceData>;
  onSave: (data: InvoiceData) => void;
  onCancel: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<InvoiceData>>({
    items: [],
    ...initialData
  });

  useEffect(() => {
    const items = formData.items || [];
    const calculatedSubtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const calculatedTax = Math.round(calculatedSubtotal * 0.05);
    const calculatedTotal = calculatedSubtotal + calculatedTax;

    setFormData(prev => ({
      ...prev,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      total: calculatedTotal
    }));
  }, [formData.items]);

  const handleChange = (field: keyof InvoiceData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = Number(newItems[index].quantity) || 0;
      const price = Number(newItems[index].unitPrice) || 0;
      newItems[index].amount = Math.round(qty * price);
    }

    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), { description: '', quantity: 1, unitPrice: 0, amount: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    const newItems = [...(formData.items || [])];
    newItems.splice(index, 1);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceNumber || !formData.date) {
      alert("請填寫發票號碼與日期");
      return;
    }
    onSave(formData as InvoiceData);
  };

  const inputClass = "mt-1 block w-full rounded-xl bg-gray-900/50 border border-gray-700 text-white shadow-sm p-3 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors placeholder-gray-500";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto bg-gray-800/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-700/50 animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
           <span className="w-2 h-8 bg-gradient-to-b from-brand-400 to-brand-600 rounded-full inline-block"></span>
           {formData.id ? '編輯發票' : '新增發票'}
        </h2>
        {formData.imageUrl && (
          <div className="relative group">
            <img src={formData.imageUrl} alt="Invoice" className="w-16 h-16 object-cover rounded-xl border-2 border-gray-600 cursor-pointer hover:border-brand-400 transition-colors" />
            <div className="absolute top-0 right-0 hidden group-hover:block w-72 p-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-20 -translate-x-full">
               <img src={formData.imageUrl} alt="Zoom" className="w-full rounded-lg" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-5">
          <div>
            <label className={labelClass}>發票種類</label>
            <div className="relative">
              <select 
                value={formData.type} 
                onChange={e => handleChange('type', e.target.value)}
                className={inputClass}
              >
                <option value={InvoiceType.DUPLICATE}>二聯式 (個人)</option>
                <option value={InvoiceType.TRIPLICATE}>三聯式 (公司)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>發票號碼</label>
            <input 
              type="text" 
              required
              value={formData.invoiceNumber || ''} 
              onChange={e => handleChange('invoiceNumber', e.target.value.toUpperCase())}
              className={`${inputClass} font-mono tracking-wider`}
              placeholder="AB12345678"
            />
          </div>

          <div>
            <label className={labelClass}>開立日期</label>
            <input 
              type="date" 
              required
              value={formData.date || ''} 
              onChange={e => handleChange('date', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Buyer Info */}
        <div className="space-y-5">
          <div>
            <label className={labelClass}>買受人抬頭</label>
            <input 
              type="text" 
              value={formData.buyerName || ''} 
              onChange={e => handleChange('buyerName', e.target.value)}
              className={inputClass}
              placeholder="公司或個人名稱"
            />
          </div>

          <div>
            <label className={labelClass}>統一編號</label>
            <input 
              type="text" 
              value={formData.buyerTaxId || ''} 
              onChange={e => handleChange('buyerTaxId', e.target.value)}
              className={`${inputClass} font-mono tracking-wider`}
              maxLength={8}
              placeholder="8 位數字"
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">品項明細</label>
          <button type="button" onClick={addItem} className="text-sm text-brand-400 hover:text-brand-300 flex items-center font-medium transition-colors">
            <Plus className="w-4 h-4 mr-1" /> 新增品項
          </button>
        </div>
        <div className="border border-gray-700 rounded-xl overflow-hidden bg-gray-900/30">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">品名</th>
                <th className="px-2 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider w-20">數量</th>
                <th className="px-2 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider w-24">單價</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider w-28">金額</th>
                <th className="px-2 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {formData.items?.map((item, idx) => (
                <tr key={idx} className="group hover:bg-white/5 transition-colors">
                  <td className="px-2 py-2">
                    <input 
                      type="text" 
                      value={item.description}
                      onChange={e => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-transparent focus:border-brand-500 focus:ring-0 text-sm text-white placeholder-gray-600"
                      placeholder="品名"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      className="w-full bg-transparent text-right border-0 border-b border-transparent focus:border-brand-500 focus:ring-0 text-sm text-white"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input 
                      type="number" 
                      value={item.unitPrice}
                      onChange={e => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                      className="w-full bg-transparent text-right border-0 border-b border-transparent focus:border-brand-500 focus:ring-0 text-sm text-white"
                    />
                  </td>
                  <td className="px-4 py-2 text-right text-sm text-gray-300 font-mono">
                    {item.amount.toLocaleString()}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button type="button" onClick={() => removeItem(idx)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {(!formData.items || formData.items.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                    尚無品項
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end mt-6">
        <div className="w-full md:w-1/3 space-y-3 bg-gray-900/50 p-5 rounded-2xl border border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">銷售額 (未稅)</span>
            <span className="font-medium text-gray-200">{formData.subtotal?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">營業稅 (5%)</span>
            <span className="font-medium text-gray-200">{formData.tax?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-3 mt-1">
            <span className="text-gray-100">總計</span>
            <span className="text-brand-400 text-xl font-mono">{formData.total?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-8 flex justify-end gap-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" variant="primary">
          <Save className="w-4 h-4 mr-2" />
          儲存發票
        </Button>
      </div>
    </form>
  );
};