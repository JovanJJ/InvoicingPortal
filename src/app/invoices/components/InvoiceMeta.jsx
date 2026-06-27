import { formatDate } from "@/components/helper/formatDate";

export default function InvoiceMeta({
  invoice,
  isEditing,
  editFormData,
  currencies,
  onEditFormChange,
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 bg-gray-50 p-4 rounded-lg items-center">
      <div className="text-center">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Date</p>
        {isEditing ? (
          <input
            type="date"
            name="issueDate"
            value={editFormData.issueDate}
            onChange={onEditFormChange}
            className="text-center font-bold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1"
          />
        ) : (
          <p className="font-bold text-gray-900">{formatDate(invoice.issueDate || invoice.createdAt)}</p>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</p>
        {isEditing ? (
          <input
            type="date"
            name="dueDate"
            value={editFormData.dueDate}
            onChange={onEditFormChange}
            className="text-center font-bold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1"
          />
        ) : (
          <p className="font-bold text-gray-900">{formatDate(invoice.dueDate)}</p>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Currency</p>
        {isEditing ? (
          <select
            name="currency"
            value={editFormData.currency}
            onChange={onEditFormChange}
            className="text-center font-bold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 mx-auto outline-none"
          >
            {(currencies || []).map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        ) : (
          <p className="font-bold text-gray-900">{invoice.currency}</p>
        )}
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
          {isEditing ? (
            <select
              name="status"
              value={editFormData.status}
              onChange={onEditFormChange}
              className="text-center font-bold text-amber-600 bg-white border border-gray-300 rounded px-2 py-1 outline-none"
            >
              <option value="draft">draft</option>
              <option value="sent">sent</option>
              <option value="partially_paid">partially_paid</option>
              <option value="paid">paid</option>
              <option value="overdue">overdue</option>
            </select>
          ) : (
            <p className="font-bold text-amber-600">{invoice.status}</p>
          )}
        </div>
      </div>
    </div>
  );
}
