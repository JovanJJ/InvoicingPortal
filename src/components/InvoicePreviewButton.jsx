export default function InvoicePreviewButton({ handleInvoicePreview }) {
    return (
        <button onClick={() => handleInvoicePreview(true)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-400 cursor-pointer transition">
            Invoice Preview
        </button>
    );
}