import { 
  DepartmentCode, 
  DepartmentInfo, 
  ClassificationRule, 
  DocumentItem,
  SystemNotification
} from '../types';

export const DEPARTMENTS: Record<DepartmentCode, DepartmentInfo> = {
  RMO: {
    code: 'RMO',
    name: 'Records Management Office (Central Receiving)',
    shortName: 'Records Office',
    head: 'Maria Elena Delos Santos',
    defaultActionOfficer: 'Jayson Bautista',
    color: '#1e3a8a', // Navy
    iconName: 'Archive'
  },
  BPLO: {
    code: 'BPLO',
    name: 'Business Permits & Licensing Office',
    shortName: 'BPLO',
    head: 'Atty. Victorina Ramirez',
    defaultActionOfficer: 'Rico Macaraeg',
    color: '#059669', // Emerald
    iconName: 'Briefcase'
  },
  OBO: {
    code: 'OBO',
    name: 'Office of the Building Official',
    shortName: 'Building Official',
    head: 'Engr. Dominador Valerio, PECE',
    defaultActionOfficer: 'Arch. Liza Morales',
    color: '#d97706', // Amber
    iconName: 'Hammer'
  },
  MPDO: {
    code: 'MPDO',
    name: 'Municipal Planning & Development Office',
    shortName: 'Planning (MPDO)',
    head: 'EnP. Corazon Aguilar',
    defaultActionOfficer: 'Noel Gutierrez',
    color: '#4f46e5', // Indigo
    iconName: 'Map'
  },
  MTO: {
    code: 'MTO',
    name: 'Municipal Treasury Office',
    shortName: 'Treasury (MTO)',
    head: 'Aurelia D. Soriano, CPA',
    defaultActionOfficer: 'Carmela Ramos',
    color: '#0891b2', // Cyan
    iconName: 'Coins'
  },
  MO: {
    code: 'MO',
    name: "Office of the Municipal Mayor",
    shortName: "Mayor's Office",
    head: 'Hon. Mayor Ferdinand E. Cruz',
    defaultActionOfficer: 'Atty. Clara Mendoza (Admin Officer)',
    color: '#dc2626', // Red
    iconName: 'Landmark'
  },
  SB: {
    code: 'SB',
    name: 'Sangguniang Bayan (Municipal Council)',
    shortName: 'Sangguniang Bayan',
    head: 'Hon. Vice Mayor Teresa Ocampo',
    defaultActionOfficer: 'Mark Anthony David (SB Secretary)',
    color: '#7c3aed', // Purple
    iconName: 'Scroll'
  },
  ASSO: {
    code: 'ASSO',
    name: "Municipal Assessor's Office",
    shortName: "Assessor's Office",
    head: 'Romeo B. Pineda, REA',
    defaultActionOfficer: 'Danilo Reyes',
    color: '#0284c7', // Sky
    iconName: 'FileCheck'
  },
  MHO: {
    code: 'MHO',
    name: 'Municipal Health Office & Sanitation',
    shortName: 'Health Office (MHO)',
    head: 'Dr. Jennifer Aranas, MD, MPH',
    defaultActionOfficer: 'Nurse Sheila Gomez',
    color: '#10b981', // Emerald light
    iconName: 'Stethoscope'
  }
};

