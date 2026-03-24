'use client';

import { useState } from "react";
import { formatDate } from "./helper/formatDate";
import formatDurationForInvoice from "./FormatDurationForInvoice";
import { invoiceNotes, updateInvoiceStatus, deletePaymentUpdate } from "@/lib/actions";
import InvoicesFilter from "./InvoicesFilter";




export default function InvoicesList({ invoices, projectNames, clientNames }) {
  const [openInvoiceId, setOpenInvoiceId] = useState(null);
  const [invoiceUpdates, setInoiceUpdates] = useState("");
  const [responseMessages, setResponseMessages] = useState("");


  const toggleInvoice = (id) => {
    setOpenInvoiceId(prev => (prev === id ? null : id));
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

  return (
    <>

      <InvoicesFilter invoices={invoices} projectNames={projectNames} clientNames={clientNames} />

      {
        invoices.map((invoice, i) => {
          const isOpen = openInvoiceId === invoice._id;
          const { subtotal, taxAmount, totalDue } = invoice;
          const defaultBank = invoice.userId.bankAccounts?.find(a => a.isDefault);
          return (
            <div key={invoice._id}>

              <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto  border  border-indigo-400 rounded-lg p-4">
                  {/* Header with Download Button */}
                  <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Invoice Preview {i + 1}</h1>

                  </div>

                  {/* Invoice Container */}
                  <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12">

                    {/* HEADER */}
                    <div className="flex justify-between items-start mb-10">
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

                    {/* FROM / TO SECTION */}
                    <div className="grid grid-cols-2 gap-8 mb-10 pb-10 border-b border-gray-200">
                      {/* From */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          From
                        </p>
                        <p className="font-bold text-gray-900 mb-1">{invoice.userId.name || ""}</p>
                        <p className="text-sm text-gray-600 mb-0.5">{invoice.userId.email || ""}</p>
                        <p className="text-sm text-gray-600 mb-0.5">{invoice.userId.address || ""}</p>
                        {invoice.userId.taxId && (
                          <p className="text-sm text-gray-600">PIB: {invoice.userId.taxId}</p>
                        )}
                      </div>

                      {/* Bill To */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Bill To
                        </p>
                        <p className="font-bold text-gray-900 mb-1">{invoice.clientId.clientName}</p>
                        <p className="text-sm text-gray-600 mb-0.5">{invoice.clientId.clientEmail}</p>
                        <p className="text-sm text-gray-600">{invoice.clientId.clientCountry}</p>
                      </div>
                    </div>

                    {/* DATES SECTION */}
                    <div className="grid grid-cols-4 gap-4 mb-10 bg-gray-50 p-4 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Date</p>
                        <p className="font-bold text-gray-900">{formatDate(invoice.createdAt)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</p>
                        <p className="font-bold text-gray-900">{formatDate(invoice.dueDate)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Currency</p>
                        <p className="font-bold text-gray-900">{invoice.currency}</p>
                      </div>
                      <div className="flex flex-col items-center justify-center">

                        <div className="text-center">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
                          <p className="font-bold text-amber-600">{invoice.status}</p>
                        </div>

                      </div>
                    </div>

                    <div className="text-center my-4">
                      <button
                        onClick={() => toggleInvoice(invoice._id)}
                        className={`bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors ${isOpen && 'hidden'}`}
                      >
                        {isOpen ? 'Show Less' : 'Show More'}
                      </button>
                    </div>

                    {isOpen &&
                      <>
                        {/* LINE ITEMS TABLE */}
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

                          {/* Table Rows */}
                          {invoice.commitList.map((item, index) => (
                            <div
                              key={index}
                              className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-200 ${index % 2 === 1 ? 'bg-gray-50' : 'bg-white'
                                }`}
                            >
                              <div className="col-span-6">
                                <p className="text-sm text-gray-900 font-medium">{item.description || 'N/A'}</p>
                                {item.createdAt && (
                                  <p className="text-xs text-gray-400 mt-1">{formatDate(item.createdAt)}</p>
                                )}
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm text-gray-700">{formatDurationForInvoice(item.duration)}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm text-gray-700">
                                  {invoice.projectId.rate}
                                </p>
                              </div>
                              <div className="col-span-2 text-right">
                                <p className="text-sm text-gray-700 font-medium">
                                  {(item.duration / 3600 * invoice.projectId.rate).toFixed(2)}
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
                                {totalDue} {invoice.currency}
                              </span>
                            </div>

                            <div className="flex justify-between py-2 border-b border-gray-200">
                              <span className="text-sm text-gray-600">
                                Tax 0 %
                              </span>
                              <span className="text-sm text-gray-900">

                              </span>
                            </div>

                            <div className="flex justify-between py-3 border-t-2 border-indigo-600 mt-2">
                              <span className="text-lg font-bold text-gray-900">Total Due</span>
                              <span className="text-lg font-bold text-indigo-600">
                                {totalDue} {invoice.currency}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* PAYMENT INFO SECTION */}
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
                          {invoice.notes && (
                            <p className="text-sm text-gray-700 italic">{invoice.notes}</p>
                          )}
                        </div>

                        {/* FOOTER */}
                        <div className="border-t border-gray-200 pt-6 text-center">
                          <p className="text-xs text-gray-500">
                            Thank you for your business — {invoice.userId.name} •{' '}
                            {invoice.userId.email}
                          </p>
                        </div>
                        <div className="flex flex-col gap-5 md:flex-row  mt-10 relative">

                          <div className="w-full md:w-1/2">
                            <form onSubmit={(e) => handleInvoiceStatusSubmit(e, invoice._id.toString())} className="flex items-center gap-6">
                              <span className="text-3xl">Status</span>
                              <select name="status" defaultValue={invoice.status} className="cursor-pointer text-center">
                                <option value="draft">draft</option>
                                <option value="sent">sent</option>
                                <option value="partially_paid">partially_paid</option>
                                <option value="paid">paid</option>
                                <option value="overdue">overdue</option>
                              </select>
                              <button type="submit" className="bg-indigo-500 text-white rounded px-4 py-1 cursor-pointer">Update</button>
                            </form>
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