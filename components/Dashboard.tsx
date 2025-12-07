import React, { useMemo } from 'react';
import { InvoiceData } from '../types';
import { Calendar, BarChart3, Layers } from 'lucide-react';

interface DashboardProps {
  invoices: InvoiceData[];
}

export const Dashboard: React.FC<DashboardProps> = ({ invoices }) => {
  const stats = useMemo(() => {
    const groups: Record<number, Record<number, { count: number, total: number }>> = {};
    
    invoices.forEach(inv => {
      if (!inv.date) return;
      const date = new Date(inv.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const period = Math.ceil(month / 2); // 1-2=1, 3-4=2, etc.
      
      if (!groups[year]) groups[year] = {};
      if (!groups[year][period]) groups[year][period] = { count: 0, total: 0 };
      
      groups[year][period].count++;
      groups[year][period].total += inv.total;
    });
    
    // Sort years descending (newest year first)
    return Object.keys(groups).map(Number).sort((a, b) => b - a).map(year => ({
      year,
      periods: groups[year]
    }));
  }, [invoices]);

  const getPeriodLabel = (p: number) => {
    const labels = [`1-2月`, `3-4月`, `5-6月`, `7-8月`, `9-10月`, `11-12月`];
    return labels[p - 1] || `${p}`;
  };

  if (stats.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 bg-gray-800/50 rounded-2xl border border-dashed border-gray-700 backdrop-blur-sm">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-xl font-bold text-gray-300">暫無數據</h3>
        <p className="mt-2 text-gray-400">新增發票後即可查看統計</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {stats.map(({ year, periods }) => (
        <div key={year} className="bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
          <div className="bg-gray-800/80 px-6 py-5 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-brand-400" />
              </div>
              <h3 className="font-bold text-xl text-white tracking-wide">{year} 年</h3>
            </div>
            <span className="text-xs font-bold text-brand-300 bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
              Year Overview
            </span>
          </div>
          
          <div className="p-6 grid gap-4 grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(period => {
              const data = periods[period] || { count: 0 };
              const hasData = data.count > 0;
              
              return (
                <div 
                  key={period} 
                  className={`relative p-5 rounded-2xl border transition-all duration-300 group ${
                    hasData 
                      ? 'bg-gradient-to-br from-gray-800 to-gray-800/50 border-brand-500/30 shadow-lg shadow-black/20 hover:border-brand-400 hover:shadow-brand-500/10 hover:-translate-y-1' 
                      : 'bg-gray-800/30 border-gray-700/30 opacity-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-sm font-bold tracking-wider uppercase ${hasData ? 'text-gray-300' : 'text-gray-600'}`}>
                      {getPeriodLabel(period)}
                    </span>
                    {hasData && (
                      <Layers className="w-4 h-4 text-brand-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-black tracking-tight ${
                      hasData 
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover:from-brand-200 group-hover:to-brand-400' 
                        : 'text-gray-700'
                    }`}>
                      {data.count}
                    </span>
                    <span className={`text-sm font-medium mb-1.5 ${hasData ? 'text-gray-400' : 'text-gray-700'}`}>
                      張
                    </span>
                  </div>
                  
                  {/* Decorative Glow */}
                  {hasData && (
                    <div className="absolute inset-0 rounded-2xl bg-brand-400/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};