export const CLASSIFICATION_RULES: Record<string, ClassificationRule> = {
  SIMPLE: {
    type: 'SIMPLE',
    label: 'Simple Transaction',
    maxDays: 3,
    description: 'Requires only ministerial action or insignificant discretionary review under RA 11032 (Max 3 working days).'
  },
  COMPLEX: {
    type: 'COMPLEX',
    label: 'Complex Transaction',
    maxDays: 7,
    description: 'Necessitates evaluation or complicated resolution by authorized action officers (Max 7 working days).'
  },
  HIGHLY_TECHNICAL: {
    type: 'HIGHLY_TECHNICAL',
    label: 'Highly Technical Transaction',
    maxDays: 20,
    description: 'Requires multi-agency assessment, engineering computations, scientific review, or council approval (Max 20 working days).'
  }
};

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'LGU-BPLO-20260912-0018',
    title: 'New Mayor’s Business Permit: Highlands Agri-Trading Corp.',
    classification: 'COMPLEX',
    category: 'Business Permit',
    requestorType: 'Private Business',
    requestorName: 'Eduardo M. Tan (Highlands Agri-Trading)',
    requestorEmail: 'e.tan@highlandsagri.ph',
    requestorPhone: '+63 917 554 9210',
    priority: 'Normal',
    currentOffice: 'MTO',
    status: 'In Progress',
    createdAt: '2026-09-12T09:15:00',
    deadlineAt: '2026-09-19T17:00:00',
    daysSpent: 5,
    purposeOrNotes: 'Application for Commercial Warehousing & Agricultural Retail Distribution Permit along McArthur Highway.',
    citizenActionRequired: 'Pay assessed local taxes and regulatory fees at Treasury Window 3.',
    routingSequence: [
      { office: 'RMO', officeName: 'Records Office', status: 'COMPLETED', receivedAt: '2026-09-12T09:15:00', completedAt: '2026-09-12T10:30:00', actionOfficer: 'Jayson Bautista', remarks: 'Complete requirements logged. Forwarded to BPLO.' },
      { office: 'BPLO', officeName: 'BPLO', status: 'COMPLETED', receivedAt: '2026-09-12T10:45:00', completedAt: '2026-09-14T14:00:00', actionOfficer: 'Rico Macaraeg', remarks: 'Barangay clearance and SEC papers verified. Endorsed for zoning validation.' },
      { office: 'MPDO', officeName: 'Planning (MPDO)', status: 'COMPLETED', receivedAt: '2026-09-14T14:15:00', completedAt: '2026-09-16T11:20:00', actionOfficer: 'Noel Gutierrez', remarks: 'Zoning clearance granted under C-2 Commercial Strip.' },
      { office: 'MTO', officeName: 'Treasury (MTO)', status: 'ACTIVE', receivedAt: '2026-09-16T11:45:00', actionOfficer: 'Carmela Ramos', remarks: 'Order of payment computed (Total: PHP 14,850.00). Awaiting taxpayer settlement.' },
      { office: 'MO', officeName: "Mayor's Office", status: 'PENDING' }
    ],
    history: [
      { id: 'log-1', timestamp: '2026-09-12 09:15', office: 'RMO', officerName: 'Jayson Bautista', officerRole: 'Receiving Officer', action: 'Created', remarks: 'Initial intake with SEC Registration & Barangay Business Endorsement.' },
      { id: 'log-2', timestamp: '2026-09-12 10:30', office: 'RMO', officerName: 'Jayson Bautista', officerRole: 'Receiving Officer', action: 'Forwarded', remarks: 'Routing jacket transferred physically to BPLO.', toOffice: 'BPLO' },
      { id: 'log-3', timestamp: '2026-09-12 10:45', office: 'BPLO', officerName: 'Rico Macaraeg', officerRole: 'Action Officer', action: 'Received', remarks: 'Scanned QR and validated physical attachments.' },
      { id: 'log-4', timestamp: '2026-09-14 14:00', office: 'BPLO', officerName: 'Atty. Victorina Ramirez', officerRole: 'Department Head', action: 'Forwarded', remarks: 'Endorsed to MPDO for Land Use compliance verification.', toOffice: 'MPDO' },
      { id: 'log-5', timestamp: '2026-09-16 11:20', office: 'MPDO', officerName: 'EnP. Corazon Aguilar', officerRole: 'Department Head', action: 'Approved', remarks: 'Compliant with CLUP 2024-2034. Forwarded to Treasury for assessment.', toOffice: 'MTO' },
      { id: 'log-6', timestamp: '2026-09-16 11:45', office: 'MTO', officerName: 'Carmela Ramos', officerRole: 'Revenue Officer', action: 'Received', remarks: 'Preparing Tax Order of Payment.' }
    ],
    attachments: [
      { name: 'SEC_Certificate_Highlands.pdf', size: '2.4 MB', type: 'application/pdf' },
      { name: 'Barangay_Clearance_2026.pdf', size: '850 KB', type: 'application/pdf' },
      { name: 'Tax_Order_Payment_Issued.pdf', size: '1.1 MB', type: 'application/pdf' }
    ]
  },
  {
    id: 'LGU-OBO-20260824-0004',
    title: 'Commercial Building Permit (4-Storey Mixed Use Center)',
    classification: 'HIGHLY_TECHNICAL',
    category: 'Building Permit',
    requestorType: 'Private Business',
    requestorName: 'St. Jude Properties & Dev’t Inc.',
    requestorEmail: 'permits@stjudeproperties.ph',
    requestorPhone: '+63 920 911 3822',
    priority: 'Urgent',
    currentOffice: 'OBO',
    status: 'In Progress',
    createdAt: '2026-08-24T08:30:00',
    deadlineAt: '2026-09-13T17:00:00', // OVERDUE SLA!
    daysSpent: 24, // Exceeds 20 days
    purposeOrNotes: 'Application for Construction of 4-Storey Commercial Complex with basement parking on Lot 402-A.',
    citizenActionRequired: 'Pending compliance: Submit revised structural calculations for seismic coefficient zone 4.',
    routingSequence: [
      { office: 'RMO', officeName: 'Records Office', status: 'COMPLETED', receivedAt: '2026-08-24T08:30:00', completedAt: '2026-08-24T09:10:00', actionOfficer: 'Jayson Bautista' },
      { office: 'OBO', officeName: 'Building Official', status: 'ACTIVE', receivedAt: '2026-08-24T09:30:00', actionOfficer: 'Engr. Dominador Valerio', remarks: 'Delayed awaiting Fire Safety Evaluation Clearance (FSEC) from BFP and seismic verification.' },
      { office: 'MPDO', officeName: 'Planning (MPDO)', status: 'PENDING' },
      { office: 'MTO', officeName: 'Treasury (MTO)', status: 'PENDING' },
      { office: 'MO', officeName: "Mayor's Office", status: 'PENDING' }
    ],
    history: [
      { id: 'obo-1', timestamp: '2026-08-24 08:30', office: 'RMO', officerName: 'Jayson Bautista', officerRole: 'Receiving Officer', action: 'Created', remarks: 'Intake of 5 sets of blueprints, structural analysis, and sanitary designs.' },
      { id: 'obo-2', timestamp: '2026-08-24 09:30', office: 'OBO', officerName: 'Arch. Liza Morales', officerRole: 'Architectural Reviewer', action: 'Received', remarks: 'Architectural review passed. Routed to Structural Engineer.' },
      { id: 'obo-3', timestamp: '2026-09-02 14:10', office: 'OBO', officerName: 'Engr. Dominador Valerio', officerRole: 'Head of Office', action: 'On Hold', remarks: 'Notice of Discrepancy sent: Seismic coefficient Zone 4 discrepancy with NSCP 2015.' },
      { id: 'obo-4', timestamp: '2026-09-14 09:00', office: 'OBO', officerName: 'Engr. Dominador Valerio', officerRole: 'Head of Office', action: 'Action Taken', remarks: 'SLA BREACH ALERT: 20 working days threshold lapsed under RA 11032. Escalated to Municipal Administrator.' }
    ],
    attachments: [
      { name: 'Blueprint_Architectural_Set.pdf', size: '18.5 MB', type: 'application/pdf' },
      { name: 'Structural_Analysis_NSCP.pdf', size: '12.1 MB', type: 'application/pdf' },
      { name: 'Notice_of_Defects_Seismic.pdf', size: '640 KB', type: 'application/pdf' }
    ]
  },
  {
    id: 'LGU-RMO-20260916-0033',
    title: 'Application for Certified True Copy of Tax Declaration No. 2024-0019',
    classification: 'SIMPLE',
    category: 'Tax Assessment',
    requestorType: 'Citizen',
    requestorName: 'Catalina Ramos-Santos',
    requestorEmail: 'catalina.santos68@gmail.com',
    requestorPhone: '+63 918 340 1289',
    priority: 'Normal',
    currentOffice: 'ASSO',
    status: 'To Receive',
    createdAt: '2026-09-16T14:10:00',
    deadlineAt: '2026-09-19T17:00:00',
    daysSpent: 1,
    purposeOrNotes: 'For property transfer and estate tax settlement with BIR Revenue District Office 25.',
    citizenActionRequired: 'No action needed. Document is being pulled from registry archives.',
    routingSequence: [
      { office: 'RMO', officeName: 'Records Office', status: 'COMPLETED', receivedAt: '2026-09-16T14:10:00', completedAt: '2026-09-16T14:30:00', actionOfficer: 'Maria Santos' },
      { office: 'ASSO', officeName: "Assessor's Office", status: 'ACTIVE', actionOfficer: 'Danilo Reyes', remarks: 'In transit to Assessor Records division.' },
      { office: 'MTO', officeName: 'Treasury (MTO)', status: 'PENDING' }
    ],
    history: [
      { id: 'asso-1', timestamp: '2026-09-16 14:10', office: 'RMO', officerName: 'Maria Santos', officerRole: 'Receiving Officer', action: 'Created', remarks: 'Citizen submitted valid government ID & authorization letter.' },
      { id: 'asso-2', timestamp: '2026-09-16 14:30', office: 'RMO', officerName: 'Maria Santos', officerRole: 'Receiving Officer', action: 'Forwarded', remarks: 'Transferred to Municipal Assessor for archive verification.', toOffice: 'ASSO' }
    ],
    attachments: [
      { name: 'National_ID_Applicant.jpg', size: '1.2 MB', type: 'image/jpeg' },
      { name: 'Deed_of_Sale_Copy.pdf', size: '3.4 MB', type: 'application/pdf' }
    ]
  },
  {
    id: 'LGU-SB-20260910-0012',
    title: 'Draft Ordinance No. 2026-014: Municipal E-Waste Disposal & Recycling Guidelines',
    classification: 'HIGHLY_TECHNICAL',
    category: 'Ordinance Draft',
    requestorType: 'Internal Office',
    requestorName: 'Hon. Councilor Rodrigo Bautista (Committee on Environment)',
    requestorEmail: 'councilor.bautista@sanfernando.gov.ph',
    requestorPhone: '+63 917 800 2311',
    priority: 'Normal',
    currentOffice: 'MO',
    status: 'In Progress',
    createdAt: '2026-09-10T10:00:00',
    deadlineAt: '2026-09-30T17:00:00',
    daysSpent: 7,
    purposeOrNotes: 'Draft legislative measure mandating accredited e-waste consolidation drop-off hubs in all 24 barangays.',
    citizenActionRequired: 'Public hearing scheduled on September 24, 2026 at Municipal Session Hall.',
    routingSequence: [
      { office: 'SB', officeName: 'Sangguniang Bayan', status: 'COMPLETED', receivedAt: '2026-09-10T10:00:00', completedAt: '2026-09-15T16:00:00', actionOfficer: 'Mark Anthony David', remarks: 'Passed on 2nd Reading. Transmitted to Legal & Mayor.' },
      { office: 'MO', officeName: "Mayor's Office", status: 'ACTIVE', receivedAt: '2026-09-16T09:00:00', actionOfficer: 'Atty. Clara Mendoza', remarks: 'Under legal review by Municipal Legal Officer prior to Executive Approval.' }
    ],
    history: [
      { id: 'sb-1', timestamp: '2026-09-10 10:00', office: 'SB', officerName: 'Mark Anthony David', officerRole: 'Council Secretary', action: 'Created', remarks: 'Submitted by Committee on Environment & Natural Resources.' },
      { id: 'sb-2', timestamp: '2026-09-15 16:00', office: 'SB', officerName: 'Hon. Vice Mayor Teresa Ocampo', officerRole: 'Presiding Officer', action: 'Approved', remarks: 'Approved on Second Reading by unanimous vote.', toOffice: 'MO' },
      { id: 'sb-3', timestamp: '2026-09-16 09:00', office: 'MO', officerName: 'Atty. Clara Mendoza', officerRole: 'Admin Officer', action: 'Received', remarks: 'Docketed for Executive Review and Mayor signature.' }
    ],
    attachments: [
      { name: 'Ordinance_Draft_2026_014.docx', size: '420 KB', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { name: 'Committee_Report_Environment.pdf', size: '2.1 MB', type: 'application/pdf' }
    ]
  },
  {
    id: 'LGU-MHO-20260914-0021',
    title: 'Sanitary Inspection Clearance: Golden Harvest Bakery & Cafe',
    classification: 'SIMPLE',
    category: 'Barangay Clearance',
    requestorType: 'Private Business',
    requestorName: 'Glenda Santos-Perez',
    requestorEmail: 'goldenharvest.cafe@gmail.com',
    requestorPhone: '+63 928 411 9090',
    priority: 'Normal',
    currentOffice: 'MHO',
    status: 'In Progress',
    createdAt: '2026-09-14T11:00:00',
    deadlineAt: '2026-09-17T17:00:00', // Today is deadline (WARNING)
    daysSpent: 3,
    purposeOrNotes: 'Annual renewal of Municipal Sanitary Permit for food service facility.',
    citizenActionRequired: 'Sanitary inspector visit completed. Awaiting release of official card.',
    routingSequence: [
      { office: 'RMO', officeName: 'Records Office', status: 'COMPLETED', receivedAt: '2026-09-14T11:00:00', completedAt: '2026-09-14T11:30:00', actionOfficer: 'Jayson Bautista' },
      { office: 'MHO', officeName: 'Health Office (MHO)', status: 'ACTIVE', receivedAt: '2026-09-14T13:00:00', actionOfficer: 'Dr. Jennifer Aranas', remarks: 'Sanitary Inspector submitted passing microbiological water test.' },
      { office: 'BPLO', officeName: 'BPLO', status: 'PENDING' }
    ],
    history: [
      { id: 'mho-1', timestamp: '2026-09-14 11:00', office: 'RMO', officerName: 'Jayson Bautista', officerRole: 'Receiving Officer', action: 'Created', remarks: 'Chest X-ray and Stool exam results of 8 food handlers attached.' },
      { id: 'mho-2', timestamp: '2026-09-14 13:00', office: 'MHO', officerName: 'Nurse Sheila Gomez', officerRole: 'Health Inspector', action: 'Received', remarks: 'Forwarded to Municipal Health Officer for final signature.' },
      { id: 'mho-3', timestamp: '2026-09-17 08:30', office: 'MHO', officerName: 'Dr. Jennifer Aranas', officerRole: 'Municipal Health Officer', action: 'Action Taken', remarks: 'Passed sanitary checklist. Rating: 94% (Class A Food Handler).' }
    ],
    attachments: [
      { name: 'Water_Bacteriological_Report.pdf', size: '890 KB', type: 'application/pdf' },
      { name: 'Health_Certificates_Staff.pdf', size: '3.1 MB', type: 'application/pdf' }
    ]
  },
  {
    id: 'LGU-MO-20260908-0009',
    title: 'Disbursement Voucher & Purchase Order: Heavy Equipment Spare Parts (Motorpool)',
    classification: 'COMPLEX',
    category: 'Purchase Order / Voucher',
    requestorType: 'Internal Office',
    requestorName: 'Engr. Bernardo Galang (General Services Office)',
    requestorEmail: 'gso@sanfernando.gov.ph',
    requestorPhone: '+63 919 772 1102',
    priority: 'Urgent',
    currentOffice: 'MO',
    status: 'Completed',
    createdAt: '2026-09-08T08:45:00',
    deadlineAt: '2026-09-15T17:00:00',
    completedAt: '2026-09-14T16:20:00',
    daysSpent: 6,
    purposeOrNotes: 'Urgent procurement of hydraulic cylinders and hydraulic oil for Road Grader Unit #3.',
    citizenActionRequired: 'Completed. Check released by Municipal Cashier to winning supplier.',
    routingSequence: [
      { office: 'RMO', officeName: 'Records Office', status: 'COMPLETED', receivedAt: '2026-09-08T08:45:00', completedAt: '2026-09-08T09:10:00', actionOfficer: 'Jayson Bautista' },
      { office: 'MPDO', officeName: 'Planning (MPDO)', status: 'COMPLETED', receivedAt: '2026-09-08T09:30:00', completedAt: '2026-09-09T14:00:00', actionOfficer: 'Noel Gutierrez', remarks: 'Verified against Annual Procurement Plan (APP 2026).' },
      { office: 'MTO', officeName: 'Treasury (MTO)', status: 'COMPLETED', receivedAt: '2026-09-09T14:30:00', completedAt: '2026-09-12T11:00:00', actionOfficer: 'Carmela Ramos', remarks: 'Certificate of Availability of Funds signed by Municipal Treasurer.' },
      { office: 'MO', officeName: "Mayor's Office", status: 'COMPLETED', receivedAt: '2026-09-12T13:30:00', completedAt: '2026-09-14T16:20:00', actionOfficer: 'Hon. Mayor Ferdinand E. Cruz', remarks: 'Check and voucher signed. Released for disbursement.' }
    ],
    history: [
      { id: 'po-1', timestamp: '2026-09-08 08:45', office: 'RMO', officerName: 'Jayson Bautista', officerRole: 'Receiving Officer', action: 'Created', remarks: 'Bidding resolution BAC Res. 2026-88 attached.' },
      { id: 'po-2', timestamp: '2026-09-09 14:00', office: 'MPDO', officerName: 'EnP. Corazon Aguilar', officerRole: 'Department Head', action: 'Approved', remarks: 'Aligned with Disaster Preparedness heavy equipment maintenance fund.', toOffice: 'MTO' },
      { id: 'po-3', timestamp: '2026-09-12 11:00', office: 'MTO', officerName: 'Aurelia D. Soriano', officerRole: 'Municipal Treasurer', action: 'Approved', remarks: 'Fund charge: Trust Fund Calamity Sub-Account 102.', toOffice: 'MO' },
      { id: 'po-4', timestamp: '2026-09-14 16:20', office: 'MO', officerName: 'Hon. Mayor Ferdinand E. Cruz', officerRole: 'Municipal Mayor', action: 'Completed', remarks: 'Signed and approved. Routing completed.' }
    ],
    attachments: [
      { name: 'BAC_Resolution_2026_88.pdf', size: '1.8 MB', type: 'application/pdf' },
      { name: 'Canvass_Summary_Suppliers.pdf', size: '920 KB', type: 'application/pdf' },
      { name: 'Signed_Disbursement_Voucher.pdf', size: '2.5 MB', type: 'application/pdf' }
    ]
  },
  {
    id: 'LGU-MPDO-20260902-0007',
    title: 'Locational Clearance & Subdivision Development Approval (Villa Esperanza Ph 2)',
    classification: 'HIGHLY_TECHNICAL',
    category: 'Zoning Clearance',
    requestorType: 'Private Business',
    requestorName: 'San Fernando Highlands Realty Inc.',
    requestorEmail: 'projects@sfhighlandsrealty.ph',
    requestorPhone: '+63 917 123 4567',
    priority: 'Normal',
    currentOffice: 'MPDO',
    status: 'In Progress',
    createdAt: '2026-09-02T10:00:00',
    deadlineAt: '2026-09-22T17:00:00',
    daysSpent: 15,
    purposeOrNotes: 'Subdivision Scheme evaluation comprising 120 residential lots with drainage outfall to Marikina Tributary.',
    citizenActionRequired: 'Pending submission of ECC (Environmental Compliance Certificate) from DENR-EMB.',
    routingSequence: [
      { office: 'RMO', officeName: 'Records Office', status: 'COMPLETED', receivedAt: '2026-09-02T10:00:00', completedAt: '2026-09-02T11:00:00', actionOfficer: 'Maria Santos' },
      { office: 'MPDO', officeName: 'Planning (MPDO)', status: 'ACTIVE', receivedAt: '2026-09-02T11:30:00', actionOfficer: 'EnP. Corazon Aguilar', remarks: 'Subdivision plan under verification with Comprehensive Land Use Plan (CLUP).' },
      { office: 'SB', officeName: 'Sangguniang Bayan', status: 'PENDING' },
      { office: 'MO', officeName: "Mayor's Office", status: 'PENDING' }
    ],
    history: [
      { id: 'mpdo-1', timestamp: '2026-09-02 10:00', office: 'RMO', officerName: 'Maria Santos', officerRole: 'Receiving Officer', action: 'Created', remarks: 'Intake with topographic surveys and hydrology study.' },
      { id: 'mpdo-2', timestamp: '2026-09-02 11:30', office: 'MPDO', officerName: 'Noel Gutierrez', officerRole: 'Zoning Inspector', action: 'Received', remarks: 'Initiated boundary validation.' },
      { id: 'mpdo-3', timestamp: '2026-09-11 15:20', office: 'MPDO', officerName: 'EnP. Corazon Aguilar', officerRole: 'Department Head', action: 'Action Taken', remarks: 'Technical site inspection done. Hydrology drainage capacity deemed adequate.' }
    ],
    attachments: [
      { name: 'Topographic_Survey_Approved.pdf', size: '14.2 MB', type: 'application/pdf' },
      { name: 'Hydrology_Runoff_Calculations.pdf', size: '6.8 MB', type: 'application/pdf' }
    ]
  },
  {
    id: 'LGU-MO-20260915-0027',
    title: 'Executive Order No. 019-2026: Reconstituting the Municipal Disaster Council',
    classification: 'SIMPLE',
    category: 'Executive Order',
    requestorType: 'Internal Office',
    requestorName: 'Municipal Disaster Risk Reduction & Management Office (MDRRMO)',
    requestorEmail: 'mdrrmo@sanfernando.gov.ph',
    requestorPhone: '+63 917 999 0112',
    priority: 'Urgent',
    currentOffice: 'MO',
    status: 'Completed',
    createdAt: '2026-09-15T08:00:00',
    deadlineAt: '2026-09-18T17:00:00',
    completedAt: '2026-09-16T15:00:00',
    daysSpent: 1.5,
    purposeOrNotes: 'Updating composition of MDRRMC committees in view of newly elected CSO representatives.',
    citizenActionRequired: 'Published on Municipal Official Gazette and Bulletin Boards.',
    routingSequence: [
      { office: 'RMO', officeName: 'Records Office', status: 'COMPLETED', receivedAt: '2026-09-15T08:00:00', completedAt: '2026-09-15T08:30:00', actionOfficer: 'Jayson Bautista' },
      { office: 'MO', officeName: "Mayor's Office", status: 'COMPLETED', receivedAt: '2026-09-15T09:00:00', completedAt: '2026-09-16T15:00:00', actionOfficer: 'Hon. Mayor Ferdinand E. Cruz', remarks: 'Signed and promulgated.' },
      { office: 'RMO', officeName: 'Records Office', status: 'COMPLETED', receivedAt: '2026-09-16T15:30:00', completedAt: '2026-09-16T16:00:00', actionOfficer: 'Maria Santos', remarks: 'Archived and dispatched to DILG Field Office.' }
    ],
    history: [
      { id: 'eo-1', timestamp: '2026-09-15 08:00', office: 'RMO', officerName: 'Jayson Bautista', officerRole: 'Receiving Officer', action: 'Created', remarks: 'Draft EO endorsed by MDRRMO Chief.' },
      { id: 'eo-2', timestamp: '2026-09-16 15:00', office: 'MO', officerName: 'Hon. Mayor Ferdinand E. Cruz', officerRole: 'Mayor', action: 'Completed', remarks: 'Signed into law. Official EO Series 2026 assigned.' }
    ],
    attachments: [
      { name: 'Signed_EO_019_2026_MDRRMC.pdf', size: '2.1 MB', type: 'application/pdf' }
    ]
  },
  {
    id: 'LGU-RMO-20260917-0041',
    title: 'Letter of Intent: Request for Public Plaza Use for Evangelical Crusade',
    classification: 'SIMPLE',
    category: 'General Correspondence',
    requestorType: 'Citizen',
    requestorName: 'Pastor Joel Villanueva (Jesus Saves Fellowship)',
    requestorEmail: 'pastor.joel@jsf-ministries.ph',
    requestorPhone: '+63 922 847 1993',
    priority: 'Normal',
    currentOffice: 'MO',
    status: 'To Receive',
    createdAt: '2026-09-17T14:30:00',
    deadlineAt: '2026-09-20T17:00:00',
    daysSpent: 0.3,
    purposeOrNotes: 'Requesting permission to utilize Municipal Freedom Park on October 3-4, 2026.',
    citizenActionRequired: 'Awaiting Mayor’s executive clearance and sound system permit.',
    routingSequence: [
      { office: 'RMO', officeName: 'Records Office', status: 'COMPLETED', receivedAt: '2026-09-17T14:30:00', completedAt: '2026-09-17T15:00:00', actionOfficer: 'Jayson Bautista', remarks: 'Intake processed. Routed to Mayor’s Chief of Staff.' },
      { office: 'MO', officeName: "Mayor's Office", status: 'ACTIVE', remarks: 'In transit to Mayor’s inbox.' }
    ],
    history: [
      { id: 'let-1', timestamp: '2026-09-17 14:30', office: 'RMO', officerName: 'Jayson Bautista', officerRole: 'Receiving Officer', action: 'Created', remarks: 'Formal request letter received with PNP coordinate clearance.' },
      { id: 'let-2', timestamp: '2026-09-17 15:00', office: 'RMO', officerName: 'Jayson Bautista', officerRole: 'Receiving Officer', action: 'Forwarded', remarks: 'Transmitted to Mayor’s Office for approval.', toOffice: 'MO' }
    ],
    attachments: [
      { name: 'Letter_Request_Plaza_Use.pdf', size: '540 KB', type: 'application/pdf' },
      { name: 'PNP_Station_Endorsement.pdf', size: '980 KB', type: 'application/pdf' }
    ]
  },
  {
    id: 'LGU-ASSO-20260818-0002',
    title: 'Petition for Reassessment of Real Property Market Value (Industrial Parcel 09-B)',
    classification: 'COMPLEX',
    category: 'Tax Assessment',
    requestorType: 'Private Business',
    requestorName: 'Eastern Luzon Steel Manufacturing Inc.',
    requestorEmail: 'legal@easternluzonsteel.com',
    requestorPhone: '+63 917 644 1928',
    priority: 'Normal',
    currentOffice: 'ASSO',
    status: 'On Hold',
    createdAt: '2026-08-18T09:00:00',
    deadlineAt: '2026-08-27T17:00:00', // OVERDUE SLA!
    daysSpent: 30,
    purposeOrNotes: 'Petition contesting 2025 general revision assessment citing obsolete plant machinery depreciation.',
    citizenActionRequired: 'Pending: Submit audited financial balance sheets and certified plant appraisal report.',
    routingSequence: [
      { office: 'RMO', officeName: 'Records Office', status: 'COMPLETED', receivedAt: '2026-08-18T09:00:00', completedAt: '2026-08-18T09:30:00', actionOfficer: 'Maria Santos' },
      { office: 'ASSO', officeName: "Assessor's Office", status: 'ACTIVE', receivedAt: '2026-08-18T10:00:00', actionOfficer: 'Romeo B. Pineda', remarks: 'On hold: Awaiting certified mechanical engineer asset appraisal.' },
      { office: 'MO', officeName: "Mayor's Office", status: 'PENDING' }
    ],
    history: [
      { id: 'ass-1', timestamp: '2026-08-18 09:00', office: 'RMO', officerName: 'Maria Santos', officerRole: 'Receiving Officer', action: 'Created', remarks: 'Formal petition docketed under Section 226 of Local Government Code.' },
      { id: 'ass-2', timestamp: '2026-08-18 10:00', office: 'ASSO', officerName: 'Romeo B. Pineda', officerRole: 'Municipal Assessor', action: 'Received', remarks: 'Assigned to Senior Appraiser Danilo Reyes.' },
      { id: 'ass-3', timestamp: '2026-08-25 14:00', office: 'ASSO', officerName: 'Romeo B. Pineda', officerRole: 'Municipal Assessor', action: 'On Hold', remarks: 'Taxpayer failed to produce audited depreciation schedule. Clock paused under ARTA rules with formal notice.' }
    ],
    attachments: [
      { name: 'Formal_Petition_Reassessment.pdf', size: '4.5 MB', type: 'application/pdf' },
      { name: 'Tax_Declaration_Current.pdf', size: '1.2 MB', type: 'application/pdf' },
      { name: 'Notice_To_Comply_Appraisal.pdf', size: '780 KB', type: 'application/pdf' }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'SLA Overdue Warning (RA 11032)',
    message: 'Document LGU-OBO-20260824-0004 has exceeded the 20-day statutory limit at Office of the Building Official.',
    type: 'error',
    timestamp: '10 mins ago',
    documentId: 'LGU-OBO-20260824-0004',
    read: false
  },
  {
    id: 'notif-2',
    title: 'New Inbound Document',
    message: 'LGU-RMO-20260916-0033 forwarded to Municipal Assessor awaits receiving acceptance.',
    type: 'info',
    timestamp: '45 mins ago',
    documentId: 'LGU-RMO-20260916-0033',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Near SLA Breach Alert',
    message: 'Document LGU-MHO-20260914-0021 reaches its 3-day SLA cutoff at 5:00 PM today.',
    type: 'warning',
    timestamp: '2 hours ago',
    documentId: 'LGU-MHO-20260914-0021',
    read: false
  }
];
