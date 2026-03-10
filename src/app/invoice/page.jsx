'use client';



const mockInvoice = {
  invoiceNumber: 'INV-2024-001',
  issueDate: 'February 28, 2024',
  dueDate: 'March 15, 2024',
  currency: '$',
  status: 'Due',
  freelancer: {
    name: 'John Developer',
    businessName: 'InvoiceFlow Dev',
    email: 'john@example.com',
    address: '123 Tech Street, San Francisco, CA 94102',
    taxId: 'TAX-123456',
    logo: null,
  },
  client: {
    name: 'Acme Corporation',
    company: 'Acme Corp Inc.',
    email: 'billing@acme.com',
    address: '456 Business Ave, New York, NY 10001',
  },
  lineItems: [
    {
      description: 'Website Development - Homepage Design',
      hours: 40,
      rate: 75,
      total: 3000,
      date: 'Feb 1-7, 2024',
    },
    {
      description: 'Website Development - Backend Integration',
      hours: 32,
      rate: 75,
      total: 2400,
      date: 'Feb 8-14, 2024',
    },
    {
      description: 'UI/UX Consultation',
      hours: 8,
      rate: 85,
      total: 680,
      date: 'Feb 20, 2024',
    },
  ],
  taxRate: 10,
  bankAccount: {
    bankName: 'Tech Bank US',
    iban: 'US12345678901234567890',
  },
  notes: 'Payment terms: Net 15. Thank you for your business!',
};

export default function InvoicePage() {
  const subtotal = mockInvoice.lineItems.reduce((sum, item) => sum + item.total, 0);
  const tax = mockInvoice.taxRate ? subtotal * (mockInvoice.taxRate / 100) : 0;
  const grandTotal = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Download Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Invoice Preview</h1>
          
        </div>

        {/* Invoice Container */}
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12">
          
          {/* HEADER */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-2xl font-bold text-indigo-600 mb-1">
                {mockInvoice.freelancer.businessName || mockInvoice.freelancer.name}
              </h2>
            </div>
            <div className="text-right">
              <h3 className="text-4xl font-bold text-gray-900">INVOICE</h3>
              <p className="text-sm text-gray-500 mt-1">#{mockInvoice.invoiceNumber}</p>
            </div>
          </div>

          {/* FROM / TO SECTION */}
          <div className="grid grid-cols-2 gap-8 mb-10 pb-10 border-b border-gray-200">
            {/* From */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                From
              </p>
              <p className="font-bold text-gray-900 mb-1">{mockInvoice.freelancer.name}</p>
              <p className="text-sm text-gray-600 mb-0.5">{mockInvoice.freelancer.email}</p>
              <p className="text-sm text-gray-600 mb-0.5">{mockInvoice.freelancer.address}</p>
              {mockInvoice.freelancer.taxId && (
                <p className="text-sm text-gray-600">PIB: {mockInvoice.freelancer.taxId}</p>
              )}
            </div>

            {/* Bill To */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Bill To
              </p>
              <p className="font-bold text-gray-900 mb-1">{mockInvoice.client.name}</p>
              <p className="text-sm text-gray-600 mb-0.5">{mockInvoice.client.email}</p>
              <p className="text-sm text-gray-600 mb-0.5">{mockInvoice.client.company}</p>
              <p className="text-sm text-gray-600">{mockInvoice.client.address}</p>
            </div>
          </div>

          {/* DATES SECTION */}
          <div className="grid grid-cols-4 gap-4 mb-10 bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Date</p>
              <p className="font-bold text-gray-900">{mockInvoice.issueDate}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</p>
              <p className="font-bold text-gray-900">{mockInvoice.dueDate}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Currency</p>
              <p className="font-bold text-gray-900">{mockInvoice.currency}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
              <p className="font-bold text-amber-600">{mockInvoice.status}</p>
            </div>
          </div>

          {/* LINE ITEMS TABLE */}
          <div className="mb-10">
            <div className="bg-indigo-600 text-white rounded-t-lg">
              <div className="grid grid-cols-12 gap-4 p-4">
                <div className="col-span-6">
                  <p className="text-xs font-bold uppercase">Description</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold uppercase">Hours</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold uppercase">Rate</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-xs font-bold uppercase">Total</p>
                </div>
              </div>
            </div>

            {/* Table Rows */}
            {mockInvoice.lineItems.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-200 ${
                  index % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="col-span-6">
                  <p className="text-sm text-gray-900 font-medium">{item.description}</p>
                  {item.date && (
                    <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-700">{item.hours}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-700">
                    {mockInvoice.currency} {item.rate}
                  </p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm text-gray-700 font-medium">
                    {mockInvoice.currency} {item.total.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* TOTALS SECTION */}
          <div className="flex justify-end mb-10">
            <div className="w-full sm:w-80">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm text-gray-900">
                  {mockInvoice.currency} {subtotal.toFixed(2)}
                </span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">
                    Tax ({mockInvoice.taxRate}%)
                  </span>
                  <span className="text-sm text-gray-900">
                    {mockInvoice.currency} {tax.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-indigo-600 mt-2">
                <span className="text-lg font-bold text-gray-900">Total Due</span>
                <span className="text-lg font-bold text-indigo-600">
                  {mockInvoice.currency} {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* PAYMENT INFO SECTION */}
          <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded mb-10">
            <h4 className="font-bold text-gray-900 text-sm mb-2">Payment Details</h4>
            {mockInvoice.bankAccount?.bankName && (
              <p className="text-sm text-gray-700 mb-1">
                Bank: {mockInvoice.bankAccount.bankName}
              </p>
            )}
            {mockInvoice.bankAccount?.iban && (
              <p className="text-sm text-gray-700 mb-1">
                IBAN: {mockInvoice.bankAccount.iban}
              </p>
            )}
            <p className="text-sm text-gray-700 mb-2">
              Reference: {mockInvoice.invoiceNumber}
            </p>
            {mockInvoice.notes && (
              <p className="text-sm text-gray-700 italic">{mockInvoice.notes}</p>
            )}
          </div>

          {/* FOOTER */}
          <div className="border-t border-gray-200 pt-6 text-center">
            <p className="text-xs text-gray-500">
              Thank you for your business — {mockInvoice.freelancer.name} •{' '}
              {mockInvoice.freelancer.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
