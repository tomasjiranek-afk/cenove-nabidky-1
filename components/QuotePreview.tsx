import React from 'react';
import type { Quote } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface QuotePreviewProps {
  quote: Quote;
  subtotal: number;
  taxAmount: number;
  total: number;
}

const QuotePreview: React.FC<QuotePreviewProps> = ({ quote, subtotal, taxAmount, total }) => {
  return (
    <div className="bg-white p-8 shadow-lg rounded-2xl border border-gray-200" id="quote-preview">
      <header className="flex justify-between items-start pb-6 border-b-2 border-gray-200">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">{quote.fromName || 'Vaše Jméno / Společnost'}</h1>
          <pre className="text-sm text-gray-600 mt-2 whitespace-pre-wrap font-sans">{quote.fromAddress || 'Vaše Adresa'}</pre>
        </div>
        <h2 className="text-2xl font-bold text-gray-500 uppercase tracking-widest">Nabídka</h2>
      </header>

      <section className="grid grid-cols-2 gap-8 mt-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Pro</h3>
          <p className="font-bold text-gray-800">{quote.toName || 'Jméno Klienta'}</p>
          <pre className="text-sm text-gray-600 mt-1 whitespace-pre-wrap font-sans">{quote.toAddress || 'Adresa Klienta'}</pre>
        </div>
        <div className="text-right">
          <div>
            <span className="text-sm font-semibold text-gray-500">Číslo Nabídky: </span>
            <span className="text-sm text-gray-800">{quote.quoteNumber || 'N/A'}</span>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-500">Datum Vystavení: </span>
            <span className="text-sm text-gray-800">{formatDate(quote.date)}</span>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-sm font-semibold text-gray-600 uppercase">Popis</th>
              <th className="p-3 text-sm font-semibold text-gray-600 uppercase text-right">Množství</th>
              <th className="p-3 text-sm font-semibold text-gray-600 uppercase text-right">Cena/Jedn.</th>
              <th className="p-3 text-sm font-semibold text-gray-600 uppercase text-right">Celkem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {quote.lineItems.map(item => (
              <tr key={item.id}>
                <td className="p-3 text-sm text-gray-800">{item.description}</td>
                <td className="p-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                <td className="p-3 text-sm text-gray-600 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="p-3 text-sm text-gray-800 font-medium text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
             {quote.lineItems.length === 0 && (
                <tr>
                    <td colSpan={4} className="p-3 text-center text-gray-500">Žádné položky</td>
                </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="mt-6 flex justify-end">
        <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-600">Mezisoučet:</span>
                <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-600">Daň ({quote.taxRate}%):</span>
                <span className="font-medium text-gray-800">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-800">Celkem:</span>
                <span className="font-bold text-gray-800">{formatCurrency(total)}</span>
            </div>
        </div>
      </section>

      {quote.notes && (
        <section className="mt-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Poznámky</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">{quote.notes}</p>
        </section>
      )}

      {quote.terms && (
          <section className="mt-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Obchodní Podmínky</h3>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans">{quote.terms}</pre>
          </section>
      )}

      <footer className="mt-12 text-center text-xs text-gray-400">
          <p>Děkujeme za Váš zájem.</p>
      </footer>
    </div>
  );
};

export default QuotePreview;
