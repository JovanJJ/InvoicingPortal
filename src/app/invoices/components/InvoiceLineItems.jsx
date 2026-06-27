import { formatDate } from "@/components/helper/formatDate";
import formatDurationForInvoice from "@/components/FormatDurationForInvoice";
import { deleteTimeEntry } from "@/lib/actions";

export default function InvoiceLineItems({
  invoice,
  items,
  isEditing,
  isFixed,
  onCommitChange,
}) {
  return (
    <div className="mb-10">
      <div className="hidden sm:block bg-indigo-600 text-white rounded-t-lg">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4">
          <div className="sm:col-span-6">
            <p className="text-xs font-bold uppercase">Description</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-bold uppercase">Hours/Min</p>
          </div>
          {invoice.projectId.paymentType === "hourly" && (
            <div className="sm:col-span-2">
              <p className="text-xs font-bold uppercase">Rate</p>
            </div>
          )}
          {invoice.projectId.paymentType === "hourly" && (
            <div className="sm:col-span-2 sm:text-right">
              <p className="text-xs font-bold uppercase">Total</p>
            </div>
          )}
        </div>
      </div>

      {items.map((item, index) => (
        <div
          key={item._id || index}
          className={`border-b border-gray-200 ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}
        >
          <div className="block sm:hidden p-4">
            <div className="flex items-start">
              <div className="w-1/3 text-xs font-bold text-gray-500">Description</div>
              <div className="w-2/3 text-sm text-gray-900">
                <LineItemDescription
                  item={item}
                  isEditing={isEditing}
                  index={index}
                  onCommitChange={onCommitChange}
                />
              </div>
            </div>

            <div className="mt-3 flex justify-between text-sm text-gray-700">
              <div>
                <div className="text-xs text-gray-500">Hours/Min</div>
                <LineItemDuration
                  item={item}
                  isEditing={isEditing}
                  index={index}
                  onCommitChange={onCommitChange}
                  compact
                />
              </div>

              {!isFixed && (
                <>
                  <div>
                    <div className="text-xs text-gray-500">Rate</div>
                    <div className="text-sm text-gray-700">{invoice.projectId?.rate || 0}</div>
                  </div>
                  <LineItemTotal item={item} isEditing={isEditing} rate={invoice.projectId?.rate || 0} mobile />
                </>
              )}
            </div>
          </div>

          <div className="hidden sm:grid sm:grid-cols-12 gap-4 p-4">
            <div className="sm:col-span-6">
              <LineItemDescription
                item={item}
                isEditing={isEditing}
                index={index}
                onCommitChange={onCommitChange}
              />
            </div>
            <div className={`${isFixed ? 'sm:col-span-4' : 'sm:col-span-2'}`}>
              <LineItemDuration
                item={item}
                isEditing={isEditing}
                index={index}
                onCommitChange={onCommitChange}
              />
            </div>
            {!isFixed && (
              <>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-700">{invoice.projectId?.rate || 0}</p>
                </div>
                <div className="sm:col-span-2 sm:text-right">
                  <LineItemTotal item={item} isEditing={isEditing} rate={invoice.projectId?.rate || 0} />
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function LineItemDescription({ item, isEditing, index, onCommitChange }) {
  if (isEditing) {
    return (
      <>
        <textarea
          value={item.description || ''}
          onChange={(e) => onCommitChange(index, 'description', e.target.value)}
          className="w-full text-sm text-gray-900 font-medium bg-white border border-gray-300 rounded p-1 mb-1 outline-none focus:border-indigo-500"
          rows={2}
        />
        <div className="flex items-center gap-2 mt-1">
          <input
            type="date"
            value={item.displayDate || ''}
            onChange={(e) => onCommitChange(index, 'displayDate', e.target.value)}
            className="text-xs text-gray-900 bg-white border border-gray-300 rounded p-1 outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={() => deleteTimeEntry(item._id.toString())}
            className="text-xs text-red-500 px-2 py-1 border border-red-200 rounded hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-900 font-medium">{item.description || 'N/A'}</p>
      {(item.updatedAt || item.createdAt) && (
        <p className="text-xs text-gray-400 mt-1">{formatDate(item.updatedAt || item.createdAt)}</p>
      )}
    </>
  );
}

function LineItemDuration({ item, isEditing, index, onCommitChange, compact = false }) {
  if (isEditing) {
    return (
      <div className="flex flex-col items-start">
        <input
          type="number"
          value={item.durationMinutes}
          onChange={(e) => onCommitChange(index, 'durationMinutes', e.target.value)}
          className={`${compact ? 'w-24' : 'w-full'} text-sm text-gray-700 bg-white border border-gray-300 rounded p-1 outline-none focus:border-indigo-500`}
          placeholder="Mins"
        />
        <span className="text-xs text-gray-400 mt-1">minutes</span>
      </div>
    );
  }

  return <p className="text-sm text-gray-700">{formatDurationForInvoice(Number(item.duration) * 60)}</p>;
}

function LineItemTotal({ item, isEditing, rate, mobile = false }) {
  const minutes = isEditing ? Number(item.durationMinutes) : Number(item.duration);
  const total = (((minutes || 0) / 60) * Number(rate || 0)).toFixed(2);

  if (mobile) {
    return (
      <div className="text-right">
        <div className="text-xs text-gray-500">Total</div>
        <div className="text-sm text-gray-700 font-medium">{total}</div>
      </div>
    );
  }

  return <p className="text-sm text-gray-700 font-medium">{total}</p>;
}
