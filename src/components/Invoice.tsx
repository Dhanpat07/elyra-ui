/**
 * Invoice Component & Generator
 * 
 * Professional invoice template for LAALI AI Platform
 * - Displays invoice details
 * - Can be printed/saved as PDF
 * - Supports INR and USD
 */

import { forwardRef } from 'react';
import { Download, Printer, Mail, CheckCircle } from 'lucide-react';

// Types
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceData {
  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  
  // Company Details (LAALI)
  company: {
    name: string;
    address: string[];
    email: string;
    phone: string;
    gstin?: string;
    pan?: string;
  };
  
  // Customer Details
  customer: {
    name: string;
    email: string;
    address: string[];
    gstin?: string;
  };
  
  // Billing
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  currency: 'INR' | 'USD';
  
  // Payment
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: string;
  
  // Plan
  plan: string;
  billingPeriod: string;
}

// Default company info
const LAALI_COMPANY = {
  name: 'LAALI AI Corporation',
  address: [
    '123 Tech Park, HSR Layout',
    'Bangalore, Karnataka 560102',
    'India'
  ],
  email: 'billing@laaliai.com',
  phone: '+91 80 4567 8900',
  gstin: '29AABCU9603R1ZM',
  pan: 'AABCU9603R',
};

// Format currency
const formatCurrency = (amount: number, currency: 'INR' | 'USD') => {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return `$${amount.toLocaleString('en-US')}`;
};

