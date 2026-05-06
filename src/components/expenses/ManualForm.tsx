import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { ExpenseInsert, Category } from '../../types';
import { CATEGORIES } from '../../lib/utils';

interface ManualFormProps {
  onAdd: (expense: ExpenseInsert) => Promise<boolean>;
  defaultAmount?: string;
  defaultDescription?: string;
  defaultCategory?: Category;
  onSuccess?: () => void;
}

export default function ManualForm({
  onAdd,
  defaultAmount = '',
  defaultDescription = '',
  defaultCategory = 'Other',
  onSuccess,
}: ManualFormProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [description, setDescription] = useState(defaultDescription);
  const [category, setCategory] = useState<Category>(defaultCategory);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (!description.trim()) return;

    setLoading(true);
    const success = await onAdd({
      amount: numAmount,
      description: description.trim(),
      category,
      input_method: 'text',
    });

    if (success) {
      setAmount('');
      setDescription('');
      setCategory('Other');
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Amount ($)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="input-field"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="label">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="input-field appearance-none cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="input-field"
          placeholder="What was this for?"
          required
          maxLength={200}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 rounded-full border-2 border-obsidian-950 border-t-transparent animate-spin" />
        ) : (
          <>
            <Plus size={16} strokeWidth={2.5} />
            Add Expense
          </>
        )}
      </button>
    </form>
  );
}
