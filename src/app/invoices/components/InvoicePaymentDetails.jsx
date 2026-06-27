export default function InvoicePaymentDetails({
  invoice,
  defaultBank,
  isEditing,
  editFormData,
  editingNoteId,
  singleNoteContent,
  onEditFormChange,
  onSingleNoteChange,
  onStartNoteEdit,
  onCancelNoteEdit,
  onSaveSingleNote,
}) {
  return (
    <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded mb-10">
      <h4 className="font-bold text-gray-900 text-sm mb-2">Payment Details</h4>
      {defaultBank?.bankName && (
        <p className="text-sm text-gray-700 mb-1">Bank: {defaultBank.bankName}</p>
      )}
      {defaultBank?.iban && (
        <p className="text-sm text-gray-700 mb-1">IBAN: {defaultBank.iban}</p>
      )}
      <p className="text-sm text-gray-700 mb-2">Reference: {invoice.invoiceNumber}</p>

      {isEditing ? (
        <div className="text-sm text-gray-700 mb-2 mt-4 border-t border-indigo-200 pt-4">
          <p className="font-bold mb-1 underline">Invoice Note:</p>
          <textarea
            name="notes"
            className="w-full bg-white border border-indigo-200 rounded p-2 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Add a custom message for this invoice..."
            rows={3}
            value={editFormData.notes || ""}
            onChange={onEditFormChange}
          />
        </div>
      ) : editingNoteId === invoice._id ? (
        <div className="text-sm text-gray-700 mb-2 mt-4 border-t border-indigo-200 pt-4">
          <p className="font-bold mb-1 underline">Invoice Note:</p>
          <textarea
            className="w-full bg-white border border-indigo-200 rounded p-2 focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="Add a custom message for this invoice..."
            rows={3}
            value={singleNoteContent}
            onChange={(e) => onSingleNoteChange(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <button onClick={() => onSaveSingleNote(invoice._id)} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700 cursor-pointer">Save Note</button>
            <button onClick={onCancelNoteEdit} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-300 cursor-pointer">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-700 mb-2 mt-4 border-t border-indigo-200 pt-4 relative group">
          <div className="flex justify-between items-center mb-1">
            <p className="font-bold underline">Invoice Note:</p>
            <button
              onClick={() => onStartNoteEdit(invoice)}
              className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-100 cursor-pointer"
            >
              Update Note
            </button>
          </div>
          {invoice.notes ? (
            <p className="italic">{invoice.notes}</p>
          ) : (
            <p className="italic text-gray-400">No invoice note provided.</p>
          )}
        </div>
      )}
    </div>
  );
}
