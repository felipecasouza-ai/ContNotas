/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Banknote, Calculator, RotateCcw, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BANKNOTES = [200, 100, 50, 20, 10, 5, 2];

export default function App() {
  const [quantities, setQuantities] = useState<Record<number, string>>(
    BANKNOTES.reduce((acc, note) => ({ ...acc, [note]: '' }), {})
  );

  const [dueValue, setDueValue] = useState<string>('');

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
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Banknote className="text-emerald-600 w-8 h-8" />
              Contador de Notas
            </h1>
            <p className="text-stone-500 mt-1">Soma rápida de cédulas de Real</p>
          </div>
          <button
            onClick={reset}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors group"
            title="Limpar tudo"
          >
            <RotateCcw className="w-5 h-5 text-stone-400 group-hover:text-stone-600 group-hover:rotate-[-45deg] transition-all" />
          </button>
        </header>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-stone-50 border-bottom border-stone-200 text-[11px] uppercase tracking-wider font-semibold text-stone-400">
            <div className="col-span-4">Cédula</div>
            <div className="col-span-4 text-center">Quantidade</div>
            <div className="col-span-4 text-right">Subtotal</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-stone-100">
            {totals.lineTotals.map(({ note, qty, total }) => (
              <motion.div
                key={note}
                layout
                className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-stone-50/50 transition-colors"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-6 bg-emerald-100 rounded flex items-center justify-center text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    R$
                  </div>
                  <span className="font-mono text-lg font-medium">{note}</span>
                </div>

                <div className="col-span-4 flex justify-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={quantities[note]}
                    onChange={(e) => handleQuantityChange(note, e.target.value)}
                    className="w-20 text-center py-2 px-3 bg-stone-100 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono text-lg"
                  />
                </div>

                <div className="col-span-4 text-right">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={total}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className={`font-mono text-lg ${total > 0 ? 'text-emerald-600 font-semibold' : 'text-stone-300'}`}
                    >
                      {formatCurrency(total)}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Due Value Input Section */}
          <div className="px-6 py-6 bg-stone-50 border-t border-stone-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Calculator className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-sm font-semibold text-stone-600 uppercase tracking-wider">Valor Devido</span>
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
                    className="w-full md:w-64 pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono text-xl text-right"
                  />
                </div>
                {dueValue.includes('+') && totals.due > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100"
                  >
                    Total: {formatCurrency(totals.due)}
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Footer / Total */}
          <div className="bg-stone-900 p-8 text-white">
            <div className="space-y-6">
              {/* Grand Total Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 rounded-2xl">
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
                  className="pt-6 border-t border-stone-800 flex items-center justify-between"
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
        <footer className="mt-8 text-center text-stone-400 text-sm">
          <p>Digite as quantidades para calcular automaticamente.</p>
        </footer>
      </div>
    </div>
  );
}
