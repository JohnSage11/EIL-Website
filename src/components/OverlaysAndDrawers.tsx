import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Send,
  Upload,
  FileText,
  Phone,
  MessageCircle,
  CheckCircle2,
  Award,
  Building2,
  ClipboardList,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Mail,
  User,
  Users,
  Store,
  CreditCard,
  CloudUpload,
  FolderOpen,
  Settings,
  Info,
} from 'lucide-react';
import { EIL_BRANCHES, StockItem } from '../data/eilData';

export interface BasketEntry {
  item: StockItem;
  quantity: number;
}

export interface QuoteRecord {
  id: string;
  createdAt: string;
  referenceCode: string;
  customerName: string;
  companyName: string;
  positionTitle: string;
  email: string;
  phone: string;
  serviceType: string;
  quantityOrDuration: string;
  location: string;
  preferredBranch: string;
  projectNotes: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentType?: string;
  attachmentUrl?: string;
  status: 'New' | 'Reviewed' | 'Quoted';
}

export interface EnquiryRecord {
  id: string;
  createdAt: string;
  referenceCode: string;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  orderMode: 'Registered Customer Order' | 'Counter Service (Walk-in)' | 'EIL Point Card Voucher';
  pointCardNumber?: string;
  preferredBranch: string;
  deliveryAddress: string;
  notes: string;
  attachmentName?: string;
  attachmentUrl?: string;
  items: {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    spec: string;
    quantity: number;
    unit: string;
    pointsEligible: boolean;
  }[];
  status: 'New' | 'Processing' | 'Dispatched';
}

// ============================================================================
// CENTRAL DUAL-CHANNEL SUBMISSION CONFIGURATION & ROUTING RULES
// ============================================================================
export const OWNER_WHATSAPP_NUMBER = '2347038259142';

export const EMAIL_ROUTES = {
  HIRE: 'hire@emmadios.com',
  INFO: 'info@emmadios.com',
} as const;

export const SERVICE_TYPE_OPTIONS = [
  'Equipment Hiring & Plant Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)',
  'Heavy-Duty Haulage Services (Lowbed, Flatbed, Tankers, Pneumatic & Dump Trucks)',
  'Earthmoving, Swamp Buggy & Site Clearing Operations',
  'Mobile Crane Lifting & Material Handling Operations',
  'Pre-Mobilization Site Survey & On-Site Fleet Support',
  'EIL Corporate Fleet Account / Point Card Inquiry',
  'General Inquiry / Questions',
];

export function normalizeInquiryCategory(raw?: string): string {
  if (!raw) return 'Equipment Hiring & Plant Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)';
  if (SERVICE_TYPE_OPTIONS.includes(raw)) {
    return raw;
  }
  const lower = raw.toLowerCase();
  if (
    lower.includes('haulage') ||
    lower.includes('logistics') ||
    lower.includes('lowbed') ||
    lower.includes('flatbed') ||
    lower.includes('tanker') ||
    lower.includes('pneumatic') ||
    lower.includes('dump')
  ) {
    return 'Heavy-Duty Haulage Services (Lowbed, Flatbed, Tankers, Pneumatic & Dump Trucks)';
  }
  if (lower.includes('swamp') || lower.includes('earthmoving') || lower.includes('dozer')) {
    return 'Earthmoving, Swamp Buggy & Site Clearing Operations';
  }
  if (lower.includes('crane') || lower.includes('rigging') || lower.includes('lifting')) {
    return 'Mobile Crane Lifting & Material Handling Operations';
  }
  if (lower.includes('survey') || lower.includes('maintenance') || lower.includes('support')) {
    return 'Pre-Mobilization Site Survey & On-Site Fleet Support';
  }
  if (lower.includes('point card') || lower.includes('voucher') || lower.includes('loyalty')) {
    return 'EIL Corporate Fleet Account / Point Card Inquiry';
  }
  if (
    lower.includes('leasing') ||
    lower.includes('rent') ||
    lower.includes('hire') ||
    lower.includes('equipment') ||
    lower.includes('forklift') ||
    lower.includes('excavator') ||
    lower.includes('backhoe') ||
    lower.includes('stock')
  ) {
    return 'Equipment Hiring & Plant Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)';
  }
  return 'General Inquiry / Questions';
}

export function resolveTargetEmail(category: string): string {
  const normalized = normalizeInquiryCategory(category);
  const hireCategories = [
    'Equipment Hiring & Plant Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)',
    'Heavy-Duty Haulage Services (Lowbed, Flatbed, Tankers, Pneumatic & Dump Trucks)',
    'Earthmoving, Swamp Buggy & Site Clearing Operations',
    'Mobile Crane Lifting & Material Handling Operations',
    'Pre-Mobilization Site Survey & On-Site Fleet Support',
  ];
  if (hireCategories.includes(normalized)) {
    return EMAIL_ROUTES.HIRE;
  }
  return EMAIL_ROUTES.INFO;
}

export interface DualSubmissionInput {
  referenceCode?: string;
  name: string;
  company?: string;
  role?: string;
  phone: string;
  email: string;
  category: string;
  branch?: string;
  location?: string;
  quantityOrSchedule?: string;
  orderMode?: string;
  pointCardNumber?: string;
  attachmentId?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  attachmentFile?: File | null;
  itemsOrSpecs?: string;
  notes?: string;
  message: string;
}

export function createDeterministicAttachmentMeta(file: File | null): {
  attachmentId: string;
  attachmentName: string;
  attachmentUrl: string;
} {
  if (!file) {
    return { attachmentId: '', attachmentName: '', attachmentUrl: '' };
  }
  const attachmentId = `att-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const sizeKb = Math.max(1, Math.round(file.size / 1024));
  const attachmentName = `${file.name} (${sizeKb} KB)`;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const attachmentUrl = `${origin}/api/attachments/${encodeURIComponent(attachmentId)}/${encodeURIComponent(safeName)}`;
  return { attachmentId, attachmentName, attachmentUrl };
}

export async function uploadAttachmentToServer(
  file: File,
  attachmentId: string
): Promise<string> {
  // Tier 1 (Primary): Direct upload to OnlyFiles.com with expire="0" (Forever)
  try {
    const onlyFilesForm = new FormData();
    onlyFilesForm.append('file', file, file.name);
    onlyFilesForm.append('expire', '0');
    const onlyFilesRes = await fetch('https://api.onlyfiles.com/v1/upload', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: onlyFilesForm,
    });
    if (onlyFilesRes.ok) {
      const onlyFilesJson = await onlyFilesRes.json();
      const fullUrl =
        onlyFilesJson?.data?.file?.url?.full ||
        onlyFilesJson?.data?.file?.url?.short ||
        '';
      if (typeof fullUrl === 'string' && fullUrl.startsWith('http')) {
        return fullUrl;
      }
    }
  } catch {
    // Fall through to Tier 2 server-side OnlyFiles proxy
  }

  // Tier 2: Express /api/attachments endpoint (which proxies to OnlyFiles.com with expire="0" / Forever)
  try {
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

    const res = await fetch('/api/attachments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachmentId,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        base64Data,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (typeof data?.publicCloudUrl === 'string' && data.publicCloudUrl.startsWith('http')) {
        return data.publicCloudUrl;
      }
      if (typeof data?.attachmentUrl === 'string' && data.attachmentUrl.startsWith('http')) {
        return data.attachmentUrl;
      }
    }
  } catch {
    // Fall through to Tier 3
  }

  // Tier 3: Native cPanel / Apache / PHP upload.php fallback when hosted on custom domain
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isPreviewOrLocal =
    !host || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.run.app');
  if (!isPreviewOrLocal) {
    try {
      const phpForm = new FormData();
      phpForm.append('file', file, file.name);
      const phpRes = await fetch('/upload.php', {
        method: 'POST',
        body: phpForm,
      });
      if (phpRes.ok) {
        const phpData = await phpRes.json();
        if (
          phpData?.ok &&
          typeof phpData.attachmentUrl === 'string' &&
          phpData.attachmentUrl.startsWith('http')
        ) {
          return phpData.attachmentUrl;
        }
      }
    } catch {
      // Fall through
    }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${origin}/api/attachments/${encodeURIComponent(attachmentId)}/${encodeURIComponent(safeName)}`;
}

