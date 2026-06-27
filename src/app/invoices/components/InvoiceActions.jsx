import PdfButton from "@/components/PDF/PdfButton";

export default function InvoiceActions({
  invoice,
  isOpen,
  isEditing,
  isSendingEmail,
  invoiceDelete,
  onToggle,
  onEdit,
  onPreviewEmail,
  onDeleteIntent,
  onCancelDelete,
  onDelete,
  onCancelEdit,
  onSaveEdit,
}) {
  return (
    <div className="text-center my-4 space-x-4">
      {!isEditing ? (
        <div className="flex justify-center">
          <button
            onClick={() => onToggle(invoice._id)}
            className={`bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors ${isOpen && 'hidden'}`}
          >
            {isOpen ? 'Show Less' : 'Show More'}
          </button>
          {isOpen && (
            <div className="flex flex-col md:flex-row justify-center gap-5">
              <button
                onClick={() => onEdit(invoice)}
                className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50 transition-colors"
              >
                Edit Invoice
              </button>
              <PdfButton
                project={invoice.projectId}
                client={invoice.clientId}
                user={invoice.userId}
                existingInvoice={invoice}
              />
              <button
                onClick={() => onPreviewEmail(invoice)}
                disabled={isSendingEmail}
                className={`bg-green-500 text-white w-fit px-4 py-2 rounded hover:bg-green-600 transition-colors ${isSendingEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSendingEmail ? 'Sending...' : 'Send Invoice to Client'}
              </button>
              {!invoiceDelete && (
                <button
                  onClick={onDeleteIntent}
                  className="bg-red-500 px-4 py-2 rounded hover:bg-red-400 text-white transition-colors"
                >
                  Delete Invoice
                </button>
              )}
              {invoiceDelete && (
                <div className="flex group items-center gap-3">
                  <p>Are you sure</p>
                  <button onClick={() => onDelete(invoice._id.toString())} className="bg-green-500 h-full cursor-pointer text-white px-2 rounded">
                    yes
                  </button>
                  <button onClick={onCancelDelete} className="bg-red-500 h-full cursor-pointer text-white px-2 rounded">
                    reject
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <button
            onClick={onCancelEdit}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSaveEdit(invoice._id, invoice.projectId?._id)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            Save Changes
          </button>
        </>
      )}
    </div>
  );
}