// Format date
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Invoice Component (Printable)
export const Invoice = forwardRef<HTMLDivElement, { data: InvoiceData }>(
  ({ data }, ref) => {
    const isPaid = data.status === 'paid';

    return (
      <div 
        ref={ref}
        className="bg-white text-gray-900 p-8 max-w-4xl mx-auto"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-gray-200">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/laali-logo.png" 
                alt="LAALI" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LAALI</h1>
                <p className="text-sm text-gray-500">Voice AI with warmth</p>
              </div>
            </div>
            
            {/* Company Details */}
            <div className="text-sm text-gray-600">
              {data.company.address.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
              <p className="mt-2">{data.company.email}</p>
              <p>{data.company.phone}</p>
              {data.company.gstin && (
                <p className="mt-2 font-medium">GSTIN: {data.company.gstin}</p>
              )}
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
            <div className="text-sm">
              <p className="text-gray-600">Invoice No.</p>
              <p className="font-bold text-lg">{data.invoiceNumber}</p>
            </div>
            
            {/* Status Badge */}
            <div className={`inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-sm font-semibold ${
              isPaid 
                ? 'bg-emerald-100 text-emerald-700' 
                : data.status === 'overdue'
                ? 'bg-red-100 text-red-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {isPaid && <CheckCircle className="w-4 h-4" />}
              {data.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Billing Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Bill To
            </h3>
            <p className="font-semibold text-lg">{data.customer.name}</p>
            <p className="text-gray-600">{data.customer.email}</p>
            {data.customer.address.map((line, i) => (
              <p key={i} className="text-gray-600">{line}</p>
            ))}
            {data.customer.gstin && (
              <p className="mt-2 text-sm font-medium">GSTIN: {data.customer.gstin}</p>
            )}
          </div>

          <div className="text-right">
            <div className="inline-block text-left">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <span className="text-gray-500">Invoice Date:</span>
                <span className="font-medium">{formatDate(data.invoiceDate)}</span>
                
                <span className="text-gray-500">Due Date:</span>
                <span className="font-medium">{formatDate(data.dueDate)}</span>
                
                <span className="text-gray-500">Plan:</span>
                <span className="font-medium">{data.plan}</span>
                
                <span className="text-gray-500">Period:</span>
                <span className="font-medium">{data.billingPeriod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="text-center py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-4">
                    <p className="font-medium">{item.description}</p>
                  </td>
                  <td className="py-4 text-center text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="py-4 text-right text-gray-600">
                    {formatCurrency(item.unitPrice, data.currency)}
                  </td>
                  <td className="py-4 text-right font-medium">
                    {formatCurrency(item.amount, data.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-72">
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatCurrency(data.subtotal, data.currency)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-500">
                {data.currency === 'INR' ? `GST (${data.taxRate}%)` : `Tax (${data.taxRate}%)`}
              </span>
              <span>{formatCurrency(data.tax, data.currency)}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-2">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg">
                {formatCurrency(data.total, data.currency)}
              </span>
            </div>
            {isPaid && (
              <div className="flex justify-between py-2 text-sm text-emerald-600">
                <span>Amount Paid</span>
                <span>{formatCurrency(data.total, data.currency)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Info (if paid) */}
        {isPaid && data.transactionId && (
          <div className="bg-emerald-50 rounded-xl p-4 mb-8">
            <h3 className="font-semibold text-emerald-800 mb-2">Payment Received</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-emerald-600">Transaction ID:</span>
                <span className="ml-2 font-mono">{data.transactionId}</span>
              </div>
              <div>
                <span className="text-emerald-600">Payment Method:</span>
                <span className="ml-2">{data.paymentMethod}</span>
              </div>
              {data.paidAt && (
                <div>
                  <span className="text-emerald-600">Paid On:</span>
                  <span className="ml-2">{formatDate(data.paidAt)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-2 gap-8 text-sm text-gray-500">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Payment Terms</h4>
              <p>Payment is due within 7 days of invoice date.</p>
              <p>Late payments may incur additional charges.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Bank Details</h4>
              <p>Bank: HDFC Bank</p>
              <p>A/C No: 50200012345678</p>
              <p>IFSC: HDFC0001234</p>
              <p>UPI: billing@laaliai.upi</p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p className="mt-1">
              LAALI AI Corporation | CIN: U72900KA2024PTC123456 | 
              PAN: {data.company.pan} | GSTIN: {data.company.gstin}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

Invoice.displayName = 'Invoice';

// Invoice Preview with Actions
export function InvoicePreview({ data, onClose }: { data: InvoiceData; onClose?: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    // In production, call backend API to generate PDF
    alert('Downloading PDF... (Backend integration required)');
  };

  const handleEmail = async () => {
    alert(`Sending invoice to ${data.customer.email}... (Backend integration required)`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-auto">
      <div className="min-h-screen py-8 px-4">
        {/* Actions Bar */}
        <div className="max-w-4xl mx-auto mb-4 flex items-center justify-between">
          <h2 className="text-white font-semibold">Invoice Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEmail}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500 text-surface-900 font-semibold hover:bg-gold-400 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="ml-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Invoice */}
        <div className="shadow-2xl rounded-xl overflow-hidden">
          <Invoice data={data} />
        </div>
      </div>
    </div>
  );
}

// Helper to generate invoice data
export function generateInvoice(params: {
  customer: {
    name: string;
    email: string;
    address?: string[];
    gstin?: string;
  };
  plan: string;
  amount: number;
  currency?: 'INR' | 'USD';
  billingCycle?: 'monthly' | 'yearly';
  paymentMethod?: string;
  transactionId?: string;
}): InvoiceData {
  const {
    customer,
    plan,
    amount,
    currency = 'INR',
    billingCycle = 'monthly',
    paymentMethod,
    transactionId,
  } = params;

  const now = new Date();
  const invoiceNumber = `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  
  const taxRate = currency === 'INR' ? 18 : 0; // GST for India
  const subtotal = amount / (1 + taxRate / 100);
  const tax = amount - subtotal;

  // Calculate billing period
  const periodStart = now.toISOString().split('T')[0];
  const periodEnd = new Date(now);
  if (billingCycle === 'yearly') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  return {
    invoiceNumber,
    invoiceDate: periodStart,
    dueDate: periodStart, // Due immediately for prepaid
    status: transactionId ? 'paid' : 'pending',
    
    company: LAALI_COMPANY,
    
    customer: {
      name: customer.name,
      email: customer.email,
      address: customer.address || ['Address not provided'],
      gstin: customer.gstin,
    },
    
    items: [
      {
        description: `LAALI ${plan} Plan - ${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Subscription`,
        quantity: 1,
        unitPrice: subtotal,
        amount: subtotal,
      },
    ],
    
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    taxRate,
    total: amount,
    currency,
    
    paymentMethod,
    transactionId,
    paidAt: transactionId ? now.toISOString().split('T')[0] : undefined,
    
    plan,
    billingPeriod: `${formatDate(periodStart)} - ${formatDate(periodEnd.toISOString().split('T')[0])}`,
  };
}

// Demo invoice for testing
export const DEMO_INVOICE: InvoiceData = generateInvoice({
  customer: {
    name: 'Acme Technologies Pvt Ltd',
    email: 'billing@acmetech.com',
    address: ['456 Business Park', 'Koramangala, Bangalore', 'Karnataka 560034', 'India'],
    gstin: '29AABCA1234R1ZX',
  },
  plan: 'Growth',
  amount: 7999,
  currency: 'INR',
  billingCycle: 'monthly',
  paymentMethod: 'UPI - Google Pay',
  transactionId: 'PAY-2024083100123456',
});

export default Invoice;
