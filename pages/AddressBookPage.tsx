import React, { useState, useEffect } from 'react';
import type { ClientAddress } from '../types';
import { ArrowLeftIcon, PencilIcon, TrashIcon, SaveIcon, PlusIcon } from '../components/icons';

interface AddressBookPageProps {
  addresses: ClientAddress[];
  onSaveAddress: (address: ClientAddress) => void;
  onDeleteAddress: (id: string) => void;
  onBack: () => void;
}

const EMPTY_ADDRESS: ClientAddress = { id: 'new', name: '', street: '', houseNumber: '', city: '', postalCode: '', country: 'Česká republika' };

const AddressBookPage: React.FC<AddressBookPageProps> = ({ addresses, onSaveAddress, onDeleteAddress, onBack }) => {
  const [editingAddress, setEditingAddress] = useState<ClientAddress | null>(null);
  const [formState, setFormState] = useState<ClientAddress>(EMPTY_ADDRESS);

  useEffect(() => {
    if (editingAddress) {
      setFormState(editingAddress);
    } else {
      setFormState(EMPTY_ADDRESS);
    }
  }, [editingAddress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.name && formState.street && formState.city && formState.postalCode && formState.country) {
      onSaveAddress(formState);
      setEditingAddress(null);
    }
  };

  const handleEdit = (address: ClientAddress) => {
    setEditingAddress(address);
    window.scrollTo(0, 0);
  };
  
  const handleCancel = () => {
    setEditingAddress(null);
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Opravdu chcete smazat tuto adresu?')) {
      onDeleteAddress(id);
      if (editingAddress?.id === id) {
        setEditingAddress(null);
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
        <h1 className="text-3xl font-bold text-gray-800">Adresář Klientů</h1>
      </div>

      <div className="bg-white p-8 shadow-lg rounded-2xl">
        <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-3">
          {editingAddress ? 'Upravit Adresu' : 'Přidat Novou Adresu'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">Jméno / Společnost</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              placeholder="Jméno klienta"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label htmlFor="street" className="block text-sm font-medium text-gray-600 mb-1">Ulice</label>
                <input type="text" id="street" name="street" value={formState.street} onChange={handleInputChange} className="w-full p-2 border rounded-md" required />
              </div>
              <div>
                <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-600 mb-1">Č.p.</label>
                <input type="text" id="houseNumber" name="houseNumber" value={formState.houseNumber} onChange={handleInputChange} className="w-full p-2 border rounded-md" required />
              </div>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-600 mb-1">Město</label>
              <input type="text" id="city" name="city" value={formState.city} onChange={handleInputChange} className="w-full p-2 border rounded-md" required />
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-600 mb-1">PSČ</label>
              <input type="text" id="postalCode" name="postalCode" value={formState.postalCode} onChange={handleInputChange} className="w-full p-2 border rounded-md" required />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="country" className="block text-sm font-medium text-gray-600 mb-1">Země</label>
              <input type="text" id="country" name="country" value={formState.country} onChange={handleInputChange} className="w-full p-2 border rounded-md" required />
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              <SaveIcon className="w-5 h-5" />
              {editingAddress ? 'Uložit Změny' : 'Uložit Adresu'}
            </button>
            {editingAddress && (
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                Zrušit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <h2 className="text-2xl font-bold text-gray-700 p-6 border-b">Uložené Adresy</h2>
        {addresses.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {addresses.map(address => (
              <li key={address.id} className="p-6 flex justify-between items-start hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-800">{address.name}</p>
                   <p className="text-sm text-gray-600 mt-1 font-sans">
                      {address.street} {address.houseNumber}<br/>
                      {address.postalCode} {address.city}<br/>
                      {address.country}
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <button onClick={() => handleEdit(address)} className="text-blue-600 hover:text-blue-900">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(address.id)} className="text-red-600 hover:text-red-900">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-6 text-center text-gray-500">Zatím žádné uložené adresy.</p>
        )}
      </div>
    </div>
  );
};

export default AddressBookPage;