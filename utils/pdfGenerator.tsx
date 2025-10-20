import React from 'react';
import ReactDOM from 'react-dom/client';
import type { Quote } from '../types';
import QuotePreview from '../components/QuotePreview';

declare const html2pdf: any;

const calculateTotals = (quote: Quote) => {
    const subtotal = quote.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const taxAmount = subtotal * (quote.taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
}

export const generatePdfFromDom = (element: HTMLElement, quote: Quote): Promise<void> => {
     if (typeof html2pdf === 'undefined') {
        const errorMsg = 'html2pdf.js is not loaded.';
        console.error(errorMsg);
        alert('Chyba při generování PDF. Knihovna pro generování není načtena.');
        return Promise.reject(new Error(errorMsg));
    }

    const opt = {
        margin:       0.5,
        filename:     `Nabidka-${quote.quoteNumber || 'XXXX'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    return html2pdf().from(element).set(opt).save();
}

export const generateQuotePdf = (quote: Quote): Promise<void> => {
    return new Promise((resolve, reject) => {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '210mm'; // A4 width
        container.style.zIndex = '-1'; // Hide it behind everything
        container.style.opacity = '0'; // Make it invisible
        container.style.pointerEvents = 'none'; // Don't capture mouse events

        document.body.appendChild(container);

        const { subtotal, taxAmount, total } = calculateTotals(quote);
        const PreviewComponent = (
            <div style={{ backgroundColor: 'white' }}>
                 <QuotePreview quote={quote} subtotal={subtotal} taxAmount={taxAmount} total={total} />
            </div>
        );
        const root = ReactDOM.createRoot(container);
        
        const cleanup = () => {
            root.unmount();
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
        };

        try {
            root.render(PreviewComponent);

            setTimeout(() => {
                const elementToPrint = container.querySelector('#print-area');
                if (!elementToPrint) {
                    console.error('Could not find element to generate PDF from.');
                    cleanup();
                    return reject(new Error('PDF generation element not found.'));
                }
                
                generatePdfFromDom(elementToPrint as HTMLElement, quote)
                    .then(() => {
                        cleanup();
                        resolve();
                    })
                    .catch((err) => {
                        alert('Při generování PDF došlo k chybě.');
                        cleanup();
                        reject(err);
                    });
            }, 100);
        } catch(err) {
            console.error("Error during render for PDF generation:", err);
            cleanup();
            reject(err);
        }
    });
};