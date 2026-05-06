import { useState, useRef, useEffect } from 'react';
import { DollarSign, TrendingDown, Wallet, Check, Pencil } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface StatCardsProps {
  income: number;
  totalExpenses: number;
  remaining: number;
  spentPercent: number;
  isOverHalf: boolean;
  onUpdateIncome: (val: number) => Promise<void>;
  profileLoading: boolean;
}

export default function StatCards({
  income,
  totalExpenses,
  remaining,
  spentPercent,
  isOverHalf,
  onUpdateIncome,
  profileLoading,
}: StatCardsProps) {
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInput, setIncomeInput] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIncome && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingIncome]);

  const handleEditIncome = () => {
    setIncomeInput(String(income || ''));
    setEditingIncome(true);
  };

  const handleSaveIncome = async () => {
    const val = parseFloat(incomeInput);
    if (isNaN(val) || val < 0) return;
    setSaving(true);
    await onUpdateIncome(val);
    setSaving(false);
    setEditingIncome(false);
  };

  const handleIncomeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveIncome();
    if (e.key === 'Escape') setEditingIncome(false);
  };

  const progressColor = isOverHalf ? 'bg-crimson-500' : spentPercent > 30 ? 'bg-amber-400' : 'bg-lime-400';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Monthly Income */}
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-display font-700 uppercase tracking-widest text-obsidian-500">
              Monthly Income
            </span>
            <div className="w-8 h-8 rounded-lg bg-lime-400/10 flex items-center justify-center">
              <Wallet size={14} className="text-lime-400" />
            </div>
          </div>

          {profileLoading ? (
            <div className="h-8 w-32 bg-obsidian-800 rounded-lg shimmer" />
          ) : editingIncome ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-obsidian-400 text-xl">$</span>
              <input
                ref={inputRef}
                type="number"
                value={incomeInput}
                onChange={e => setIncomeInput(e.target.value)}
                onKeyDown={handleIncomeKeyDown}
                className="flex-1 bg-transparent border-b border-lime-400 text-2xl font-display font-700 text-white outline-none w-full"
                min="0"
                step="0.01"
              />
              <button
                onClick={handleSaveIncome}
                disabled={saving}
                className="w-7 h-7 rounded-lg bg-lime-400 flex items-center justify-center flex-shrink-0 hover:bg-lime-500 transition-colors"
              >
                {saving ? (
                  <div className="w-3 h-3 rounded-full border border-obsidian-950 border-t-transparent animate-spin" />
                ) : (
                  <Check size={13} className="text-obsidian-950" strokeWidth={2.5} />
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={handleEditIncome}
              className="group flex items-center gap-2 mt-1"
            >
              <span className="font-display font-700 text-2xl text-white">
                {formatCurrency(income)}
              </span>
              <Pencil size={13} className="text-obsidian-600 group-hover:text-lime-400 transition-colors" />
            </button>
          )}
          <p className="text-xs text-obsidian-600 mt-1">Click to edit</p>
        </div>

        {/* Total Expenses */}
        <div className="stat-card animate-slide-up" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-display font-700 uppercase tracking-widest text-obsidian-500">
              Total Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-crimson-500/10 flex items-center justify-center">
              <TrendingDown size={14} className="text-crimson-400" />
            </div>
          </div>
          <span className="font-display font-700 text-2xl text-white mt-1 block">
            {formatCurrency(totalExpenses)}
          </span>
          <p className="text-xs text-obsidian-600 mt-1">This month</p>
        </div>

        {/* Remaining Balance */}
        <div className="stat-card animate-slide-up" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-display font-700 uppercase tracking-widest text-obsidian-500">
              Remaining
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center">
              <DollarSign size={14} className="text-blue-400" />
            </div>
          </div>
          <span className={`font-display font-700 text-2xl mt-1 block ${remaining < 0 ? 'text-crimson-400' : 'text-white'}`}>
            {formatCurrency(remaining)}
          </span>
          <p className="text-xs text-obsidian-600 mt-1">Income − Expenses</p>
        </div>
      </div>

      {/* Progress bar */}
      {income > 0 && (
        <div className="glass-card rounded-xl p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-obsidian-400 font-500">Budget utilization</span>
            <span className={`text-xs font-mono font-500 ${isOverHalf ? 'text-crimson-400' : 'text-obsidian-400'}`}>
              {Math.min(spentPercent, 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-obsidian-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor}`}
              style={{ width: `${Math.min(spentPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-obsidian-600">$0</span>
            <span className="text-xs text-obsidian-500">50% = {formatCurrency(income * 0.5)}</span>
            <span className="text-xs text-obsidian-600">{formatCurrency(income)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
