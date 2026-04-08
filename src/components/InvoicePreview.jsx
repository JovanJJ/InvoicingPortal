'use client';

import { useState } from 'react';
import { formatDate } from './helper/formatDate';
import formatDurationForInvoice from './FormatDurationForInvoice';
import { saveInvoice, splitTimeEntryByInvoice, updateTimeEntry, deleteTimeEntry } from '@/lib/actions';


export default function InvoicePreview({ handleInvoicePreview, project, client, timeEntries, user, bankIban }) {
    const [isOpen, setIsOpen] = useState(true);
    const [message, setMessage] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [updateDescription, setUpdateDescription] = useState("");
    const [updateSessionDuration, setUpdateSessionDuration] = useState("");
    const [edditing, setEdditing] = useState(null);
    const [note, setNote] = useState("");
    const [deleteEntry, setDeleteEntry] = useState(false);
    const unbilledEntries = timeEntries.filter(e => e.invoiceId === null || e.invoiceId === undefined);
    const lineItems = unbilledEntries.map(e => {
        const isEditing = edditing === e._id;
        const activeDuration = isEditing && updateSessionDuration !== "" ? Number(updateSessionDuration) : e.duration;
        return {
            id: e._id,
            description: e.description,
            date: e.updatedAt ? formatDate(e.updatedAt) : formatDate(e.createdAt),
            hours: formatDurationForInvoice(Number(activeDuration) * 60),
            rate: project.rate,
            total: ((Number(activeDuration) / 60) * Number(project.rate)).toFixed(2)
        };
    });

    const issueDate = new Date().toLocaleDateString('en-GB');
    const isFixed = project.paymentType === 'fixed';
    const subtotal = isFixed ? Number(project.rate) : lineItems.reduce((acc, item) => acc + Number(item.total), 0);
    const tax = (Number(project.taxRate) / 100 * subtotal).toFixed(2);
    const total = (Number(subtotal) + Number(tax)).toFixed(2);



    const handleSaveInvoice = async () => {
        const res = await saveInvoice(project, client, unbilledEntries, user, dueDate, note);
        const invoiceId = res.invoiceId;
        await Promise.all(unbilledEntries.map(entry => splitTimeEntryByInvoice(entry._id, invoiceId)));
        setMessage(res.message);
    }

    const entryUpdate = async (entryId, description, duration) => {
        const res = await updateTimeEntry(entryId, description, duration);
    }

    const handleDeleteEntry = async (entryId) => {
        const res = await deleteTimeEntry(entryId);
        setDeleteEntry(false);
    }
    const toggleInvoice = () => setIsOpen(!isOpen);

    return (
        !project.rate ? <p className='inline ml-10 text-red-400'>"Make sure you added project rate"</p>
            :
            <div className="absolute inset-0 backdrop-blur-[2px] z-40 transition-opacity py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto border bg-white p-4 border-indigo-400 rounded-lg ">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Invoice Preview</h1>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12">

                        <div className="flex justify-between items-start mb-10">
                            <div>
                                {user.logo && (
                                    <div className="mb-4">
                                        <img src={user.logo} className="w-20 h-20 object-contain" alt="Logo" />
                                        <p className="text-[10px] text-gray-400 mt-1 italic tracking-tight uppercase">You can change picture in settings.</p>
                                    </div>
                                )}
                                <h2 className="text-2xl font-bold text-indigo-600 mb-1">
                                    {user.businessName || user.name}
                                </h2>
                            </div>
                            <div className="text-right">
                                <h3 className="text-4xl font-bold text-gray-900">INVOICE</h3>
                                <p className="text-sm text-gray-500 mt-1 italic">#Invoice Number</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-10 pb-10 border-b border-gray-200">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    From
                                </p>
                                <p className="font-bold text-gray-900 mb-1">{user.name}</p>
                                <p className="text-sm text-gray-600 mb-0.5">{user.email}</p>
                                <p className="text-sm text-gray-600 mb-0.5">{user.address}</p>
                                {user.taxIdType && (
                                    <p className="text-sm text-gray-600">Tax ID {user.taxIdType}: {user.taxIdNumber}</p>
                                )}
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Bill To
                                </p>
                                <p className="font-bold text-gray-900 mb-1">{client.clientName}</p>
                                <p className="text-sm text-gray-600 mb-0.5">{client.clientEmail}</p>
                                <p className="text-sm text-gray-600">{client.address}</p>
                                <p className="text-sm text-gray-600">Tax ID {client.taxIdType} {client.taxIdNumber}</p>
                            </div>
                        </div>


                        <div className="grid grid-cols-4 gap-4 mb-10 bg-gray-50 p-4 rounded-lg">
                            <div className="text-center">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Date</p>
                                <p className="font-bold text-gray-900">{issueDate}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</p>
                                <input disabled={message} type='date' onChange={(e) => {
                                    setDueDate(e.target.value)
                                }} />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Currency</p>
                                <p className="font-bold text-gray-900">{project.currency}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
                                <p className="font-bold text-amber-600">Draft</p>
                            </div>
                        </div>

                        <div className="text-center my-4">
                            <button
                                onClick={toggleInvoice}
                                className={`bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors ${isOpen && 'hidden'}`}
                            >
                                Show More
                            </button>
                        </div>

                        {isOpen && (
                            <>

                                <div className="mb-10">
                                    <div className="bg-indigo-600 flex justify-between items-center text-white rounded-t-lg">
                                        <div className="flex w-full items-center gap-4 p-4">
                                            <div className={isFixed ? "w-9/12" : "w-5/12"}>
                                                <p className="text-xs font-bold uppercase">Description</p>
                                            </div>
                                            <div className="w-2/12">
                                                <p className="text-xs font-bold uppercase">Hours/Min</p>
                                            </div>
                                            {!isFixed && (
                                                <>
                                                    <div className="w-2/12">
                                                        <p className="text-xs font-bold uppercase">Rate</p>
                                                    </div>
                                                    <div className="w-2/12 text-right">
                                                        <p className="text-xs font-bold uppercase">Total</p>
                                                    </div>
                                                </>
                                            )}
                                            <div className="w-1/12 text-right">
                                            </div>
                                        </div>
                                    </div>


                                    {lineItems.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`flex w-full items-center gap-4 p-4 border-b border-gray-200 ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}`}
                                        >
                                            <div className={isFixed ? "w-9/12" : "w-5/12"}>
                                                {edditing === item.id ? (
                                                    <textarea onChange={(e) => setUpdateDescription(e.target.value)} className='border border-gray-200 p-1 rounded w-full' type='text' value={updateDescription} />
                                                ) : (
                                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{item.description}</p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                                            </div>

                                            <div className="w-2/12">
                                                {edditing === item.id ? (
                                                    <>
                                                        <input onChange={(e) => setUpdateSessionDuration(e.target.value)} className='border p-1 rounded border-gray-200 w-full' type="text" value={updateSessionDuration} />
                                                        <p className="text-xs text-gray-400 mt-1">Update in minutes</p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-gray-700">{item.hours}</p>
                                                )}
                                            </div>
                                            {!isFixed && (
                                                <>
                                                    <div className="w-2/12">
                                                        <p className="text-sm text-gray-700">{item.rate}</p>
                                                    </div>
                                                    <div className="w-2/12 text-right">
                                                        <p className="text-sm text-gray-700 font-medium">
                                                            {item.total}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                            <div className="w-1/12 flex gap-5 text-right">

                                                {!deleteEntry && <p
                                                    onClick={async () => {
                                                        if (edditing === item.id) {
                                                            await entryUpdate(item.id, updateDescription, updateSessionDuration);
                                                            setEdditing(null);
                                                        } else {
                                                            const originalEntry = unbilledEntries[index];
                                                            setUpdateDescription(item.description);
                                                            setUpdateSessionDuration(Math.floor(originalEntry.duration).toString());
                                                            setEdditing(item.id);
                                                        }
                                                    }}
                                                    className="text-xs font-bold uppercase cursor-pointer text-green-500 hover:text-green-700"
                                                >
                                                    {edditing === item.id ? 'Save' : 'Eddit'}
                                                </p>
                                                }
                                                {edditing && <p
                                                    onClick={() => setEdditing(null)}
                                                    className="text-xs font-bold uppercase cursor-pointer text-red-500 hover:text-red-700"
                                                >
                                                    Cancel
                                                </p>}
                                                {!edditing && !deleteEntry && <p onClick={() => setDeleteEntry(true)} className='text-xs font-bold uppercase cursor-pointer text-red-500 hover:text-red-700'>Delete</p>}
                                                {deleteEntry && <div className='flex gap-3'><p onClick={() => handleDeleteEntry(item.id)} className='text-xs font-bold uppercase cursor-pointer text-red-500 hover:text-red-700'>Confirm</p><p onClick={() => setDeleteEntry(false)} className='text-xs font-bold uppercase cursor-pointer text-black'>Cancel</p></div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end mb-10">
                                    <div className="w-full sm:w-80">
                                        <div className="flex justify-between py-2 border-b border-gray-200">
                                            <span className="text-sm text-gray-600">Subtotal</span>
                                            <span className="text-sm text-gray-900">
                                                {(subtotal).toFixed(2)} {project.currency}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-200">
                                            <span className="text-sm text-gray-600">Tax {project.taxRate}%</span>
                                            <span className="text-sm text-gray-900">{tax} {project.currency}</span>
                                        </div>
                                        <div className="flex justify-between py-3 border-t-2 border-indigo-600 mt-2">
                                            <span className="text-lg font-bold text-gray-900">Total Due</span>
                                            <span className="text-lg font-bold text-indigo-600">
                                                {total} {project.currency}
                                            </span>
                                        </div>
                                    </div>
                                </div>


                                <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded mb-10">
                                    <h4 className="font-bold text-gray-900 text-sm mb-2">Payment Details</h4>
                                    <p className="text-sm text-gray-700 mb-1">Bank: {bankIban.bankName}</p>
                                    <p className="text-sm text-gray-700 mb-1">Account Owner: {bankIban.accountOwnerFirstName} {bankIban.accountOwnerLastName}</p>
                                    <p className="text-sm text-gray-700 mb-1">IBAN: {bankIban.iban}</p>
                                    <p className="text-sm text-gray-700 mb-2">Reference: (This will be filed on invoice generation)</p>
                                    {project.notes && <p className="text-sm text-gray-700 italic">{project.notes}</p>}
                                    <div className="text-sm text-gray-700 mb-2">
                                        <p className="font-bold mb-1 underline">Invoice Note:</p>
                                        <textarea
                                            className="w-full bg-white/50 border border-indigo-200 rounded p-2 focus:outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="Add a custom message for this invoice..."
                                            rows={3}
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                        />
                                    </div>
                                </div>


                                <div className="border-t border-gray-200 pt-6 text-center">
                                    <p className="text-xs text-gray-500">
                                        Thank you for your business — {user.name} • {user.email}
                                    </p>
                                </div>

                                <div className="text-center my-4 space-x-5">
                                    {!message && <button onClick={handleSaveInvoice} className='px-2 py-2 bg-blue-300 rounded active:bg-blue-200 cursor-pointer'>Save Invoice</button>}
                                    <button
                                        onClick={() => handleInvoicePreview(false)}
                                        className={`${message ? "bg-blue-600" : "bg-red-600"} text-white px-4 py-2 cursor-pointer rounded hover:bg-blue-700 transition-colors`}
                                    >
                                        {message ? "Ok" : "Cancel"}
                                    </button>
                                    <p className='text-green-400 mt-5'>{message}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>


    );
}