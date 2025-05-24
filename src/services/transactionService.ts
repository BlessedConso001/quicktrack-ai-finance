
import { supabase } from '../integrations/supabase/client';

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  input_method: 'voice' | 'photo' | 'manual';
  receipt_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  created_at: string;
}

export class TransactionService {
  static async getTransactions(filters?: {
    type?: 'income' | 'expense';
    category?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.ilike('description', `%${filters.search}%`);
    }

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data as Transaction[];
  }

  static async createTransaction(transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        ...transaction,
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  }

  static async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getFinancialSummary() {
    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount');

    if (error) throw error;

    const summary = data.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.totalIncome += transaction.amount;
        } else {
          acc.totalExpenses += transaction.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 }
    );

    return {
      ...summary,
      netProfit: summary.totalIncome - summary.totalExpenses,
    };
  }

  static async getCategories(type?: 'income' | 'expense') {
    let query = supabase
      .from('categories')
      .select('*')
      .order('name');

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Category[];
  }

  static async getBusinessProfile() {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .single();

    if (error) throw error;
    return data as BusinessProfile;
  }
}
