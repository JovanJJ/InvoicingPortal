import React from 'react';

/**
 * InvoiceEmailTemplate - A specialized React component for generating email-safe HTML.
 * All styles are inline to ensure high compatibility with Gmail, Outlook, etc.
 */
export default function InvoiceEmailTemplate({ 
  invoice, 
  user, 
  client, 
  lineItems, 
  subtotal, 
  tax, 
  taxRate,
  total, 
  bankDetails,
  paymentType
}) {
  const isFixed = paymentType === 'fixed';
  const mainColor = '#4f46e5'; // Indigo-600
  const lightGray = '#f9fafb';
  const borderColor = '#e5e7eb';
  const textColor = '#1f2937';
  const labelColor = '#6b7280';

  const styles = {
    container: {
      fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      color: textColor,
      backgroundColor: lightGray,
      padding: '40px 20px',
      margin: '0',
    },
    wrapper: {
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
    },
    header: {
      padding: '40px',
      borderBottom: `1px solid ${borderColor}`,
    },
    headerTop: {
      display: 'table',
      width: '100%',
      marginBottom: '30px',
    },
    brand: {
      display: 'table-cell',
      fontSize: '24px',
      fontWeight: 'bold',
      color: mainColor,
      verticalAlign: 'top',
    },
    invoiceTitle: {
      display: 'table-cell',
      textAlign: 'right',
      verticalAlign: 'top',
    },
    titleText: {
      fontSize: '32px',
      fontWeight: 'bold',
      margin: '0',
    },
    invoiceNumber: {
      fontSize: '14px',
      color: labelColor,
      marginTop: '5px',
    },
    infoSection: {
      padding: '0 40px 30px',
      display: 'table',
      width: '100%',
    },
    infoBlock: {
      display: 'table-cell',
      width: '50%',
      verticalAlign: 'top',
    },
    label: {
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      color: labelColor,
      letterSpacing: '0.05em',
      marginBottom: '8px',
    },
    value: {
      fontSize: '14px',
      lineHeight: '1.5',
      margin: '0',
    },
    datesSection: {
      padding: '20px 40px',
      backgroundColor: lightGray,
      display: 'table',
      width: '100%',
    },
    dateCell: {
      display: 'table-cell',
      textAlign: 'center',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      padding: '0 40px',
    },
    tableHeader: {
      backgroundColor: mainColor,
      color: '#ffffff',
    },
    tableHeaderCell: {
      padding: '12px 20px',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      textAlign: 'left',
    },
    tableCell: {
      padding: '16px 20px',
      fontSize: '14px',
      borderBottom: `1px solid ${borderColor}`,
    },
    totalsSection: {
      padding: '30px 40px',
      textAlign: 'right',
    },
    totalRow: {
      display: 'table',
      width: '200px',
      marginLeft: 'auto',
      marginBottom: '10px',
    },
    totalLabel: {
      display: 'table-cell',
      textAlign: 'left',
      fontSize: '14px',
      color: labelColor,
    },
    totalValue: {
      display: 'table-cell',
      textAlign: 'right',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    grandTotal: {
      borderTop: `2px solid ${mainColor}`,
      marginTop: '10px',
      paddingTop: '10px',
    },
    paymentInfo: {
      padding: '30px 40px',
      backgroundColor: '#f5f7ff',
      margin: '30px 40px',
      borderRadius: '4px',
      borderLeft: `4px solid ${mainColor}`,
    },
    footer: {
      padding: '30px 40px 40px',
      textAlign: 'center',
      borderTop: `1px solid ${borderColor}`,
    },
    thankYou: {
      fontSize: '12px',
      color: labelColor,
      margin: '0',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div style={styles.brand}>{user.businessName || user.name}</div>
            <div style={styles.invoiceTitle}>
              <h1 style={styles.titleText}>INVOICE</h1>
              <p style={styles.invoiceNumber}>#{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Address Info */}
        <div style={styles.infoSection}>
          <div style={styles.infoBlock}>
            <p style={styles.label}>From</p>
            <p style={{ ...styles.value, fontWeight: 'bold' }}>{user.name}</p>
            <p style={styles.value}>{user.email}</p>
            <p style={styles.value}>{user.address}</p>
          </div>
          <div style={styles.infoBlock}>
            <p style={styles.label}>Bill To</p>
            <p style={{ ...styles.value, fontWeight: 'bold' }}>{client.clientName}</p>
            <p style={styles.value}>{client.clientEmail}</p>
            <p style={styles.value}>{client.address || client.clientCountry}</p>
          </div>
        </div>

        {/* Dates */}
        <div style={styles.datesSection}>
          <div style={styles.dateCell}>
            <p style={styles.label}>Invoice Date</p>
            <p style={{ ...styles.value, fontWeight: 'bold' }}>{invoice.issueDate}</p>
          </div>
          <div style={styles.dateCell}>
            <p style={styles.label}>Due Date</p>
            <p style={{ ...styles.value, fontWeight: 'bold' }}>{invoice.dueDate}</p>
          </div>
          <div style={styles.dateCell}>
            <p style={styles.label}>Currency</p>
            <p style={{ ...styles.value, fontWeight: 'bold' }}>{invoice.currency}</p>
          </div>
        </div>

        {/* Line Items */}
        <div style={{ padding: '30px 0' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={{ ...styles.tableHeaderCell, width: isFixed ? '80%' : '60%' }}>Description</th>
                <th style={{ ...styles.tableHeaderCell, width: isFixed ? '20%' : '20%' }}>{isFixed ? 'Duration' : 'Hours'}</th>
                {!isFixed && <th style={{ ...styles.tableHeaderCell, width: '20%', textAlign: 'right' }}>Total</th>}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 1 ? '#fdfdfd' : '#ffffff' }}>
                  <td style={styles.tableCell}>{item.description}</td>
                  <td style={styles.tableCell}>{item.hours}</td>
                  {!isFixed && (
                    <td style={{ ...styles.tableCell, textAlign: 'right', fontWeight: 'bold' }}>
                      {invoice.currency} {item.total}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={styles.totalsSection}>
          <div style={styles.totalRow}>
            <div style={styles.totalLabel}>Subtotal</div>
            <div style={styles.totalValue}>{invoice.currency} {subtotal}</div>
          </div>
          <div style={styles.totalRow}>
            <div style={styles.totalLabel}>Tax ({taxRate}%)</div>
            <div style={styles.totalValue}>{invoice.currency} {tax}</div>
          </div>
          <div style={{ ...styles.totalRow, ...styles.grandTotal }}>
            <div style={{ ...styles.totalLabel, color: textColor, fontWeight: 'bold', fontSize: '18px' }}>Total Due</div>
            <div style={{ ...styles.totalValue, color: mainColor, fontSize: '18px' }}>{invoice.currency} {total}</div>
          </div>
        </div>

        {/* Payment Details */}
        <div style={styles.paymentInfo}>
          <p style={{ ...styles.label, marginBottom: '10px' }}>Payment Details</p>
          {bankDetails?.bankName && <p style={styles.value}><strong>Bank:</strong> {bankDetails.bankName}</p>}
          {bankDetails?.iban && <p style={styles.value}><strong>IBAN:</strong> {bankDetails.iban}</p>}
          <p style={styles.value}><strong>Reference:</strong> {invoice.invoiceNumber}</p>
          {invoice.notes && (
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: `1px solid ${borderColor}`, fontStyle: 'italic' }}>
              {invoice.notes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.thankYou}>
            Thank you for your business — {user.name} • {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}
