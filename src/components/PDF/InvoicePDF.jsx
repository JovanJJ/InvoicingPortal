
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  // FROM / TO SECTION
  parties: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  partyBlock: {
    width: '45%',
  },
  partyLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  partyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  partyDetail: {
    fontSize: 11,
    color: '#444',
    marginBottom: 2,
  },
  // DATES
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    marginBottom: 30,
  },
  dateBlock: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 9,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dateValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111',
  },
  // LINE ITEMS TABLE
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    padding: 10,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  col_description: { width: '50%' },
  col_hours: { width: '15%' },
  col_rate: { width: '15%' },
  col_total: { width: '20%', alignItems: 'flex-end' },
  cellText: {
    fontSize: 11,
    color: '#333',
  },
  // TOTALS
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 11,
    color: '#888',
  },
  totalValue: {
    fontSize: 11,
    color: '#333',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    borderTopWidth: 2,
    borderTopColor: '#6366f1',
    paddingTop: 8,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  // PAYMENT INFO
  paymentSection: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#f0f0ff',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  paymentTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  paymentDetail: {
    fontSize: 10,
    color: '#555',
    marginBottom: 3,
  },
  // FOOTER
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#aaa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  }
})

export function InvoicePDF({ invoice }) {
  const {
    invoiceNumber,
    issueDate,
    dueDate,
    freelancer,  // your info
    client,      // their info
    lineItems,   // time entries + expenses
    currency,
    bankAccount,
    notes,
  } = invoice

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const tax = invoice.taxRate ? subtotal * (invoice.taxRate / 100) : 0
  const grandTotal = subtotal + tax

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            {freelancer.logo && (
              <Image style={styles.logo} src={freelancer.logo} />
            )}
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 8 }}>
              {freelancer.businessName || freelancer.name}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoiceNumber}</Text>
          </View>
        </View>

        {/* FROM / TO */}
        <View style={styles.parties}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>{freelancer.name}</Text>
            <Text style={styles.partyDetail}>{freelancer.email}</Text>
            <Text style={styles.partyDetail}>{freelancer.address}</Text>
            {freelancer.taxId && (
              <Text style={styles.partyDetail}>PIB: {freelancer.taxId}</Text>
            )}
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Bill To</Text>
            <Text style={styles.partyName}>{client.name}</Text>
            <Text style={styles.partyDetail}>{client.email}</Text>
            <Text style={styles.partyDetail}>{client.company}</Text>
            <Text style={styles.partyDetail}>{client.address}</Text>
          </View>
        </View>

        {/* DATES */}
        <View style={styles.datesRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Invoice Date</Text>
            <Text style={styles.dateValue}>{issueDate}</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Due Date</Text>
            <Text style={styles.dateValue}>{dueDate}</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Currency</Text>
            <Text style={styles.dateValue}>{currency}</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Status</Text>
            <Text style={[styles.dateValue, { color: '#f59e0b' }]}>Due</Text>
          </View>
        </View>

        {/* LINE ITEMS TABLE HEADER */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.col_description]}>Description</Text>
          <Text style={[styles.tableHeaderText, styles.col_hours]}>Hours</Text>
          <Text style={[styles.tableHeaderText, styles.col_rate]}>Rate</Text>
          <Text style={[styles.tableHeaderText, styles.col_total]}>Total</Text>
        </View>

        {/* LINE ITEMS ROWS */}
        {lineItems.map((item, index) => (
          <View
            key={index}
            style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
          >
            <View style={styles.col_description}>
              <Text style={styles.cellText}>{item.description}</Text>
              {item.date && (
                <Text style={{ fontSize: 9, color: '#aaa', marginTop: 2 }}>
                  {item.date}
                </Text>
              )}
            </View>
            <Text style={[styles.cellText, styles.col_hours]}>
              {item.hours ? `${item.hours}` : '-'}
            </Text>
            <Text style={[styles.cellText, styles.col_rate]}>
              {item.rate ? `${currency} ${item.rate}` : '-'}
            </Text>
            <Text style={[styles.cellText, styles.col_total]}>
              {currency} {item.total.toFixed(2)}
            </Text>
          </View>
        ))}

        {/* TOTALS */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{currency} {subtotal.toFixed(2)}</Text>
          </View>
          {tax > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%)</Text>
              <Text style={styles.totalValue}>{currency} {tax.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total Due</Text>
            <Text style={styles.grandTotalValue}>{currency} {grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* PAYMENT INFO */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Payment Details</Text>
          {bankAccount?.iban && (
            <Text style={styles.paymentDetail}>IBAN: {bankAccount.iban}</Text>
          )}
          {bankAccount?.bankName && (
            <Text style={styles.paymentDetail}>Bank: {bankAccount.bankName}</Text>
          )}
          <Text style={styles.paymentDetail}>
            Reference: {invoiceNumber}
          </Text>
          {notes && (
            <Text style={[styles.paymentDetail, { marginTop: 8 }]}>{notes}</Text>
          )}
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Thank you for your business — {freelancer.name} • {freelancer.email}
        </Text>

      </Page>
    </Document>
  )
}