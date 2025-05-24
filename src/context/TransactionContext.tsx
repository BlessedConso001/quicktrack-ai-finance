
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  inputMethod: 'voice' | 'photo' | 'manual';
  receiptImage?: string;
  createdAt: Date;
}

interface TransactionState {
  transactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

type TransactionAction = 
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction };

const initialState: TransactionState = {
  transactions: [
    {
      id: '1',
      type: 'income',
      amount: 2500,
      description: 'Client payment for web design',
      category: 'Services',
      date: '2024-01-20',
      inputMethod: 'manual',
      createdAt: new Date('2024-01-20')
    },
    {
      id: '2',
      type: 'expense',
      amount: 150,
      description: 'Office supplies from Staples',
      category: 'Supplies',
      date: '2024-01-19',
      inputMethod: 'photo',
      createdAt: new Date('2024-01-19')
    },
    {
      id: '3',
      type: 'expense',
      amount: 89,
      description: 'Business lunch with client',
      category: 'Marketing',
      date: '2024-01-18',
      inputMethod: 'voice',
      createdAt: new Date('2024-01-18')
    },
    {
      id: '4',
      type: 'income',
      amount: 1200,
      description: 'Logo design project',
      category: 'Services',
      date: '2024-01-17',
      inputMethod: 'manual',
      createdAt: new Date('2024-01-17')
    }
  ],
  totalIncome: 0,
  totalExpenses: 0,
  netProfit: 0
};

const calculateTotals = (transactions: Transaction[]) => {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  return {
    totalIncome: income,
    totalExpenses: expenses,
    netProfit: income - expenses
  };
};

// Calculate initial totals
const initialTotals = calculateTotals(initialState.transactions);
initialState.totalIncome = initialTotals.totalIncome;
initialState.totalExpenses = initialTotals.totalExpenses;
initialState.netProfit = initialTotals.netProfit;

function transactionReducer(state: TransactionState, action: TransactionAction): TransactionState {
  let newTransactions: Transaction[];
  
  switch (action.type) {
    case 'ADD_TRANSACTION':
      newTransactions = [...state.transactions, action.payload];
      break;
    case 'DELETE_TRANSACTION':
      newTransactions = state.transactions.filter(t => t.id !== action.payload);
      break;
    case 'UPDATE_TRANSACTION':
      newTransactions = state.transactions.map(t => 
        t.id === action.payload.id ? action.payload : t
      );
      break;
    default:
      return state;
  }

  const totals = calculateTotals(newTransactions);
  
  return {
    transactions: newTransactions,
    ...totals
  };
}

const TransactionContext = createContext<{
  state: TransactionState;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (transaction: Transaction) => void;
} | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  const updateTransaction = (transaction: Transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  };

  return (
    <TransactionContext.Provider value={{
      state,
      addTransaction,
      deleteTransaction,
      updateTransaction
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
