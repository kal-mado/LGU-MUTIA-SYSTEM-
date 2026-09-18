export type Role = 
  | 'RMO' // Central Receiving / Records Officer
  | 'ACTION_OFFICER' // Department Action Officer / Receiver
  | 'DEPT_HEAD' // Department Head / Approver
  | 'EXECUTIVE' // Mayor / Municipal Administrator
  | 'CITIZEN'; // Public Citizen Tracking Portal

export type DepartmentCode = 
  | 'RMO'
  | 'BPLO'
  | 'OBO'
  | 'MPDO'
  | 'MTO' // Municipal Treasury Office
  | 'MO'  // Mayor's Office
  | 'SB'  // Sangguniang Bayan
  | 'ASSO' // Municipal Assessor's Office
  | 'MHO'; // Municipal Health Office

export interface DepartmentInfo {
  code: DepartmentCode;
  name: string;
  shortName: string;
  head: string;
  defaultActionOfficer: string;
  color: string;
  iconName: string;
}

export type DocumentClassification = 'SIMPLE' | 'COMPLEX' | 'HIGHLY_TECHNICAL';

export interface ClassificationRule {
  type: DocumentClassification;
  label: string;
  maxDays: number; // RA 11032 SLA limit (in calendar/working days)
  description: string;
}

export type DocumentCategory = 
  | 'Business Permit'
  | 'Building Permit'
  | 'Ordinance Draft'
  | 'Executive Order'
  | 'Barangay Clearance'
  | 'Purchase Order / Voucher'
  | 'Tax Assessment'
  | 'Zoning Clearance'
  | 'General Correspondence';

export type RequestorType = 'Citizen' | 'Private Business' | 'Internal Office' | 'External Agency';

export type PriorityLevel = 'Normal' | 'Urgent' | 'Confidential';

export type DocumentStatus = 
  | 'To Receive'
  | 'In Progress'
  | 'On Hold'
  | 'Approved'
  | 'Disapproved'
  | 'Completed'
  | 'Archived';

export type SLAStatus = 'ON_TIME' | 'WARNING' | 'OVERDUE' | 'COMPLETED';

export interface AuditLog {
  id: string;
  timestamp: string;
  office: DepartmentCode;
  officerName: string;
  officerRole: string;
  action: 'Created' | 'Received' | 'Action Taken' | 'Forwarded' | 'On Hold' | 'Approved' | 'Disapproved' | 'Completed' | 'Archived';
  remarks: string;
  attachments?: string[];
  toOffice?: DepartmentCode;
}

export interface RoutingStep {
  office: DepartmentCode;
  officeName: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING' | 'SKIPPED';
  receivedAt?: string;
  completedAt?: string;
  actionOfficer?: string;
  remarks?: string;
}

export interface DocumentItem {
  id: string; // Tracking Number: e.g. LGU-BPLO-20260918-0042
  title: string;
  classification: DocumentClassification;
  category: DocumentCategory;
  requestorType: RequestorType;
  requestorName: string;
  requestorEmail: string;
  requestorPhone: string;
  priority: PriorityLevel;
  currentOffice: DepartmentCode;
  status: DocumentStatus;
  createdAt: string;
  deadlineAt: string;
  completedAt?: string;
  daysSpent: number;
  routingSequence: RoutingStep[];
  history: AuditLog[];
  attachments: {
    name: string;
    size: string;
    type: string;
    url?: string;
  }[];
  purposeOrNotes: string;
  citizenActionRequired?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  documentId?: string;
  read: boolean;
}
