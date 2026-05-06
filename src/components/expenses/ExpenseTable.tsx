import { useState } from 'react';
import { Trash2, Type, Mic, Receipt, ImageIcon, ChevronDown } from 'lucide-react';
import type { Expense, InputMethod } from '../../types';
import { formatCurrency, formatDate, CATEGORY_COLORS, CATEGORY_DOTS } from '../../lib/utils';

interface ExpenseTableProps {
  expenses: Expense[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

const METHOD_ICONS: Record<InputMethod, { icon: typeof Type; label: string; color: string }> = {
  text: { icon: Type, label: 'Manual', color: 'text-blue-400' },
  voice: { icon: Mic, label: 'Voice', color: 'text-lime-400' },
  receipt: { icon: Receipt, label: 'Receipt', color: 'text-purple-400' },
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-obsidian-800/50">
      <div className="w-20 h-4 bg-obsidian-800 rounded shimmer" />
      <div className="flex-1 h-4 bg-obsidian-800 rounded shimmer" />
      <div className="w-20 h-6 bg-obsidian-800 rounded-full shimmer" />
      <div className="w-16 h-4 bg-obsidian-800 rounded shimmer" />
      <div className="w-8 h-8 bg-obsidian-800 rounded-lg shimmer" />
    </div>
  );
}

export default function ExpenseTable({ expenses, loading, onDelete }: ExpenseTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [receiptModal, setReceiptModal] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  const displayedExpenses = expanded ? expenses : expenses.slice(0, 10);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl overflow-hidden">
        {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
        <div className="w-12 h-12 rounded-xl bg-obsidian-800 flex items-center justify-center">
          <Receipt size={20} className="text-obsidian-500" />
        </div>
        <p className="text-obsidian-400 font-500 text-sm">No expenses this month</p>
        <p className="text-obsidian-600 text-xs">Add your first expense above</p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Desktop header */}
        <div className="hidden sm:grid grid-cols-[120px_1fr_130px_100px_60px_48px] gap-3 px-5 py-3 border-b border-obsidian-800">
          {['Date', 'Description', 'Category', 'Amount', 'Via', ''].map(h => (
            <span key={h} className="text-xs font-display font-700 uppercase tracking-widest text-obsidian-600">{h}</span>
          ))}
        </div>

        <div className="divide-y divide-obsidian-800/50">
          {displayedExpenses.map((expense, idx) => {
            const methodInfo = METHOD_ICONS[expense.input_method];
            const MethodIcon = methodInfo.icon;
            const isDeleting = deletingId === expense.id;

            return (
              <div
                key={expense.id}
                className={`group px-4 sm:px-5 py-3 transition-colors duration-150 hover:bg-obsidian-800/30 animate-fade-in ${isDeleting ? 'opacity-50' : ''}`}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                {/* Desktop layout */}
                <div className="hidden sm:grid grid-cols-[120px_1fr_130px_100px_60px_48px] gap-3 items-center">
                  <span className="text-xs text-obsidian-500 font-mono">
                    {formatDate(expense.created_at)}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-obsidian-200 truncate">{expense.description}</span>
                    {expense.receipt_url && (
                      <button
                        onClick={() => setReceiptModal(expense.receipt_url!)}
                        className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-purple-400 hover:text-purple-300"
                        title="View receipt"
                      >
                        <ImageIcon size={12} />
                      </button>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border w-fit ${CATEGORY_COLORS[expense.category]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${CATEGORY_DOTS[expense.category]}`} />
                    {expense.category}
                  </span>
                  <span className="font-mono font-500 text-sm text-obsidian-100">
                    {formatCurrency(expense.amount)}
                  </span>
                  <div
                    title={methodInfo.label}
                    className={`flex items-center gap-1 ${methodInfo.color}`}
                  >
                    <MethodIcon size={14} />
                  </div>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={isDeleting}
                    className="btn-danger opacity-0 group-hover:opacity-100 flex items-center justify-center"
                    title="Delete expense"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 rounded-full border border-crimson-400 border-t-transparent animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>

                {/* Mobile layout */}
                <div className="sm:hidden flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[expense.category]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_DOTS[expense.category]}`} />
                        {expense.category}
                      </span>
                      <span className={`${methodInfo.color}`}>
                        <MethodIcon size={12} />
                      </span>
                    </div>
                    <p className="text-sm text-obsidian-200 truncate">{expense.description}</p>
                    <p className="text-xs text-obsidian-500 mt-0.5">{formatDate(expense.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono font-500 text-sm text-obsidian-100">
                      {formatCurrency(expense.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      disabled={isDeleting}
                      className="btn-danger"
                    >
                      {isDeleting ? (
                        <div className="w-4 h-4 rounded-full border border-crimson-400 border-t-transparent animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {expenses.length > 10 && (
          <div className="border-t border-obsidian-800 p-3 flex justify-center">
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn-ghost flex items-center gap-1.5 text-sm"
            >
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
              {expanded ? 'Show less' : `Show ${expenses.length - 10} more`}
            </button>
          </div>
        )}
      </div>

      {/* Receipt modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div
            className="absolute inset-0 bg-obsidian-950/90 backdrop-blur-sm"
            onClick={() => setReceiptModal(null)}
          />
          <div className="relative max-w-lg w-full animate-slide-up">
            <button
              onClick={() => setReceiptModal(null)}
              className="absolute -top-10 right-0 btn-ghost p-2"
            >
              <ChevronDown size={20} className="rotate-180" />
            </button>
            <img
              src={receiptModal}
              alt="Receipt"
              className="w-full rounded-2xl border border-obsidian-700"
            />
          </div>
        </div>
      )}
    </>
  );
}
