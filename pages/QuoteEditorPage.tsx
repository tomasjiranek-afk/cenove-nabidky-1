import React, { useState, useMemo } from 'react';
import QuoteForm from '../components/QuoteForm';
import QuotePreview from '../components/QuotePreview';
import type { Quote, ClientAddress, QuoteItemTemplate } from '../types';
import { PrintIcon, SaveIcon, ArrowLeftIcon, DownloadIcon } from '../components/icons';

declare const html2pdf: any;

interface QuoteEditorPageProps {
  initialQuote: Quote;
  onSave: (quote: Quote) => void;
  onBack: () => void;
  addresses: ClientAddress[];
  quoteItemTemplates: QuoteItemTemplate[];
}

const QuoteEditorPage: React.FC<QuoteEditorPageProps> = ({ initialQuote, onSave, onBack, addresses, quoteItemTemplates }) => {
  const [quote, setQuote] = useState<Quote>(initialQuote);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { subtotal, taxAmount, total } = useMemo(() => {
    const subtotal = quote.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const taxAmount = subtotal * (quote.taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }, [quote.lineItems, quote.taxRate]);

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePdf = () => {
    if (typeof html2pdf === 'undefined') {
      console.error('html2pdf.js is not loaded.');
      alert('Chyba při generování PDF. Knihovna pro generování není načtena.');
      return;
    }

    setIsGeneratingPdf(true);
    const element = document.getElementById('print-area');
    const opt = {
      margin:       0.5,
      filename:     `Nabidka-${quote.quoteNumber || 'XXXX'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save().then(() => {
        setIsGeneratingPdf(false);
    }).catch((err: any) => {
        console.error("PDF generation failed:", err);
        alert('Při generování PDF došlo k chybě.');
        setIsGeneratingPdf(false);
    });
  };
  
  const handleBack = () => {
    onBack();
  }

  return (
    <div>
        <header className="mb-8 print:hidden">
            <div className="flex justify-between items-center">
                <div>
                    <button 
                        onClick={handleBack}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-2"
                    >
                        <ArrowLeftIcon className="w-4 h-4"/>
                        Zpět na přehled
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {initialQuote.id === 'new' ? 'Nová Nabídka' : `Upravit Nabídku ${quote.quoteNumber}`}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleGeneratePdf}
                        disabled={isGeneratingPdf}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-wait"
                    >
                        <DownloadIcon className="w-5 h-5"/>
                        {isGeneratingPdf ? 'Generuji...' : 'Stáhnout PDF'}
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        <PrintIcon className="w-5 h-5"/>
                        Tisk
                    </button>
                    <button 
                        onClick={() => onSave(quote)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <SaveIcon className="w-5 h-5"/>
                        Uložit Nabídku
                    </button>
                </div>
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="print:hidden">
                <QuoteForm quote={quote} setQuote={setQuote} addresses={addresses} quoteItemTemplates={quoteItemTemplates} />
            </div>
            <div className="lg:sticky lg:top-8">
                <QuotePreview quote={quote} subtotal={subtotal} taxAmount={taxAmount} total={total}/>
            </div>
        </div>
    </div>
  );
};

export default QuoteEditorPage;