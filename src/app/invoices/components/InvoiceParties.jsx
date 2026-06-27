import Image from "next/image";

export default function InvoiceParties({ invoice, userImage }) {
  return (
    <>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-indigo-600 mb-1">
            {invoice.userId.name || ""}
          </h2>
        </div>
        <div className="text-right">
          <h3 className="text-4xl font-bold text-gray-900">INVOICE</h3>
          <p className="text-sm text-gray-500 mt-1">#{invoice.invoiceNumber}</p>
        </div>
      </div>

      {userImage && (
        <div className="mb-5">
          <div className="w-20 h-20 relative">
            <Image fill src={userImage} className="w-20 h-20 object-cover" alt="Logo" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-8 mb-10 pb-10 border-b border-gray-200">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            From
          </p>
          <p className="font-bold text-gray-900 mb-1">{invoice.userId.name || ""}</p>
          <p className="text-sm text-gray-600 mb-0.5">{invoice.userId.email || ""}</p>
          <p className="text-sm text-gray-600 mb-0.5">{invoice.userId.address || ""}</p>
          {invoice.userId.taxIdType && (
            <p className="text-sm text-gray-600">Tax ID: {invoice.userId.taxIdType} {invoice.userId.taxIdNumber}</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Bill To
          </p>
          <p className="font-bold text-gray-900 mb-1">{invoice.clientId.clientName}</p>
          <p className="text-sm text-gray-600 mb-0.5">{invoice.clientId.clientEmail}</p>
          <p className="text-sm text-gray-600">{invoice.clientId.address || ""}</p>
          {invoice.clientId.taxIdType && (
            <p className="text-sm text-gray-600">Tax ID: {invoice.clientId.taxIdType} {invoice.clientId.taxIdNumber}</p>
          )}
        </div>
      </div>
    </>
  );
}
