export type Category = 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Entertainment' | 'Other';
export type InputMethod = 'text' | 'voice' | 'receipt';

export interface Profile {
  id: string;
  email: string;
  monthly_income: number;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: Category;
  input_method: InputMethod;
  receipt_url?: string | null;
  created_at: string;
}

export type ExpenseInsert = Omit<Expense, 'id' | 'user_id' | 'created_at'>;

export interface VoiceParsedResult {
  amount: number | null;
  description: string;
}