export function buildDualWhatsAppUrl(input: DualSubmissionInput, targetEmail: string): string {
  const normalizedCategory = normalizeInquiryCategory(input.category);

  const headerSection = [
    `*NEW WEBSITE INQUIRY — EMMADIOS INDUSTRIAL LIMITED (EIL)*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    input.referenceCode ? `*Reference:* ${input.referenceCode}` : null,
    `*Category:* ${normalizedCategory}`,
    `*Routed Email:* ${targetEmail}`,
  ]
    .filter(Boolean)
    .join('\n');

  const customerSection = [
    `*1. CUSTOMER DETAILS*`,
    `• *Name:* ${input.name}`,
    input.company ? `• *Company:* ${input.company}` : null,
    input.role ? `• *Role / Position:* ${input.role}` : null,
    `• *Phone:* ${input.phone}`,
    `• *Email:* ${input.email || 'Not provided'}`,
  ]
    .filter(Boolean)
    .join('\n');

  const orderLines = [
    input.branch ? `• *Handling Branch:* ${input.branch}` : null,
    input.location ? `• *Site / Location:* ${input.location}` : null,
    input.quantityOrSchedule ? `• *Units / Fleet Scope:* ${input.quantityOrSchedule}` : null,
    input.orderMode ? `• *Ordering Channel:* ${input.orderMode}` : null,
    input.pointCardNumber ? `• *EIL Point Card No:* ${input.pointCardNumber}` : null,
    input.attachmentName ? `• *Attached File:* ${input.attachmentName}` : null,
    input.attachmentUrl ? `• *Download Document:* ${input.attachmentUrl}` : null,
  ].filter(Boolean);

  const orderSection =
    orderLines.length > 0
      ? [`*2. ORDER / PROJECT DETAILS*`, ...orderLines].join('\n')
      : null;

  const scopeLines = [
    input.itemsOrSpecs ? `${input.itemsOrSpecs}` : null,
    input.notes ? `• *Notes / Instructions:* ${input.notes}` : null,
    !input.itemsOrSpecs && !input.notes && input.message ? `${input.message}` : null,
  ].filter(Boolean);

  const scopeSection = [
    orderSection ? `*3. MESSAGE / SCOPE / ITEMS*` : `*2. MESSAGE / DETAILS*`,
    ...(scopeLines.length > 0 ? scopeLines : ['• No additional instructions provided.']),
    `━━━━━━━━━━━━━━━━━━━━`,
  ].join('\n');

  const whatsappText = [headerSection, customerSection, orderSection, scopeSection]
    .filter(Boolean)
    .join('\n\n');

  return `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`;
}

export async function dispatchFormSubmitEmail(
  input: DualSubmissionInput,
  targetEmail: string
): Promise<void> {
  const normalizedCategory = normalizeInquiryCategory(input.category);

  let resolvedAttachmentUrl = input.attachmentUrl || '';
  const isAlreadyPublicCloud =
    resolvedAttachmentUrl.startsWith('http') &&
    !resolvedAttachmentUrl.includes('/api/attachments/');

  if (input.attachmentFile && input.attachmentId && !isAlreadyPublicCloud) {
    try {
      const uploadedUrl = await uploadAttachmentToServer(
        input.attachmentFile,
        input.attachmentId
      );
      if (uploadedUrl) {
        resolvedAttachmentUrl = uploadedUrl;
      }
    } catch {
      // Keep existing URL if upload encountered an error
    }
  }

  const emailPayload: Record<string, string> = {
    _subject: `New EIL Website Inquiry: ${normalizedCategory} from ${input.name}`,
    _template: 'table',
    _captcha: 'false',
    ...(input.email ? { _replyto: input.email } : {}),
    ...(input.referenceCode ? { Reference_Code: input.referenceCode } : {}),
    Inquiry_Category: normalizedCategory,
    Routed_Department_Email: targetEmail,
    Customer_Name: input.name,
    ...(input.company ? { Company_Name: input.company } : {}),
    ...(input.role ? { Position_or_Role: input.role } : {}),
    Phone_or_WhatsApp: input.phone,
    Customer_Email: input.email || 'Not provided',
    ...(input.branch ? { Handling_EIL_Branch: input.branch } : {}),
    ...(input.location ? { Site_or_Delivery_Location: input.location } : {}),
    ...(input.quantityOrSchedule ? { Quantity_or_Hire_Schedule: input.quantityOrSchedule } : {}),
    ...(input.orderMode ? { Ordering_Channel: input.orderMode } : {}),
    ...(input.pointCardNumber ? { EIL_Point_Card_No: input.pointCardNumber } : {}),
    ...(input.attachmentName ? { Attached_Document: input.attachmentName } : {}),
    ...(resolvedAttachmentUrl
      ? { Download_Attached_Document: resolvedAttachmentUrl }
      : {}),
    ...(input.itemsOrSpecs ? { Requested_Items_or_Specifications: input.itemsOrSpecs } : {}),
    Additional_Instructions_or_Message:
      input.notes || input.message || 'No additional instructions provided.',
    name: input.name,
    phone: input.phone,
    email: input.email || 'Not provided',
    category: normalizedCategory,
    message: input.message,
  };

  try {
    await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });
  } catch {
    // Allow silent completion if offline so WhatsApp flow remains uninterrupted
  }
}

const BRANCH_CONTACT_LINES = [
  {
    id: 'ph-aba-rd',
    label: 'Port Harcourt Head Office (+234 703 825 9142)',
    shortLabel: 'Port Harcourt Office',
    displayPhone: '+234 703 825 9142',
    telHref: 'tel:+2347038259142',
    whatsappNumber: OWNER_WHATSAPP_NUMBER,
    address: 'Plot 213, Old Aba Road, Rumuogba-Obio, Port Harcourt',
  },
  {
    id: 'warri-branch',
    label: 'Warri Branch Office (+234 703 825 9142)',
    shortLabel: 'Warri Branch Office',
    displayPhone: '+234 703 825 9142',
    telHref: 'tel:+2347038259142',
    whatsappNumber: OWNER_WHATSAPP_NUMBER,
    address: '9, Etuwewe Road, Off Deco Road, P.O. Box 894, Warri, Delta State',
  },
];

// ============================================================================
// 1. ENQUIRY BASKET SLIDE-OVER DRAWER
// ============================================================================
interface EnquiryBasketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  basket: BasketEntry[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearBasket: () => void;
  onEnquirySubmitted: (record: EnquiryRecord) => void;
}

export const EnquiryBasketDrawer: React.FC<EnquiryBasketDrawerProps> = ({
  isOpen,
  onClose,
  basket,
  onUpdateQuantity,
  onRemoveItem,
  onClearBasket,
  onEnquirySubmitted,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryCategory, setInquiryCategory] = useState(
    'Equipment Hiring & Plant Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)'
  );
  const [orderMode, setOrderMode] = useState<
    'Registered Customer Order' | 'Counter Service (Walk-in)' | 'EIL Point Card Voucher'
  >('Counter Service (Walk-in)');
  const [pointCardNumber, setPointCardNumber] = useState('');
  const [preferredBranch, setPreferredBranch] = useState(EIL_BRANCHES[0].name);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentMetaState, setAttachmentMetaState] = useState<{
    attachmentId: string;
    attachmentName: string;
    attachmentUrl: string;
  }>({ attachmentId: '', attachmentName: '', attachmentUrl: '' });
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<EnquiryRecord | null>(null);
  const [routedTargetEmail, setRoutedTargetEmail] = useState<string>(EMAIL_ROUTES.INFO);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const totalUnits = basket.reduce((sum, entry) => sum + entry.quantity, 0);
  const pointsEligibleCount = basket.filter((entry) => entry.item.pointsEligible).length;

  const handleBasketFileChange = async (file: File | null) => {
    setAttachmentFile(file);
    if (!file) {
      setAttachmentMetaState({ attachmentId: '', attachmentName: '', attachmentUrl: '' });
      setUploadingAttachment(false);
      return;
    }
    const initialMeta = createDeterministicAttachmentMeta(file);
    setAttachmentMetaState(initialMeta);
    setUploadingAttachment(true);
    try {
      const cloudUrl = await uploadAttachmentToServer(file, initialMeta.attachmentId);
      if (cloudUrl) {
        setAttachmentMetaState({
          ...initialMeta,
          attachmentUrl: cloudUrl,
        });
      }
    } catch {
      // Keep fallback URL
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) {
      setErrorMessage('Please enter your name and phone number so our Customer Service team can reach you.');
      return;
    }
    setErrorMessage('');

    const generatedRef = `EIL-ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const attachmentMeta = attachmentFile
      ? attachmentMetaState.attachmentName
        ? attachmentMetaState
        : createDeterministicAttachmentMeta(attachmentFile)
      : { attachmentId: '', attachmentName: '', attachmentUrl: '' };

    // Step A: Determine Target Email
    const targetEmail = resolveTargetEmail(inquiryCategory);
    setRoutedTargetEmail(targetEmail);

    const itemSummaryLines =
      basket.length > 0
        ? basket
            .map(
              (b, idx) =>
                `• ${idx + 1}. ${b.item.name} (${b.item.spec}) — Qty: ${b.quantity} ${b.item.unit}${
                  b.item.pointsEligible ? ' [Point Card Eligible]' : ''
                }`
            )
            .join('\n')
        : '• Direct / Custom Enquiry (No specific stock catalogue items attached)';

    const compiledMessage = [
      itemSummaryLines,
      notes.trim() ? `Notes: ${notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const dualInput: DualSubmissionInput = {
      referenceCode: generatedRef,
      name: customerName.trim(),
      company: companyName.trim() || 'Direct / Individual',
      phone: phone.trim(),
      email: email.trim(),
      category: inquiryCategory,
      branch: preferredBranch,
      location: deliveryAddress.trim() || 'Counter Collection',
      orderMode,
      pointCardNumber: pointCardNumber.trim() || undefined,
      attachmentId: attachmentMeta.attachmentId || undefined,
      attachmentName: attachmentMeta.attachmentName || undefined,
      attachmentUrl: attachmentMeta.attachmentUrl || undefined,
      attachmentFile,
      itemsOrSpecs: itemSummaryLines,
      notes: notes.trim() || undefined,
      message: compiledMessage,
    };

    // Step B: Build & Trigger Instant WhatsApp Deep Link Synchronously (Prevent Popup Blockers)
    const whatsappUrl = buildDualWhatsAppUrl(dualInput, targetEmail);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setSubmitting(true);

    const payload = {
      referenceCode: generatedRef,
      customerName: customerName.trim(),
      companyName: companyName.trim() || 'Direct / Individual',
      email: email.trim(),
      phone: phone.trim(),
      orderMode,
      pointCardNumber: pointCardNumber.trim(),
      preferredBranch,
      deliveryAddress: deliveryAddress.trim(),
      notes: notes.trim(),
      attachmentName: attachmentMeta.attachmentName || '',
      attachmentUrl: attachmentMeta.attachmentUrl || '',
      items: basket.map((b) => ({
        id: b.item.id,
        name: b.item.name,
        category: b.item.category,
        subcategory: b.item.subcategory,
        spec: b.item.spec,
        quantity: b.quantity,
        unit: b.item.unit,
        pointsEligible: b.item.pointsEligible,
      })),
    };

    // Step C: Silent Background Email Dispatch via FormSubmit AJAX + Local API
    const [, apiResult] = await Promise.allSettled([
      dispatchFormSubmitEmail(dualInput, targetEmail),
      fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    ]);

    let finalRecord: EnquiryRecord = {
      id: `e-local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...payload,
      status: 'New',
    };

    if (apiResult.status === 'fulfilled' && apiResult.value.ok) {
      try {
        const data = await apiResult.value.json();
        if (data?.submission) {
          finalRecord = data.submission;
        }
      } catch {
        // Use fallback record
      }
    }

    // Step D: UI Feedback & State Reset
    setSubmittedRecord(finalRecord);
    onEnquirySubmitted(finalRecord);
    onClearBasket();
    setCustomerName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setPointCardNumber('');
    setDeliveryAddress('');
    setNotes('');
    setAttachmentFile(null);
    setAttachmentMetaState({ attachmentId: '', attachmentName: '', attachmentUrl: '' });
    setUploadingAttachment(false);
    setSubmitting(false);
  };

  const buildWhatsAppUrl = (record: EnquiryRecord) => {
    const itemLines =
      record.items.length > 0
        ? record.items
            .map(
              (it, idx) =>
                `• ${idx + 1}. ${it.name} (${it.spec}) — Qty: ${it.quantity} ${it.unit}${
                  it.pointsEligible ? ' [Point Card Eligible]' : ''
                }`
            )
            .join('\n')
        : '• Direct / Custom Enquiry';
    return buildDualWhatsAppUrl(
      {
        referenceCode: record.referenceCode,
        name: record.customerName,
        company: record.companyName,
        phone: record.phone,
        email: record.email,
        category: inquiryCategory,
        branch: record.preferredBranch,
        location: record.deliveryAddress || 'Counter Collection',
        orderMode: record.orderMode,
        pointCardNumber: record.pointCardNumber || undefined,
        attachmentName: record.attachmentName || undefined,
        attachmentUrl: record.attachmentUrl || undefined,
        itemsOrSpecs: itemLines,
        notes: record.notes || undefined,
        message: itemLines,
      },
      routedTargetEmail
    );
  };

  const buildMailtoUrl = (record: EnquiryRecord) => {
    const subject = `New EIL Website Inquiry: ${inquiryCategory} from ${record.customerName}`;
    const itemLines = record.items
      .map(
        (it, idx) =>
          `${idx + 1}. [${it.category}] ${it.name} (${it.spec}) - Qty: ${it.quantity} ${it.unit}`
      )
      .join('\n');
    const body = [
      `Emmadios Industrial Limited — Stock Enquiry Submission`,
      `Reference: ${record.referenceCode}`,
      `Customer Name: ${record.customerName}`,
      `Company: ${record.companyName}`,
      `Phone: ${record.phone}`,
      `Email: ${record.email}`,
      `Order Mode: ${record.orderMode}`,
      `Preferred Branch: ${record.preferredBranch}`,
      `Delivery / Site Location: ${record.deliveryAddress || 'Counter Collection'}`,
      record.attachmentName ? `Attached Document: ${record.attachmentName}` : null,
      record.attachmentUrl ? `Download Document: ${record.attachmentUrl}` : null,
      ``,
      `ITEMS:`,
      itemLines,
      ``,
      `Additional Notes: ${record.notes || 'None'}`,
    ]
      .filter(Boolean)
      .join('\n');
    return `mailto:${routedTargetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const orderingChannels: {
    value: 'Registered Customer Order' | 'Counter Service (Walk-in)' | 'EIL Point Card Voucher';
    label: string;
    icon: React.ElementType;
  }[] = [
    { value: 'Registered Customer Order', label: 'Registered Customer', icon: Users },
    { value: 'Counter Service (Walk-in)', label: 'Counter Service', icon: Store },
    { value: 'EIL Point Card Voucher', label: 'EIL Point Card', icon: CreditCard },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0A0A0A]/65 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl border-l border-[#D4D4D8] overflow-hidden">
        {/* Drawer Header */}
        <div className="px-6 py-5 bg-[#0A0A0A] text-white flex items-center justify-between border-b-2 border-[#DC2626]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#DC2626] font-bold block">
              Order &amp; Counter Service Desk
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              EIL Stock Enquiry Basket
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setSubmittedRecord(null);
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-[#DC2626] text-white transition-colors cursor-pointer"
            aria-label="Close Enquiry Basket"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6 bg-white">
          {submittedRecord ? (
            <div className="bg-[#FFF0F0] border border-[#FCA5A5] rounded-2xl p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#DC2626]">
                    Reference: {submittedRecord.referenceCode}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#0A0A0A] mt-0.5">
                    Enquiry Logged with EIL Customer Service
                  </h3>
                  <p className="text-sm font-bold text-[#0A0A0A] mt-1.5 leading-relaxed">
                    Thank you! Your inquiry has been sent to {routedTargetEmail} and opened in WhatsApp for instant chat, expect to hear from our representative soon!
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-[#FCA5A5] space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">
                  Submitted Line Items ({submittedRecord.items.length})
                </div>
                <div className="divide-y divide-red-100 max-h-48 overflow-y-auto">
                  {submittedRecord.items.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#0A0A0A]">{item.name}</span>
                        <span className="text-[#52525B] block">{item.spec}</span>
                      </div>
                      <span className="font-mono font-bold text-[#DC2626] shrink-0 ml-3">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={buildWhatsAppUrl(submittedRecord)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#DC2626] hover:bg-[#0A0A0A] text-white font-bold text-sm transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Re-open in WhatsApp
                </a>
                <a
                  href={buildMailtoUrl(submittedRecord)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-[#FFF0F0] text-[#0A0A0A] border border-[#D4D4D8] font-bold text-sm transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#DC2626]" />
                  Send via Email Client
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmittedRecord(null);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-[#0A0A0A] hover:bg-[#DC2626] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Return to Stock Catalogue
              </button>
            </div>
          ) : (
            <>
              {/* Basket Items Summary Header + Horizontal Red Rule */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#DC2626] min-w-0">
                    SELECTED CATALOGUE ITEMS ({basket.length} LINES &middot; {totalUnits} UNITS)
                  </span>
                  <div className="hidden sm:block flex-1 h-[1.5px] bg-[#DC2626]" />
                  {basket.length > 0 && (
                    <button
                      type="button"
                      onClick={onClearBasket}
                      className="text-xs font-extrabold text-[#DC2626] hover:text-[#0A0A0A] underline shrink-0 cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {basket.length === 0 ? (
                  <div className="bg-[#FFF0F0] border border-[#FCA5A5] rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
                    {/* Custom Red Engineering Specification & Gear/Wrench SVG Icon */}
                    <div className="shrink-0">
                      <svg
                        viewBox="0 0 64 64"
                        className="w-16 h-16 text-[#DC2626]"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Engineering Clipboard Body */}
                        <rect
                          x="10"
                          y="12"
                          width="34"
                          height="44"
                          rx="4"
                          fill="currentColor"
                        />
                        {/* Clipboard Top Clasp */}
                        <rect
                          x="20"
                          y="7"
                          width="14"
                          height="8"
                          rx="2.5"
                          fill="currentColor"
                          stroke="#FFF0F0"
                          strokeWidth="2"
                        />
                        {/* Specification Lines on Clipboard */}
                        <line
                          x1="17"
                          y1="24"
                          x2="35"
                          y2="24"
                          stroke="#FFF0F0"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <line
                          x1="17"
                          y1="33"
                          x2="31"
                          y2="33"
                          stroke="#FFF0F0"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <line
                          x1="17"
                          y1="42"
                          x2="27"
                          y2="42"
                          stroke="#FFF0F0"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        {/* Precision Engineering Cogwheel / Gear Badge (Bottom-Right) */}
                        <circle
                          cx="45"
                          cy="43"
                          r="13"
                          fill="#FFF0F0"
                        />
                        <path
                          d="M45 29V32M45 54V57M31 43H34M56 43H59M35.1 33.1L37.2 35.2M52.8 50.8L54.9 52.9M54.9 33.1L52.8 35.2M37.2 50.8L35.1 52.9"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="45"
                          cy="43"
                          r="9"
                          fill="currentColor"
                        />
                        {/* Inner Wrench / Spanner Cutout Center */}
                        <circle
                          cx="45"
                          cy="43"
                          r="3.8"
                          fill="#FFF0F0"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-extrabold text-[#0A0A0A]">
                        You Haven&apos;t Started Any Enquiries Yet.
                      </p>
                      <p className="text-xs sm:text-sm text-[#3F3F46] mt-1.5 leading-relaxed">
                        Browse our 8 searchable Equipment Hire &amp; Haulage Fleet Lists (Forklifts, Excavators &amp; Swamp Buggies, Dozers, Cranes, Backhoes &amp; Loaders, Lowbeds &amp; Flatbeds, Tankers &amp; Pneumatic Trucks, and Dump Trucks) and click &ldquo;Add to Enquiry&rdquo;.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {basket.map(({ item, quantity }) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-[#FFF0F0] border border-[#FCA5A5] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#DC2626] font-extrabold">
                              {item.category}
                            </span>
                            {item.pointsEligible && (
                              <span className="text-[10px] font-mono text-[#0A0A0A] font-bold">
                                &bull; Point Card Eligible
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-extrabold text-[#0A0A0A] leading-snug break-words sm:truncate mt-0.5">
                            {item.name}
                          </div>
                          <div className="text-xs text-[#52525B] font-mono leading-snug break-words sm:truncate mt-0.5">
                            {item.spec}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-[#FCA5A5]/50 sm:border-0">
                          <div className="inline-flex items-center rounded-xl border border-[#D4D4D8] bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(item.id, Math.max(1, quantity - 1))
                              }
                              className="p-1.5 text-[#DC2626] hover:bg-[#FFF0F0] transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2.5 text-xs font-mono font-extrabold text-[#0A0A0A]">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                              className="p-1.5 text-[#DC2626] hover:bg-[#FFF0F0] transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 text-[#DC2626] hover:text-white hover:bg-[#DC2626] rounded-xl transition-colors cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pointsEligibleCount > 0 && (
                  <div className="mt-3 px-4 py-2.5 rounded-xl bg-[#FFF0F0] border border-[#FCA5A5] flex items-center gap-2.5 text-xs text-[#0A0A0A]">
                    <Award className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <span>
                      <strong>{pointsEligibleCount} item(s)</strong> in your basket qualify for{' '}
                      <strong className="text-[#DC2626]">EIL Point Card</strong> points and Free Voucher redemption.
                    </span>
                  </div>
                )}
              </div>

              {/* Enquiry Submission Form */}
              <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-[#FFF0F0] border border-[#DC2626] text-xs font-bold text-[#DC2626]">
                    {errorMessage}
                  </div>
                )}

                {/* 01. Customer Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#0A0A0A] min-w-0 leading-snug">
                      01. Customer Information
                    </h3>
                    <div className="hidden sm:block flex-1 h-[1.5px] bg-[#DC2626]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                        Full Name / Contact Person <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Engr. Chinedu Nwosu"
                        className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                        Company / Organisation
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Niger Delta Marine Services"
                        className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                        Phone / WhatsApp Number <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 703 825 9142"
                        className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                        Official Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="procurement@company.com"
                        className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 02. Ordering Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#0A0A0A] min-w-0 leading-snug">
                      02. Ordering Preferences
                    </h3>
                    <div className="hidden sm:block flex-1 h-[1.5px] bg-[#DC2626]" />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                      Inquiry Type / Department <span className="text-[#DC2626]">*</span>
                    </label>
                    <select
                      value={inquiryCategory}
                      onChange={(e) => setInquiryCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#DC2626]"
                    >
                      {SERVICE_TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-2.5">
                      EIL Booking Channel (&ldquo;How to Hire &amp; Book&rdquo; Guidelines)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {orderingChannels.map((ch) => {
                        const IconComp = ch.icon;
                        const isSelected = orderMode === ch.value;
                        return (
                          <button
                            key={ch.value}
                            type="button"
                            onClick={() => {
                              setOrderMode(ch.value);
                              if (ch.value === 'EIL Point Card Voucher') {
                                setInquiryCategory('EIL Corporate Fleet Account / Point Card Inquiry');
                              } else if (inquiryCategory === 'EIL Corporate Fleet Account / Point Card Inquiry') {
                                setInquiryCategory('Equipment Hiring & Plant Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)');
                              }
                            }}
                            className={`relative rounded-2xl px-3.5 py-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-2 border-[#DC2626] bg-[#FFF0F0] shadow-xs'
                                : 'border border-[#D4D4D8] bg-white hover:border-[#DC2626]'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-[#DC2626] text-white text-[10px] font-bold">
                                Selected
                              </span>
                            )}
                            <IconComp
                              className={`w-7 h-7 ${
                                isSelected ? 'text-[#DC2626]' : 'text-[#52525B]'
                              }`}
                            />
                            <span
                              className={`text-xs sm:text-sm font-extrabold mt-2 ${
                                isSelected ? 'text-[#DC2626]' : 'text-[#0A0A0A]'
                              }`}
                            >
                              {ch.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {orderMode === 'EIL Point Card Voucher' && (
                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                        EIL Point Card Number (Optional &mdash; leave blank to request new card registration)
                      </label>
                      <input
                        type="text"
                        value={pointCardNumber}
                        onChange={(e) => setPointCardNumber(e.target.value)}
                        placeholder="e.g. EIL-PC-00419"
                        className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm font-mono text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626]"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                        Preferred EIL Branch / Counter
                      </label>
                      <select
                        value={preferredBranch}
                        onChange={(e) => setPreferredBranch(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#DC2626]"
                      >
                        {EIL_BRANCHES.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                        Delivery Site / Collection Preference
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="e.g. Counter Pickup or Trans-Amadi Site"
                        className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626]"
                      />
                    </div>
                  </div>
                </div>

                {/* 03. Documents & Instructions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CloudUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#0A0A0A] min-w-0 leading-snug">
                      03. Documents &amp; Instructions
                    </h3>
                    <div className="hidden sm:block flex-1 h-[1.5px] bg-[#DC2626]" />
                  </div>

                  <label className="rounded-2xl border border-[#FCA5A5] bg-[#FFF0F0] hover:bg-[#FEE2E2]/60 p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <CloudUpload className="w-9 h-9 text-[#DC2626] mb-1.5" />
                    <span className="text-base font-extrabold text-[#0A0A0A]">
                      Upload Supporting Documents
                    </span>
                    <span className="text-xs sm:text-sm text-[#52525B] mt-0.5">
                      {attachmentFile
                        ? `${attachmentFile.name} (${(attachmentFile.size / 1024).toFixed(1)} KB)`
                        : 'Purchase orders, equipment schedules, cargo manifests, or site access specs'}
                    </span>
                    {attachmentFile && (
                      <span className="mt-1.5 text-xs font-mono font-bold text-[#DC2626]">
                        {uploadingAttachment
                          ? '⏳ Preparing cloud download link for WhatsApp & Email...'
                          : '✓ Cloud link ready for WhatsApp DM & Email'}
                      </span>
                    )}
                    <span className="mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#DC2626] hover:bg-[#0A0A0A] text-white text-xs font-extrabold transition-colors shadow-xs">
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Browse Files</span>
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                      onChange={(e) =>
                        handleBasketFileChange(e.target.files?.[0] ? e.target.files[0] : null)
                      }
                      className="hidden"
                    />
                  </label>

                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                      Additional Instructions (Site Terrain, Tonnage Specs, Urgent 24/7 Mobilization, etc.)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify required tonnage, lowbed/flatbed route details, or special 24/7 mobilization arrangement..."
                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || uploadingAttachment}
                  className="w-full py-3.5 px-6 rounded-full bg-[#DC2626] hover:bg-[#0A0A0A] disabled:opacity-60 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {uploadingAttachment
                    ? 'Preparing Document Link...'
                    : submitting
                    ? 'Submitting Enquiry...'
                    : basket.length > 0
                    ? `Submit Enquiry Basket (${basket.length} Item Lines)`
                    : 'Submit Enquiry'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. REQUEST A QUOTE SITE-WIDE MODAL
// ============================================================================
interface RequestQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceType?: string;
  initialNotes?: string;
  onQuoteSubmitted: (record: QuoteRecord) => void;
}

export const RequestQuoteModal: React.FC<RequestQuoteModalProps> = ({
  isOpen,
  onClose,
  initialServiceType,
  initialNotes,
  onQuoteSubmitted,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState(
    normalizeInquiryCategory(initialServiceType)
  );
  const [quantityOrDuration, setQuantityOrDuration] = useState('');
  const [location, setLocation] = useState('');
  const [preferredBranch, setPreferredBranch] = useState(EIL_BRANCHES[0].name);
  const [projectNotes, setProjectNotes] = useState(initialNotes || '');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentMetaState, setAttachmentMetaState] = useState<{
    attachmentId: string;
    attachmentName: string;
    attachmentUrl: string;
  }>({ attachmentId: '', attachmentName: '', attachmentUrl: '' });
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<QuoteRecord | null>(null);
  const [routedTargetEmail, setRoutedTargetEmail] = useState<string>(EMAIL_ROUTES.INFO);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialServiceType) {
      setServiceType(normalizeInquiryCategory(initialServiceType));
    }
    if (initialNotes !== undefined) setProjectNotes(initialNotes);
  }, [initialServiceType, initialNotes]);

  if (!isOpen) return null;

  const handleQuoteFileChange = async (file: File | null) => {
    setAttachmentFile(file);
    if (!file) {
      setAttachmentMetaState({ attachmentId: '', attachmentName: '', attachmentUrl: '' });
      setUploadingAttachment(false);
      return;
    }
    const initialMeta = createDeterministicAttachmentMeta(file);
    setAttachmentMetaState(initialMeta);
    setUploadingAttachment(true);
    try {
      const cloudUrl = await uploadAttachmentToServer(file, initialMeta.attachmentId);
      if (cloudUrl) {
        setAttachmentMetaState({
          ...initialMeta,
          attachmentUrl: cloudUrl,
        });
      }
    } catch {
      // Keep fallback URL
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !location.trim()) {
      setErrorMsg('Please fill in your Name, Phone Number, and Project/Delivery Location.');
      return;
    }
    setErrorMsg('');

    const normalizedCategory = normalizeInquiryCategory(serviceType);
    const generatedRef = `EIL-QT-${Math.floor(1000 + Math.random() * 9000)}`;
    const attachmentMeta = attachmentFile
      ? attachmentMetaState.attachmentName
        ? attachmentMetaState
        : createDeterministicAttachmentMeta(attachmentFile)
      : { attachmentId: '', attachmentName: '', attachmentUrl: '' };

    // Step A: Determine Target Email
    const targetEmail = resolveTargetEmail(normalizedCategory);
    setRoutedTargetEmail(targetEmail);

    const dualInput: DualSubmissionInput = {
      referenceCode: generatedRef,
      name: customerName.trim(),
      company: companyName.trim() || 'Direct Client',
      role: positionTitle.trim() || undefined,
      phone: phone.trim(),
      email: email.trim(),
      category: normalizedCategory,
      branch: preferredBranch,
      location: location.trim(),
      quantityOrSchedule: quantityOrDuration.trim() || 'Per Project Scope',
      attachmentId: attachmentMeta.attachmentId || undefined,
      attachmentName: attachmentMeta.attachmentName || undefined,
      attachmentUrl: attachmentMeta.attachmentUrl || undefined,
      attachmentFile,
      notes: projectNotes.trim() || undefined,
      message: projectNotes.trim() || `Quote request for ${normalizedCategory} (${quantityOrDuration.trim() || 'Per Project Scope'}) at ${location.trim()}.`,
    };

    // Step B: Build & Trigger Instant WhatsApp Deep Link Synchronously (Prevent Popup Blockers)
    const whatsappUrl = buildDualWhatsAppUrl(dualInput, targetEmail);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setSubmitting(true);

    const payload = {
      referenceCode: generatedRef,
      customerName: customerName.trim(),
      companyName: companyName.trim() || 'Direct Client',
      positionTitle: positionTitle.trim(),
      email: email.trim(),
      phone: phone.trim(),
      serviceType: normalizedCategory,
      quantityOrDuration: quantityOrDuration.trim() || 'Per Project Scope',
      location: location.trim(),
      preferredBranch,
      projectNotes: projectNotes.trim(),
      attachmentName: attachmentMeta.attachmentName || '',
      attachmentSize: attachmentFile ? attachmentFile.size : 0,
      attachmentType: attachmentFile ? attachmentFile.type : '',
      attachmentUrl: attachmentMeta.attachmentUrl || '',
    };

    // Step C: Silent Background Email Dispatch via FormSubmit AJAX + Local API
    const [, apiResult] = await Promise.allSettled([
      dispatchFormSubmitEmail(dualInput, targetEmail),
      fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    ]);

    let finalQuote: QuoteRecord = {
      id: `q-local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...payload,
      status: 'New',
    };

    if (apiResult.status === 'fulfilled' && apiResult.value.ok) {
      try {
        const data = await apiResult.value.json();
        if (data?.submission) {
          finalQuote = data.submission;
        }
      } catch {
        // Use fallback quote
      }
    }

    // Step D: UI Feedback & State Reset
    setSubmittedQuote(finalQuote);
    onQuoteSubmitted(finalQuote);
    setCustomerName('');
    setCompanyName('');
    setPositionTitle('');
    setEmail('');
    setPhone('');
    setQuantityOrDuration('');
    setLocation('');
    setProjectNotes('');
    setAttachmentFile(null);
    setAttachmentMetaState({ attachmentId: '', attachmentName: '', attachmentUrl: '' });
    setUploadingAttachment(false);
    setSubmitting(false);
  };

  const buildQuoteWhatsAppUrl = (q: QuoteRecord) => {
    return buildDualWhatsAppUrl(
      {
        referenceCode: q.referenceCode,
        name: q.customerName,
        company: q.companyName,
        role: q.positionTitle || undefined,
        phone: q.phone,
        email: q.email,
        category: q.serviceType,
        branch: q.preferredBranch,
        location: q.location,
        quantityOrSchedule: q.quantityOrDuration,
        attachmentName: q.attachmentName || undefined,
        attachmentUrl: q.attachmentUrl || undefined,
        notes: q.projectNotes || undefined,
        message: q.projectNotes || `Quote request for ${q.serviceType}`,
      },
      routedTargetEmail
    );
  };

  const buildQuoteMailtoUrl = (q: QuoteRecord) => {
    const subject = `New EIL Website Inquiry: ${q.serviceType} from ${q.customerName}`;
    const body = [
      `Emmadios Industrial Limited — Request for Quotation`,
      `Reference Code: ${q.referenceCode}`,
      `Customer Name: ${q.customerName}`,
      `Position: ${q.positionTitle || 'N/A'}`,
      `Company: ${q.companyName}`,
      `Phone: ${q.phone}`,
      `Email: ${q.email}`,
      ``,
      `Inquiry Category: ${q.serviceType}`,
      `Quantity / Fleet Units Required: ${q.quantityOrDuration}`,
      `Site / Delivery Location: ${q.location}`,
      `Preferred EIL Branch: ${q.preferredBranch}`,
      `Attached Drawing / Spec Filename: ${q.attachmentName || 'None'}`,
      q.attachmentUrl ? `Download Attached Document: ${q.attachmentUrl}` : null,
      ``,
      `Technical Scope & Notes:`,
      q.projectNotes || 'Please contact us to discuss full equipment leasing and haulage specifications.',
    ]
      .filter(Boolean)
      .join('\n');
    return `mailto:${routedTargetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#D4D4D8] overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#0A0A0A] text-white flex items-center justify-between border-b-2 border-[#DC2626]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#DC2626] font-bold block">
              Emmadios Industrial Limited &bull; Equipment Hire &amp; Haulage Desk
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              Request an Equipment Hire or Haulage Quote
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setSubmittedQuote(null);
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-[#DC2626] text-white transition-colors cursor-pointer"
            aria-label="Close Quote Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 max-h-[84vh] overflow-y-auto bg-white">
          {submittedQuote ? (
            <div className="bg-[#FFF0F0] border border-[#FCA5A5] rounded-2xl p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#DC2626]">
                    Quote Ref: {submittedQuote.referenceCode}
                  </span>
                  <h3 className="text-xl font-extrabold text-[#0A0A0A] mt-0.5">
                    Quote Request Received by EIL Fleet &amp; Haulage Desk
                  </h3>
                  <p className="text-sm font-bold text-[#0A0A0A] mt-1.5 leading-relaxed">
                    Thank you! Your inquiry has been sent to {routedTargetEmail} and opened in WhatsApp for instant chat, expect to hear from our representative soon!
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-[#FCA5A5] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#DC2626] font-bold block">Quantity / Fleet Units Required:</span>
                  <span className="text-[#0A0A0A] font-mono">{submittedQuote.quantityOrDuration}</span>
                </div>
                <div>
                  <span className="text-[#DC2626] font-bold block">Preferred Branch:</span>
                  <span className="text-[#0A0A0A]">{submittedQuote.preferredBranch}</span>
                </div>
                {submittedQuote.attachmentName && (
                  <div className="sm:col-span-2">
                    <span className="text-[#DC2626] font-bold block">Attached Drawing / Specification:</span>
                    <span className="text-[#0A0A0A] font-mono">{submittedQuote.attachmentName}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={buildQuoteWhatsAppUrl(submittedQuote)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#DC2626] hover:bg-[#0A0A0A] text-white font-bold text-sm transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Re-open in WhatsApp
                </a>
                <a
                  href={buildQuoteMailtoUrl(submittedQuote)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-[#FFF0F0] text-[#0A0A0A] border border-[#D4D4D8] font-bold text-sm transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#DC2626]" />
                  Send via Official Email
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmittedQuote(null);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-[#0A0A0A] hover:bg-[#DC2626] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Done &amp; Return to Website
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-[#FFF0F0] border border-[#DC2626] text-xs font-bold text-[#DC2626]">
                  {errorMsg}
                </div>
              )}

              {/* Section 1: Customer Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0A0A0A] min-w-0 leading-snug">
                    Customer Details
                  </h3>
                  <div className="hidden sm:block flex-1 h-[1.5px] bg-[#DC2626]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                      Full Name <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Engr. Boma Jack"
                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Offshore Fabrication & EPC Ltd"
                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                      Phone / WhatsApp Number <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 703 825 9142"
                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="projects@company.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Service & Project Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0A0A0A] min-w-0 leading-snug">
                    Service &amp; Project Information
                  </h3>
                  <div className="hidden sm:block flex-1 h-[1.5px] bg-[#DC2626]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                      Inquiry Type / Department <span className="text-[#DC2626]">*</span>
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#DC2626]"
                    >
                      {SERVICE_TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                      Quantity / Fleet Units Required <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={quantityOrDuration}
                      onChange={(e) => setQuantityOrDuration(e.target.value)}
                      placeholder="e.g. 2x Swamp Buggy / 1x 50T Mobile Crane / 60T Lowbed"
                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                      Project / Site Location <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Trans-Amadi PH, Warri, Bonny, Onne"
                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                      Position / Role in Company
                    </label>
                    <input
                      type="text"
                      value={positionTitle}
                      onChange={(e) => setPositionTitle(e.target.value)}
                      placeholder="e.g. Project Manager / Procurement Lead"
                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                      Handling EIL Branch / Yard
                    </label>
                    <select
                      value={preferredBranch}
                      onChange={(e) => setPreferredBranch(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#DC2626]"
                    >
                      {EIL_BRANCHES.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Upload Engineering Drawings / Specifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CloudUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0A0A0A] min-w-0 leading-snug">
                    Upload Engineering Drawings / Specifications
                  </h3>
                  <div className="hidden sm:block flex-1 h-[1.5px] bg-[#DC2626]" />
                </div>

                <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-5 py-4 rounded-2xl border border-dashed border-[#DC2626] bg-[#FFF0F0] hover:bg-[#FEE2E2]/60 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <CloudUpload className="w-9 h-9 sm:w-10 sm:h-10 text-[#DC2626] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-extrabold text-[#0A0A0A] block break-words sm:truncate">
                        {attachmentFile
                          ? attachmentFile.name
                          : 'Click to upload CAD drawing, isometric spool sheet, or technical spec'}
                      </span>
                      <span className="text-xs text-[#52525B] block mt-0.5">
                        {attachmentFile
                          ? `${(attachmentFile.size / 1024).toFixed(1)} KB attached`
                          : 'Supports PDF, DWG, DXF, Word, Excel, PNG, JPG'}
                      </span>
                      {attachmentFile && (
                        <span className="text-xs font-mono font-bold text-[#DC2626] block mt-1">
                          {uploadingAttachment
                            ? '⏳ Preparing cloud download link for WhatsApp & Email...'
                            : '✓ Cloud link ready for WhatsApp DM & Email'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#0A0A0A] text-white text-xs font-extrabold shrink-0 transition-colors shadow-xs">
                    <FolderOpen className="w-4 h-4" />
                    <span>Select File</span>
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                    onChange={(e) =>
                      handleQuoteFileChange(e.target.files?.[0] ? e.target.files[0] : null)
                    }
                    className="hidden"
                  />
                </label>
              </div>

              {/* Section 4: Equipment Specifications, Haulage Route & Site Notes */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0A0A0A] min-w-0 leading-snug">
                    Equipment Specifications, Haulage Route, or Mobilization Scope
                  </h3>
                  <div className="hidden sm:block flex-1 h-[1.5px] bg-[#DC2626]" />
                </div>

                <textarea
                  rows={3}
                  value={projectNotes}
                  onChange={(e) => setProjectNotes(e.target.value)}
                  placeholder="Describe required machine tonnages, site terrain, lowbed/flatbed cargo dimensions, or 24/7 mobilization schedule..."
                  className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626]"
                />
              </div>

              {/* Bottom Action Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-start sm:items-center gap-2 text-xs font-medium text-[#DC2626]">
                  <Info className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5 sm:mt-0" />
                  <span>
                    Need 24/7 Sunday or Public Holiday mobilization? Note it above for special arrangement.
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={submitting || uploadingAttachment}
                  className="w-full sm:w-auto min-h-[48px] px-7 py-3.5 rounded-full bg-[#DC2626] hover:bg-[#0A0A0A] disabled:bg-red-300 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {uploadingAttachment
                      ? 'Preparing Document Link...'
                      : submitting
                      ? 'Submitting Quote...'
                      : 'Submit Quote Request'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. ADMIN SUBMISSIONS PORTAL MODAL
// ============================================================================
interface AdminSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  localQuotes: QuoteRecord[];
  localEnquiries: EnquiryRecord[];
}

export const AdminSubmissionsModal: React.FC<AdminSubmissionsModalProps> = ({
  isOpen,
  onClose,
  localQuotes,
  localEnquiries,
}) => {
  const [activeTab, setActiveTab] = useState<'quotes' | 'enquiries'>('quotes');
  const [serverQuotes, setServerQuotes] = useState<QuoteRecord[]>([]);
  const [serverEnquiries, setServerEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        setServerQuotes(data.quotes || []);
        setServerEnquiries(data.enquiries || []);
      }
    } catch {
      // Fallback uses local records
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Merge server and local records without duplicates
  const mergedQuotes = [
    ...serverQuotes,
    ...localQuotes.filter((lq) => !serverQuotes.some((sq) => sq.id === lq.id)),
  ];
  const mergedEnquiries = [
    ...serverEnquiries,
    ...localEnquiries.filter((le) => !serverEnquiries.some((se) => se.id === le.id)),
  ];

  const handleStatusUpdate = async (
    type: 'quotes' | 'enquiries',
    id: string,
    status: string
  ) => {
    try {
      const res = await fetch(`/api/submissions/${type}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchSubmissions();
      }
    } catch {
      // ignore offline error
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredQuotes = mergedQuotes.filter((q) => {
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    const matchesSearch =
      !normalizedQuery ||
      q.referenceCode.toLowerCase().includes(normalizedQuery) ||
      q.customerName.toLowerCase().includes(normalizedQuery) ||
      q.companyName.toLowerCase().includes(normalizedQuery) ||
      q.serviceType.toLowerCase().includes(normalizedQuery) ||
      q.location.toLowerCase().includes(normalizedQuery) ||
      q.preferredBranch.toLowerCase().includes(normalizedQuery);
    return matchesStatus && matchesSearch;
  });

  const filteredEnquiries = mergedEnquiries.filter((enq) => {
    const matchesStatus = statusFilter === 'All' || enq.status === statusFilter;
    const matchesSearch =
      !normalizedQuery ||
      enq.referenceCode.toLowerCase().includes(normalizedQuery) ||
      enq.customerName.toLowerCase().includes(normalizedQuery) ||
      enq.companyName.toLowerCase().includes(normalizedQuery) ||
      enq.preferredBranch.toLowerCase().includes(normalizedQuery) ||
      enq.items.some((it) => it.name.toLowerCase().includes(normalizedQuery));
    return matchesStatus && matchesSearch;
  });

  const currentStatuses =
    activeTab === 'quotes'
      ? (['All', 'New', 'Reviewed', 'Quoted'] as const)
      : (['All', 'New', 'Processing', 'Dispatched'] as const);

  const formatDateLabel = (iso: string) => {
    if (!iso) return 'Recent Submission';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-[#D4D4D8] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Dark Header — Matches Enquiry Basket Drawer */}
        <div className="px-5 sm:px-7 py-5 bg-[#0A0A0A] text-white flex items-center justify-between gap-4 border-b-2 border-[#DC2626] shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-md">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-mono uppercase tracking-widest text-red-400 block">
                EIL INTERNAL DESK · LIVE SUBMISSIONS LEDGER
              </span>
              <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white truncate">
                Customer Quotes &amp; Stock Enquiry Submissions Portal
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchSubmissions}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-[#DC2626] text-white text-xs font-bold transition-colors cursor-pointer"
              title="Refresh Submissions"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close portal"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#DC2626] text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Filter Controls Bar */}
        <div className="px-5 sm:px-7 py-4 bg-[#FFF8F8] border-b border-[#FCA5A5]/70 flex flex-col gap-3.5 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Primary Category Switcher */}
            <div className="inline-flex p-1 rounded-2xl bg-white border border-[#D4D4D8] shadow-2xs self-start">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('quotes');
                  setStatusFilter('All');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'quotes'
                    ? 'bg-[#DC2626] text-white shadow-xs'
                    : 'text-[#0A0A0A] hover:text-[#DC2626]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Project Quote Requests</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                    activeTab === 'quotes'
                      ? 'bg-black/25 text-white'
                      : 'bg-[#FFF0F0] text-[#DC2626]'
                  }`}
                >
                  {mergedQuotes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('enquiries');
                  setStatusFilter('All');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'enquiries'
                    ? 'bg-[#DC2626] text-white shadow-xs'
                    : 'text-[#0A0A0A] hover:text-[#DC2626]'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Stock Enquiry Baskets</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                    activeTab === 'enquiries'
                      ? 'bg-black/25 text-white'
                      : 'bg-[#FFF0F0] text-[#DC2626]'
                  }`}
                >
                  {mergedEnquiries.length}
                </span>
              </button>
            </div>

            {/* Search & Status Filter Strip */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ref, client, company, branch..."
                className="w-full sm:w-60 px-3.5 py-2 rounded-xl border border-[#D4D4D8] bg-white text-xs text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626]"
              />
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D4D4D8]">
                {currentStatuses.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#0A0A0A] text-white'
                        : 'text-[#52525B] hover:text-[#0A0A0A]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Submissions Feed */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 bg-[#FAFAFA]">
          {activeTab === 'quotes' ? (
            filteredQuotes.length === 0 ? (
              <div className="p-12 rounded-2xl border border-dashed border-[#D4D4D8] bg-white text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#FFF0F0] text-[#DC2626] flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-base font-extrabold text-[#0A0A0A]">
                  No Matching Project Quote Requests
                </p>
                <p className="text-xs text-[#71717A]">
                  Try clearing your search or status filter, or submit a new quote request to see it logged here.
                </p>
              </div>
            ) : (
              filteredQuotes.map((q) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-[#D4D4D8] bg-white shadow-xs overflow-hidden transition-all hover:border-[#DC2626]/60"
                >
                  {/* Top Card Banner */}
                  <div className="px-5 py-4 bg-[#FFF8F8] border-b border-[#FCA5A5]/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 min-w-0">
                      <span className="px-3 py-1 rounded-full bg-[#DC2626] text-white font-mono text-xs font-extrabold tracking-wider shadow-2xs">
                        {q.referenceCode}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-base font-extrabold text-[#0A0A0A] truncate">
                          {q.customerName}{' '}
                          <span className="text-[#DC2626] font-bold">—</span>{' '}
                          <span className="text-[#27272A]">{q.companyName}</span>
                        </h3>
                        <p className="text-[11px] font-medium text-[#71717A]">
                          {q.positionTitle ? `${q.positionTitle} · ` : ''}
                          Logged: {formatDateLabel(q.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Status Pills */}
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-[#D4D4D8]">
                      {(['New', 'Reviewed', 'Quoted'] as const).map((st) => {
                        const active = q.status === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusUpdate('quotes', q.id, st)}
                            className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                              active
                                ? st === 'Quoted'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : st === 'Reviewed'
                                  ? 'bg-[#0A0A0A] text-white shadow-2xs'
                                  : 'bg-[#DC2626] text-white shadow-2xs'
                                : 'text-[#52525B] hover:text-[#0A0A0A] hover:bg-zinc-100'
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Structured Card Body (Enquiry Basket Form Aesthetic) */}
                  <div className="p-5 sm:p-6 space-y-6">
                    {/* Section 01: Customer & Dispatch Information */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0A0A0A]">
                          01. Customer Contact &amp; Preferred EIL Branch
                        </h4>
                        <div className="flex-1 h-[1.5px] bg-[#DC2626]/40" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                            Direct Phone &amp; WhatsApp
                          </span>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-bold text-[#0A0A0A] font-mono">
                              {q.phone || 'Not provided'}
                            </span>
                            {q.phone && (
                              <a
                                href={`tel:${q.phone}`}
                                className="px-2.5 py-1 rounded-full bg-[#FFF0F0] hover:bg-[#DC2626] text-[#DC2626] hover:text-white text-[11px] font-bold transition-colors"
                              >
                                Call
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                            Corporate Email Address
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-[#0A0A0A] break-all">
                            {q.email || 'Not provided'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                            Preferred EIL Branch
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-[#0A0A0A] block">
                            {q.preferredBranch}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 02: Project Scope & Service Specifications */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                          <Settings className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0A0A0A]">
                          02. Service Category, Quantity &amp; Site Location
                        </h4>
                        <div className="flex-1 h-[1.5px] bg-[#DC2626]/40" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl border border-[#FCA5A5] bg-[#FFF8F8]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] block mb-1">
                            Requested Service Type
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-[#0A0A0A]">
                            {q.serviceType}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                            Requested Units / Fleet Scope
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-[#0A0A0A]">
                            {q.quantityOrDuration || 'Standard Project Scope'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                            Project / Delivery Location
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-[#0A0A0A]">
                            {q.location || 'Client Site'}
                          </span>
                        </div>
                      </div>

                      {q.projectNotes && (
                        <div className="p-4 rounded-xl border border-[#D4D4D8] bg-white">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] block mb-1">
                            Technical Scope, Fabrication Tolerance &amp; Mobilization Notes
                          </span>
                          <p className="text-xs sm:text-sm text-[#27272A] leading-relaxed whitespace-pre-line">
                            {q.projectNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Section 03: Uploaded Engineering Drawing / Document (if attached) */}
                    {q.attachmentName && (
                      <div className="p-4 rounded-xl border border-[#FCA5A5] bg-[#FFF0F0] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] block">
                              Uploaded Engineering Spec / Drawing (Permanent Link)
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-[#0A0A0A] truncate block">
                              {q.attachmentName}
                            </span>
                          </div>
                        </div>

                        {q.attachmentUrl && (
                          <a
                            href={q.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-full bg-[#DC2626] hover:bg-[#0A0A0A] text-white text-xs font-extrabold transition-colors shadow-2xs shrink-0"
                          >
                            Download File
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          ) : filteredEnquiries.length === 0 ? (
            <div className="p-12 rounded-2xl border border-dashed border-[#D4D4D8] bg-white text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#FFF0F0] text-[#DC2626] flex items-center justify-center mx-auto">
                <ClipboardList className="w-6 h-6" />
              </div>
              <p className="text-base font-extrabold text-[#0A0A0A]">
                No Matching Stock Enquiry Baskets
              </p>
              <p className="text-xs text-[#71717A]">
                Try clearing your search or status filter, or submit an enquiry basket to see it logged here.
              </p>
            </div>
          ) : (
            filteredEnquiries.map((enq) => (
              <div
                key={enq.id}
                className="rounded-2xl border border-[#D4D4D8] bg-white shadow-xs overflow-hidden transition-all hover:border-[#DC2626]/60"
              >
                {/* Top Card Banner */}
                <div className="px-5 py-4 bg-[#FFF8F8] border-b border-[#FCA5A5]/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 min-w-0">
                    <span className="px-3 py-1 rounded-full bg-[#DC2626] text-white font-mono text-xs font-extrabold tracking-wider shadow-2xs">
                      {enq.referenceCode}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-extrabold text-[#0A0A0A] truncate">
                          {enq.customerName}{' '}
                          <span className="text-[#DC2626] font-bold">—</span>{' '}
                          <span className="text-[#27272A]">{enq.companyName}</span>
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#FCA5A5] text-[#DC2626] font-mono text-[11px] font-bold">
                          {enq.orderMode}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-[#71717A]">
                        Logged: {formatDateLabel(enq.createdAt)} · {enq.items.length} Basket{' '}
                        {enq.items.length === 1 ? 'Item' : 'Items'}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Status Pills */}
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-[#D4D4D8]">
                    {(['New', 'Processing', 'Dispatched'] as const).map((st) => {
                      const active = enq.status === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleStatusUpdate('enquiries', enq.id, st)}
                          className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                            active
                              ? st === 'Dispatched'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : st === 'Processing'
                                ? 'bg-[#0A0A0A] text-white shadow-2xs'
                                : 'bg-[#DC2626] text-white shadow-2xs'
                              : 'text-[#52525B] hover:text-[#0A0A0A] hover:bg-zinc-100'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Structured Card Body */}
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Section 01: Customer & Fulfilment Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0A0A0A]">
                        01. Customer Contact, Branch &amp; Point Card Details
                      </h4>
                      <div className="flex-1 h-[1.5px] bg-[#DC2626]/40" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                          Phone / WhatsApp &amp; Email
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-[#0A0A0A] font-mono block">
                          {enq.phone || 'Not provided'}
                        </span>
                        {enq.email && (
                          <span className="text-xs text-[#52525B] break-all block mt-0.5">
                            {enq.email}
                          </span>
                        )}
                      </div>

                      <div className="p-3.5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                          Preferred EIL Branch
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-[#0A0A0A] block">
                          {enq.preferredBranch}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block mb-1">
                          EIL Point Card / Delivery Site
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-[#0A0A0A] block">
                          {enq.pointCardNumber
                            ? `Card: ${enq.pointCardNumber}`
                            : enq.deliveryAddress || 'Counter Pickup / Standard Dispatch'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 02: Selected Stock Items in Enquiry Basket */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                        <ClipboardList className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0A0A0A]">
                        02. Requested Stock Items ({enq.items.length})
                      </h4>
                      <div className="flex-1 h-[1.5px] bg-[#DC2626]/40" />
                    </div>

                    {enq.items.length === 0 ? (
                      <div className="p-3.5 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] text-xs text-[#52525B]">
                        Direct General / Service Inquiry (0 stock catalogue items attached)
                      </div>
                    ) : (
                      <div className="rounded-xl border border-[#D4D4D8] bg-white divide-y divide-[#E4E4E7] overflow-hidden">
                        {enq.items.map((it, idx) => (
                          <div
                            key={it.id}
                            className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-[#FFF8F8] transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-6 h-6 rounded-full bg-[#FFF0F0] border border-[#FCA5A5] text-[#DC2626] font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <span className="text-xs sm:text-sm font-extrabold text-[#0A0A0A] block truncate">
                                  {it.name}
                                </span>
                                <span className="text-[11px] text-[#71717A] block">
                                  {it.category} · {it.spec}
                                </span>
                              </div>
                            </div>

                            <span className="px-3 py-1 rounded-full bg-[#FFF0F0] border border-[#FCA5A5] text-[#DC2626] font-mono text-xs font-extrabold shrink-0">
                              {it.quantity} {it.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {enq.notes && (
                      <div className="p-4 rounded-xl border border-[#D4D4D8] bg-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] block mb-1">
                          Customer Inquiry / Dispatch Instructions
                        </span>
                        <p className="text-xs sm:text-sm text-[#27272A] leading-relaxed whitespace-pre-line">
                          {enq.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Section 03: Attached Document (if any) */}
                  {enq.attachmentName && (
                    <div className="p-4 rounded-xl border border-[#FCA5A5] bg-[#FFF0F0] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] block">
                            Attached Purchase Order / Specification Document
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-[#0A0A0A] truncate block">
                            {enq.attachmentName}
                          </span>
                        </div>
                      </div>

                      {enq.attachmentUrl && (
                        <a
                          href={enq.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-full bg-[#DC2626] hover:bg-[#0A0A0A] text-white text-xs font-extrabold transition-colors shadow-2xs shrink-0"
                        >
                          Download File
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. STICKY CLICK-TO-CALL & WHATSAPP ACTION BAR (WITH BRANCH SELECTOR)
// ============================================================================
interface StickyContactBarProps {
  basketCount: number;
  onOpenBasket: () => void;
  onOpenQuote: () => void;
}

export const StickyContactBar: React.FC<StickyContactBarProps> = ({
  basketCount,
  onOpenBasket,
  onOpenQuote,
}) => {
  const [selectedLineId, setSelectedLineId] = useState<string>('ph-aba-rd');
  const [selectorOpen, setSelectorOpen] = useState(false);

  const activeLine =
    BRANCH_CONTACT_LINES.find((l) => l.id === selectedLineId) ||
    BRANCH_CONTACT_LINES[0];

  const whatsappHref = `https://wa.me/${activeLine.whatsappNumber}?text=${encodeURIComponent(
    `Hello Emmadios Industrial Limited (${activeLine.shortLabel}), I would like to make an enquiry regarding your heavy equipment hiring/leasing or haulage services.`
  )}`;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t-2 border-[#DC2626] shadow-2xl">
      {/* Collapsible Branch Phone Line Selector Popover */}
      {selectorOpen && (
        <div className="bg-[#141414] border-b border-white/15 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-200">
                Select EIL Office for Direct Call &amp; WhatsApp (Official Line: +234 703 825 9142)
              </span>
              <button
                type="button"
                onClick={() => setSelectorOpen(false)}
                className="text-xs font-bold text-[#DC2626] hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BRANCH_CONTACT_LINES.map((line) => (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => {
                    setSelectedLineId(line.id);
                    setSelectorOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedLineId === line.id
                      ? 'bg-[#DC2626] text-white border-[#DC2626]'
                      : 'bg-[#0A0A0A] text-white border-white/15 hover:border-[#DC2626]'
                  }`}
                >
                  <div className="text-xs font-extrabold">{line.shortLabel}</div>
                  <div
                    className={`text-xs font-mono font-bold ${
                      selectedLineId === line.id ? 'text-white' : 'text-[#DC2626]'
                    }`}
                  >
                    {line.displayPhone}
                  </div>
                  <div
                    className={`text-[10px] truncate mt-0.5 ${
                      selectedLineId === line.id ? 'text-red-100' : 'text-red-200/80'
                    }`}
                  >
                    {line.address}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Compact Sticky Bar — No borders or background fills on bar controls */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Branch Selector Trigger */}
        <div className="flex items-center min-w-0 shrink">
          <button
            type="button"
            onClick={() => setSelectorOpen(!selectorOpen)}
            className="inline-flex items-center gap-1 sm:gap-1.5 min-h-[40px] px-1 sm:px-2 py-1.5 bg-transparent border-0 text-[11px] sm:text-xs font-bold text-white hover:text-[#DC2626] transition-colors cursor-pointer group min-w-0"
            title="Switch EIL Branch Phone Line"
          >
            <Building2 className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
            <span className="hidden md:inline text-red-200 group-hover:text-white shrink-0">
              {activeLine.shortLabel}:
            </span>
            <span className="font-mono text-white group-hover:text-[#DC2626] max-w-[105px] min-[390px]:max-w-[145px] sm:max-w-none truncate">
              {activeLine.displayPhone}
            </span>
            {selectorOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
            )}
          </button>
        </div>

        {/* Action Buttons: Click-to-Call, WhatsApp, Enquiry Basket, Quote (no border or background color) */}
        <div className="flex items-center gap-1.5 sm:gap-5 shrink-0">
          <a
            href={activeLine.telHref}
            className="inline-flex items-center gap-1 sm:gap-1.5 min-h-[40px] px-1.5 sm:px-2 py-1.5 bg-transparent border-0 text-white hover:text-[#DC2626] hover:scale-105 text-[11px] sm:text-xs font-extrabold transition-all duration-200 whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
            <span>Call Now</span>
          </a>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 sm:gap-1.5 min-h-[40px] px-1.5 sm:px-2 py-1.5 bg-transparent border-0 text-white hover:text-[#DC2626] hover:scale-105 text-[11px] sm:text-xs font-extrabold transition-all duration-200 whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={onOpenBasket}
            className="inline-flex items-center gap-1 sm:gap-1.5 min-h-[40px] px-1.5 sm:px-2 py-1.5 bg-transparent border-0 text-white hover:text-[#DC2626] hover:scale-105 text-[11px] sm:text-xs font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <ClipboardList className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
            <span className="hidden sm:inline">Enquiry Basket</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#DC2626] text-white font-mono text-[10px] font-bold">
              {basketCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenQuote}
            className="hidden sm:inline-flex items-center gap-1.5 min-h-[40px] px-2 py-1.5 bg-transparent border-0 text-white hover:text-[#DC2626] hover:scale-105 text-xs font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <span>Request Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
};

