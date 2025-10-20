import React, { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import QuoteEditorPage from './pages/QuoteEditorPage';
import AddressBookPage from './pages/AddressBookPage';
import QuoteItemsPage from './pages/QuoteItemsPage';
import type { Quote, ClientAddress, QuoteItemTemplate } from './types';

// Simple unique ID generator
const generateUniqueId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


type View = 'home' | 'editor' | 'addressBook' | 'quoteItems';

const newQuoteTemplate = (quotes: Quote[]): Quote => {
  const latestQuoteNumber = quotes.length > 0
    ? Math.max(...quotes.map(q => parseInt(q.quoteNumber.replace(/[^0-9]/g, ''), 10) || 0))
    : 0;

  return {
    id: 'new',
    quoteNumber: (latestQuoteNumber + 1).toString().padStart(4, '0'),
    date: new Date().toISOString().split('T')[0],
    fromName: 'Vaše Jméno / Společnost',
    fromAddress: 'Vaše Adresa\nPSČ, Město',
    toName: '',
    toAddress: '',
    lineItems: [{ id: generateUniqueId(), description: '', quantity: 1, unitPrice: 0 }],
    taxRate: 21,
    notes: '',
    terms: 'Splatnost faktury je 14 dní. Platba je možná bankovním převodem.',
  };
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    try {
        const savedQuotes = localStorage.getItem('quotes');
        return savedQuotes ? JSON.parse(savedQuotes) : [];
    } catch (e) {
        return [];
    }
  });
  const [addresses, setAddresses] = useState<ClientAddress[]>(() => {
     try {
        const savedAddresses = localStorage.getItem('clientAddresses');
        return savedAddresses ? JSON.parse(savedAddresses) : [];
    } catch (e) {
        return [];
    }
  });
  const [quoteItemTemplates, setQuoteItemTemplates] = useState<QuoteItemTemplate[]>(() => {
    try {
      const savedItems = localStorage.getItem('quoteItemTemplates');
      return savedItems ? JSON.parse(savedItems) : [];
    } catch (e) {
      return [];
    }
  });
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem('clientAddresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('quoteItemTemplates', JSON.stringify(quoteItemTemplates));
  }, [quoteItemTemplates]);

  const handleNewQuote = () => {
    setSelectedQuoteId(null);
    setView('editor');
  };

  const handleSelectQuote = (id: string) => {
    setSelectedQuoteId(id);
    setView('editor');
  };

  const handleDeleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  const handleSaveQuote = (quoteToSave: Quote) => {
    setQuotes(prev => {
        if (quoteToSave.id === 'new') {
            return [...prev, { ...quoteToSave, id: generateUniqueId() }];
        }
        return prev.map(q => q.id === quoteToSave.id ? quoteToSave : q);
    });
    setView('home');
  };
  
  const handleSaveAddress = (addressToSave: ClientAddress) => {
    setAddresses(prev => {
        if (addressToSave.id === 'new') {
            return [...prev, { ...addressToSave, id: generateUniqueId() }];
        }
        return prev.map(a => a.id === addressToSave.id ? addressToSave : a);
    });
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const handleSaveQuoteItemTemplate = (itemToSave: QuoteItemTemplate) => {
    setQuoteItemTemplates(prev => {
      if (itemToSave.id === 'new') {
        return [...prev, { ...itemToSave, id: generateUniqueId() }];
      }
      return prev.map(i => i.id === itemToSave.id ? itemToSave : i);
    });
  };

  const handleDeleteQuoteItemTemplate = (id: string) => {
    setQuoteItemTemplates(prev => prev.filter(i => i.id !== id));
  };
  
  const handleManageAddresses = () => {
    setView('addressBook');
  };

  const handleManageQuoteItems = () => {
    setView('quoteItems');
  };

  const renderContent = () => {
    switch (view) {
      case 'editor':
        const selectedQuote = quotes.find(q => q.id === selectedQuoteId) || newQuoteTemplate(quotes);
        return <QuoteEditorPage 
          initialQuote={selectedQuote} 
          onSave={handleSaveQuote} 
          onBack={() => setView('home')} 
          addresses={addresses} 
          quoteItemTemplates={quoteItemTemplates}
        />;
      case 'addressBook':
        return <AddressBookPage addresses={addresses} onSaveAddress={handleSaveAddress} onDeleteAddress={handleDeleteAddress} onBack={() => setView('home')} />;
      case 'quoteItems':
        return <QuoteItemsPage 
          items={quoteItemTemplates} 
          onSaveItem={handleSaveQuoteItemTemplate} 
          onDeleteItem={handleDeleteQuoteItemTemplate} 
          onBack={() => setView('home')}
        />;
      case 'home':
      default:
        return <HomePage quotes={quotes} onNewQuote={handleNewQuote} onSelectQuote={handleSelectQuote} onDeleteQuote={handleDeleteQuote} onManageAddresses={handleManageAddresses} onManageQuoteItems={handleManageQuoteItems} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            {renderContent()}
        </div>
    </div>
  );
};

export default App;
