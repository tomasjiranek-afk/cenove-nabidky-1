import React, { useState } from 'react';
import type { Quote, LineItem, ClientAddress, QuoteItemTemplate } from '../types';
import { generateDescription, generateTerms } from '../services/geminiService';
import { PlusIcon, SparklesIcon, TrashIcon } from './icons';

interface QuoteFormProps {
  quote: Quote;
  setQuote: React.Dispatch<React.SetStateAction<Quote>>;
  addresses: ClientAddress[];
  quoteItemTemplates: QuoteItemTemplate[];
}

// Simple unique ID generator
const generateUniqueId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const QuoteForm: React.FC<QuoteFormProps> = ({ quote, setQuote, addresses, quoteItemTemplates }) => {
    const [generatingDescriptionIndex, setGeneratingDescriptionIndex] = useState<number | null>(null);
    const [generatingTerms, setGeneratingTerms] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setQuote(prev => ({ ...prev, [name]: value }));
    };
    
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setQuote(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setQuote(prev => ({ ...prev, logoUrl: undefined }));
    };


    const handleClientAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedAddress = addresses.find(addr => addr.id === selectedId);
        if (selectedAddress) {
            const formattedAddress = `${selectedAddress.street} ${selectedAddress.houseNumber}\n${selectedAddress.postalCode} ${selectedAddress.city}\n${selectedAddress.country}`;
            setQuote(prev => ({ ...prev, toName: selectedAddress.name, toAddress: formattedAddress }));
        } else {
            setQuote(prev => ({ ...prev, toName: '', toAddress: '' }));
        }
    };

    const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        const updatedLineItems = [...quote.lineItems];
        (updatedLineItems[index] as any)[field] = value;
        setQuote(prev => ({ ...prev, lineItems: updatedLineItems }));
    };

    const addLineItem = () => {
        setQuote(prev => ({
            ...prev,
            lineItems: [...prev.lineItems, { id: generateUniqueId(), description: '', quantity: 1, unitPrice: 0 }]
        }));
    };

    const addLineItemFromTemplate = (template: QuoteItemTemplate) => {
        setQuote(prev => ({
            ...prev,
            lineItems: [
                ...prev.lineItems,
                {
                    id: generateUniqueId(),
                    description: template.description,
                    unitPrice: template.unitPrice,
                    quantity: 1,
                }
            ]
        }));
    };

    const handleAddFromTemplate = () => {
        if (!selectedTemplateId) return;
        const template = quoteItemTemplates.find(t => t.id === selectedTemplateId);
        if (template) {
            addLineItemFromTemplate(template);
            setSelectedTemplateId(''); // Reset dropdown
        }
    };

    const removeLineItem = (index: number) => {
        const updatedLineItems = quote.lineItems.filter((_, i) => i !== index);
        setQuote(prev => ({ ...prev, lineItems: updatedLineItems }));
    };

    const handleGenerateDescription = async (index: number) => {
        const currentDescription = quote.lineItems[index].description;
        if (!currentDescription) return;
        setGeneratingDescriptionIndex(index);
        try {
            const newDescription = await generateDescription(currentDescription);
            handleLineItemChange(index, 'description', newDescription);
        } finally {
            setGeneratingDescriptionIndex(null);
        }
    };

    const handleGenerateTerms = async () => {
        setGeneratingTerms(true);
        try {
            const newTerms = await generateTerms();
            setQuote(prev => ({...prev, terms: newTerms}));
        } finally {
            setGeneratingTerms(false);
        }
    };

    return (
        <div className="space-y-6 bg-white p-8 shadow-lg rounded-2xl border border-gray-200">
            {/* From/To Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-700">Od</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Jméno / Společnost</label>
                        <input type="text" name="fromName" value={quote.fromName} onChange={handleInputChange} className="w-full p-2 border rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Adresa</label>
                        <textarea name="fromAddress" value={quote.fromAddress} onChange={handleInputChange} rows={3} className="w-full p-2 border rounded-md"/>
                    </div>
                     <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Logo</label>
                        <div className="flex items-center gap-4">
                            {quote.logoUrl && <img src={quote.logoUrl} alt="Náhled loga" className="h-12 w-12 object-contain border p-1 rounded-md" />}
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 hover:file:bg-blue-200" />
                            {quote.logoUrl && (
                                <button onClick={removeLogo} type="button" className="text-sm text-red-500 hover:text-red-700">
                                    Odebrat
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-700">Pro</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Klient</label>
                        <select onChange={handleClientAddressChange} className="w-full p-2 border rounded-md" defaultValue="">
                            <option value="">Vyberte klienta nebo zadejte ručně</option>
                            {addresses.map(addr => (
                                <option key={addr.id} value={addr.id}>{addr.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Jméno / Společnost</label>
                        <input type="text" name="toName" value={quote.toName} onChange={handleInputChange} className="w-full p-2 border rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Adresa</label>
                        <textarea name="toAddress" value={quote.toAddress} onChange={handleInputChange} rows={3} className="w-full p-2 border rounded-md"/>
                    </div>
                </div>
            </div>

            {/* Quote Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Číslo Nabídky</label>
                    <input type="text" name="quoteNumber" value={quote.quoteNumber} onChange={handleInputChange} className="w-full p-2 border rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Datum Vystavení</label>
                    <input type="date" name="date" value={quote.date} onChange={handleInputChange} className="w-full p-2 border rounded-md"/>
                </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
                <h3 className="font-bold text-lg text-gray-700 border-b pb-2 mb-2">Položky</h3>
                {quote.lineItems.map((item, index) => (
                    <div key={item.id} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex gap-2 items-start">
                            <textarea
                                placeholder="Popis položky..."
                                value={item.description}
                                onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                                rows={2}
                                className="w-full p-2 border rounded-md flex-grow"
                            />
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleGenerateDescription(index)}
                                    disabled={!item.description || generatingDescriptionIndex === index}
                                    className="p-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Vylepšit popis pomocí AI"
                                >
                                    {generatingDescriptionIndex === index ? '...' : <SparklesIcon className="w-5 h-5" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeLineItem(index)}
                                    className="p-2 text-red-500 hover:text-red-700"
                                    title="Odebrat položku"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Množství</label>
                                <input
                                    type="number"
                                    placeholder="Množství"
                                    value={item.quantity}
                                    onChange={(e) => handleLineItemChange(index, 'quantity', Number(e.target.value))}
                                    className="w-24 p-2 border rounded-md"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Cena/Jedn.</label>
                                <input
                                    type="number"
                                    placeholder="Cena/Jedn."
                                    value={item.unitPrice}
                                    onChange={(e) => handleLineItemChange(index, 'unitPrice', Number(e.target.value))}
                                    className="w-32 p-2 border rounded-md"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addLineItem} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 mt-2">
                    <PlusIcon className="w-5 h-5" />
                    Přidat Prázdnou Položku
                </button>
            </div>
            
            {quoteItemTemplates.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                    <h3 className="font-bold text-md text-gray-700 mb-2">Přidat z uložených položek</h3>
                     <div className="flex items-center gap-2">
                        <select 
                            value={selectedTemplateId} 
                            onChange={(e) => setSelectedTemplateId(e.target.value)} 
                            className="w-full p-2 border rounded-md bg-white"
                        >
                            <option value="">Vyberte uloženou položku</option>
                            {quoteItemTemplates.map(template => (
                                <option key={template.id} value={template.id}>
                                    {template.description} ({new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(template.unitPrice)})
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={handleAddFromTemplate}
                            disabled={!selectedTemplateId}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Přidat
                        </button>
                    </div>
                </div>
            )}


            {/* Totals & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Daň (%)</label>
                        <input
                            type="number"
                            name="taxRate"
                            value={quote.taxRate}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded-md"
                            min="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Poznámky</label>
                        <textarea
                            name="notes"
                            value={quote.notes}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-600">Obchodní Podmínky</label>
                            <button
                                type="button"
                                onClick={handleGenerateTerms}
                                disabled={generatingTerms}
                                className="flex items-center gap-1 text-sm text-purple-700 hover:text-purple-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <SparklesIcon className="w-4 h-4" />
                                {generatingTerms ? 'Generuji...' : 'Vygenerovat'}
                            </button>
                        </div>
                        <textarea
                            name="terms"
                            value={quote.terms}
                            onChange={handleInputChange}
                            rows={8}
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteForm;