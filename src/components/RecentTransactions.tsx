
import React from 'react';
import { Mic, Camera, Edit, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useSupabaseTransactions, formatCurrency } from '../context/SupabaseTransactionContext';

const RecentTransactions = () => {
  const { state } = useSupabaseTransactions();
  
  const recentTransactions = state.transactions.slice(0, 5);

  const getInputMethodIcon = (method: string) => {
    switch (method) {
      case 'voice': return <Mic className="h-4 w-4" />;
      case 'photo': return <Camera className="h-4 w-4" />;
      default: return <Edit className="h-4 w-4" />;
    }
  };

  const getInputMethodColor = (method: string) => {
    switch (method) {
      case 'voice': return 'text-blue-600 bg-blue-50';
      case 'photo': return 'text-green-600 bg-green-50';
      default: return 'text-purple-600 bg-purple-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions yet</p>
            <p className="text-sm">Add your first transaction to get started</p>
          </div>
        ) : (
          recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500">{transaction.category}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                    <div className={`p-1 rounded ${getInputMethodColor(transaction.input_method)}`}>
                      {getInputMethodIcon(transaction.input_method)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
