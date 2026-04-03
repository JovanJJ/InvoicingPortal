'use client'
import { pdf } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/PDF/InvoicePDF'
import formatDurationForInvoice from '../FormatDurationForInvoice'
import { saveInvoice, splitTimeEntryByInvoice, fetchBankIban } from '@/lib/actions'
import { formatDate } from '../helper/formatDate'


export default function PdfButton({ project, client, timeEntries, user, getCommitMessages, existingInvoice }) {

  async function handleGenerate() {
    let invoiceData;
    let bankAccount;

    if (existingInvoice) {
      bankAccount = await fetchBankIban(user._id.toString(), project?.bankAccountId?.toString());
      
      invoiceData = {
        invoiceNumber: existingInvoice.invoiceNumber,
        issueDate: formatDate(existingInvoice.issueDate),
        dueDate: formatDate(existingInvoice.dueDate),
        currency: existingInvoice.currency,
        freelancer: {
          name: user.name,
          email: user.email,
          businessName: user.businessName,
          address: user.address,
          logo: user.logo,
          taxIdType: user.taxIdType,
          taxIdNumber: user.taxIdNumber,
        },
        client: {
          name: client.clientName,
          email: client.clientEmail,
          company: client.clientCompany,
          address: client.address,
          taxIdType: client.taxIdType,
          taxIdNumber: client.taxIdNumber,
        },
        lineItems: (existingInvoice.commitList || []).map(entry => ({
          description: entry.description || 'Development work',
          date: formatDate(entry.createdAt),
          hours: formatDurationForInvoice(entry.duration),
          rate: project?.rate || 0,
          total: (entry.duration / 3600) * (project?.rate || 0)
        })).reverse(),
        bankAccount,
        taxRate: project?.taxRate || 0,
        notes: existingInvoice.notes,
        paymentType: project?.paymentType || 'hourly',
        totalAmount: existingInvoice.totalAmount || 0,
      }
    } else {
      const unbilledEntries = timeEntries.filter(entry => entry.invoiceId === null || entry.invoiceId === undefined);
      bankAccount = await fetchBankIban(user._id.toString(), project.bankAccountId?.toString());

      if (unbilledEntries.length === 0) {
        alert("No unbilled time entries available for a new invoice.");
        return;
      }

      const { invoiceNumber, invoiceId } = await saveInvoice(project, client, unbilledEntries, user);
      const dueDate = formatDate(project.dueDate);
      
      invoiceData = {
        invoiceNumber: invoiceNumber,
        issueDate: new Date().toLocaleDateString('en-GB'),
        dueDate: dueDate,
        currency: project.currency,
        freelancer: {
          name: user.name,
          email: user.email,
          businessName: user.businessName,
          address: user.address,
          logo: user.logo,
          taxIdType: user.taxIdType,
          taxIdNumber: user.taxIdNumber,
        },
        client: {
          name: client.clientName,
          email: client.clientEmail,
          company: client.clientCompany,
          address: client.address,
          taxIdType: client.taxIdType,
          taxIdNumber: client.taxIdNumber,
        },
        lineItems: unbilledEntries.map(entry => ({
          description: entry.description || 'Development work',
          date: formatDate(entry.createdAt),
          hours: formatDurationForInvoice(entry.duration),
          rate: project.rate,
          total: (entry.duration / 3600) * project.rate
        })).reverse(),
        bankAccount,
        taxRate: project.taxRate,
        notes: user.invoiceNotes,
        paymentType: project.paymentType || 'hourly',
        totalAmount: project.rate || 0,
      }

      await Promise.all(unbilledEntries.map(entry => splitTimeEntryByInvoice(entry._id, invoiceId)));

      if (getCommitMessages) {
        getCommitMessages();
      }
    }

    // generate and download
    const blob = await pdf(<InvoicePDF invoice={invoiceData} />).toBlob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${invoiceData.invoiceNumber}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='group inline-block'>
      <button 
        onClick={handleGenerate} 
        className='bg-indigo-600 text-white px-4 py-2 rounded font-medium cursor-pointer hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-sm'
      >
        {existingInvoice ? "Download PDF" : "Generate - Send"}
      </button>
    </div>
  )
}