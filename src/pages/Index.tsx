
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import Transactions from '../components/Transactions';
import Analytics from '../components/Analytics';
import Sidebar from '../components/Sidebar';
import { SupabaseTransactionProvider } from '../context/SupabaseTransactionContext';

const Index = () => {
  return (
    <SupabaseTransactionProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </SupabaseTransactionProvider>
  );
};

export default Index;
