
import React, { useState } from 'react';
import { Plus, Mic, Camera, Edit } from 'lucide-react';
import { useSupabaseTransactions, formatCurrency } from '../context/SupabaseTransactionContext';
import MetricCard from './MetricCard';
import QuickActions from './QuickActions';
import RecentTransactions from './RecentTransactions';
import AddTransactionModal from './AddTransactionModal';

const Dashboard = () => {
  const { state } = useSupabaseTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputMethod, setInputMethod] = useState<'manual' | 'voice' | 'photo'>('manual');

  const profitMargin = state.totalIncome > 0 ? (state.netProfit / state.totalIncome) * 100 : 0;

  const handleQuickAction = (method: 'manual' | 'voice' | 'photo') => {
    setInputMethod(method);
    setIsModalOpen(true);
  };

  if (state.loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
        <p className="text-gray-600">Track your business income and expenses in real-time</p>
      </div>

      {state.error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {state.error}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Income"
          value={formatCurrency(state.totalIncome)}
          change="+12.5%"
          changeType="positive"
          icon="trending-up"
        />
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(state.totalExpenses)}
          change="+5.2%"
          changeType="negative"
          icon="trending-down"
        />
        <MetricCard
          title="Net Profit"
          value={formatCurrency(state.netProfit)}
          change="+18.3%"
          changeType={state.netProfit >= 0 ? "positive" : "negative"}
          icon="dollar-sign"
        />
        <MetricCard
          title="Profit Margin"
          value={`${profitMargin.toFixed(1)}%`}
          change="+2.1%"
          changeType="positive"
          icon="percent"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions onActionClick={handleQuickAction} />

      {/* Recent Transactions */}
      <RecentTransactions />

      {/* Add Transaction Modal */}
      <AddTransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        inputMethod={inputMethod}
      />
    </div>
  );
};

export default Dashboard;
