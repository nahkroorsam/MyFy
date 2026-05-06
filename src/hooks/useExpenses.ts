import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Expense, ExpenseInsert } from '../types';

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load expenses');
    } else {
      setExpenses(data as Expense[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (expense: ExpenseInsert): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase
      .from('expenses')
      .insert({ ...expense, user_id: user.id });

    if (error) {
      toast.error('Failed to add expense');
      return false;
    }

    toast.success('Expense added!');
    await fetchExpenses();
    return true;
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete expense');
    } else {
      setExpenses(prev => prev.filter(e => e.id !== id));
      toast.success('Expense deleted');
    }
  };

  return { expenses, loading, addExpense, deleteExpense, refetch: fetchExpenses };
}
