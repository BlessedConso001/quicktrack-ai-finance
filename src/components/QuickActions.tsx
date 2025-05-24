
import React from 'react';
import { Plus, Mic, Camera, Edit } from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (method: 'manual' | 'voice' | 'photo') => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onActionClick('voice')}
          className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Mic className="h-5 w-5 mr-2" />
          Voice Entry
        </button>
        <button
          onClick={() => onActionClick('photo')}
          className="flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Camera className="h-5 w-5 mr-2" />
          Scan Receipt
        </button>
        <button
          onClick={() => onActionClick('manual')}
          className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Edit className="h-5 w-5 mr-2" />
          Manual Entry
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
