import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  DocumentItem, 
  Role, 
  DepartmentCode, 
  SystemNotification,
  DocumentClassification,
  RoutingStep
} from '../types';
import { 
  INITIAL_DOCUMENTS, 
  INITIAL_NOTIFICATIONS, 
  DEPARTMENTS 
} from '../data/mockData';
import { calculateDeadline, generateTrackingId } from '../utils/helpers';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface DocTrackContextType {
  documents: DocumentItem[];
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  activeDepartment: DepartmentCode;
  setActiveDepartment: (dept: DepartmentCode) => void;
  selectedDoc: DocumentItem | null;
  setSelectedDocId: (id: string | null) => void;
  routingSlipDoc: DocumentItem | null;
  setRoutingSlipDocId: (id: string | null) => void;
  notifications: SystemNotification[];
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error', title?: string) => void;
  removeToast: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeView: 'dashboard' | 'intake' | 'analytics' | 'track' | 'logbook';
  setActiveView: (view: 'dashboard' | 'intake' | 'analytics' | 'track' | 'logbook') => void;
  
  // Actions
  createDocument: (docData: any) => DocumentItem;
  receiveDocument: (docId: string, remarks?: string) => void;
  forwardDocument: (docId: string, toOffice: DepartmentCode, remarks: string) => void;
  approveDocument: (docId: string, remarks: string, forwardTo?: DepartmentCode) => void;
  disapproveDocument: (docId: string, remarks: string) => void;
  putOnHold: (docId: string, remarks: string, citizenAction?: string) => void;
  completeDocument: (docId: string, remarks: string) => void;
  addAttachmentsToDocument: (docId: string, newFiles: Array<{ name: string; size: string; type: string; url?: string }>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  resetToMockData: () => void;
}

const STORAGE_KEY_DOCS = 'lgu_edoctrack_documents_v1';
const STORAGE_KEY_NOTIFS = 'lgu_edoctrack_notifs_v1';

const DocTrackContext = createContext<DocTrackContextType | undefined>(undefined);

export const DocTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DOCS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load documents from localStorage', e);
    }
    return INITIAL_DOCUMENTS;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load notifications from localStorage', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [activeRole, setActiveRoleState] = useState<Role>('RMO');
  const [activeDepartment, setActiveDepartment] = useState<DepartmentCode>('RMO');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [routingSlipDocId, setRoutingSlipDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'dashboard' | 'intake' | 'analytics' | 'track' | 'logbook'>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Automatically adjust view or default department when switching roles
  const setActiveRole = (role: Role) => {
    setActiveRoleState(role);
    if (role === 'CITIZEN') {
      setActiveView('track');
    } else if (role === 'RMO') {
      setActiveDepartment('RMO');
      if (activeView === 'track') setActiveView('dashboard');
    } else if (role === 'EXECUTIVE') {
      setActiveDepartment('MO');
      setActiveView('analytics');
    } else {
      if (activeView === 'track') setActiveView('dashboard');
      if (activeDepartment === 'RMO') {
        setActiveDepartment('BPLO'); // Default to popular department for demo
      }
    }
    addToast(`Switched perspective to ${getRoleName(role)}`, 'info');
  };

  const getRoleName = (role: Role) => {
    switch (role) {
      case 'RMO': return 'Central Records Officer (RMO)';
      case 'ACTION_OFFICER': return 'Department Action Officer';
      case 'DEPT_HEAD': return 'Department Head / Approver';
      case 'EXECUTIVE': return 'Executive / Mayor’s Administrator';
      case 'CITIZEN': return 'Public Citizen Portal';
      default: return role;
    }
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
    } catch (e) {
      console.error('Failed to sync documents to localStorage', e);
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to sync notifications to localStorage', e);
    }
  }, [notifications]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId) || null;
  const routingSlipDoc = documents.find(d => d.id === routingSlipDocId) || null;

  // Document actions
  const createDocument = (formData: any): DocumentItem => {
    const creationDate = new Date();
    const id = generateTrackingId(formData.initialOffice || 'RMO', documents.length);
    const deadline = calculateDeadline(creationDate, formData.classification as DocumentClassification);
    const deptInfo = DEPARTMENTS[formData.initialOffice as DepartmentCode] || DEPARTMENTS.RMO;

    const initialStep: RoutingStep = {
      office: 'RMO' as DepartmentCode,
      officeName: DEPARTMENTS.RMO.shortName,
      status: 'COMPLETED' as const,
      receivedAt: creationDate.toISOString(),
      completedAt: creationDate.toISOString(),
      actionOfficer: DEPARTMENTS.RMO.defaultActionOfficer,
      remarks: 'Intake and logging completed. Routing slip generated.'
    };

    const nextStep: RoutingStep | null = formData.initialOffice !== 'RMO' ? {
      office: formData.initialOffice as DepartmentCode,
      officeName: deptInfo.shortName,
      status: 'ACTIVE' as const,
      remarks: 'Dispatched from Central Records.'
    } : null;

    const routingSequence: RoutingStep[] = [initialStep];
    if (nextStep) routingSequence.push(nextStep);

    const newDoc: DocumentItem = {
      id,
      title: formData.title,
      classification: formData.classification,
      category: formData.category,
      requestorType: formData.requestorType,
      requestorName: formData.requestorName,
      requestorEmail: formData.requestorEmail,
      requestorPhone: formData.requestorPhone,
      priority: formData.priority || 'Normal',
      currentOffice: formData.initialOffice || 'RMO',
      status: formData.initialOffice === 'RMO' ? 'In Progress' : 'To Receive',
      createdAt: creationDate.toISOString(),
      deadlineAt: deadline.toISOString(),
      daysSpent: 0,
      purposeOrNotes: formData.purposeOrNotes || '',
      citizenActionRequired: 'Awaiting departmental review at ' + deptInfo.shortName,
      routingSequence,
      attachments: formData.attachments || [],
      history: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('en-PH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          office: 'RMO',
          officerName: DEPARTMENTS.RMO.defaultActionOfficer,
          officerRole: 'Records Receiving Officer',
          action: 'Created',
          remarks: `Initial document intake. Tagged as ${formData.classification} (${formData.category}).`,
          toOffice: formData.initialOffice
        }
      ]
    };

    setDocuments(prev => [newDoc, ...prev]);

    // Push notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Document Registered',
        message: `${newDoc.id} (${newDoc.category}) assigned to ${deptInfo.shortName}.`,
        type: 'info',
        timestamp: 'Just now',
        documentId: newDoc.id,
        read: false
      },
      ...prev
    ]);

    addToast(`Document ${newDoc.id} successfully created!`, 'success', 'Intake Completed');
    setRoutingSlipDocId(newDoc.id); // Auto show printable routing slip
    return newDoc;
  };

  const receiveDocument = (docId: string, remarks?: string) => {
    const officer = DEPARTMENTS[activeDepartment]?.defaultActionOfficer || 'Action Officer';
    const deptInfo = DEPARTMENTS[activeDepartment];

    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id !== docId) return doc;

        const updatedSeq = doc.routingSequence.map(step => {
          if (step.office === activeDepartment && step.status !== 'COMPLETED') {
            return {
              ...step,
              status: 'ACTIVE' as const,
              receivedAt: new Date().toISOString(),
              actionOfficer: officer,
              remarks: remarks || step.remarks
            };
          }
          return step;
        });

        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('en-PH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          office: activeDepartment,
          officerName: officer,
          officerRole: 'Action Officer',
          action: 'Received' as const,
          remarks: remarks || `Physical/electronic receipt confirmed at ${deptInfo.name}.`
        };

        return {
          ...doc,
          status: 'In Progress',
          routingSequence: updatedSeq,
          history: [...doc.history, newLog]
        };
      })
    );

    addToast(`Document ${docId} received by ${deptInfo.shortName}`, 'success');
  };

  const forwardDocument = (docId: string, toOffice: DepartmentCode, remarks: string) => {
    const currentOfficer = DEPARTMENTS[activeDepartment]?.defaultActionOfficer || 'Action Officer';
    const toOfficeInfo = DEPARTMENTS[toOffice];

    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id !== docId) return doc;

        // Mark current office in sequence as completed
        let foundCurrent = false;
        let updatedSeq = doc.routingSequence.map(step => {
          if (step.office === activeDepartment && step.status !== 'COMPLETED') {
            foundCurrent = true;
            return {
              ...step,
              status: 'COMPLETED' as const,
              completedAt: new Date().toISOString(),
              remarks: remarks || step.remarks
            };
          }
          return step;
        });

        if (!foundCurrent) {
          updatedSeq.push({
            office: activeDepartment,
            officeName: DEPARTMENTS[activeDepartment].shortName,
            status: 'COMPLETED',
            completedAt: new Date().toISOString(),
            actionOfficer: currentOfficer,
            remarks
          });
        }

        // Add destination office as ACTIVE
        updatedSeq.push({
          office: toOffice,
          officeName: toOfficeInfo.shortName,
          status: 'ACTIVE',
          receivedAt: new Date().toISOString(),
          actionOfficer: toOfficeInfo.defaultActionOfficer,
          remarks: 'Awaiting departmental review.'
        });

        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('en-PH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          office: activeDepartment,
          officerName: currentOfficer,
          officerRole: 'Action Officer',
          action: 'Forwarded' as const,
          remarks: remarks || `Forwarded to ${toOfficeInfo.name}`,
          toOffice
        };

        return {
          ...doc,
          currentOffice: toOffice,
          status: 'To Receive',
          citizenActionRequired: `Document forwarded to ${toOfficeInfo.shortName}.`,
          routingSequence: updatedSeq,
          history: [...doc.history, newLog]
        };
      })
    );

    addToast(`Document ${docId} successfully forwarded to ${toOfficeInfo.shortName}`, 'success');
  };

  const approveDocument = (docId: string, remarks: string, forwardTo?: DepartmentCode) => {
    const headName = DEPARTMENTS[activeDepartment]?.head || 'Department Head';

    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id !== docId) return doc;

        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('en-PH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          office: activeDepartment,
          officerName: headName,
          officerRole: 'Department Head / Approver',
          action: 'Approved' as const,
          remarks: remarks || 'Request endorsed and approved under regulatory standard.',
          toOffice: forwardTo
        };

        if (forwardTo) {
          const toInfo = DEPARTMENTS[forwardTo];
          const seq = doc.routingSequence.map(s => {
            if (s.office === activeDepartment) {
              return { ...s, status: 'COMPLETED' as const, completedAt: new Date().toISOString(), remarks };
            }
            return s;
          });
          seq.push({
            office: forwardTo,
            officeName: toInfo.shortName,
            status: 'ACTIVE',
            receivedAt: new Date().toISOString(),
            remarks: 'Endorsed for next regulatory phase'
          });

          return {
            ...doc,
            currentOffice: forwardTo,
            status: 'To Receive',
            routingSequence: seq,
            history: [...doc.history, newLog]
          };
        }

        return {
          ...doc,
          status: 'In Progress',
          history: [...doc.history, newLog]
        };
      })
    );

    addToast(`Document ${docId} approved by ${headName}`, 'success');
  };

  const disapproveDocument = (docId: string, remarks: string) => {
    const headName = DEPARTMENTS[activeDepartment]?.head || 'Department Head';

    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id !== docId) return doc;

        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('en-PH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          office: activeDepartment,
          officerName: headName,
          officerRole: 'Department Head / Approver',
          action: 'Disapproved' as const,
          remarks: remarks || 'Disapproved due to non-compliance with statutory requirements.'
        };

        return {
          ...doc,
          status: 'Disapproved',
          citizenActionRequired: `Disapproved: ${remarks}. Requestor may file motion for reconsideration.`,
          history: [...doc.history, newLog]
        };
      })
    );

    addToast(`Document ${docId} marked as Disapproved`, 'warning');
  };

  const putOnHold = (docId: string, remarks: string, citizenAction?: string) => {
    const officer = DEPARTMENTS[activeDepartment]?.defaultActionOfficer || 'Action Officer';

    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id !== docId) return doc;

        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('en-PH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          office: activeDepartment,
          officerName: officer,
          officerRole: 'Action Officer',
          action: 'On Hold' as const,
          remarks: remarks || 'Processing paused pending additional citizen documents.'
        };

        return {
          ...doc,
          status: 'On Hold',
          citizenActionRequired: citizenAction || remarks || 'Additional documentary requirements required.',
          history: [...doc.history, newLog]
        };
      })
    );

    addToast(`Document ${docId} placed On Hold`, 'info');
  };

  const completeDocument = (docId: string, remarks: string) => {
    const officer = DEPARTMENTS[activeDepartment]?.defaultActionOfficer || 'Authorized Signatory';

    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id !== docId) return doc;

        const seq = doc.routingSequence.map(s => {
          if (s.office === activeDepartment) {
            return {
              ...s,
              status: 'COMPLETED' as const,
              completedAt: new Date().toISOString(),
              remarks
            };
          }
          return s;
        });

        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('en-PH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          office: activeDepartment,
          officerName: officer,
          officerRole: 'Releasing Officer',
          action: 'Completed' as const,
          remarks: remarks || 'Transaction final release. Document archived.'
        };

        return {
          ...doc,
          status: 'Completed',
          completedAt: new Date().toISOString(),
          citizenActionRequired: 'Transaction completed. Permit / Clearance ready for pickup or digital copy issued.',
          routingSequence: seq,
          history: [...doc.history, newLog]
        };
      })
    );

    addToast(`Document ${docId} successfully marked as Completed / Released!`, 'success');
  };

  const addAttachmentsToDocument = (
    docId: string,
    newFiles: Array<{ name: string; size: string; type: string; url?: string }>
  ) => {
    const officer = DEPARTMENTS[activeDepartment]?.defaultActionOfficer || 'Authorized Officer';
    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id !== docId) return doc;

        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('en-PH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          office: activeDepartment,
          officerName: officer,
          officerRole: 'Document Custodian',
          action: 'Action Taken' as const,
          remarks: `Attached ${newFiles.length} supporting document(s): ${newFiles.map(f => f.name).join(', ')}`,
          attachments: newFiles.map(f => f.name)
        };

        return {
          ...doc,
          attachments: [...doc.attachments, ...newFiles],
          history: [...doc.history, newLog]
        };
      })
    );

    addToast(`Uploaded ${newFiles.length} file(s) to ${docId}`, 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('All notifications marked as read', 'info');
  };

  const resetToMockData = () => {
    localStorage.removeItem(STORAGE_KEY_DOCS);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
    setDocuments(INITIAL_DOCUMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSelectedDocId(null);
    setRoutingSlipDocId(null);
    addToast('System reset to pre-seeded LGU mock data', 'info');
  };

  return (
    <DocTrackContext.Provider
      value={{
        documents,
        activeRole,
        setActiveRole,
        activeDepartment,
        setActiveDepartment,
        selectedDoc,
        setSelectedDocId,
        routingSlipDoc,
        setRoutingSlipDocId,
        notifications,
        toasts,
        addToast,
        removeToast,
        searchQuery,
        setSearchQuery,
        activeView,
        setActiveView,
        createDocument,
        receiveDocument,
        forwardDocument,
        approveDocument,
        disapproveDocument,
        putOnHold,
        completeDocument,
        addAttachmentsToDocument,
        markNotificationAsRead,
        clearNotifications,
        resetToMockData
      }}
    >
      {children}
    </DocTrackContext.Provider>
  );
};

export const useDocTrack = () => {
  const context = useContext(DocTrackContext);
  if (!context) {
    throw new Error('useDocTrack must be used within a DocTrackProvider');
  }
  return context;
};
