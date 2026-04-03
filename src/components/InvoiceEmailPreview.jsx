'use client';

import React, { useState } from 'react';
import { sendInvoiceEmail, markSentInvoice } from '@/lib/actions';

export default function InvoiceEmailPreview({ invoice, onClose }) {
    const [loading, setLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState(false);
    if (!invoice) return null;

    const user = invoice.userId || {};
    const client = invoice.clientId || {};
    const project = invoice.projectId || {};
    const commitList = invoice.commitList || [];
    const invoiceNumber = invoice.invoiceNumber;
    const issueDate = invoice.issueDate;
    const dueDate = invoice.dueDate;
    const currency = invoice.currency || '';
    const notes = invoice.notes;

    const formatDateLocal = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB');
    };

    const rate = project?.rate || 0;
    const taxRate = project?.taxRate || 0;

    const isFixed = project?.paymentType === 'fixed';
    const subtotal = isFixed 
        ? (Number(invoice.totalAmount) || 0)
        : (commitList || []).reduce((acc, item) => {
            const seconds = Number(Number.isFinite(item?.duration) ? item.duration : 0);
            const total = (seconds / 3600) * rate;
            return acc + total;
        }, 0);

    const tax = subtotal * (taxRate / 100);
    const totalDue = subtotal + tax;

    const handleSend = async () => {
        setLoading(true);
        const res = await sendInvoiceEmail(invoice);
        await markSentInvoice(invoice._id.toString());
        setLoading(false);
        setResponseMessage(res.message);
        console.log(res.message);


    }
    return (
        <div
            onClick={() => onClose && onClose()}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                zIndex: 9999
            }}
        >

            <div style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto' }}>
                <div onClick={(e) => e.stopPropagation()} style={{
                    maxWidth: 600,
                    margin: '0 auto',
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb'
                }}>

                    <div style={{ padding: 40, borderBottom: '1px solid #f3f4f6' }}>
                        <table width="100%" border="0" cellPadding="0" cellSpacing="0">
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: 'top' }}>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: '#4f46e5', letterSpacing: '-0.02em' }}>{user?.businessName || user?.name || 'Invoicing Portal'}</div>
                                    </td>
                                    <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                                        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.03em' }}>INVOICE</h1>
                                        <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0 0' }}>#{invoiceNumber}</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <img src={user?.avatar || user?.logo} alt="logo" style={{ width: 80, height: 80 }} />
                    </div>

                    <div style={{ padding: '40px 40px 20px 40px' }}>
                        <table width="100%" border="0" cellPadding="0" cellSpacing="0">
                            <tbody>
                                <tr>
                                    <td width="50%" style={{ verticalAlign: 'top', paddingRight: 20 }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.05em', marginBottom: 8 }}>From</p>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{user?.name || ''}</p>
                                        <p style={{ fontSize: 14, color: '#4b5563', margin: '2px 0' }}>{user?.email || ''}</p>
                                        <p style={{ fontSize: 14, color: '#4b5563', margin: '2px 0', lineHeight: 1.5 }}>{user?.address || ''}</p>
                                        <p style={{ fontSize: 14, color: '#4b5563', margin: '2px 0', lineHeight: 1.5 }}>Tax ID: {user?.taxIdType || ''} {user?.taxIdNumber || ''}</p>
                                    </td>
                                    <td width="50%" style={{ verticalAlign: 'top' }}>
                                        <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.05em', marginBottom: 8 }}>Bill To</p>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{client?.clientName || ''}</p>
                                        <p style={{ fontSize: 14, color: '#4b5563', margin: '2px 0' }}>{client?.clientEmail || ''}</p>
                                        <p style={{ fontSize: 14, color: '#4b5563', margin: '2px 0' }}>{client?.address || client?.clientCountry || ''}</p>
                                        <p style={{ fontSize: 14, color: '#4b5563', margin: '2px 0', lineHeight: 1.5 }}>Tax ID: {client?.taxIdType || ''} {client?.taxIdNumber || ''}</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style={{ margin: '0 40px 30px 40px', padding: 20, backgroundColor: '#f9fafb', borderRadius: 8 }}>
                        <table width="100%" border="0" cellPadding="0" cellSpacing="0">
                            <tbody>
                                <tr>
                                    <td style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>Date</p>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{formatDateLocal(issueDate)}</p>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>Due Date</p>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{formatDateLocal(dueDate)}</p>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>Currency</p>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{currency}</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style={{ padding: '0 0 20px 0' }}>
                        <table width="100%" border="0" cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#4f46e5' }}>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>Description</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>{isFixed ? 'Duration' : 'Qty'}</th>
                                    {!isFixed && <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>Total</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {commitList.map((item, index) => (
                                    <tr key={index} style={{ backgroundColor: index % 2 === 1 ? '#f9fafb' : '#ffffff' }}>
                                        <td style={{ padding: '16px 20px', fontSize: 14, borderBottom: '1px solid #e5e7eb' }}>
                                            <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{item.description || 'Development Work'}</div>
                                            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{formatDateLocal(item.createdAt)}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: 14, borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>
                                            {(((item.duration || 0) / 3600).toFixed(2))} hrs
                                        </td>
                                        {!isFixed && (
                                            <td style={{ padding: '16px 20px', fontSize: 14, borderBottom: '1px solid #e5e7eb', textAlign: 'right', fontWeight: 'bold', color: '#1f2937' }}>
                                                {currency} {(((item.duration || 0) / 3600) * rate).toFixed(2)}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {user?.bankAccounts && Array.isArray(user.bankAccounts) && (() => {
                        const defaultBank = user.bankAccounts.find(b => b.isDefault) || user.bankAccounts[0];
                        if (!defaultBank) return null;
                        return (
                            <div style={{ background: '#eef2ff', borderLeft: '4px solid #6366f1', padding: 20, borderRadius: 8, margin: '32px 0 24px 0' }}>
                                <h4 style={{ fontWeight: 'bold', color: '#1f2937', fontSize: 15, marginBottom: 8 }}>Payment Details</h4>
                                {defaultBank.bankName ? <div style={{ color: '#374151', fontSize: 14, marginBottom: 4 }}>Bank: {defaultBank.bankName}</div> : null}
                                {defaultBank.accountOwnerFirstName && defaultBank.accountOwnerLastName ? <div style={{ color: '#374151', fontSize: 14, marginBottom: 4 }}>Bank Account Holder: {defaultBank.accountOwnerFirstName} {defaultBank.accountOwnerLastName}</div> : null}
                                {defaultBank.iban ? <div style={{ color: '#374151', fontSize: 14, marginBottom: 4 }}>IBAN: {defaultBank.iban}</div> : null}
                                <div style={{ color: '#374151', fontSize: 14, marginBottom: 4 }}>Reference: {invoiceNumber}</div>
                            </div>
                        );
                    })()}

                    <div style={{ padding: '20px 40px 40px 40px' }}>
                        <table width="100%" border="0" cellPadding="0" cellSpacing="0">
                            <tbody>
                                <tr>
                                    <td width="60%"></td>
                                    <td width="40%">
                                        <table width="100%" border="0" cellPadding="0" cellSpacing="0">
                                            <tbody>
                                                <tr>
                                                    <td style={{ padding: '8px 0', fontSize: 14, color: '#6b7280' }}>Subtotal</td>
                                                    <td style={{ padding: '8px 0', fontSize: 14, textAlign: 'right', color: '#111827' }}>{currency} {subtotal.toFixed(2)}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ padding: '8px 0', fontSize: 14, color: '#6b7280' }}>Tax ({taxRate}%)</td>
                                                    <td style={{ padding: '8px 0', fontSize: 14, textAlign: 'right', color: '#111827' }}>{currency} {tax.toFixed(2)}</td>
                                                </tr>
                                                <tr style={{ borderTop: '2px solid #4f46e5' }}>
                                                    <td style={{ padding: '15px 0 0 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>Total Due</td>
                                                    <td style={{ padding: '15px 0 0 0', fontSize: 20, fontWeight: 800, textAlign: 'right', color: '#4f46e5' }}>{currency} {totalDue.toFixed(2)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style={{ padding: 40, textAlign: 'center', borderTop: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
                        {notes ? (
                            <div style={{ marginBottom: 25, padding: 20, backgroundColor: '#fdf2f2', borderLeft: '4px solid #ef4444', textAlign: 'left', fontStyle: 'italic', color: '#991b1b', fontSize: 14, borderRadius: 4 }}>
                                "{notes}"
                            </div>
                        ) : null}
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Thank you for your business — {user?.name || ''} • {user?.email || ''}</p>
                        <p style={{ fontSize: 11, color: '#d1d5db', margin: '8px 0 0 0' }}>Generated by your Invoicing Portal</p>
                    </div>

                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '10px 0 10px 0' }}>
                        <button
                        disabled={responseMessage === "Email sent successfully!"}
                            onClick={(e) => { e.stopPropagation(); handleSend(); }}
                            style={{
                                backgroundColor: responseMessage === "Email sent successfully!" ? "gray" : '#10b981',
                                color: '#ffffff',
                                padding: '10px 18px',
                                borderRadius: 8,
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Send
                        </button>
                        
                        <button
                            onClick={(e) => { e.stopPropagation(); setResponseMessage(""); onClose && onClose(); }}
                            style={{
                                backgroundColor: '#ef4444',
                                color: '#ffffff',
                                padding: '10px 18px',
                                borderRadius: 8,
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Close
                        </button>
                    </div>
                    <div style={{
                        width: '100%',
                        color: responseMessage === "Email sent successfully!" || loading ? "green" : "red",
                        display: "flex",
                        justifyContent: "center",
                    }}>{loading && "Sending..."}{responseMessage}</div>
                </div>
            </div>
        </div>
    );
}
