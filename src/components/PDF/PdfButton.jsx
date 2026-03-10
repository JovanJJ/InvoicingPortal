'use client'
import { pdf } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/PDF/InvoicePDF'
import formatDurationForInvoice from '../FormatDurationForInvoice'
import { saveInvoice } from '@/lib/actions'


const user = {
  name: 'Marko Nikolic',
  email: 'marko@gmail.com',
  businessName: 'Marko Dev Studio',
  address: 'Bulevar Oslobodjenja 12, Beograd, Serbia',
  taxId: 'RS123456789',
  logo: null, // add image URL string to test logo
  invoiceNotes: 'Thank you for your business! Payment due within 30 days.',
  bankAccounts: [
    {
      label: 'EUR Account',
      bankName: 'Raiffeisen Bank',
      iban: 'RS35265100000000000',
      currency: 'EUR',
      isDefault: true
    }
  ]
}

const client = {
  name: 'Stefan Petrovic',
  email: 'stefan@company.com',
  company: 'Web Studio d.o.o',
  address: 'Knez Mihailova 10, Beograd, Serbia',
}

const project = {
  _id: '123',
  name: 'Website Redesign',
  type: 'hourly',
  rate: 50,
  currency: 'EUR',
}

const timeEntries = [
  {
    _id: '1',
    description: 'Built login page and Google OAuth integration',
    duration: 3000, // 3 hours in seconds
    timerStartedAt: '2026-02-23T10:00:00Z',
    billable: true,
    status: 'completed'
  },
  {
    _id: '2',
    description: 'API integration and bug fixes',
    duration: 4000, // 5 hours
    timerStartedAt: '2026-02-24T09:00:00Z',
    billable: true,
    status: 'completed'
  },
  {
    _id: '3',
    description: 'Responsive design for mobile screens',
    duration: 8000, // 2 hours
    timerStartedAt: '2026-02-25T14:00:00Z',
    billable: true,
    status: 'completed'
  },
  {
    _id: '4',
    description: 'Internal meeting', // non billable, should not appear
    duration: 4500,
    timerStartedAt: '2026-02-25T16:00:00Z',
    billable: false, // ← filtered out from invoice
    status: 'completed'
  }
]



export default function GenerateInvoiceButton({ project, client, timeEntries, user }) {
  async function handleGenerate() {
    await saveInvoice(project, client, timeEntries, user);
    // build invoice data from project + time entries
    const invoiceData = {
      invoiceNumber: `INV-${Date.now()}`,
      issueDate: new Date().toLocaleDateString('en-GB'),
      dueDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-GB'),
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
        address: client.clientAddress,
      },
      lineItems: timeEntries.map(entry => ({
        description: entry.description || 'Development work',
        date: new Date(entry.timerStartedAt).toLocaleDateString('en-GB'),
        hours: formatDurationForInvoice(entry.duration),
        rate: project.rate,
        total: (entry.duration / 3600) * project.rate
      })),
      //bankAccount: user.bankAccounts.find(b => b.isDefault),
      bankAccount: user.bankAccount,
      taxRate: 0, // add later
      notes: user.invoiceNotes,
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