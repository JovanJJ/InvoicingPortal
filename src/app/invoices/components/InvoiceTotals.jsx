export default function InvoiceTotals({ invoice, isFixed, computedSubtotal, computedTax, computedTotalDue, taxRate }) {
  return (
    <div className="flex justify-end mb-10">
      <div className="w-full sm:w-80">
        <div className="flex justify-between py-2 border-b border-gray-200">
          <span className="text-sm text-gray-600">Subtotal</span>
          <span className="text-sm text-gray-900">
            {isFixed ? invoice.projectId.rate : computedSubtotal.toFixed(2)} {invoice.currency}
          </span>
        </div>

        <div className="flex justify-between py-2 border-b border-gray-200">
          <span className="text-sm text-gray-600">Tax {taxRate}%</span>
          <span className="text-sm text-gray-900">
            {computedTax.toFixed(2)} {invoice.currency}
          </span>
        </div>

        <div className="flex justify-between py-3 border-t-2 border-indigo-600 mt-2">
          <span className="text-lg font-bold text-gray-900">Total Due</span>
          <span className="text-lg font-bold text-indigo-600">
            {computedTotalDue.toFixed(2)} {invoice.currency}
          </span>
        </div>
      </div>
    </div>
  );
}
