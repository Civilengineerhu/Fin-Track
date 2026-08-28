import { Transaction, Workspace } from '../types';
import { formatCurrency, formatDate, CATEGORY_META } from './formatters';

interface StatementReportData {
  workspace: Workspace | null;
  dateScopeLabel: string;
  filterMethodLabel?: string;
  filterPersonLabel?: string;
  totalIncome: number;
  totalExpenses: number;
  totalInvestments: number;
  totalLent: number;
  totalBorrowed: number;
  repaidLentReceived: number;
  repaidBorrowedPaid: number;
  netSavings: number;
  paymentBreakdown: { method: string; count: number; totalAmount: number }[];
  transactions: Transaction[];
  currency: string;
}

export function generatePrintableStatementHtml(data: StatementReportData): string {
  const {
    workspace,
    dateScopeLabel,
    filterMethodLabel,
    filterPersonLabel,
    totalIncome,
    totalExpenses,
    totalInvestments,
    totalLent,
    totalBorrowed,
    repaidLentReceived,
    repaidBorrowedPaid,
    netSavings,
    paymentBreakdown,
    transactions,
    currency,
  } = data;

  const totalInflows = totalIncome + repaidLentReceived + totalBorrowed;
  const totalOutflows = totalExpenses + totalInvestments + totalLent + repaidBorrowedPaid;
  const generatedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const generatedTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const transactionRowsHtml =
    transactions.length === 0
      ? `<tr><td colspan="8" style="text-align: center; padding: 24px; color: #64748b; font-style: italic;">No transactions matched this reporting criteria.</td></tr>`
      : transactions
          .map((tx, idx) => {
            const isIncome = tx.type === 'income';
            const isExpense = tx.type === 'expense';
            const isInvest = tx.type === 'investment';
            const isLent = tx.type === 'lent';
            const isBorrowed = tx.type === 'borrowed';

            let typeBadgeColor = '#64748b';
            let typeBgColor = '#f1f5f9';
            let amountColor = '#0f172a';

            if (isIncome) {
              typeBadgeColor = '#059669';
              typeBgColor = '#ecfdf5';
              amountColor = '#059669';
            } else if (isExpense) {
              typeBadgeColor = '#dc2626';
              typeBgColor = '#fef2f2';
              amountColor = '#dc2626';
            } else if (isInvest) {
              typeBadgeColor = '#4f46e5';
              typeBgColor = '#eef2ff';
              amountColor = '#4f46e5';
            } else if (isLent) {
              typeBadgeColor = '#d97706';
              typeBgColor = '#fffbeb';
              amountColor = '#d97706';
            } else if (isBorrowed) {
              typeBadgeColor = '#2563eb';
              typeBgColor = '#eff6ff';
              amountColor = '#2563eb';
            }

            const catLabel = CATEGORY_META[tx.category]?.label || tx.category || 'General';
            const partyOrPlatform = tx.sourceOrPerson || tx.platformOrInstitution || '—';
            const payMethod = tx.paymentMethod || '—';
            const addedBy = tx.createdBy?.name || 'User';

            return `
        <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 1 ? 'background-color: #f8fafc;' : ''} page-break-inside: avoid;">
          <td style="padding: 9px 10px; font-weight: 500; color: #334155; white-space: nowrap;">${formatDate(tx.date)}</td>
          <td style="padding: 9px 10px; white-space: nowrap;">
            <span style="display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; background-color: ${typeBgColor}; color: ${typeBadgeColor}; border: 1px solid ${typeBadgeColor}30;">
              ${tx.type}
            </span>
          </td>
          <td style="padding: 9px 10px; font-weight: 600; color: #1e293b;">${catLabel}</td>
          <td style="padding: 9px 10px; color: #334155; max-width: 220px; word-break: break-word;">${tx.description || '—'}</td>
          <td style="padding: 9px 10px; color: #475569; font-size: 11px;">
            <span style="display: inline-block; padding: 2px 6px; background: #e2e8f0; border-radius: 4px;">${payMethod}</span>
          </td>
          <td style="padding: 9px 10px; color: #475569; font-size: 11px;">${partyOrPlatform}</td>
          <td style="padding: 9px 10px; text-align: right; font-weight: 800; color: ${amountColor}; white-space: nowrap;">
            ${isIncome ? '+' : '-'}${formatCurrency(tx.amount, currency)}
          </td>
          <td style="padding: 9px 10px; color: #64748b; font-size: 11px; white-space: nowrap;">${addedBy}</td>
        </tr>
      `;
          })
          .join('');

  const paymentBreakdownHtml =
    paymentBreakdown.length === 0
      ? ''
      : `
    <div style="margin-top: 24px; page-break-inside: avoid;">
      <h3 style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; border-bottom: 2px solid #0f172a; padding-bottom: 4px;">
        Payment Method Breakdown
      </h3>
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
        ${paymentBreakdown
          .map(
            (pm) => `
          <div style="flex: 1 1 140px; min-width: 130px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px;">
            <div style="font-size: 11px; font-weight: 700; color: #475569;">${pm.method}</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">${formatCurrency(pm.totalAmount, currency)}</div>
            <div style="font-size: 10px; color: #64748b;">${pm.count} ${pm.count === 1 ? 'record' : 'records'}</div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${workspace?.name || 'FinTrack'} - Financial Statement</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 12mm 14mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      margin: 0;
      padding: 16px;
      font-size: 12px;
      line-height: 1.4;
    }
    .header-box {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #059669;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .workspace-info {
      font-size: 11px;
      color: #475569;
      margin-top: 4px;
    }
    .meta-box {
      text-align: right;
    }
    .meta-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 700;
      color: #64748b;
    }
    .meta-value {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px 14px;
      background-color: #f8fafc;
    }
    .card-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .card-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11px;
    }
    .card-row:last-child {
      border-bottom: none;
      padding-top: 6px;
      font-weight: 800;
      font-size: 12px;
    }
    table.ledger-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-top: 10px;
    }
    table.ledger-table th {
      background-color: #0f172a;
      color: #ffffff;
      padding: 8px 10px;
      text-align: left;
      font-weight: 700;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    table.ledger-table th:last-child {
      text-align: right;
    }
    .footer-note {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      page-break-inside: avoid;
    }
    .print-actions-bar {
      position: fixed;
      top: 12px;
      right: 16px;
      background: #ffffff;
      padding: 8px 14px;
      border-radius: 9999px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
      border: 1px solid #cbd5e1;
      display: flex;
      gap: 8px;
      z-index: 99999;
    }
    .btn-print {
      background: #059669;
      color: #ffffff;
      border: none;
      border-radius: 6px;
      padding: 6px 14px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
    }
    .btn-close {
      background: #e2e8f0;
      color: #1e293b;
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
    }
    @media print {
      body {
        padding: 0;
      }
      .print-actions-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-actions-bar">
    <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
    <button class="btn-close" onclick="window.close()">✕ Close</button>
  </div>

  <div class="header-box">
    <div>
      <h1 class="brand-title">FinTrack Pro</h1>
      <div style="font-size: 16px; font-weight: 800; color: #1e293b; margin-top: 2px;">
        ${workspace?.name || 'Financial Workspace'}
      </div>
      <div class="workspace-info">
        Workspace Code: <strong>${workspace?.code || 'DEFAULT'}</strong> • Ledger Statement
      </div>
    </div>
    <div class="meta-box">
      <div class="meta-title">Reporting Scope</div>
      <div class="meta-value">${dateScopeLabel}</div>
      ${filterMethodLabel ? `<div style="font-size: 10.5px; color: #059669; font-weight: 600; margin-top: 2px;">Payment: ${filterMethodLabel}</div>` : ''}
      ${filterPersonLabel ? `<div style="font-size: 10.5px; color: #2563eb; font-weight: 600;">Counterparty: ${filterPersonLabel}</div>` : ''}
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
        Generated: ${generatedDate} at ${generatedTime}
      </div>
    </div>
  </div>

  <div class="summary-grid">
    <!-- Inflow Section -->
    <div class="card">
      <div class="card-title" style="color: #059669;">Inflows & Recoveries</div>
      <div class="card-row">
        <span>Regular Income (Salary & Others)</span>
        <span style="color: #059669; font-weight: 700;">+${formatCurrency(totalIncome, currency)}</span>
      </div>
      <div class="card-row">
        <span>Lent Money Recovered</span>
        <span style="color: #059669; font-weight: 700;">+${formatCurrency(repaidLentReceived, currency)}</span>
      </div>
      <div class="card-row">
        <span>Borrowed Funds Received</span>
        <span style="font-weight: 700;">+${formatCurrency(totalBorrowed, currency)}</span>
      </div>
      <div class="card-row" style="color: #059669; border-top: 1px solid #cbd5e1; margin-top: 4px;">
        <span>Total Gross Inflow</span>
        <span>+${formatCurrency(totalInflows, currency)}</span>
      </div>
    </div>

    <!-- Outflow Section -->
    <div class="card">
      <div class="card-title" style="color: #dc2626;">Outflows & Investments</div>
      <div class="card-row">
        <span>Regular Expenses</span>
        <span style="color: #dc2626; font-weight: 700;">-${formatCurrency(totalExpenses, currency)}</span>
      </div>
      <div class="card-row">
        <span>SIP & Assets Investment</span>
        <span style="color: #4f46e5; font-weight: 700;">-${formatCurrency(totalInvestments, currency)}</span>
      </div>
      <div class="card-row">
        <span>Money Lent to Others</span>
        <span style="color: #d97706; font-weight: 700;">-${formatCurrency(totalLent, currency)}</span>
      </div>
      <div class="card-row">
        <span>Borrowed Debt Repayments</span>
        <span style="color: #dc2626; font-weight: 700;">-${formatCurrency(repaidBorrowedPaid, currency)}</span>
      </div>
      <div class="card-row" style="color: #dc2626; border-top: 1px solid #cbd5e1; margin-top: 4px;">
        <span>Total Gross Outflow</span>
        <span>-${formatCurrency(totalOutflows, currency)}</span>
      </div>
    </div>
  </div>

  <div style="background: #0f172a; color: #ffffff; border-radius: 8px; padding: 10px 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; page-break-inside: avoid;">
    <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Net Balance & Cashflow for Period</span>
    <span style="font-size: 16px; font-weight: 900; color: ${netSavings >= 0 ? '#34d399' : '#f87171'};">
      ${netSavings >= 0 ? '+' : ''}${formatCurrency(netSavings, currency)}
    </span>
  </div>

  ${paymentBreakdownHtml}

  <div style="margin-top: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px;">
      <h3 style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">
        Itemized Statement Ledger (${transactions.length} Records)
      </h3>
    </div>

    <table class="ledger-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Category</th>
          <th>Description</th>
          <th>Method</th>
          <th>Party / Platform</th>
          <th style="text-align: right;">Amount</th>
          <th>Added By</th>
        </tr>
      </thead>
      <tbody>
        ${transactionRowsHtml}
      </tbody>
    </table>
  </div>

  <div class="footer-note">
    Generated via FinTrack Pro • Multi-User Financial Audit & Record Keeping System • Confidential Financial Statement
  </div>
</body>
</html>`;
}

/**
 * Robust cross-browser & iframe-safe print execution function.
 * 1. Creates a hidden iframe to render the pure HTML print document.
 * 2. Invokes iframe print dialog without disturbing parent app UI.
 * 3. Falls back to blob window open, window.print, or HTML download if browser security blocks direct modal dialogs.
 */
export function executePrintStatement(
  data: StatementReportData,
  onComplete?: () => void,
  onError?: (err: Error) => void
): boolean {
  const htmlContent = generatePrintableStatementHtml(data);

  try {
    // Strategy 1: Hidden iframe printing (works in modern browsers without redirecting or breaking iframe layout)
    const existingIframe = document.getElementById('fintrack-print-frame');
    if (existingIframe) {
      existingIframe.remove();
    }

    const printFrame = document.createElement('iframe');
    printFrame.id = 'fintrack-print-frame';
    printFrame.style.position = 'fixed';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    printFrame.style.width = '0px';
    printFrame.style.height = '0px';
    printFrame.style.border = 'none';

    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(htmlContent);
      frameDoc.close();

      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          if (onComplete) onComplete();
        } catch (innerErr) {
          console.warn('Iframe print dialog failed, falling back:', innerErr);
          // Strategy 2 fallback: standard window print with clean print classes
          window.print();
        }
      }, 350);

      return true;
    }
  } catch (err) {
    console.error('Print execution error:', err);
    if (onError) onError(err as Error);
  }

  // Strategy 2 fallback
  try {
    window.print();
    return true;
  } catch (err) {
    if (onError) onError(err as Error);
    return false;
  }
}

/**
 * Download standalone printable HTML statement file
 */
export function downloadStatementHtmlFile(data: StatementReportData, filename?: string): void {
  const htmlContent = generatePrintableStatementHtml(data);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    filename ||
      `FinTrack_Statement_${data.workspace?.name.replace(/\s+/g, '_') || 'Workspace'}_${new Date().toISOString().split('T')[0]}.html`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
