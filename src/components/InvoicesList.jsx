'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "./helper/formatDate";
import formatDurationForInvoice from "./FormatDurationForInvoice";
import { invoiceNotes, updateInvoiceStatus, deletePaymentUpdate, updateInvoiceDetails, sendInvoiceEmail, markSentInvoice } from "@/lib/actions";
import InvoicesFilter from "./InvoicesFilter";
import PdfButton from "./PDF/PdfButton";
import Image from "next/image";

export default function InvoicesList({ invoices, projectNames, clientNames, currencies }) {
  const router = useRouter();
  const [openInvoiceId, setOpenInvoiceId] = useState(null);
  const [invoiceUpdates, setInoiceUpdates] = useState("");
  const [responseMessages, setResponseMessages] = useState("");
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [singleNoteContent, setSingleNoteContent] = useState("");


  setTimeout(() => {
    setResponseMessages("");
  }, 6000)

  const handleSaveSingleNote = async (invoiceId) => {
    const res = await updateInvoiceDetails(invoiceId, { notes: singleNoteContent });
    if (res.success) {
      setEditingNoteId(null);
      router.refresh();
    }
    setResponseMessages(res.message);
  };

  const toggleInvoice = (id) => {
    setOpenInvoiceId(prev => (prev === id ? null : id));
  };

  const handleEditClick = (invoice) => {
    setEditingInvoiceId(invoice._id);
    const formCommitList = (invoice.commitList || []).map(item => ({
      ...item,
      durationMinutes: item.duration ? Math.floor(item.duration / 60) : 0
    }));

    setEditFormData({
      issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().substring(0, 10) : "",
      createdAt: invoice.createdAt ? new Date(invoice.createdAt).toISOString().substring(0, 10) : "",
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().substring(0, 10) : "",
      currency: invoice.currency || "",
      status: invoice.status || "draft",
      notes: invoice.notes || "",
      commitList: formCommitList
    });
  };

  const handleCancelEdit = () => {
    setEditingInvoiceId(null);
    setEditFormData(null);
  };

  const handleSaveEdit = async (invoiceId, projectId) => {
    const res = await updateInvoiceDetails(invoiceId, { ...editFormData, projectId });
    if (res.success) {
      setEditingInvoiceId(null);
      setEditFormData(null);
      router.refresh();
    }
    setResponseMessages(res.message);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleCommitChange = (index, field, value) => {
    const updatedCommitList = [...editFormData.commitList];
    updatedCommitList[index][field] = value;
    setEditFormData({ ...editFormData, commitList: updatedCommitList });
  };

  const handleInvoiceChange = (e) => {
    setInoiceUpdates({
      ...invoiceUpdates,
      [e.target.name]: e.target.value,
    });
  }

  const updateInvoiceNotes = async (e, projectId, updates) => {
    e.preventDefault();
    const res = await invoiceNotes(projectId, updates);
    setResponseMessages(res.message);
  }

  const handleInvoiceStatusSubmit = async (e, projectId) => {
    e.preventDefault();
    const status = e.target.status.value;
    const res = await updateInvoiceStatus(projectId, status);
    setResponseMessages(res.message);
  }

  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const sendInvoiceToClient = async (invoice) => {
    setIsSendingEmail(true);
    const clientEmail = invoice.clientId?.clientEmail;
    if (!clientEmail) {
      setResponseMessages("Client email not found.");
      setIsSendingEmail(false);
      return;
    }
    const res = await sendInvoiceEmail(clientEmail, invoice);
    await markSentInvoice(invoice._id.toString());
    setResponseMessages(res.message);
    setIsSendingEmail(false);
  }

  return (
    <>

      <InvoicesFilter invoices={invoices} projectNames={projectNames} clientNames={clientNames} />

      {
        invoices.map((invoice, i) => {
          const invoiceData = {
            userId: invoice.userId._id,
            clientId: invoice.clientId._id,
          }
          const isOpen = openInvoiceId === invoice._id;
          const isEditing = editingInvoiceId === invoice._id;
          const currentCommitList = isEditing ? editFormData.commitList : invoice.commitList;
          const rate = invoice.projectId?.rate || 0;
          const taxRate = invoice.projectId?.taxRate || 0;

          const computedSubtotal = currentCommitList.reduce((acc, item) => {
            const seconds = isEditing ? (Number(item.durationMinutes) * 60) : Number(item.duration);
            const total = (seconds / 3600) * rate;
            return acc + total;
          }, 0);

          const computedTax = computedSubtotal * (taxRate / 100);
          const computedTotalDue = computedSubtotal + computedTax;

          const defaultBank = invoice.userId.bankAccounts?.find(a => a.isDefault);
          return (
            <div key={invoice._id}>

              <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto  border  border-indigo-400 rounded-lg p-4">

                  <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Invoice Preview {i + 1}</h1>
                    <div className={`${invoice.sent ? "text-green-500" : "text-red-500"}`}>{invoice.sent ? "Invoice sent" : "Invoice not sent"}</div>

                  </div>


                  <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12">
                    

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
                      {invoice.userId.logo && (
                        <div className="mb-5">
                          <div className=" w-20 h-20 relative">
                            <Image fill src={invoice.userId.logo} className="w-20 h-20 object-cover" alt="Logo" />
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
                        <p className="text-sm text-gray-600">{invoice.clientId.clientCountry}</p>
                        {invoice.userId.taxIdType && (
                          <p className="text-sm text-gray-600">Tax ID: {invoice.clientId.taxIdType} {invoice.clientId.taxIdNumber}</p>
                        )}
                      </div>
                    </div>


                    <div className="grid grid-cols-4 gap-4 mb-10 bg-gray-50 p-4 rounded-lg items-center">
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Date</p>
                        {editingInvoiceId === invoice._id ? (
                          <input
                            type="date"
                            name="createdAt"
                            value={editFormData.createdAt}
                            onChange={handleEditFormChange}
                            className="text-center font-bold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1"
                          />
                        ) : (
                          <p className="font-bold text-gray-900">{formatDate(invoice.createdAt)}</p>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</p>
                        {editingInvoiceId === invoice._id ? (
                          <input
                            type="date"
                            name="dueDate"
                            value={editFormData.dueDate}
                            onChange={handleEditFormChange}
                            className="text-center font-bold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1"
                          />
                        ) : (
                          <p className="font-bold text-gray-900">{formatDate(invoice.dueDate)}</p>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Currency</p>
                        {editingInvoiceId === invoice._id ? (
                          <select
                            name="currency"
                            value={editFormData.currency}
                            onChange={handleEditFormChange}
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
                          {editingInvoiceId === invoice._id ? (
                            <select
                              name="status"
                              value={editFormData.status}
                              onChange={handleEditFormChange}
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

                    <div className="text-center my-4 space-x-4">
                      {editingInvoiceId !== invoice._id ? (
                        <>
                          <button
                            onClick={() => toggleInvoice(invoice._id)}
                            className={`bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors ${isOpen && 'hidden'}`}
                          >
                            {isOpen ? 'Show Less' : 'Show More'}
                          </button>
                          {isOpen && (
                            <>
                              <div className="flex justify-center gap-5">
                                <button
                                  onClick={() => handleEditClick(invoice)}
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
                                  onClick={() => sendInvoiceToClient(invoice)}
                                  disabled={isSendingEmail}
                                  className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors ${isSendingEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {isSendingEmail ? 'Sending...' : 'Send Invoice to Client'}
                                </button>
                              </div>
                              <div className={`mt-3 ${responseMessages === "Email sent successfully!" ? "text-green-500" : "text-red-400"}`}>{responseMessages}</div>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(invoice._id, invoice.projectId?._id)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                          >
                            Save Changes
                          </button>
                        </>
                      )}
                    </div>

                    {isOpen &&
                      <>

                        <div className="mb-10">
                          <div className="bg-indigo-600 text-white rounded-t-lg">
                            <div className="grid grid-cols-12 gap-4 p-4">
                              <div className="col-span-6">
                                <p className="text-xs font-bold uppercase">Description</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-xs font-bold uppercase">Hours/Min</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-xs font-bold uppercase">Rate</p>
                              </div>
                              <div className="col-span-2 text-right">
                                <p className="text-xs font-bold uppercase">Total</p>
                              </div>
                            </div>
                          </div>


                          {(editingInvoiceId === invoice._id ? editFormData.commitList : invoice.commitList).map((item, index) => (
                            <div
                              key={index}
                              className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-200 ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                                }`}
                            >
                              <div className="col-span-6">
                                {editingInvoiceId === invoice._id ? (
                                  <>
                                    <textarea
                                      value={item.description || ''}
                                      onChange={(e) => handleCommitChange(index, 'description', e.target.value)}
                                      className="w-full text-sm text-gray-900 font-medium bg-white border border-gray-300 rounded p-1 mb-1 outline-none focus:border-indigo-500"
                                      rows={2}
                                    />
                                    {item.createdAt && (
                                      <p className="text-xs text-gray-400 mt-1">{formatDate(item.createdAt)}</p>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm text-gray-900 font-medium">{item.description || 'N/A'}</p>
                                    {item.createdAt && (
                                      <p className="text-xs text-gray-400 mt-1">{formatDate(item.createdAt)}</p>
                                    )}
                                  </>
                                )}
                              </div>
                              <div className="col-span-2">
                                {editingInvoiceId === invoice._id ? (
                                  <div className="flex flex-col items-start">
                                    <input
                                      type="number"
                                      value={item.durationMinutes}
                                      onChange={(e) => handleCommitChange(index, 'durationMinutes', e.target.value)}
                                      className="w-full text-sm text-gray-700 bg-white border border-gray-300 rounded p-1 outline-none focus:border-indigo-500"
                                      placeholder="Mins"
                                    />
                                    <span className="text-xs text-gray-400 mt-1">minutes</span>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-700">{formatDurationForInvoice(item.duration)}</p>
                                )}
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm text-gray-700">
                                  {invoice.projectId?.rate || 0}
                                </p>
                              </div>
                              <div className="col-span-2 text-right">
                                <p className="text-sm text-gray-700 font-medium">
                                  {editingInvoiceId === invoice._id
                                    ? ((item.durationMinutes * 60) / 3600 * (invoice.projectId?.rate || 0)).toFixed(2)
                                    : ((item.duration / 3600) * (invoice.projectId?.rate || 0)).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>


                        <div className="flex justify-end mb-10">
                          <div className="w-full sm:w-80">
                            <div className="flex justify-between py-2 border-b border-gray-200">
                              <span className="text-sm text-gray-600">Subtotal</span>
                              <span className="text-sm text-gray-900">
                                {computedSubtotal.toFixed(2)} {invoice.currency}
                              </span>
                            </div>

                            <div className="flex justify-between py-2 border-b border-gray-200">
                              <span className="text-sm text-gray-600">
                                Tax {taxRate}%
                              </span>
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


                        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded mb-10">
                          <h4 className="font-bold text-gray-900 text-sm mb-2">Payment Details</h4>
                          {defaultBank?.bankName && (
                            <p className="text-sm text-gray-700 mb-1">
                              Bank: {defaultBank.bankName}
                            </p>
                          )}
                          {defaultBank?.iban && (
                            <p className="text-sm text-gray-700 mb-1">
                              IBAN: {defaultBank.iban}
                            </p>
                          )}
                          <p className="text-sm text-gray-700 mb-2">
                            Reference: {invoice.invoiceNumber}
                          </p>
                          {editingInvoiceId === invoice._id ? (
                            <div className="text-sm text-gray-700 mb-2 mt-4 border-t border-indigo-200 pt-4">
                              <p className="font-bold mb-1 underline">Invoice Note:</p>
                              <textarea
                                name="notes"
                                className="w-full bg-white border border-indigo-200 rounded p-2 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="Add a custom message for this invoice..."
                                rows={3}
                                value={editFormData.notes || ""}
                                onChange={handleEditFormChange}
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
                                onChange={(e) => setSingleNoteContent(e.target.value)}
                              />
                              <div className="flex gap-2 mt-2">
                                <button onClick={() => handleSaveSingleNote(invoice._id)} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700 cursor-pointer">Save Note</button>
                                <button onClick={() => setEditingNoteId(null)} className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-300 cursor-pointer">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-700 mb-2 mt-4 border-t border-indigo-200 pt-4 relative group">
                              <div className="flex justify-between items-center mb-1">
                                <p className="font-bold underline">Invoice Note:</p>
                                <button
                                  onClick={() => { setEditingNoteId(invoice._id); setSingleNoteContent(invoice.notes || ""); }}
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


                        <div className="border-t border-gray-200 pt-6 text-center">
                          <p className="text-xs text-gray-500">
                            Thank you for your business — {invoice.userId.name} •{' '}
                            {invoice.userId.email}
                          </p>
                        </div>
                        <div className="flex flex-col gap-5 md:flex-row  mt-10 relative">

                          <div className="w-full md:w-1/2">
                            <h2 className="text-3xl mt-5">Payment details</h2>
                            <span className="text-gray-500">Add payment details when you get paid</span>
                            <form onSubmit={(e) => updateInvoiceNotes(e, invoice._id.toString(), invoiceUpdates)} className="py-5 flex flex-col  gap-3">
                              <div className="space-x-4 flex items-center">
                                <span className="w-15">Amount</span>
                                <input name="amount" value={invoiceUpdates.amount || ""} onChange={handleInvoiceChange} className="border border-indigo-600 rounded p-2" type="number" placeholder={invoice.currency} />
                              </div>

                              <div className="space-x-4 flex items-center">
                                <span className="w-15">Date</span>
                                <input name="date" value={invoiceUpdates.date || ""} onChange={handleInvoiceChange} className="border border-indigo-600 rounded p-2" type="date" />
                              </div>
                              <div className="space-x-4 flex items-center">
                                <span className="w-15">Note</span>
                                <textarea name="note" value={invoiceUpdates.note || ""} onChange={handleInvoiceChange} className="border border-indigo-600 rounded p-2" />
                              </div>
                              <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors  cursor-pointer" type="submit">Add note</button>
                            </form>
                          </div>
                          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 border border-w-0.5 border-gray-200 w-[1px] flex"></div>
                          <div className="w-full md:w-1/2">
                            <h2 className="text-3xl">Recent Updates</h2>
                            <div className="py-5 text-gray-500">
                              add payment details
                            </div>
                            <div className="max-h-80 overflow-y-auto space-y-4 pr-2 w-full">
                              {invoice.payments && invoice.payments.length > 0 ? (
                                [...invoice.payments].reverse().map((payment, index) => {
                                  const updateNumber = invoice.payments.length - index;
                                  return (
                                    <div key={payment._id || index} className="flex flex-row items-center gap-5">

                                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm w-full">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-xs font-bold text-gray-500 uppercase">Update #{updateNumber}</span>
                                          <span className="text-xs text-gray-400">
                                            {payment.paidAt ? formatDate(payment.paidAt) : ''}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="font-semibold text-gray-900 text-lg">
                                            {payment.amount} {invoice.currency}
                                          </span>
                                        </div>
                                        <div className="text-gray-600 text-sm border-t border-gray-200 pt-2 mt-2">
                                          {payment.note ? payment.note : <span className="italic text-gray-400">No notes provided.</span>}
                                        </div>
                                      </div>
                                      <div onClick={() => deletePaymentUpdate(invoice._id.toString(), payment._id.toString())} className="text-red-500 cursor-pointer">Delete</div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-gray-400 italic text-sm">No payment updates yet.</div>
                              )}
                            </div>
                          </div>

                        </div>
                        <div className="text-center my-4">
                          <button
                            onClick={() => toggleInvoice(invoice._id)}
                            className={`bg-indigo-600 text-white px-4 py-2 cursor-pointer rounded hover:bg-indigo-700 transition-colors ${!isOpen && 'hidden'}`}
                          >
                            {isOpen && 'Show Less'}
                          </button>
                        </div>
                      </>
                    }

                  </div>
                </div >

              </div >
            </div>
          );
        })
      }
    </>
  );
}