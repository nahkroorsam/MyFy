import { useMemo } from 'react';
import { LogOut, AlertTriangle, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useExpenses } from '../hooks/useExpenses';
import { useProfile } from '../hooks/useProfile';
import StatCards from '../components/dashboard/StatCards';
import ExpenseInput from '../components/expenses/ExpenseInput';
import ExpenseTable from '../components/expenses/ExpenseTable';

export default function DashboardPage() {
  const { signOut, user } = useAuth();
  const { expenses, loading: expensesLoading, addExpense, deleteExpense } = useExpenses();
  const { profile, loading: profileLoading, updateIncome } = useProfile();

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const income = profile?.monthly_income ?? 0;
  const remaining = income - totalExpenses;
  const spentPercent = income > 0 ? (totalExpenses / income) * 100 : 0;
  const isOverHalf = spentPercent > 50;

  return (
    <div className="min-h-screen bg-obsidian-950">
      {/* Header */}
      <header className="border-b border-obsidian-800 sticky top-0 z-10 backdrop-blur-md bg-obsidian-950/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-lime-400 flex items-center justify-center">
              <Wallet size={14} className="text-obsidian-950" />
            </div>
            <span className="font-display font-700 text-lg">MyFy</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-obsidian-500 hidden sm:block">{user?.email}</span>
            <button
              onClick={signOut}
              className="btn-ghost flex items-center gap-1.5 text-sm py-1.5 px-3"
            >
              <LogOut size={14} />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Over-budget alert */}
        {isOverHalf && income > 0 && (
          <div className="flex items-center gap-3 bg-crimson-500/10 border border-crimson-500/20 rounded-2xl px-5 py-4 animate-fade-in">
            <AlertTriangle size={18} className="text-crimson-400 flex-shrink-0" />
            <div>
              <p className="text-crimson-300 font-500 text-sm">You've spent over 50% of your monthly income</p>
              <p className="text-crimson-400/70 text-xs mt-0.5">Consider reviewing your expenses this month.</p>
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <StatCards
          income={income}
          totalExpenses={totalExpenses}
          remaining={remaining}
          spentPercent={spentPercent}
          isOverHalf={isOverHalf}
          onUpdateIncome={updateIncome}
          profileLoading={profileLoading}
        />

        {/* Add Expense */}
        <div>
          <h2 className="font-display font-700 text-sm uppercase tracking-widest text-obsidian-500 mb-3">
            Add Expense
          </h2>
          <ExpenseInput onAdd={addExpense} />
        </div>

        {/* Expense Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-700 text-sm uppercase tracking-widest text-obsidian-500">
              This Month
            </h2>
            <span className="text-xs text-obsidian-600 font-mono">
              {expenses.length} transaction{expenses.length !== 1 ? 's' : ''}
            </span>
          </div>
          <ExpenseTable
            expenses={expenses}
            loading={expensesLoading}
            onDelete={deleteExpense}
          />
        </div>
      </main>
    </div>
  );
}
