import React, { useMemo, useState } from 'react';
import type { Quote } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, AddressBookIcon, DocumentTextIcon, DownloadIcon, SpinnerIcon } from '../components/icons';
import { formatCurrency, formatDate } from '../utils/formatters';
import { generateQuotePdf } from '../utils/pdfGenerator';


interface HomePageProps {
  quotes: Quote[];
  onNewQuote: () => void;
  onSelectQuote: (id: string) => void;
  onDeleteQuote: (id: string) => void;
  onManageAddresses: () => void;
  onManageQuoteItems: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ quotes, onNewQuote, onSelectQuote, onDeleteQuote, onManageAddresses, onManageQuoteItems }) => {
    
    const [filters, setFilters] = useState({ quoteNumber: '', clientName: '', date: '' });
    const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent row click event
        if (window.confirm('Opravdu chcete smazat tuto nabídku?')) {
            onDeleteQuote(id);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleDownloadPdf = async (e: React.MouseEvent, quote: Quote) => {
        e.stopPropagation();
        setGeneratingPdfId(quote.id);
        try {
            await generateQuotePdf(quote);
        } catch (error) {
            console.error("PDF generation on homepage failed", error);
        } finally {
            setGeneratingPdfId(null);
        }
    };
    
    const quotesWithTotals = useMemo(() => {
        return quotes.map(quote => {
            const subtotal = quote.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
            const total = subtotal * (1 + quote.taxRate / 100);
            return { ...quote, total };
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [quotes]);

    const filteredQuotes = useMemo(() => {
        return quotesWithTotals.filter(quote => {
            const quoteNumberMatch = filters.quoteNumber 
                ? quote.quoteNumber.toLowerCase().includes(filters.quoteNumber.toLowerCase()) 
                : true;
            const clientNameMatch = filters.clientName 
                ? quote.toName.toLowerCase().includes(filters.clientName.toLowerCase()) 
                : true;
            const dateMatch = filters.date ? quote.date === filters.date : true;
            return quoteNumberMatch && clientNameMatch && dateMatch;
        });
    }, [quotesWithTotals, filters]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Moje Nabídky</h1>
                <div className="flex items-center gap-2">
                     <button 
                        onClick={onManageAddresses}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <AddressBookIcon className="w-5 h-5" />
                        Adresář
                    </button>
                    <button 
                        onClick={onManageQuoteItems}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <DocumentTextIcon className="w-5 h-5" />
                        Položky nabídky
                    </button>
                    <button 
                        onClick={onNewQuote}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Vytvořit Nabídku
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                <div className="p-4 border-b">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <input 
                            type="text" 
                            name="quoteNumber" 
                            value={filters.quoteNumber} 
                            onChange={handleFilterChange} 
                            placeholder="Filtrovat podle č. nabídky..." 
                            className="p-2 border rounded-md w-full" 
                            aria-label="Filtr podle čísla nabídky"
                        />
                        <input 
                            type="text" 
                            name="clientName" 
                            value={filters.clientName} 
                            onChange={handleFilterChange} 
                            placeholder="Filtrovat podle klienta..." 
                            className="p-2 border rounded-md w-full" 
                            aria-label="Filtr podle klienta"
                        />
                        <input 
                            type="date" 
                            name="date" 
                            value={filters.date} 
                            onChange={handleFilterChange} 
                            className="p-2 border rounded-md w-full"
                            aria-label="Filtr podle data" 
                        />
                        <button onClick={() => setFilters({ quoteNumber: '', clientName: '', date: '' })} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 w-full md:w-auto">
                            Vymazat filtry
                        </button>
                    </div>
                </div>
                {filteredQuotes.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nabídka č.</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Klient</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Celkem</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Akce</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredQuotes.map((quote) => (
                                    <tr key={quote.id} onClick={() => onSelectQuote(quote.id)} className="hover:bg-gray-50 cursor-pointer">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quote.quoteNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{quote.toName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(quote.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold text-right">{formatCurrency(quote.total)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex items-center justify-center gap-4">
                                                <button onClick={() => onSelectQuote(quote.id)} className="text-blue-600 hover:text-blue-900" aria-label={`Upravit nabídku ${quote.quoteNumber}`}>
                                                    <PencilIcon className="w-5 h-5"/>
                                                </button>
                                                <button 
                                                    onClick={(e) => handleDownloadPdf(e, quote)} 
                                                    disabled={generatingPdfId === quote.id}
                                                    className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-wait" 
                                                    aria-label={`Stáhnout PDF pro nabídku ${quote.quoteNumber}`}
                                                >
                                                    {generatingPdfId === quote.id ? (
                                                        <SpinnerIcon className="animate-spin w-5 h-5"/> 
                                                    ) : (
                                                        <DownloadIcon className="w-5 h-5" />
                                                    )}
                                                </button>
                                                <button onClick={(e) => handleDelete(e, quote.id)} className="text-red-600 hover:text-red-900" aria-label={`Smazat nabídku ${quote.quoteNumber}`}>
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 px-6">
                        <h3 className="text-lg font-medium text-gray-700">Žádné nabídky nevyhovují filtru</h3>
                        <p className="mt-1 text-sm text-gray-500">Zkuste upravit nebo smazat filtry.</p>
                        <div className="mt-6">
                            <button
                                onClick={onNewQuote}
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                Vytvořit Novou Nabídku
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;