import React, { useState, useEffect } from 'react';
import type { QuoteItemTemplate } from '../types';
import { ArrowLeftIcon, PencilIcon, TrashIcon, SaveIcon } from '../components/icons';
import { formatCurrency } from '../utils/formatters';

interface QuoteItemsPageProps {
  items: QuoteItemTemplate[];
  onSaveItem: (item: QuoteItemTemplate) => void;
  onDeleteItem: (id: string) => void;
  onBack: () => void;
}

const EMPTY_ITEM: QuoteItemTemplate = { id: 'new', description: '', unitPrice: 0 };

const QuoteItemsPage: React.FC<QuoteItemsPageProps> = ({ items, onSaveItem, onDeleteItem, onBack }) => {
  const [editingItem, setEditingItem] = useState<QuoteItemTemplate | null>(null);
  const [formState, setFormState] = useState<QuoteItemTemplate>(EMPTY_ITEM);

  useEffect(() => {
    if (editingItem) {
      setFormState(editingItem);
    } else {
      setFormState(EMPTY_ITEM);
    }
  }, [editingItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormState(prev => ({ 
        ...prev, 
        [name]: type === 'number' ? Number(value) : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.description && formState.unitPrice >= 0) {
      onSaveItem(formState);
      setEditingItem(null);
    }
  };

  const handleEdit = (item: QuoteItemTemplate) => {
    setEditingItem(item);
    window.scrollTo(0, 0);
  };
  
  const handleCancel = () => {
    setEditingItem(null);
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Opravdu chcete smazat tuto položku?')) {
      onDeleteItem(id);
      if (editingItem?.id === id) {
        setEditingItem(null);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-2">
          <ArrowLeftIcon className="w-4 h-4" />
          Zpět na přehled
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Uložené Položky Nabídky</h1>
      </div>

      <div className="bg-white p-8 shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-3">
          {editingItem ? 'Upravit Položku' : 'Přidat Novou Položku'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">Popis</label>
            <textarea
              id="description"
              name="description"
              value={formState.description}
              onChange={handleInputChange}
              placeholder="Např. Webdesign - úvodní stránka"
              rows={3}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-600 mb-1">Cena za jednotku</label>
            <input
              type="number"
              id="unitPrice"
              name="unitPrice"
              value={formState.unitPrice}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex items-center gap-4">
            <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              <SaveIcon className="w-5 h-5" />
              {editingItem ? 'Uložit Změny' : 'Uložit Položku'}
            </button>
            {editingItem && (
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                Zrušit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <h2 className="text-2xl font-bold text-gray-700 p-6 border-b">Seznam Položek</h2>
        {items.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {items.map(item => (
              <li key={item.id} className="p-6 flex justify-between items-start hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-800">{item.description}</p>
                  <p className="text-sm text-gray-600 mt-1">{formatCurrency(item.unitPrice)}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-center text-gray-500">Zatím žádné uložené položky.</p>
        )}
      </div>
    </div>
  );
};

export default QuoteItemsPage;
