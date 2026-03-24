'use client'
import { pdf } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/PDF/InvoicePDF'
import formatDurationForInvoice from '../FormatDurationForInvoice'
import { saveInvoice, splitTimeEntryByInvoice } from '@/lib/actions'
import { formatDate } from '../helper/formatDate'


export default function GenerateInvoiceButton({ project, client, timeEntries, user, getCommitMessages }) {


  async function handleGenerate() {
    const unbilledEntries = timeEntries.filter(entry => entry.invoiceId === null || entry.invoiceId === undefined);

    if (unbilledEntries.length === 0) {
      alert("No unbilled time entries available for a new invoice.");
      return;
    }

    const { invoiceNumber, invoiceId } = await saveInvoice(project, client, unbilledEntries, user);
    const dueDate = formatDate(project.dueDate);
    const commitMessageDate = formatDate(timeEntries.createdAt);
    const invoiceData = {
      invoiceNumber: invoiceNumber,
      issueDate: new Date().toLocaleDateString('en-GB'),
      dueDate: dueDate,
      currency: project.currency,
      freelancer: {
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        address: user.address,
        taxId: user.taxId,
        logo: user.logo,
      },
      client: {
        name: client.clientName,
        email: client.clientEmail,
        company: client.clientCompany,
        address: client.address,
      },
      lineItems: unbilledEntries.map(entry => ({
        description: entry.description || 'Development work',
        date: formatDate(entry.createdAt),
        hours: formatDurationForInvoice(entry.duration),
        rate: project.rate,
        total: (entry.duration / 3600) * project.rate
      })).reverse(),
      bankAccount: project.bankAccountId ? user.bankAccounts.find(b => b._id.toString() === project.bankAccountId) : user.bankAccounts.find(b => b.isDefault),
      //bankAccount: user.bankAccount,
      taxRate: project.taxRate,
      notes: user.invoiceNotes,
    }

    await Promise.all(unbilledEntries.map(entry => splitTimeEntryByInvoice(entry._id, invoiceId)));

    if (getCommitMessages) {
      getCommitMessages();
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
    <div className='group ml-8 inline'>
      <button onClick={handleGenerate} className='bg-blue-400 group px-3 py-2 rounded cursor-pointer active:bg-blue-200 group-hover:scale-105 transition'>
        Generate Invoice PDF
      </button>
    </div>
  )
}