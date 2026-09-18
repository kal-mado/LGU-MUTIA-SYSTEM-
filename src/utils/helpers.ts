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

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export interface FileTypeInfo {
  badge: string;
  extension: string;
  category: 'pdf' | 'word' | 'excel' | 'image' | 'archive' | 'text' | 'generic';
  badgeColor: string; // Tailwind classes
}

export function getFileTypeDetails(fileName: string, mimeType?: string): FileTypeInfo {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const mime = mimeType?.toLowerCase() || '';

  if (ext === 'pdf' || mime.includes('pdf')) {
    return {
      badge: 'PDF',
      extension: ext || 'pdf',
      category: 'pdf',
      badgeColor: 'bg-red-100 text-red-700 border-red-200'
    };
  }

  if (['doc', 'docx', 'dot', 'dotx', 'odt', 'rtf'].includes(ext) || mime.includes('word') || mime.includes('document')) {
    return {
      badge: ext.toUpperCase() || 'DOCX',
      extension: ext || 'docx',
      category: 'word',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200'
    };
  }

  if (['xls', 'xlsx', 'csv', 'ods', 'tsv'].includes(ext) || mime.includes('excel') || mime.includes('spreadsheet') || mime.includes('csv')) {
    return {
      badge: ext.toUpperCase() || 'XLSX',
      extension: ext || 'xlsx',
      category: 'excel',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
  }

  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'tiff'].includes(ext) || mime.startsWith('image/')) {
    return {
      badge: ext.toUpperCase() || 'IMG',
      extension: ext || 'image',
      category: 'image',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200'
    };
  }

  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) {
    return {
      badge: ext.toUpperCase() || 'ZIP',
      extension: ext || 'zip',
      category: 'archive',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200'
    };
  }

  if (['txt', 'log', 'md'].includes(ext) || mime.startsWith('text/')) {
    return {
      badge: ext.toUpperCase() || 'TXT',
      extension: ext || 'txt',
      category: 'text',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
    };
  }

  return {
    badge: ext ? ext.toUpperCase().slice(0, 4) : 'FILE',
    extension: ext || 'file',
    category: 'generic',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
  };
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
