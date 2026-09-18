import { DocumentClassification, DocumentItem, SLAStatus, DepartmentCode } from '../types';
import { CLASSIFICATION_RULES } from '../data/mockData';

// Generates LGU-[DEPT]-[YYYYMMDD]-[4 DIGITS]
export function generateTrackingId(dept: DepartmentCode, existingDocsCount: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const sequence = String(existingDocsCount + 1).padStart(4, '0');
  return `LGU-${dept}-${year}${month}${day}-${sequence}`;
}

// Compute SLA Status based on deadline & status
export function getSLAStatus(doc: DocumentItem): SLAStatus {
  if (doc.status === 'Completed' || doc.status === 'Archived') {
    return 'COMPLETED';
  }

  const now = new Date().getTime();
  const deadline = new Date(doc.deadlineAt).getTime();
  const diffHours = (deadline - now) / (1000 * 60 * 60);

  if (diffHours < 0) {
    return 'OVERDUE';
  }
  // If within 24 hours of deadline
  if (diffHours <= 24) {
    return 'WARNING';
  }
  return 'ON_TIME';
}

// Format remaining SLA time in friendly string
export function getSLACountdownText(doc: DocumentItem): { text: string; isOverdue: boolean; percentUsed: number } {
  if (doc.status === 'Completed') {
    return { text: 'Completed On Time', isOverdue: false, percentUsed: 100 };
  }

  const created = new Date(doc.createdAt).getTime();
  const deadline = new Date(doc.deadlineAt).getTime();
  const now = new Date().getTime();

  const totalDuration = deadline - created;
  const elapsed = Math.max(0, now - created);
  const remaining = deadline - now;

  const percentUsed = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

  if (remaining <= 0) {
    const overdueDays = Math.ceil(Math.abs(remaining) / (1000 * 60 * 60 * 24));
    return {
      text: `Lapsed by ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'} (RA 11032 Breach)`,
      isOverdue: true,
      percentUsed: 100
    };
  }

  const hoursRemaining = Math.floor(remaining / (1000 * 60 * 60));
  const daysRemaining = Math.floor(hoursRemaining / 24);

  if (daysRemaining >= 1) {
    const remHours = hoursRemaining % 24;
    return {
      text: `${daysRemaining}d ${remHours}h remaining`,
      isOverdue: false,
      percentUsed
    };
  }

  return {
    text: `${Math.max(1, hoursRemaining)}h remaining today`,
    isOverdue: false,
    percentUsed
  };
}

// Calculate legal deadline from creation date and classification
export function calculateDeadline(createdAt: Date, classification: DocumentClassification): Date {
  const rule = CLASSIFICATION_RULES[classification];
  const maxDays = rule ? rule.maxDays : 3;
  
  // In Philippine government practice under RA 11032, working days exclude weekends
  const deadline = new Date(createdAt.getTime());
  let addedDays = 0;
  while (addedDays < maxDays) {
    deadline.setDate(deadline.getDate() + 1);
    const dayOfWeek = deadline.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }
  deadline.setHours(17, 0, 0, 0); // Close of government working day 5:00 PM
  return deadline;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
