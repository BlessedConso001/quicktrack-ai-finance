
import React, { useState, useEffect } from 'react';
import { X, Mic, Camera, Edit, MicOff, Loader2 } from 'lucide-react';
import { useSupabaseTransactions } from '../context/SupabaseTransactionContext';
import { TransactionService } from '../services/transactionService';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputMethod: 'manual' | 'voice' | 'photo';
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  inputMethod 
}) => {
  const { addTransaction } = useSupabaseTransactions();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, formData.type]);

  const loadCategories = async () => {
    try {
      const categoryList = await TransactionService.getCategories(formData.type);
      setCategories(categoryList);
      if (categoryList.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: categoryList[0].name }));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount && formData.description) {
      try {
        await addTransaction({
          ...formData,
          amount: parseFloat(formData.amount),
          category: formData.category || categories[0]?.name || 'Other',
          input_method: inputMethod
        });
        onClose();
        setFormData({
          type: 'expense',
          amount: '',
          description: '',
          category: '',
          date: new Date().toISOString().split('T')[0]
        });
      } catch (error) {
        console.error('Error adding transaction:', error);
      }
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate voice processing
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          description: 'Office supplies purchase',
          amount: '125.50',
          category: 'Supplies'
        }));
        setIsRecording(false);
      }, 3000);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      // Simulate OCR processing
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          description: 'Restaurant receipt',
          amount: '89.75',
          category: 'Marketing'
        }));
        setIsProcessing(false);
      }, 2000);
    }
  };

  const getMethodIcon = () => {
    switch (inputMethod) {
      case 'voice': return <Mic className="h-5 w-5" />;
      case 'photo': return <Camera className="h-5 w-5" />;
      default: return <Edit className="h-5 w-5" />;
    }
  };

  const getMethodTitle = () => {
    switch (inputMethod) {
      case 'voice': return 'Voice Entry';
      case 'photo': return 'Receipt Scan';
      default: return 'Manual Entry';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-90vh overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {getMethodIcon()}
            <h2 className="text-xl font-semibold text-gray-900">{getMethodTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Special UI for voice input */}
          {inputMethod === 'voice' && (
            <div className="mb-6 text-center">
              <button
                onClick={handleVoiceRecord}
                className={`p-4 rounded-full transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                }`}
              >
                {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </button>
              <p className="mt-2 text-sm text-gray-600">
                {isRecording ? 'Recording... Tap to stop' : 'Tap to start recording'}
              </p>
            </div>
          )}

          {/* Special UI for photo input */}
          {inputMethod === 'photo' && (
            <div className="mb-6">
              <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors cursor-pointer">
                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-600">
                  {isProcessing ? 'Processing receipt...' : 'Click to upload receipt photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isProcessing}
                />
              </label>
              {isProcessing && (
                <div className="flex items-center justify-center mt-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-gray-600">Processing image...</span>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.type === 'expense'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.type === 'income'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (KSh)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What was this transaction for?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.amount || !formData.description}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Add Transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;
