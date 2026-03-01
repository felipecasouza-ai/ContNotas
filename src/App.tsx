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

  const [dueItems, setDueItems] = useState<number[]>([]);
  const [currentDueInput, setCurrentDueInput] = useState<string>('');
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
    setDueItems([]);
    setCurrentDueInput('');
  };

  const addDueItem = () => {
    const val = parseFloat(currentDueInput.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      setDueItems(prev => [...prev, val]);
      setCurrentDueInput('');
    }
  };

  const removeDueItem = (index: number) => {
    setDueItems(prev => prev.filter((_, i) => i !== index));
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
    const accumulatedDue = dueItems.reduce((sum, val) => sum + val, 0);
    const currentInputVal = parseFloat(currentDueInput.replace(',', '.') || '0');
    const due = accumulatedDue + (isNaN(currentInputVal) ? 0 : currentInputVal);
    const balance = grandTotal - due;

    return { lineTotals, grandTotal, due, balance, accumulatedDue };
  }, [quantities, dueItems, currentDueInput]);

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
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex items-center gap-2 pt-3">
                <div className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
                  <Calculator className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                </div>
                <span className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>Valor Devido</span>
              </div>

              <div className="flex-1 flex flex-col items-end gap-3">
                <div className="relative w-full md:w-64">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-mono">R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={currentDueInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || /^[0-9.,]*$/.test(val)) {
                        setCurrentDueInput(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDueItem();
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:ring-2 focus:ring-amber-500 transition-all font-mono text-xl text-right ${isDarkMode ? 'bg-stone-800 border-stone-700 text-white placeholder-stone-600 focus:bg-stone-700' : 'bg-white border-stone-200 text-stone-900 placeholder-stone-400 focus:bg-white'}`}
                  />
                  <div className="absolute -bottom-5 right-0 text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                    Pressione Enter para somar
                  </div>
                </div>

                {/* Accumulated Items List */}
                <AnimatePresence>
                  {dueItems.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-wrap justify-end gap-2 mt-4 max-w-full"
                    >
                      {dueItems.map((item, idx) => (
                        <motion.button
                          key={`${idx}-${item}`}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => removeDueItem(idx)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-mono transition-all group ${isDarkMode ? 'bg-stone-800 border-stone-700 text-stone-300 hover:border-red-900 hover:text-red-400' : 'bg-white border-stone-200 text-stone-600 hover:border-red-200 hover:text-red-500'}`}
                        >
                          {formatCurrency(item)}
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">×</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
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
