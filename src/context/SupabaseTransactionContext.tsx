
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { TransactionService, Transaction } from '../services/transactionService';
import { useAuth } from '../contexts/AuthContext';

interface TransactionState {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  loading: boolean;
  error: string | null;
}

type TransactionAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_SUMMARY'; payload: { totalIncome: number; totalExpenses: number; netProfit: number } };

export const formatCurrency = (amount: number): string => {
  return `KSh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const initialState: TransactionState = {
  transactions: [],
  totalIncome: 0,
  totalExpenses: 0,
  netProfit: 0,
  loading: false,
  error: null,
};

function transactionReducer(state: TransactionState, action: TransactionAction): TransactionState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload, loading: false };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? action.payload : t
        )
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload)
      };
    case 'SET_SUMMARY':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const SupabaseTransactionContext = createContext<{
  state: TransactionState;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loadTransactions: (filters?: any) => Promise<void>;
  refreshSummary: () => Promise<void>;
} | undefined>(undefined);

export const SupabaseTransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);
  const { user } = useAuth();

  const loadTransactions = async (filters?: any) => {
    if (!user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const transactions = await TransactionService.getTransactions(filters);
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
      await refreshSummary();
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTransaction = await TransactionService.createTransaction(transaction);
      dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
      await refreshSummary();
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = await TransactionService.updateTransaction(id, updates);
      dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
      await refreshSummary();
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await TransactionService.deleteTransaction(id);
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      await refreshSummary();
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const refreshSummary = async () => {
    try {
      const summary = await TransactionService.getFinancialSummary();
      dispatch({ type: 'SET_SUMMARY', payload: summary });
    } catch (error: any) {
      console.error('Error refreshing summary:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  return (
    <SupabaseTransactionContext.Provider value={{
      state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      loadTransactions,
      refreshSummary,
    }}>
      {children}
    </SupabaseTransactionContext.Provider>
  );
};

export const useSupabaseTransactions = () => {
  const context = useContext(SupabaseTransactionContext);
  if (context === undefined) {
    throw new Error('useSupabaseTransactions must be used within a SupabaseTransactionProvider');
  }
  return context;
};
