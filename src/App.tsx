/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Banknote, Calculator, RotateCcw, TrendingUp, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BANKNOTES = [200, 100, 50, 20, 10, 5, 2];

export default function App() {
  const [quantities, setQuantities] = useState<Record<number, string>>(
    BANKNOTES.reduce((acc, note) => ({ ...acc, [note]: '' }), {})
  );

  const [dueValue, setDueValue] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync dark mode with document class for potential global styles
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleQuantityChange = (note: number, value: string) => {
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setQuantities(prev => ({ ...prev, [note]: value }));
    }
  };

  const reset = () => {
    setQuantities(BANKNOTES.reduce((acc, note) => ({ ...acc, [note]: '' }), {}));
    setDueValue('');
  };

  const evaluateExpression = (expr: string): number => {
    try {
      // Replace comma with dot for calculation
      const sanitized = expr.replace(/,/g, '.');
      // Only allow numbers, dots and plus signs for safety
      if (!/^[0-9.+\s]*$/.test(sanitized)) return 0;
      
      // Split by '+' and sum up
      const parts = sanitized.split('+');
      return parts.reduce((acc, part) => {
        const num = parseFloat(part.trim());
        return acc + (isNaN(num) ? 0 : num);
      }, 0);
    } catch {
      return 0;
    }
  };

  const totals = useMemo(() => {
    const lineTotals = BANKNOTES.map(note => {
      const qty = parseInt(quantities[note] || '0', 10);
      return {
        note,
        qty,
        total: note * qty
      };
    });

    const grandTotal = lineTotals.reduce((sum, item) => sum + item.total, 0);
    const due = evaluateExpression(dueValue);
    const balance = grandTotal - due;

    return { lineTotals, grandTotal, due, balance };
  }, [quantities, dueValue]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans p-4 md:p-8 ${isDarkMode ? 'bg-[#0F0F0F] text-stone-100' : 'bg-[#F5F5F5] text-[#1A1A1A]'}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
              <Banknote className="text-emerald-500 w-8 h-8" />
              Contador de Notas
            </h1>
            <p className={`mt-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>Soma rápida de cédulas de Real</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-stone-800 text-amber-400' : 'hover:bg-stone-200 text-stone-500'}`}
              title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={reset}
              className={`p-2 rounded-full transition-colors group ${isDarkMode ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-200 text-stone-400'}`}
              title="Limpar tudo"
            >
              <RotateCcw className={`w-5 h-5 group-hover:rotate-[-45deg] transition-all ${isDarkMode ? 'group-hover:text-stone-200' : 'group-hover:text-stone-600'}`} />
            </button>
          </div>
        </header>

        {/* Main Card */}
        <div className={`rounded-3xl shadow-xl border overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#1A1A1A] border-stone-800' : 'bg-white border-stone-200'}`}>
          {/* Table Header */}
          <div className={`grid grid-cols-12 gap-4 px-6 py-4 text-[11px] uppercase tracking-wider font-semibold border-b transition-colors ${isDarkMode ? 'bg-[#242424] border-stone-800 text-stone-500' : 'bg-stone-50 border-stone-200 text-stone-400'}`}>
            <div className="col-span-4">Cédula</div>
            <div className="col-span-4 text-center">Quantidade</div>
            <div className="col-span-4 text-right">Subtotal</div>
          </div>

          {/* Rows */}
          <div className={`divide-y transition-colors ${isDarkMode ? 'divide-stone-800' : 'divide-stone-100'}`}>
            {totals.lineTotals.map(({ note, qty, total }) => (
              <motion.div
                key={note}
                layout
                className={`grid grid-cols-12 gap-4 px-6 py-5 items-center transition-colors ${isDarkMode ? 'hover:bg-stone-800/30' : 'hover:bg-stone-50/50'}`}
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className={`w-10 h-6 rounded flex items-center justify-center text-[10px] font-bold border transition-colors ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                    R$
                  </div>
                  <span className={`font-mono text-lg font-medium ${isDarkMode ? 'text-stone-200' : 'text-stone-800'}`}>{note}</span>
                </div>

                <div className="col-span-4 flex justify-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={quantities[note]}
                    onChange={(e) => handleQuantityChange(note, e.target.value)}
                    className={`w-20 text-center py-2 px-3 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-lg ${isDarkMode ? 'bg-stone-800 text-white placeholder-stone-600 focus:bg-stone-700' : 'bg-stone-100 text-stone-900 placeholder-stone-400 focus:bg-white'}`}
                  />
                </div>

                <div className="col-span-4 text-right">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={total}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className={`font-mono text-lg ${total > 0 ? (isDarkMode ? 'text-emerald-400 font-semibold' : 'text-emerald-600 font-semibold') : (isDarkMode ? 'text-stone-700' : 'text-stone-300')}`}
                    >
                      {formatCurrency(total)}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Due Value Input Section */}
          <div className={`px-6 py-6 border-t transition-colors ${isDarkMode ? 'bg-[#242424] border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
                  <Calculator className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                </div>
                <span className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Valor Devido</span>
              </div>
              <div className="relative flex flex-col items-end gap-2">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-mono">R$</span>
                  <input
                    type="text"
                    inputMode="text"
                    placeholder="0,00 + 0,00"
                    value={dueValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^[0-9.,+\s]*$/.test(val)) {
                        setDueValue(val);
                      }
                    }}
                    className={`w-full md:w-64 pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-amber-500 transition-all font-mono text-xl text-right ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-600 focus:bg-stone-700' : 'bg-white border-stone-200 text-stone-900 placeholder-stone-400 focus:bg-white'}`}
                  />
                </div>
                {dueValue.includes('+') && totals.due > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs font-mono font-bold px-2 py-1 rounded-md border transition-colors ${isDarkMode ? 'text-amber-400 bg-amber-900/20 border-amber-800/50' : 'text-amber-600 bg-amber-50 border-amber-100'}`}
                  >
                    Total: {formatCurrency(totals.due)}
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Footer / Total */}
          <div className={`p-8 text-white transition-colors duration-300 ${isDarkMode ? 'bg-stone-950' : 'bg-stone-900'}`}>
            <div className="space-y-6">
              {/* Grand Total Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl transition-colors ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-500/20'}`}>
                    <Banknote className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">Total em Notas</p>
                    <span className="text-stone-400 text-sm">
                      {totals.lineTotals.reduce((acc, curr) => acc + curr.qty, 0)} notas
                    </span>
                  </div>
                </div>
                <motion.div
                  key={totals.grandTotal}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-right"
                >
                  <span className="text-3xl md:text-4xl font-mono font-bold tracking-tighter text-emerald-400">
                    {formatCurrency(totals.grandTotal)}
                  </span>
                </motion.div>
              </div>

              {/* Balance Row (Only show if dueValue is present) */}
              {totals.due > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`pt-6 border-t flex items-center justify-between transition-colors ${isDarkMode ? 'border-stone-800' : 'border-stone-800'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${totals.balance >= 0 ? 'bg-blue-500/20' : 'bg-red-500/20'}`}>
                      <TrendingUp className={`w-6 h-6 ${totals.balance >= 0 ? 'text-blue-400' : 'text-red-400'}`} />
                    </div>
                    <div>
                      <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">
                        {totals.balance >= 0 ? 'Troco / Saldo' : 'Faltando'}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    key={totals.balance}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-right"
                  >
                    <span className={`text-4xl md:text-5xl font-mono font-bold tracking-tighter ${totals.balance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {formatCurrency(Math.abs(totals.balance))}
                    </span>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <footer className={`mt-8 text-center text-sm transition-colors ${isDarkMode ? 'text-stone-600' : 'text-stone-400'}`}>
          <p>Digite as quantidades para calcular automaticamente.</p>
        </footer>
      </div>
    </div>
  );
}
