/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  MapPin,
  FileText,
  Upload,
  Send,
  Menu,
  X,
  CheckCircle2,
  Flame,
  Clock,
  Search,
  MessageCircle,
  Layers,
  Wrench,
  CreditCard,
  PhoneCall,
  Building2,
  Truck,
  ShieldCheck,
  Sparkles,
  User,
  Settings,
  CloudUpload,
  FolderOpen,
  Info,
  Headset,
} from 'lucide-react';
import {
  EIL_SLOGAN,
  EIL_BRANCHES,
  STOCK_CATALOGUE,
  StockItem,
} from './data/eilData';
import {
  EilCmsData,
  DEFAULT_EIL_CMS_DATA,
  ADMIN_SESSION_STORAGE_KEY,
  loadLocalCmsData,
  fetchSharedCmsData,
  saveSharedCmsData,
  resetSharedCmsData,
} from './data/cmsDefaults';
import {
  CmsContext,
  CmsContextValue,
  EilScalarFieldKey,
  UniversalEditorRequest,
  UniversalDomCmsInspector,
  CmsEditableText,
  CmsEditableImage,
  CmsText,
  CmsImage,
  StealthAdminLoginModal,
  CmsFieldEditorModal,
  CmsAllFieldsDrawer,
  RestoreDefaultsConfirmModal,
  StealthAdminToolbar,
} from './components/StealthCmsAdmin';
import {
  resolveAssetUrl,
  handleBrandLogoError,
} from './components/ResilientImage';
import { StockCatalogueSection } from './components/StockCatalogueSection';
import {
  ServicesAndTrainingSection,
  ServicesSubTab,
} from './components/ServicesAndTrainingSection';
import {
  HowToBuySection,
  BranchLocatorSection,
  AboutUsSection,
} from './components/HowToBuyAndBranchesSection';
import {
  GasDeliveryExplainerTool,
  CylinderServicesTool,
} from './components/InteractiveTools';
import {
  BasketEntry,
  QuoteRecord,
  EnquiryRecord,
  SERVICE_TYPE_OPTIONS,
  EMAIL_ROUTES,
  normalizeInquiryCategory,
  resolveTargetEmail,
  buildDualWhatsAppUrl,
  dispatchFormSubmitEmail,
  createDeterministicAttachmentMeta,
  uploadAttachmentToServer,
  DualSubmissionInput,
  EnquiryBasketDrawer,
  RequestQuoteModal,
  AdminSubmissionsModal,
  StickyContactBar,
} from './components/OverlaysAndDrawers';

export type PageId =
  | 'home'
  | 'product-supply'
  | 'services'
  | 'how-to-buy'
  | 'contact-help'
  | 'about-us';

const NAV_ITEMS: { id: PageId; label: string }[] = [
  { id: 'home', label: 'HOME' },
  { id: 'product-supply', label: 'PRODUCT & SUPPLY' },
  { id: 'services', label: 'SERVICES' },
  { id: 'how-to-buy', label: 'HOW TO BUY' },
  { id: 'contact-help', label: 'CONTACT & HELP' },
  { id: 'about-us', label: 'ABOUT US' },
];

const BASKET_STORAGE_KEY = 'eil_enquiry_basket_v3';
const LEGACY_BASKET_STORAGE_KEY = 'eil_enquiry_basket_v2';
const QUOTES_STORAGE_KEY = 'eil_local_quotes_v2';
const ENQUIRIES_STORAGE_KEY = 'eil_local_enquiries_v2';

interface NavHistoryEntry {
  page: PageId;
  subTab: ServicesSubTab;
  overlay: 'none' | 'basket' | 'quote' | 'admin';
  scrollY: number;
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [servicesSubTab, setServicesSubTab] = useState<ServicesSubTab>('services');
  const [historyDepth, setHistoryDepth] = useState(0);

  // Refs for tracking current state & history stack without stale closures
  const activePageRef = useRef<PageId>('home');
  const servicesSubTabRef = useRef<ServicesSubTab>('services');
  const overlayRef = useRef<'none' | 'basket' | 'quote' | 'admin'>('none');
  const navStackRef = useRef<NavHistoryEntry[]>([]);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // =========================================================================
  // STEALTH CMS STATE & 10-TAP LOGO DETECTOR (1.5 SECOND RESET TIMER)
  // =========================================================================
  const [cmsData, setCmsData] = useState<EilCmsData>(() => loadLocalCmsData());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(ADMIN_SESSION_STORAGE_KEY));
    } catch {
      return false;
    }
  });
  const [stealthLoginModalOpen, setStealthLoginModalOpen] = useState(false);
  const [isCmsEditMode, setIsCmsEditMode] = useState(false);
  const [hasUnsavedCmsChanges, setHasUnsavedCmsChanges] = useState(false);
  const [isSavingCms, setIsSavingCms] = useState(false);
  const [editingCmsField, setEditingCmsField] = useState<EilScalarFieldKey | null>(null);
  const [universalEditorReq, setUniversalEditorReq] = useState<UniversalEditorRequest | null>(
    null
  );
  const [cmsAllFieldsDrawerOpen, setCmsAllFieldsDrawerOpen] = useState(false);
  const [restoreConfirmModalOpen, setRestoreConfirmModalOpen] = useState(false);

  const logoTapCountRef = useRef<number>(0);
  const logoTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On app load, sync CMS state from shared persistent backend (/api/cms or /cms-api.php)
  useEffect(() => {
    let active = true;
    fetchSharedCmsData().then((remoteData) => {
      if (active && remoteData) {
        setCmsData(remoteData);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleBrandLogoClick = () => {
    if (logoTapTimerRef.current) {
      clearTimeout(logoTapTimerRef.current);
    }
    logoTapCountRef.current += 1;

    if (logoTapCountRef.current >= 10) {
      logoTapCountRef.current = 0;
      if (logoTapTimerRef.current) {
        clearTimeout(logoTapTimerRef.current);
        logoTapTimerRef.current = null;
      }
      if (isAdminAuthenticated) {
        setIsCmsEditMode(true);
        showToast('Admin CMS Portal active — Edit Mode enabled across all pages.');
      } else {
        setStealthLoginModalOpen(true);
      }
      return;
    }

    logoTapTimerRef.current = setTimeout(() => {
      logoTapCountRef.current = 0;
    }, 1500);

    if (activePage !== 'home') {
      navigateToPage('home');
    }
  };

  const handleUpdateCmsField = useCallback((fieldKey: EilScalarFieldKey, newValue: string) => {
    setCmsData((prev) => ({
      ...prev,
      [fieldKey]: newValue,
    }));
    setHasUnsavedCmsChanges(true);
  }, []);

  const handleUpdateCmsData = useCallback((updater: (prev: EilCmsData) => EilCmsData) => {
    setCmsData((prev) => updater(prev));
    setHasUnsavedCmsChanges(true);
  }, []);

  const getText = useCallback(
    (key: string, defaultValue: string) => {
      const val = cmsData.customTexts?.[key];
      return val !== undefined ? val : defaultValue;
    },
    [cmsData.customTexts]
  );

  const getImage = useCallback(
    (key: string, defaultSrc: string) => {
      const val = cmsData.customImages?.[key];
      return val !== undefined && val.length > 0 ? val : defaultSrc;
    },
    [cmsData.customImages]
  );

  const cmsContextValue = useMemo<CmsContextValue>(
    () => ({
      cmsData,
      isEditMode: isCmsEditMode,
      isAdminAuthenticated,
      updateCmsData: handleUpdateCmsData,
      getText,
      getImage,
      openUniversalEditor: (req) => setUniversalEditorReq(req),
      onSelectField: (fieldKey) => setEditingCmsField(fieldKey),
    }),
    [
      cmsData,
      isCmsEditMode,
      isAdminAuthenticated,
      handleUpdateCmsData,
      getText,
      getImage,
    ]
  );

  const handleSaveCmsChanges = async () => {
    setIsSavingCms(true);
    try {
      await saveSharedCmsData(cmsData);
      setHasUnsavedCmsChanges(false);
      showToast('CMS changes saved! All visitors will now see the updated website.');
    } finally {
      setIsSavingCms(false);
    }
  };

  const handleRestoreFactoryDefaults = async () => {
    setIsSavingCms(true);
    try {
      await resetSharedCmsData();
      setCmsData(structuredClone(DEFAULT_EIL_CMS_DATA));
      setHasUnsavedCmsChanges(false);
      setEditingCmsField(null);
      setUniversalEditorReq(null);
      showToast('Entire website restored to original factory default state.');
    } finally {
      setIsSavingCms(false);
    }
  };

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsAdminAuthenticated(false);
    setIsCmsEditMode(false);
    setEditingCmsField(null);
    setUniversalEditorReq(null);
    setCmsAllFieldsDrawerOpen(false);
    showToast('Logged out of Stealth CMS Admin.');
  };

  // Track desktop viewport (>= 1024px) so vertical scroll-parallax never causes stacked mobile cards to overlap
  const [isDesktopViewport, setIsDesktopViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 1024px)');
    const handleChange = (e: MediaQueryListEvent) => setIsDesktopViewport(e.matches);
    setIsDesktopViewport(mql.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  // Scroll-linked parallax transforms for image cards (active on desktop lg+ only)
  const { scrollY } = useScroll();
  const heroPrimaryCardY = useTransform(scrollY, [0, 700], [0, -36]);
  const heroSecondaryTopY = useTransform(scrollY, [0, 700], [0, 32]);
  const heroSecondaryBottomY = useTransform(scrollY, [0, 700], [0, -24]);
  const expertiseCardY = useTransform(scrollY, [200, 1100], [28, -32]);

  // Basket state (defaults to 0 items on every new visit)
  const [basket, setBasket] = useState<BasketEntry[]>(() => {
    try {
      localStorage.removeItem(LEGACY_BASKET_STORAGE_KEY);
      const raw = localStorage.getItem(BASKET_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [localQuotes, setLocalQuotes] = useState<QuoteRecord[]>(() => {
    try {
      const raw = localStorage.getItem(QUOTES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [localEnquiries, setLocalEnquiries] = useState<EnquiryRecord[]>(() => {
    try {
      const raw = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // UI Overlays state
  const [basketDrawerOpen, setBasketDrawerOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteModalPrefillService, setQuoteModalPrefillService] = useState<string | undefined>(
    undefined
  );
  const [quoteModalPrefillNotes, setQuoteModalPrefillNotes] = useState<string | undefined>(
    undefined
  );
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  // Embedded Page Quote Form State
  const [inlineCustomerName, setInlineCustomerName] = useState('');
  const [inlineCompanyName, setInlineCompanyName] = useState('');
  const [inlinePositionTitle, setInlinePositionTitle] = useState('');
  const [inlinePhone, setInlinePhone] = useState('');
  const [inlineEmail, setInlineEmail] = useState('');
  const [inlineServiceType, setInlineServiceType] = useState(SERVICE_TYPE_OPTIONS[0]);
  const [inlineQuantityOrDuration, setInlineQuantityOrDuration] = useState('');
  const [inlineLocation, setInlineLocation] = useState('');
  const [inlineBranch, setInlineBranch] = useState(EIL_BRANCHES[0].name);
  const [inlineNotes, setInlineNotes] = useState('');
  const [inlineFile, setInlineFile] = useState<File | null>(null);
  const [inlineAttachmentMeta, setInlineAttachmentMeta] = useState<{
    attachmentId: string;
    attachmentName: string;
    attachmentUrl: string;
  }>({ attachmentId: '', attachmentName: '', attachmentUrl: '' });
  const [inlineUploadingAttachment, setInlineUploadingAttachment] = useState(false);
  const [inlineSubmitting, setInlineSubmitting] = useState(false);
  const [inlineSubmittedQuote, setInlineSubmittedQuote] = useState<QuoteRecord | null>(null);
  const [inlineRoutedEmail, setInlineRoutedEmail] = useState<string>(EMAIL_ROUTES.INFO);

  useEffect(() => {
    try {
      localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(basket));
    } catch {
      // ignore
    }
  }, [basket]);

  useEffect(() => {
    try {
      localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(localQuotes));
    } catch {
      // ignore
    }
  }, [localQuotes]);

  useEffect(() => {
    try {
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(localEnquiries));
    } catch {
      // ignore
    }
  }, [localEnquiries]);

  // Keep refs synchronized with state
  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  useEffect(() => {
    servicesSubTabRef.current = servicesSubTab;
  }, [servicesSubTab]);

  useEffect(() => {
    if (quoteModalOpen) overlayRef.current = 'quote';
    else if (basketDrawerOpen) overlayRef.current = 'basket';
    else if (adminModalOpen) overlayRef.current = 'admin';
    else overlayRef.current = 'none';
  }, [quoteModalOpen, basketDrawerOpen, adminModalOpen]);

  // Helper to push current view onto history stack before transitioning
  const pushNavigationHistory = useCallback(
    (
      nextPage: PageId,
      nextSubTab: ServicesSubTab = servicesSubTabRef.current,
      nextOverlay: 'none' | 'basket' | 'quote' | 'admin' = 'none'
    ) => {
      const currentEntry: NavHistoryEntry = {
        page: activePageRef.current,
        subTab: servicesSubTabRef.current,
        overlay: overlayRef.current,
        scrollY: window.scrollY || 0,
      };
      navStackRef.current.push(currentEntry);
      setHistoryDepth(navStackRef.current.length);

      try {
        window.history.replaceState(currentEntry, '');
        const nextState: NavHistoryEntry = {
          page: nextPage,
          subTab: nextSubTab,
          overlay: nextOverlay,
          scrollY: nextOverlay === 'none' ? 0 : window.scrollY || 0,
        };
        const hash = nextPage === 'home' ? '#home' : `#${nextPage}`;
        window.history.pushState(nextState, '', hash);
      } catch {
        // Ignore history security errors in restricted sandbox contexts
      }
    },
    []
  );

  // Restore previous state when device/browser Back button or swipe-back fires
  const restorePreviousEntry = useCallback((entry: NavHistoryEntry) => {
    setMobileMenuOpen(false);
    setBasketDrawerOpen(entry.overlay === 'basket');
    setQuoteModalOpen(entry.overlay === 'quote');
    setAdminModalOpen(entry.overlay === 'admin');
    setServicesSubTab(entry.subTab);
    setActivePage(entry.page);

    requestAnimationFrame(() => {
      setTimeout(() => {
        window.scrollTo({ top: entry.scrollY || 0, behavior: 'smooth' });
      }, 60);
    });
  }, []);

  // Initialize initial history state & listen for hardware/browser popstate
  useEffect(() => {
    try {
      const initialEntry: NavHistoryEntry = {
        page: 'home',
        subTab: 'services',
        overlay: 'none',
        scrollY: 0,
      };
      window.history.replaceState(initialEntry, '', window.location.hash || '#home');
    } catch {
      // ignore
    }

    const handlePopState = (event: PopStateEvent) => {
      const poppedFromStack = navStackRef.current.pop();
      setHistoryDepth(navStackRef.current.length);

      const targetEntry: NavHistoryEntry | undefined =
        (event.state as NavHistoryEntry | null) || poppedFromStack;

      if (targetEntry && targetEntry.page) {
        restorePreviousEntry(targetEntry);
      } else {
        setBasketDrawerOpen(false);
        setQuoteModalOpen(false);
        setAdminModalOpen(false);
        setActivePage('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [restorePreviousEntry]);

  // Programmatic back handler (used by on-screen Back button & touch swipe-back)
  const handleGoBack = useCallback(() => {
    if (navStackRef.current.length > 0) {
      try {
        window.history.back();
        return;
      } catch {
        const prev = navStackRef.current.pop();
        setHistoryDepth(navStackRef.current.length);
        if (prev) {
          restorePreviousEntry(prev);
          return;
        }
      }
    }
    if (quoteModalOpen || basketDrawerOpen || adminModalOpen) {
      setQuoteModalOpen(false);
      setBasketDrawerOpen(false);
      setAdminModalOpen(false);
      return;
    }
    if (activePageRef.current !== 'home') {
      setActivePage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [quoteModalOpen, basketDrawerOpen, adminModalOpen, restorePreviousEntry]);

  // Mobile/trackpad touch left-edge swipe-back gesture handler
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (touch.clientX <= 40) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    } else {
      touchStartRef.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    touchStartRef.current = null;

    if (deltaX > 75 && deltaY < 55) {
      handleGoBack();
    }
  };

  const navigateToPage = (page: PageId) => {
    if (page === activePage && overlayRef.current === 'none') {
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    pushNavigationHistory(page, servicesSubTabRef.current, 'none');
    setBasketDrawerOpen(false);
    setQuoteModalOpen(false);
    setAdminModalOpen(false);
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openServicesWithSubTab = (tab: ServicesSubTab) => {
    pushNavigationHistory('services', tab, 'none');
    setBasketDrawerOpen(false);
    setQuoteModalOpen(false);
    setAdminModalOpen(false);
    setServicesSubTab(tab);
    setActivePage('services');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBasketDrawer = () => {
    if (!basketDrawerOpen) {
      pushNavigationHistory(activePageRef.current, servicesSubTabRef.current, 'basket');
    }
    setBasketDrawerOpen(true);
  };

  const handleOpenAdminModal = () => {
    if (!adminModalOpen) {
      pushNavigationHistory(activePageRef.current, servicesSubTabRef.current, 'admin');
    }
    setAdminModalOpen(true);
  };

  const showToast = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => {
      setToastBanner((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleAddToEnquiry = (item: StockItem, quantity: number) => {
    setBasket((prev) => {
      const existingIndex = prev.findIndex((e) => e.item.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { item, quantity }];
    });
    showToast(`Added "${item.name}" (${quantity} ${item.unit}) to your Enquiry Basket.`);
  };

  const handleUpdateBasketQuantity = (itemId: string, quantity: number) => {
    setBasket((prev) =>
      prev.map((entry) =>
        entry.item.id === itemId ? { ...entry, quantity } : entry
      )
    );
  };

  const handleRemoveBasketItem = (itemId: string) => {
    setBasket((prev) => prev.filter((entry) => entry.item.id !== itemId));
  };

  const handleClearBasket = () => {
    setBasket([]);
  };

  const handleOpenQuoteModal = (prefillService?: string, prefillNotes?: string) => {
    if (!quoteModalOpen) {
      pushNavigationHistory(activePageRef.current, servicesSubTabRef.current, 'quote');
    }
    const mappedCategory = prefillService
      ? normalizeInquiryCategory(prefillService)
      : SERVICE_TYPE_OPTIONS[0];
    setQuoteModalPrefillService(mappedCategory);
    setInlineServiceType(mappedCategory);
    setQuoteModalPrefillNotes(prefillNotes);
    if (prefillNotes !== undefined) {
      setInlineNotes(prefillNotes);
    }
    setQuoteModalOpen(true);
  };

  const handleQuoteSubmitted = (record: QuoteRecord) => {
    setLocalQuotes((prev) => [record, ...prev]);
    showToast(`Quote request ${record.referenceCode} logged with EIL Contracting Desk.`);
  };

  const handleEnquirySubmitted = (record: EnquiryRecord) => {
    setLocalEnquiries((prev) => [record, ...prev]);
    showToast(`Enquiry Basket ${record.referenceCode} submitted to EIL Customer Service.`);
  };

  const handleInlineFileChange = async (file: File | null) => {
    setInlineFile(file);
    if (!file) {
      setInlineAttachmentMeta({ attachmentId: '', attachmentName: '', attachmentUrl: '' });
      setInlineUploadingAttachment(false);
      return;
    }
    const initialMeta = createDeterministicAttachmentMeta(file);
    setInlineAttachmentMeta(initialMeta);
    setInlineUploadingAttachment(true);
    try {
      const cloudUrl = await uploadAttachmentToServer(file, initialMeta.attachmentId);
      if (cloudUrl) {
        setInlineAttachmentMeta({
          ...initialMeta,
          attachmentUrl: cloudUrl,
        });
      }
    } catch {
      // Keep fallback URL
    } finally {
      setInlineUploadingAttachment(false);
    }
  };

  const handleInlineQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineCustomerName.trim() || !inlinePhone.trim() || !inlineLocation.trim()) {
      showToast('Please enter your Name, Phone Number, and Site Location.');
      return;
    }

    const normalizedCategory = normalizeInquiryCategory(inlineServiceType);
    const targetEmail = resolveTargetEmail(normalizedCategory);
    setInlineRoutedEmail(targetEmail);

    const generatedRefCode = `EIL-QT-${Math.floor(1000 + Math.random() * 9000)}`;
    const attachmentMeta = inlineFile
      ? inlineAttachmentMeta.attachmentName
        ? inlineAttachmentMeta
        : createDeterministicAttachmentMeta(inlineFile)
      : { attachmentId: '', attachmentName: '', attachmentUrl: '' };

    const compiledMessage = [
      `Company: ${inlineCompanyName.trim() || 'Direct Client'}`,
      inlinePositionTitle.trim() ? `Position: ${inlinePositionTitle.trim()}` : null,
      `Units / Fleet Scope: ${inlineQuantityOrDuration.trim() || 'Per Project Scope'}`,
      `Site Location: ${inlineLocation.trim()}`,
      `Handling Branch: ${inlineBranch}`,
      attachmentMeta.attachmentName ? `Attached File: ${attachmentMeta.attachmentName}` : null,
      attachmentMeta.attachmentUrl ? `Download File: ${attachmentMeta.attachmentUrl}` : null,
      inlineNotes.trim() ? `Details: ${inlineNotes.trim()}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    const dualInput: DualSubmissionInput = {
      name: inlineCustomerName.trim(),
      phone: inlinePhone.trim(),
      email: inlineEmail.trim(),
      category: normalizedCategory,
      message: compiledMessage,
      referenceCode: generatedRefCode,
      company: inlineCompanyName.trim() || 'Direct Client',
      role: inlinePositionTitle.trim() || 'Project / Procurement Contact',
      branch: inlineBranch,
      location: inlineLocation.trim(),
      quantityOrSchedule: inlineQuantityOrDuration.trim() || 'Per Project Scope',
      attachmentId: attachmentMeta.attachmentId || undefined,
      attachmentName: attachmentMeta.attachmentName || undefined,
      attachmentUrl: attachmentMeta.attachmentUrl || undefined,
      attachmentFile: inlineFile,
      notes: inlineNotes.trim(),
    };

    const whatsappUrl = buildDualWhatsAppUrl(dualInput, targetEmail);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setInlineSubmitting(true);

    const payload = {
      referenceCode: generatedRefCode,
      customerName: inlineCustomerName.trim(),
      companyName: inlineCompanyName.trim() || 'Direct Client',
      positionTitle: inlinePositionTitle.trim() || 'Project / Procurement Contact',
      email: inlineEmail.trim(),
      phone: inlinePhone.trim(),
      serviceType: normalizedCategory,
      quantityOrDuration: inlineQuantityOrDuration.trim() || 'Per Project Scope',
      location: inlineLocation.trim(),
      preferredBranch: inlineBranch,
      projectNotes: inlineNotes.trim(),
      attachmentName: attachmentMeta.attachmentName || '',
      attachmentSize: inlineFile ? inlineFile.size : 0,
      attachmentType: inlineFile ? inlineFile.type : '',
      attachmentUrl: attachmentMeta.attachmentUrl || '',
    };

    const [, apiResult] = await Promise.allSettled([
      dispatchFormSubmitEmail(dualInput, targetEmail),
      fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    ]);

    let finalQuote: QuoteRecord = {
      id: `q-inline-${Date.now()}`,
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
        // Fallback
      }
    }

    setInlineSubmittedQuote(finalQuote);
    handleQuoteSubmitted(finalQuote);
    setInlineCustomerName('');
    setInlineCompanyName('');
    setInlinePositionTitle('');
    setInlinePhone('');
    setInlineEmail('');
    setInlineQuantityOrDuration('');
    setInlineLocation('');
    setInlineNotes('');
    setInlineFile(null);
    setInlineAttachmentMeta({ attachmentId: '', attachmentName: '', attachmentUrl: '' });
    setInlineUploadingAttachment(false);
    setInlineSubmitting(false);
  };

  const basketItemIds = basket.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.item.id] = entry.quantity;
    return acc;
  }, {});

  const totalBasketItems = basket.reduce((sum, entry) => sum + entry.quantity, 0);

  // Reusable Department Contact Row (shown at the bottom of pages — 100% Editable)
  const renderDepartmentContactsRow = () => (
    <div className="pt-8 sm:pt-10 border-t-2 border-[#0A0A0A]/15 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-start">
      {/* Brand & Port Harcourt Head Office Address */}
      <div className="space-y-3 min-w-0">
        <button
          type="button"
          onClick={handleBrandLogoClick}
          className="flex items-center gap-3 text-left group cursor-pointer"
        >
          <img
            src={resolveAssetUrl(cmsData.brandLogoUrl)}
            onError={handleBrandLogoError}
            alt="Emmadios Industrial Limited Logo"
            className="h-11 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </button>
        <div className="flex items-start gap-2.5 text-[14px] sm:text-xs text-[#3B0707] leading-[1.6] break-words">
          <MapPin className="w-4 h-4 text-[#DC2626] shrink-0 mt-1" />
          <div className="min-w-0">
            <strong className="text-[#0A0A0A] block">
              <CmsText
                cmsKey="dept_row_hq_title"
                defaultValue="Port Harcourt Head Office:"
                label="Footer HQ Label"
                section="Department Contacts Row"
              />
            </strong>
            <CmsText
              cmsKey="dept_row_hq_address"
              defaultValue="Plot 213, Old Aba Road, Rumuogba-Obio, Port-Harcourt, Rivers State, Nigeria."
              label="Footer HQ Address"
              section="Department Contacts Row"
              multiline
            />
          </div>
        </div>
      </div>

      {/* Equipment Hiring & Leasing Desk (Port Harcourt) */}
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        className="flex items-start gap-3.5 p-4 sm:p-3 rounded-2xl bg-white sm:bg-transparent border border-[#0A0A0A]/10 sm:border-0 hover:bg-[#FFF8F8] transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-[#FFF0F0] border-2 border-[#DC2626] text-[#DC2626] flex items-center justify-center shrink-0 shadow-xs">
          <Headset className="w-6 h-6" />
        </div>
        <div className="text-xs sm:text-xs space-y-1 min-w-0">
          <div className="text-sm font-extrabold text-[#DC2626]">
            <CmsText
              cmsKey="dept_row_col2_title"
              defaultValue="Equipment Hire & Leasing Desk"
              label="Equipment Hire Desk Heading"
              section="Department Contacts Row"
            />
          </div>
          <a
            href="tel:+2347038259142"
            className="block font-mono font-bold text-sm sm:text-xs text-[#0A0A0A] hover:text-[#DC2626] py-0.5"
          >
            <CmsText
              cmsKey="dept_row_col2_phone1"
              defaultValue="(+234) 070-3825-9142"
              label="Official Phone & WhatsApp"
              section="Department Contacts Row"
            />
          </a>
          <div className="text-xs text-[#3B0707] py-0.5">
            <CmsText
              cmsKey="dept_row_col2_phone2"
              defaultValue="Forklifts, Excavators, Dozers, Cranes & Backhoes"
              label="Equipment Fleet Scope"
              section="Department Contacts Row"
            />
          </div>
          <a
            href="mailto:hire@emmadios.com"
            className="block text-xs text-[#3B0707] hover:text-[#DC2626] font-semibold py-0.5 break-all"
          >
            <CmsText
              cmsKey="dept_row_col2_email"
              defaultValue="hire@emmadios.com"
              label="Equipment Hire Email"
              section="Department Contacts Row"
            />
          </a>
        </div>
      </motion.div>

      {/* Warri Branch Office */}
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        className="flex items-start gap-3.5 p-4 sm:p-3 rounded-2xl bg-white sm:bg-transparent border border-[#0A0A0A]/10 sm:border-0 hover:bg-[#FFF8F8] transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-[#FFF0F0] border-2 border-[#DC2626] text-[#DC2626] flex items-center justify-center shrink-0 shadow-xs">
          <Building2 className="w-6 h-6" />
        </div>
        <div className="text-xs space-y-1 min-w-0">
          <div className="text-sm font-extrabold text-[#DC2626]">
            <CmsText
              cmsKey="dept_row_col3_title"
              defaultValue="Warri Branch Office"
              label="Warri Branch Heading"
              section="Department Contacts Row"
            />
          </div>
          <a
            href="tel:+2347038259142"
            className="block font-mono font-bold text-sm sm:text-xs text-[#0A0A0A] hover:text-[#DC2626] py-0.5"
          >
            <CmsText
              cmsKey="dept_row_col3_phone"
              defaultValue="(+234) 070-3825-9142"
              label="Warri Phone"
              section="Department Contacts Row"
            />
          </a>
          <div className="text-[#3B0707] leading-relaxed">
            <CmsText
              cmsKey="dept_row_col3_addr"
              defaultValue="9, Etuwewe Road, Off Deco Road, P.O. Box 894, Warri, Delta State"
              label="Warri Address"
              section="Department Contacts Row"
            />
          </div>
          <a
            href="mailto:info@emmadios.com"
            className="block text-[#3B0707] hover:text-[#DC2626] font-semibold py-0.5 break-all"
          >
            <CmsText
              cmsKey="dept_row_col3_email"
              defaultValue="info@emmadios.com"
              label="Warri Email"
              section="Department Contacts Row"
            />
          </a>
        </div>
      </motion.div>

      {/* Heavy Haulage & Fleet Dispatch */}
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        className="flex items-start gap-3.5 p-4 sm:p-3 rounded-2xl bg-white sm:bg-transparent border border-[#0A0A0A]/10 sm:border-0 hover:bg-[#FFF8F8] transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-[#FFF0F0] border-2 border-[#DC2626] text-[#DC2626] flex items-center justify-center shrink-0 shadow-xs">
          <Truck className="w-6 h-6" />
        </div>
        <div className="text-xs space-y-1 min-w-0">
          <div className="text-sm font-extrabold text-[#DC2626]">
            <CmsText
              cmsKey="dept_row_col4_title"
              defaultValue="Haulage & Fleet Dispatch"
              label="Haulage Dispatch Heading"
              section="Department Contacts Row"
            />
          </div>
          <a
            href="tel:+2347038259142"
            className="block font-mono font-bold text-sm sm:text-xs text-[#0A0A0A] hover:text-[#DC2626] py-0.5"
          >
            <CmsText
              cmsKey="dept_row_col4_phone"
              defaultValue="(+234) 070-3825-9142"
              label="Haulage Dispatch Phone"
              section="Department Contacts Row"
            />
          </a>
          <div className="text-[#3B0707] leading-relaxed">
            <CmsText
              cmsKey="dept_row_col4_addr"
              defaultValue="Lowbed, Flatbed, Tankers, Pneumatic & Dump Trucks"
              label="Haulage Fleet Scope"
              section="Department Contacts Row"
            />
          </div>
          <span className="inline-block text-[11px] font-mono font-bold text-[#0A0A0A]">
            <CmsText
              cmsKey="dept_row_col4_web"
              defaultValue="www.emmadios.com"
              label="Company Website Label"
              section="Department Contacts Row"
            />
          </span>
        </div>
      </motion.div>
    </div>
  );

  const canGoBack = historyDepth > 0 || activePage !== 'home';

  const renderSubPageBackButton = () => (
    <div data-cms-ignore="true" className="mb-3">
      <button
        type="button"
        onClick={handleGoBack}
        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full bg-white/10 hover:bg-[#DC2626] border border-white/20 hover:border-[#DC2626] text-white text-xs font-extrabold transition-all duration-200 cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 text-[#DC2626] group-hover:text-white group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Previous Page</span>
      </button>
    </div>
  );

  return (
    <CmsContext.Provider value={cmsContextValue}>
      <div
        id="eil-site-root"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`w-full max-w-[100vw] overflow-x-hidden min-h-screen bg-white text-[#0A0A0A] flex flex-col selection:bg-[#DC2626] selection:text-white ${
          isAdminAuthenticated ? 'pb-40 sm:pb-28' : 'pb-24 sm:pb-16'
        }`}
      >
        {/* Universal DOM Click-to-Edit Inspector — Guarantees 100% Top-to-Bottom Page Editability */}
        <UniversalDomCmsInspector activePageKey={`${activePage}-${servicesSubTab}`} />

        {/* Subtle Toast Notification Banner */}
        {toastBanner && (
          <div
            data-cms-ignore="true"
            className="fixed top-20 sm:top-24 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-md bg-[#0A0A0A] text-white px-4 py-3 rounded-2xl shadow-2xl border-2 border-[#DC2626] flex items-center gap-3"
          >
            <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span className="text-xs font-semibold leading-snug">{toastBanner}</span>
            <button
              type="button"
              onClick={() => setToastBanner(null)}
              className="w-8 h-8 flex items-center justify-center text-red-200 hover:text-white ml-auto cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =====================================================================
            TOP NAVIGATION BAR (Compact 68px Mobile / 88px Desktop + 44x44px Toggle)
           ===================================================================== */}
        <header className="sticky top-0 z-40 h-[68px] lg:h-22 bg-white/95 backdrop-blur-md border-b-2 border-[#0A0A0A]/10 shadow-xs">
          <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-1.5 sm:gap-4">
            {/* Zone 1: Back Button (when navigated) + Official EIL Logo (10-Tap Stealth CMS Trigger) */}
            <div data-cms-ignore="true" className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
              {canGoBack && (
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center justify-center gap-1.5 min-h-[38px] min-w-[38px] sm:min-h-[40px] sm:min-w-[40px] px-2 sm:px-3 py-1.5 rounded-full border-2 border-[#0A0A0A]/15 hover:border-[#DC2626] bg-[#FFF8F8] hover:bg-[#DC2626] text-[#0A0A0A] hover:text-white text-xs font-extrabold transition-all duration-200 cursor-pointer group shrink-0"
                  title="Go back to previous page"
                  aria-label="Go back to previous page"
                >
                  <ArrowLeft className="w-4 h-4 text-[#DC2626] group-hover:text-white group-hover:-translate-x-0.5 transition-transform" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleBrandLogoClick}
                className="flex items-center gap-2 sm:gap-3 group min-w-0 shrink cursor-pointer focus:outline-none select-none"
                title="Emmadios Industrial Limited — Home"
              >
                <img
                  src={resolveAssetUrl(cmsData.brandLogoUrl)}
                  onError={handleBrandLogoError}
                  alt="Emmadios Industrial Limited (EIL) Official Logo"
                  className="h-8 sm:h-12 lg:h-14 w-auto max-w-[118px] min-[390px]:max-w-[136px] sm:max-w-none object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </button>
              {isCmsEditMode && (
                <button
                  type="button"
                  onClick={() => setEditingCmsField('brandLogoUrl')}
                  className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md bg-[#0A0A0A] border border-[#10B981] text-[#10B981] text-[10px] font-mono font-extrabold uppercase tracking-wider hover:bg-[#10B981] hover:text-[#0A0A0A] transition-colors cursor-pointer shrink-0"
                  title="Upload or change Brand Logo (400 × 120 px, auto-dimensioned)"
                >
                  <Upload className="w-3 h-3" />
                  <span className="hidden md:inline">Logo (400×120)</span>
                </button>
              )}
            </div>

            {/* Zone 2: Exact 6 Uppercase Navigation Items */}
            <nav data-cms-ignore="true" className="hidden lg:flex items-center gap-6 xl:gap-8">
              {NAV_ITEMS.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateToPage(item.id)}
                    className={`relative py-2 text-xs xl:text-sm font-extrabold tracking-wide uppercase transition-all duration-200 whitespace-nowrap cursor-pointer hover:scale-105 ${
                      isActive
                        ? 'text-[#DC2626]'
                        : 'text-[#0A0A0A] hover:text-[#DC2626]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="eil-active-nav-underline"
                        className="absolute bottom-0 inset-x-0 h-0.5 bg-[#DC2626] rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Primary Action CTAs + 44x44px Mobile Menu Toggle */}
            <div data-cms-ignore="true" className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenQuoteModal()}
                className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-full border-2 border-[#0A0A0A] bg-white hover:bg-[#0A0A0A] text-[#0A0A0A] hover:text-white hover:scale-105 text-xs font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                Request Quote
              </button>

              <button
                type="button"
                onClick={handleOpenBasketDrawer}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 min-h-[44px] px-3 sm:px-4 py-2 rounded-full bg-[#DC2626] hover:bg-[#0A0A0A] hover:scale-105 text-white text-xs font-extrabold transition-all duration-200 shadow-xs cursor-pointer whitespace-nowrap"
                aria-label={`Open Enquiry Basket (${totalBasketItems} items)`}
              >
                <ClipboardList className="w-4 h-4 shrink-0" />
                <span className="hidden min-[380px]:inline sm:hidden">Basket</span>
                <span className="hidden sm:inline">Enquiry Basket</span>
                <span className="px-1.5 py-0.5 rounded-full bg-white text-[#0A0A0A] font-mono text-[10px] font-extrabold">
                  {totalBasketItems}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border-2 border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Toggle Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer — Clean Vertical Stack with Generous Touch Targets */}
          {mobileMenuOpen && (
            <div
              data-cms-ignore="true"
              className="lg:hidden bg-[#0A0A0A] text-white border-b-2 border-[#DC2626] px-4 sm:px-6 py-5 space-y-3 shadow-2xl max-h-[calc(100vh-68px)] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {NAV_ITEMS.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigateToPage(item.id)}
                      className={`min-h-[48px] px-4 py-3 rounded-xl text-left text-xs font-extrabold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#DC2626] text-white'
                          : 'bg-[#181818] text-white hover:bg-[#DC2626]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="w-4 h-4 opacity-80 shrink-0" />
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenQuoteModal();
                }}
                className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-white text-[#0A0A0A] hover:bg-[#DC2626] hover:text-white text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Request an Engineering Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </header>

        {/* =====================================================================
            MULTI-PAGE CONTENT ROUTER (HOME | PRODUCT & SUPPLY | SERVICES | HOW TO BUY | CONTACT & HELP | ABOUT US)
           ===================================================================== */}
        <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
          <AnimatePresence mode="wait">
            {/* =================================================================
                PAGE 1: HOME
               ================================================================= */}
            {activePage === 'home' && (
              <motion.div
                key="page-home"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {/* HERO SECTION WITH FLUID TYPOGRAPHY, FULL-WIDTH MOBILE CTAS & RESPONSIVE IMAGE SHOWCASE */}
                <section className="relative bg-[#FFF8F8] border-b-2 border-[#0A0A0A]/10 overflow-hidden py-12 sm:py-16 lg:py-20">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
                      {/* Left Column */}
                      <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-6 space-y-5 sm:space-y-6 min-w-0"
                      >
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#0A0A0A] text-white text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase max-w-full">
                          <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0" />
                          <CmsEditableText
                            fieldKey="heroBadge"
                            value={cmsData.heroBadge}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                            className="truncate"
                          />
                        </div>

                        <h1 className="text-[clamp(1.85rem,6vw,3.25rem)] font-extrabold tracking-tight text-[#0A0A0A] leading-[1.08] break-words [overflow-wrap:anywhere] [text-wrap:balance]">
                          <CmsEditableText
                            fieldKey="heroTitlePrefix"
                            value={cmsData.heroTitlePrefix}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />{' '}
                          <span className="text-[#DC2626]">
                            <CmsEditableText
                              fieldKey="heroTitleHighlight"
                              value={cmsData.heroTitleHighlight}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </span>{' '}
                          <CmsEditableText
                            fieldKey="heroTitleSuffix"
                            value={cmsData.heroTitleSuffix}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />
                        </h1>

                        <p className="text-[15px] sm:text-base text-[#3B0707] leading-[1.65] text-left max-w-xl break-words [overflow-wrap:anywhere]">
                          <CmsEditableText
                            fieldKey="heroDescriptionPart1"
                            value={cmsData.heroDescriptionPart1}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />{' '}
                          <strong className="text-[#0A0A0A] underline decoration-[#DC2626] decoration-2">
                            <CmsEditableText
                              fieldKey="heroDescriptionHighlight"
                              value={cmsData.heroDescriptionHighlight}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </strong>
                          <CmsEditableText
                            fieldKey="heroDescriptionPart2"
                            value={cmsData.heroDescriptionPart2}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />
                        </p>

                        {/* Primary Hero CTAs */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleOpenQuoteModal()}
                            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-between sm:justify-center gap-3 pl-5 pr-2.5 py-2 rounded-full border-2 border-[#0A0A0A] bg-white hover:bg-[#0A0A0A] text-sm font-extrabold text-[#0A0A0A] hover:text-white hover:scale-[1.02] transition-all duration-200 cursor-pointer group min-w-0"
                          >
                            <CmsEditableText
                              fieldKey="heroPrimaryCtaLabel"
                              value={cmsData.heroPrimaryCtaLabel}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                            <span className="w-9 h-9 rounded-full bg-[#0A0A0A] group-hover:bg-[#DC2626] text-white flex items-center justify-center transition-colors shrink-0">
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => navigateToPage('product-supply')}
                            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-[#DC2626] hover:bg-[#0A0A0A] hover:scale-[1.02] text-white text-sm font-extrabold transition-all duration-200 shadow-sm cursor-pointer min-w-0"
                          >
                            <Search className="w-4 h-4 shrink-0" />
                            <CmsEditableText
                              fieldKey="heroSecondaryCtaLabel"
                              value={cmsData.heroSecondaryCtaLabel}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </button>
                        </div>

                        {/* Interactive Metric Cards */}
                        <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2.5 sm:gap-3 pt-4 border-t-2 border-[#0A0A0A]/10">
                          <motion.button
                            type="button"
                            whileHover={{ y: -4, scale: 1.02 }}
                            onClick={() => navigateToPage('product-supply')}
                            className="p-3.5 sm:p-3.5 rounded-2xl bg-white hover:bg-[#0A0A0A] group border border-[#0A0A0A]/15 text-left transition-colors cursor-pointer flex min-[420px]:block items-center justify-between min-w-0 overflow-hidden"
                          >
                            <div className="text-lg sm:text-2xl font-extrabold font-mono text-[#DC2626] break-words">
                              <CmsEditableText
                                fieldKey="heroMetric1Value"
                                value={cmsData.heroMetric1Value}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </div>
                            <div className="text-xs text-[#0A0A0A] group-hover:text-white font-bold break-words">
                              <CmsEditableText
                                fieldKey="heroMetric1Label"
                                value={cmsData.heroMetric1Label}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </div>
                          </motion.button>

                          <motion.button
                            type="button"
                            whileHover={{ y: -4, scale: 1.02 }}
                            onClick={() => navigateToPage('contact-help')}
                            className="p-3.5 sm:p-3.5 rounded-2xl bg-white hover:bg-[#0A0A0A] group border border-[#0A0A0A]/15 text-left transition-colors cursor-pointer flex min-[420px]:block items-center justify-between min-w-0 overflow-hidden"
                          >
                            <div className="text-lg sm:text-2xl font-extrabold font-mono text-[#DC2626] break-words">
                              <CmsEditableText
                                fieldKey="heroMetric2Value"
                                value={cmsData.heroMetric2Value}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </div>
                            <div className="text-xs text-[#0A0A0A] group-hover:text-white font-bold break-words">
                              <CmsEditableText
                                fieldKey="heroMetric2Label"
                                value={cmsData.heroMetric2Label}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </div>
                          </motion.button>

                          <motion.button
                            type="button"
                            whileHover={{ y: -4, scale: 1.02 }}
                            onClick={() => navigateToPage('how-to-buy')}
                            className="p-3.5 sm:p-3.5 rounded-2xl bg-white hover:bg-[#0A0A0A] group border border-[#0A0A0A]/15 text-left transition-colors cursor-pointer flex min-[420px]:block items-center justify-between min-w-0 overflow-hidden"
                          >
                            <div className="text-lg sm:text-2xl font-extrabold font-mono text-[#DC2626] break-words">
                              <CmsEditableText
                                fieldKey="heroMetric3Value"
                                value={cmsData.heroMetric3Value}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </div>
                            <div className="text-xs text-[#0A0A0A] group-hover:text-white font-bold break-words">
                              <CmsEditableText
                                fieldKey="heroMetric3Label"
                                value={cmsData.heroMetric3Label}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </div>
                          </motion.button>
                        </div>
                      </motion.div>

                      {/* Right Column: Responsive Hero Image Cards */}
                      <div className="lg:col-span-6 relative min-w-0">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-5 items-center">
                          {/* Primary Hero Image Card */}
                          <motion.div
                            style={{ y: isDesktopViewport ? heroPrimaryCardY : 0 }}
                            whileHover={{ scale: 1.02 }}
                            className="sm:col-span-7 relative rounded-3xl overflow-hidden border-2 border-[#0A0A0A] shadow-2xl aspect-[16/10] sm:aspect-auto sm:h-96 group cursor-pointer"
                            onClick={() => navigateToPage('services')}
                          >
                            <CmsEditableImage
                              fieldKey="heroPrimaryImage"
                              src={cmsData.heroPrimaryImage}
                              alt="EIL Heavy Equipment Hiring & Plant Leasing Fleet"
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              eager
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/95 via-[#0A0A0A]/40 to-transparent pointer-events-none" />

                            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 inline-flex items-center gap-2.5 sm:gap-3 bg-white group-hover:bg-[#0A0A0A] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl sm:rounded-full shadow-lg border-2 border-[#0A0A0A] transition-colors max-w-full z-30">
                              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                                <Flame className="w-4 h-4" />
                              </span>
                              <div className="min-w-0 pr-1">
                                <span className="text-xs font-extrabold text-[#0A0A0A] group-hover:text-white block leading-snug line-clamp-1">
                                  <CmsEditableText
                                    fieldKey="heroPrimaryCardTitle"
                                    value={cmsData.heroPrimaryCardTitle}
                                    isEditMode={isCmsEditMode}
                                    onSelectField={setEditingCmsField}
                                  />
                                </span>
                                <span className="text-[11px] text-[#DC2626] font-bold block leading-snug line-clamp-1">
                                  <CmsEditableText
                                    fieldKey="heroPrimaryCardSubtitle"
                                    value={cmsData.heroPrimaryCardSubtitle}
                                    isEditMode={isCmsEditMode}
                                    onSelectField={setEditingCmsField}
                                  />
                                </span>
                              </div>
                            </div>
                          </motion.div>

                          {/* Secondary Two Image Cards */}
                          <div className="sm:col-span-5 grid grid-cols-1 gap-4">
                            <motion.div
                              style={{ y: isDesktopViewport ? heroSecondaryTopY : 0 }}
                              whileHover={{ scale: 1.04 }}
                              onClick={() => navigateToPage('product-supply')}
                              className="rounded-3xl overflow-hidden border-2 border-[#0A0A0A] hover:border-[#DC2626] shadow-xl aspect-[16/10] sm:aspect-auto sm:h-48 relative group cursor-pointer"
                            >
                              <CmsEditableImage
                                fieldKey="heroSecondaryTopImage"
                                src={cmsData.heroSecondaryTopImage}
                                alt="EIL Heavy Haulage Lowbed, Flatbed & Tanker Fleet"
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                eager
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/95 via-[#0A0A0A]/45 to-transparent pointer-events-none" />
                              <div className="absolute bottom-3 left-3.5 right-3.5 text-white z-30 min-w-0">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-[#DC2626] font-extrabold block leading-snug line-clamp-1">
                                  <CmsEditableText
                                    fieldKey="heroSecondaryTopBadge"
                                    value={cmsData.heroSecondaryTopBadge}
                                    isEditMode={isCmsEditMode}
                                    onSelectField={setEditingCmsField}
                                  />
                                </span>
                                <span className="text-xs font-bold leading-snug block line-clamp-2">
                                  <CmsEditableText
                                    fieldKey="heroSecondaryTopTitle"
                                    value={cmsData.heroSecondaryTopTitle}
                                    isEditMode={isCmsEditMode}
                                    onSelectField={setEditingCmsField}
                                  />
                                </span>
                              </div>
                            </motion.div>

                            <motion.div
                              style={{ y: isDesktopViewport ? heroSecondaryBottomY : 0 }}
                              whileHover={{ scale: 1.04 }}
                              onClick={() => navigateToPage('services')}
                              className="rounded-3xl overflow-hidden border-2 border-[#0A0A0A] hover:border-[#DC2626] shadow-xl aspect-[16/10] sm:aspect-auto sm:h-48 relative group cursor-pointer"
                            >
                              <CmsEditableImage
                                fieldKey="heroSecondaryBottomImage"
                                src={cmsData.heroSecondaryBottomImage}
                                alt="EIL Modular Skid & Structural Fabrication"
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                eager
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/95 via-[#0A0A0A]/45 to-transparent pointer-events-none" />
                              <div className="absolute bottom-3 left-3.5 right-3.5 text-white z-30 min-w-0">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-[#DC2626] font-extrabold block leading-snug line-clamp-1">
                                  <CmsEditableText
                                    fieldKey="heroSecondaryBottomBadge"
                                    value={cmsData.heroSecondaryBottomBadge}
                                    isEditMode={isCmsEditMode}
                                    onSelectField={setEditingCmsField}
                                  />
                                </span>
                                <span className="text-xs font-bold leading-snug block line-clamp-2">
                                  <CmsEditableText
                                    fieldKey="heroSecondaryBottomTitle"
                                    value={cmsData.heroSecondaryBottomTitle}
                                    isEditMode={isCmsEditMode}
                                    onSelectField={setEditingCmsField}
                                  />
                                </span>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Authorised Agencies & Technical Standards Strip */}
                    <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t-2 border-[#0A0A0A]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
                      <div className="text-xs sm:text-sm font-bold text-[#0A0A0A] max-w-xs break-words">
                        <CmsEditableText
                          fieldKey="heroAgenciesIntro"
                          value={cmsData.heroAgenciesIntro}
                          isEditMode={isCmsEditMode}
                          onSelectField={setEditingCmsField}
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-start sm:items-center gap-4 sm:gap-8 lg:gap-10 w-full md:w-auto">
                        {[
                          {
                            titleKey: 'heroAgency1Title' as EilScalarFieldKey,
                            subKey: 'heroAgency1Sub' as EilScalarFieldKey,
                          },
                          {
                            titleKey: 'heroAgency2Title' as EilScalarFieldKey,
                            subKey: 'heroAgency2Sub' as EilScalarFieldKey,
                          },
                          {
                            titleKey: 'heroAgency3Title' as EilScalarFieldKey,
                            subKey: 'heroAgency3Sub' as EilScalarFieldKey,
                          },
                          {
                            titleKey: 'heroAgency4Title' as EilScalarFieldKey,
                            subKey: 'heroAgency4Sub' as EilScalarFieldKey,
                          },
                          {
                            titleKey: 'heroAgency5Title' as EilScalarFieldKey,
                            subKey: 'heroAgency5Sub' as EilScalarFieldKey,
                          },
                        ].map((brand) => (
                          <motion.div
                            key={String(brand.titleKey)}
                            whileHover={{ scale: 1.06, y: -2 }}
                            className="group cursor-pointer min-w-0"
                            onClick={() => navigateToPage('product-supply')}
                          >
                            <div className="text-xs sm:text-base font-extrabold tracking-tight text-[#0A0A0A] group-hover:text-[#DC2626] transition-colors break-words">
                              <CmsEditableText
                                fieldKey={brand.titleKey}
                                value={cmsData[brand.titleKey]}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </div>
                            <div className="text-[10px] font-mono uppercase tracking-wider text-[#DC2626] font-bold break-words">
                              <CmsEditableText
                                fieldKey={brand.subKey}
                                value={cmsData[brand.subKey]}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 2: EDITORIAL EXPERTISE SPLIT WITH SCROLL-MOVING PORTRAIT CARD */}
                <section className="py-12 sm:py-16 lg:py-24 bg-white border-b-2 border-[#0A0A0A]/10">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="max-w-3xl mb-8 sm:mb-12 min-w-0"
                    >
                      <h2 className="text-[clamp(1.5rem,4.5vw,2.5rem)] font-extrabold tracking-tight text-[#0A0A0A] leading-[1.15] [text-wrap:balance] break-words [overflow-wrap:anywhere]">
                        <CmsEditableText
                          fieldKey="expertiseTitlePrefix"
                          value={cmsData.expertiseTitlePrefix}
                          isEditMode={isCmsEditMode}
                          onSelectField={setEditingCmsField}
                        />{' '}
                        <span className="text-[#DC2626]">
                          <CmsEditableText
                            fieldKey="expertiseTitleHighlight"
                            value={cmsData.expertiseTitleHighlight}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />
                        </span>{' '}
                        <CmsEditableText
                          fieldKey="expertiseTitleSuffix"
                          value={cmsData.expertiseTitleSuffix}
                          isEditMode={isCmsEditMode}
                          onSelectField={setEditingCmsField}
                        />
                      </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-center">
                      {/* Left Rounded Portrait Image Card */}
                      <div className="lg:col-span-5 min-w-0">
                        <motion.div
                          style={{ y: isDesktopViewport ? expertiseCardY : 0 }}
                          whileHover={{ scale: 1.02 }}
                          className="relative rounded-3xl overflow-hidden border-2 border-[#0A0A0A] shadow-2xl aspect-[4/3] sm:aspect-[4/5] max-h-[420px] sm:max-h-[520px] group"
                        >
                          <CmsEditableImage
                            fieldKey="expertisePortraitImage"
                            src={cmsData.expertisePortraitImage}
                            alt="EIL Heavy Plant & Haulage Fleet Operations"
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/95 via-[#0A0A0A]/40 to-transparent pointer-events-none" />
                          <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 text-white z-30 min-w-0">
                            <span className="text-[11px] font-mono uppercase tracking-widest text-[#DC2626] font-bold block break-words">
                              <CmsEditableText
                                fieldKey="expertisePortraitBadge"
                                value={cmsData.expertisePortraitBadge}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </span>
                            <p className="text-xs sm:text-sm font-extrabold mt-0.5 leading-snug break-words">
                              <CmsEditableText
                                fieldKey="brandSlogan"
                                value={cmsData.brandSlogan}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </p>
                          </div>
                        </motion.div>
                      </div>

                      {/* Right Narrative Paragraphs + Interactive Capability Cards */}
                      <div className="lg:col-span-7 space-y-5 text-[15px] sm:text-base text-[#3B0707] leading-[1.65] text-left min-w-0">
                        <p className="text-[#0A0A0A] font-bold text-base sm:text-lg leading-[1.6] break-words [overflow-wrap:anywhere]">
                          <CmsEditableText
                            fieldKey="expertiseLeadParagraph"
                            value={cmsData.expertiseLeadParagraph}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />
                        </p>

                        <p className="break-words [overflow-wrap:anywhere]">
                          <CmsEditableText
                            fieldKey="expertiseBodyParagraphPrefix"
                            value={cmsData.expertiseBodyParagraphPrefix}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />{' '}
                          <strong className="text-[#0A0A0A]">
                            <CmsEditableText
                              fieldKey="expertiseBodyParagraphStrong"
                              value={cmsData.expertiseBodyParagraphStrong}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </strong>
                          <CmsEditableText
                            fieldKey="expertiseBodyParagraphSuffix"
                            value={cmsData.expertiseBodyParagraphSuffix}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <motion.div
                            whileHover={{ y: -6, scale: 1.02 }}
                            onClick={() => navigateToPage('services')}
                            className="p-5 sm:p-6 rounded-3xl bg-[#FFF8F8] hover:bg-[#0A0A0A] group border-2 border-[#0A0A0A]/15 hover:border-[#DC2626] transition-all duration-300 cursor-pointer min-w-0 overflow-hidden"
                          >
                            <div className="text-xs font-mono uppercase tracking-wider text-[#DC2626] font-extrabold break-words">
                              <CmsEditableText
                                fieldKey="fabricationCardBadge"
                                value={cmsData.fabricationCardBadge}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </div>
                            <div className="text-base font-extrabold text-[#0A0A0A] group-hover:text-white mt-1 break-words">
                              <CmsEditableText
                                fieldKey="fabricationCardTitle"
                                value={cmsData.fabricationCardTitle}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </div>
                            <p className="text-[14px] sm:text-xs text-[#3B0707] group-hover:text-red-100 mt-1.5 leading-[1.6] break-words">
                              <CmsEditableText
                                fieldKey="fabricationCardDesc"
                                value={cmsData.fabricationCardDesc}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </p>
                          </motion.div>

                          <motion.div
                            whileHover={{ y: -6, scale: 1.02 }}
                            onClick={() => navigateToPage('product-supply')}
                            className="p-5 sm:p-6 rounded-3xl bg-[#FFF8F8] hover:bg-[#0A0A0A] group border-2 border-[#0A0A0A]/15 hover:border-[#DC2626] transition-all duration-300 cursor-pointer min-w-0 overflow-hidden"
                          >
                            <div className="text-xs font-mono uppercase tracking-wider text-[#DC2626] font-extrabold break-words">
                              <CmsEditableText
                                fieldKey="plantHireCardBadge"
                                value={cmsData.plantHireCardBadge}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </div>
                            <div className="text-base font-extrabold text-[#0A0A0A] group-hover:text-white mt-1 break-words">
                              <CmsEditableText
                                fieldKey="plantHireCardTitle"
                                value={cmsData.plantHireCardTitle}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </div>
                            <p className="text-[14px] sm:text-xs text-[#3B0707] group-hover:text-red-100 mt-1.5 leading-[1.6] break-words">
                              <CmsEditableText
                                fieldKey="plantHireCardDesc"
                                value={cmsData.plantHireCardDesc}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </p>
                          </motion.div>
                        </div>

                        <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                          <button
                            type="button"
                            onClick={() => navigateToPage('services')}
                            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-between sm:justify-center gap-3 pl-5 pr-2.5 py-2 rounded-full border-2 border-[#0A0A0A] bg-white hover:bg-[#0A0A0A] text-sm font-extrabold text-[#0A0A0A] hover:text-white hover:scale-[1.02] transition-all cursor-pointer group min-w-0"
                          >
                            <CmsEditableText
                              fieldKey="expertisePrimaryCtaLabel"
                              value={cmsData.expertisePrimaryCtaLabel}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                            <span className="w-9 h-9 rounded-full bg-[#0A0A0A] group-hover:bg-[#DC2626] text-white flex items-center justify-center transition-colors shrink-0">
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenQuoteModal(
                                'Equipment Hiring & Plant Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)'
                              )
                            }
                            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#0A0A0A] hover:bg-[#DC2626] hover:scale-[1.02] text-white text-xs sm:text-sm font-extrabold transition-all cursor-pointer min-w-0"
                          >
                            <Upload className="w-4 h-4 text-[#DC2626] shrink-0" />
                            <CmsEditableText
                              fieldKey="expertiseSecondaryCtaLabel"
                              value={cmsData.expertiseSecondaryCtaLabel}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* SECTION 2B: INTERACTIVE ENGINEERING & GAS SELF-SERVICE TOOLS LAUNCHER */}
                <section className="py-12 sm:py-16 bg-[#FFF8F8] border-b-2 border-[#0A0A0A]/10">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0A0A0A] text-[#FFFFFF] text-[11px] sm:text-xs font-mono font-extrabold uppercase tracking-wider mb-2 max-w-full">
                          <Sparkles className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                          <CmsEditableText
                            fieldKey="toolsBadge"
                            value={cmsData.toolsBadge}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />
                        </span>
                        <h2 className="text-[clamp(1.5rem,4.5vw,2.25rem)] font-extrabold text-[#0A0A0A] tracking-tight leading-[1.15] [text-wrap:balance] break-words [overflow-wrap:anywhere]">
                          <CmsEditableText
                            fieldKey="toolsTitlePrefix"
                            value={cmsData.toolsTitlePrefix}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />{' '}
                          <span className="text-[#DC2626]">
                            <CmsEditableText
                              fieldKey="toolsTitleHighlight"
                              value={cmsData.toolsTitleHighlight}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </span>{' '}
                          <CmsEditableText
                            fieldKey="toolsTitleSuffix"
                            value={cmsData.toolsTitleSuffix}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />
                        </h2>
                      </div>
                      <p className="text-[15px] sm:text-sm text-[#3B0707] max-w-md leading-[1.65] break-words">
                        <CmsEditableText
                          fieldKey="toolsSubtitle"
                          value={cmsData.toolsSubtitle}
                          isEditMode={isCmsEditMode}
                          onSelectField={setEditingCmsField}
                        />
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                      {/* Tool 1: Equipment Hire Request Tool */}
                      <motion.div
                        whileHover={{ y: -8, scale: 1.02 }}
                        onClick={() => openServicesWithSubTab('fleet')}
                        className="group bg-white hover:bg-[#0A0A0A] rounded-3xl border-2 border-[#0A0A0A] hover:border-[#DC2626] p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-md min-w-0 overflow-hidden"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <span className="px-2.5 py-1 rounded bg-[#DC2626] text-white font-mono text-[10px] font-extrabold uppercase">
                              <CmsEditableText
                                fieldKey="tool1Badge"
                                value={cmsData.tool1Badge}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </span>
                            <Truck className="w-5 h-5 text-[#DC2626] shrink-0" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-extrabold text-[#0A0A0A] group-hover:text-white transition-colors break-words">
                            <CmsEditableText
                              fieldKey="tool1Title"
                              value={cmsData.tool1Title}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </h3>
                          <p className="text-[15px] sm:text-xs text-[#3B0707] group-hover:text-red-100 mt-2 leading-[1.65] transition-colors break-words">
                            <CmsEditableText
                              fieldKey="tool1Desc"
                              value={cmsData.tool1Desc}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-[#FECACA]/50 flex items-center justify-between text-xs font-extrabold text-[#DC2626] group-hover:text-white gap-2">
                          <CmsEditableText
                            fieldKey="tool1Cta"
                            value={cmsData.tool1Cta}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                        </div>
                      </motion.div>

                      {/* Tool 2: Cylinder Services & Free Oxy-Acetylene Inspection */}
                      <motion.div
                        whileHover={{ y: -8, scale: 1.02 }}
                        onClick={() => openServicesWithSubTab('cylinder-services')}
                        className="group bg-white hover:bg-[#0A0A0A] rounded-3xl border-2 border-[#0A0A0A] hover:border-[#DC2626] p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-md min-w-0 overflow-hidden"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <span className="px-2.5 py-1 rounded bg-[#0A0A0A] group-hover:bg-[#DC2626] text-white font-mono text-[10px] font-extrabold uppercase transition-colors">
                              <CmsEditableText
                                fieldKey="tool2Badge"
                                value={cmsData.tool2Badge}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </span>
                            <ShieldCheck className="w-5 h-5 text-[#DC2626] shrink-0" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-extrabold text-[#0A0A0A] group-hover:text-white transition-colors break-words">
                            <CmsEditableText
                              fieldKey="tool2Title"
                              value={cmsData.tool2Title}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </h3>
                          <p className="text-[15px] sm:text-xs text-[#3B0707] group-hover:text-red-100 mt-2 leading-[1.65] transition-colors break-words">
                            <CmsEditableText
                              fieldKey="tool2Desc"
                              value={cmsData.tool2Desc}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-[#FECACA]/50 flex items-center justify-between text-xs font-extrabold text-[#DC2626] group-hover:text-white gap-2">
                          <CmsEditableText
                            fieldKey="tool2Cta"
                            value={cmsData.tool2Cta}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                        </div>
                      </motion.div>

                      {/* Tool 3: Gas Delivery Options Explainer */}
                      <motion.div
                        whileHover={{ y: -8, scale: 1.02 }}
                        onClick={() => navigateToPage('product-supply')}
                        className="group bg-white hover:bg-[#0A0A0A] rounded-3xl border-2 border-[#0A0A0A] hover:border-[#DC2626] p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-md min-w-0 overflow-hidden"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <span className="px-2.5 py-1 rounded bg-[#DC2626] text-white font-mono text-[10px] font-extrabold uppercase">
                              <CmsEditableText
                                fieldKey="tool3Badge"
                                value={cmsData.tool3Badge}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                            </span>
                            <Flame className="w-5 h-5 text-[#DC2626] shrink-0" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-extrabold text-[#0A0A0A] group-hover:text-white transition-colors break-words">
                            <CmsEditableText
                              fieldKey="tool3Title"
                              value={cmsData.tool3Title}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </h3>
                          <p className="text-[15px] sm:text-xs text-[#3B0707] group-hover:text-red-100 mt-2 leading-[1.65] transition-colors break-words">
                            <CmsEditableText
                              fieldKey="tool3Desc"
                              value={cmsData.tool3Desc}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-[#FECACA]/50 flex items-center justify-between text-xs font-extrabold text-[#DC2626] group-hover:text-white gap-2">
                          <CmsEditableText
                            fieldKey="tool3Cta"
                            value={cmsData.tool3Cta}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </section>

                {/* SECTION 3: DEDICATED PAGES INTERACTIVE NAVIGATION HUB */}
                <section className="py-12 sm:py-16 lg:py-24 bg-[#0A0A0A] text-white">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
                      <div className="min-w-0">
                        <span className="text-xs font-mono uppercase tracking-widest text-[#DC2626] font-extrabold block mb-2 break-words">
                          <CmsEditableText
                            fieldKey="divisionsBadge"
                            value={cmsData.divisionsBadge}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />
                        </span>
                        <h2 className="text-[clamp(1.6rem,4.5vw,2.5rem)] font-extrabold text-white tracking-tight leading-[1.15] break-words [overflow-wrap:anywhere]">
                          <CmsEditableText
                            fieldKey="divisionsTitlePrefix"
                            value={cmsData.divisionsTitlePrefix}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />{' '}
                          <span className="text-[#DC2626]">
                            <CmsEditableText
                              fieldKey="divisionsTitleHighlight"
                              value={cmsData.divisionsTitleHighlight}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </span>{' '}
                          <CmsEditableText
                            fieldKey="divisionsTitleSuffix"
                            value={cmsData.divisionsTitleSuffix}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />
                        </h2>
                      </div>
                      <p className="text-[15px] sm:text-sm text-red-100 max-w-md leading-[1.65] break-words">
                        <CmsEditableText
                          fieldKey="divisionsSubtitle"
                          value={cmsData.divisionsSubtitle}
                          isEditMode={isCmsEditMode}
                          onSelectField={setEditingCmsField}
                        />
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                      {[
                        {
                          page: 'product-supply' as PageId,
                          code: '01',
                          titleKey: 'div1Title' as EilScalarFieldKey,
                          subtitleKey: 'div1Subtitle' as EilScalarFieldKey,
                          descKey: 'div1Desc' as EilScalarFieldKey,
                          imageKey: 'div1Image' as EilScalarFieldKey,
                          icon: Layers,
                        },
                        {
                          page: 'services' as PageId,
                          code: '02',
                          titleKey: 'div2Title' as EilScalarFieldKey,
                          subtitleKey: 'div2Subtitle' as EilScalarFieldKey,
                          descKey: 'div2Desc' as EilScalarFieldKey,
                          imageKey: 'div2Image' as EilScalarFieldKey,
                          icon: Wrench,
                        },
                        {
                          page: 'how-to-buy' as PageId,
                          code: '03',
                          titleKey: 'div3Title' as EilScalarFieldKey,
                          subtitleKey: 'div3Subtitle' as EilScalarFieldKey,
                          descKey: 'div3Desc' as EilScalarFieldKey,
                          imageKey: 'div3Image' as EilScalarFieldKey,
                          icon: CreditCard,
                        },
                        {
                          page: 'contact-help' as PageId,
                          code: '04',
                          titleKey: 'div4Title' as EilScalarFieldKey,
                          subtitleKey: 'div4Subtitle' as EilScalarFieldKey,
                          descKey: 'div4Desc' as EilScalarFieldKey,
                          imageKey: 'div4Image' as EilScalarFieldKey,
                          icon: PhoneCall,
                        },
                        {
                          page: 'about-us' as PageId,
                          code: '05',
                          titleKey: 'div5Title' as EilScalarFieldKey,
                          subtitleKey: 'div5Subtitle' as EilScalarFieldKey,
                          descKey: 'div5Desc' as EilScalarFieldKey,
                          imageKey: 'div5Image' as EilScalarFieldKey,
                          icon: Building2,
                        },
                      ].map((card, idx) => {
                        const IconComponent = card.icon;
                        return (
                          <motion.div
                            key={card.page}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ duration: 0.4, delay: idx * 0.07 }}
                            whileHover={{ y: -10, scale: 1.03 }}
                            onClick={() => navigateToPage(card.page)}
                            className="group rounded-3xl overflow-hidden border-2 border-white/15 hover:border-[#DC2626] bg-[#141414] hover:bg-[#1C1C1C] flex flex-col justify-between cursor-pointer transition-colors duration-300 shadow-xl min-w-0"
                          >
                            <div className="min-w-0">
                              <div className="aspect-[16/10] sm:aspect-auto sm:h-48 relative overflow-hidden">
                                <CmsEditableImage
                                  fieldKey={card.imageKey}
                                  src={cmsData[card.imageKey]}
                                  alt={cmsData[card.titleKey]}
                                  isEditMode={isCmsEditMode}
                                  onSelectField={setEditingCmsField}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#0A0A0A]/40 to-transparent pointer-events-none" />
                                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#0A0A0A]/90 border border-white/15 text-xs font-mono font-extrabold text-[#DC2626] z-20">
                                  PAGE {card.code}
                                </div>
                                <div className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-[#DC2626] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform z-20">
                                  <IconComponent className="w-4 h-4" />
                                </div>
                              </div>
                              <div className="p-5 sm:p-6 min-w-0">
                                <div className="text-xs font-mono font-bold text-[#DC2626] uppercase tracking-wider break-words">
                                  <CmsEditableText
                                    fieldKey={card.subtitleKey}
                                    value={cmsData[card.subtitleKey]}
                                    isEditMode={isCmsEditMode}
                                    onSelectField={setEditingCmsField}
                                  />
                                </div>
                                <h3 className="text-xl font-extrabold text-white mt-1 group-hover:text-[#DC2626] transition-colors break-words">
                                  <CmsEditableText
                                    fieldKey={card.titleKey}
                                    value={cmsData[card.titleKey]}
                                    isEditMode={isCmsEditMode}
                                    onSelectField={setEditingCmsField}
                                  />
                                </h3>
                                <p className="text-[15px] sm:text-xs text-red-100/85 mt-2 leading-[1.65] break-words">
                                  <CmsEditableText
                                    fieldKey={card.descKey}
                                    value={cmsData[card.descKey]}
                                    isEditMode={isCmsEditMode}
                                    onSelectField={setEditingCmsField}
                                  />
                                </p>
                              </div>
                            </div>
                            <div
                              data-cms-ignore="true"
                              className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs font-extrabold text-white group-hover:text-[#DC2626] gap-2"
                            >
                              <span className="truncate">Open {cmsData[card.titleKey]} Page</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* 6th Card: Direct Request a Quote Trigger Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{ duration: 0.4, delay: 0.35 }}
                        whileHover={{ y: -10, scale: 1.03 }}
                        onClick={() => handleOpenQuoteModal()}
                        className="group rounded-3xl overflow-hidden border-2 border-[#DC2626] bg-[#DC2626] hover:bg-white text-white hover:text-[#0A0A0A] p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-xl min-w-0"
                      >
                        <div className="min-w-0">
                          <span className="inline-block px-3 py-1 rounded-md bg-[#0A0A0A] text-white text-xs font-mono font-extrabold uppercase">
                            <CmsEditableText
                              fieldKey="div6Badge"
                              value={cmsData.div6Badge}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </span>
                          <h3 className="text-xl sm:text-2xl font-extrabold mt-4 leading-tight break-words">
                            <CmsEditableText
                              fieldKey="div6Title"
                              value={cmsData.div6Title}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </h3>
                          <p className="text-[15px] sm:text-xs opacity-95 mt-3 leading-[1.65] break-words">
                            <CmsEditableText
                              fieldKey="div6Desc"
                              value={cmsData.div6Desc}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </p>
                        </div>
                        <div className="pt-5 mt-6 border-t border-white/25 group-hover:border-[#0A0A0A]/20 flex items-center justify-between text-sm font-extrabold gap-2">
                          <CmsEditableText
                            fieldKey="div6Cta"
                            value={cmsData.div6Cta}
                            isEditMode={isCmsEditMode}
                            onSelectField={setEditingCmsField}
                          />
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0" />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </section>

                {/* SECTION 3B: EIL POINT CARD & LOYALTY VOUCHER SPOTLIGHT ON HOMEPAGE */}
                <section className="py-12 sm:py-16 bg-white border-b-2 border-[#0A0A0A]/10">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-[#FFF8F8] rounded-3xl border-2 border-[#0A0A0A] p-5 sm:p-10 shadow-md">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-5 min-w-0">
                          <div
                            onClick={() => navigateToPage('how-to-buy')}
                            className="aspect-[16/10] w-full rounded-2xl overflow-hidden border-2 border-[#0A0A0A] bg-[#0A0A0A] relative cursor-pointer group"
                          >
                            <CmsEditableImage
                              fieldKey="pointCardImage"
                              src={cmsData.pointCardImage}
                              alt="EIL Point Card & Customer Loyalty System"
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        </div>
                        <div className="lg:col-span-7 space-y-4 min-w-0">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0A0A0A] text-white text-xs font-mono font-extrabold uppercase tracking-wider max-w-full">
                            <CreditCard className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                            <CmsEditableText
                              fieldKey="pointCardBadge"
                              value={cmsData.pointCardBadge}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </div>
                          <h3 className="text-xl sm:text-3xl font-extrabold text-[#0A0A0A] leading-tight break-words [overflow-wrap:anywhere]">
                            <CmsEditableText
                              fieldKey="pointCardHeading"
                              value={cmsData.pointCardHeading}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </h3>
                          <p className="text-[15px] sm:text-base text-[#3B0707] leading-[1.65] break-words [overflow-wrap:anywhere]">
                            <CmsEditableText
                              fieldKey="pointCardDescription"
                              value={cmsData.pointCardDescription}
                              isEditMode={isCmsEditMode}
                              onSelectField={setEditingCmsField}
                            />
                          </p>
                          <div className="pt-2 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenQuoteModal(
                                  'EIL Point Card Inquiry',
                                  'Requesting registration for a company/individual EIL Point Card cashless account.'
                                )
                              }
                              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-full bg-[#DC2626] hover:bg-[#0A0A0A] text-white text-xs sm:text-sm font-extrabold transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                            >
                              <CmsEditableText
                                fieldKey="pointCardCtaLabel"
                                value={cmsData.pointCardCtaLabel}
                                isEditMode={isCmsEditMode}
                                onSelectField={setEditingCmsField}
                              />
                              <ArrowRight className="w-4 h-4 shrink-0" />
                            </button>
                            <button
                              type="button"
                              onClick={() => navigateToPage('how-to-buy')}
                              className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-full border-2 border-[#0A0A0A] bg-white hover:bg-[#0A0A0A] text-[#0A0A0A] hover:text-white text-xs sm:text-sm font-extrabold transition-all cursor-pointer"
                            >
                              <CmsText
                                cmsKey="home_point_card_rules_btn"
                                defaultValue="View Point Card Rules & Order Options"
                                label="Point Card Rules Button"
                                section="Home — Point Card"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* HOME BOTTOM CALLOUT & CONTACTS */}
                <section className="py-12 sm:py-16 bg-[#FFF8F8]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {renderDepartmentContactsRow()}
                  </div>
                </section>
              </motion.div>
            )}

            {/* =================================================================
                PAGE 2: PRODUCT & SUPPLY
               ================================================================= */}
            {activePage === 'product-supply' && (
              <motion.div
                key="page-product-supply"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {/* Page Header Banner */}
                <div className="bg-[#0A0A0A] text-white py-10 sm:py-12 lg:py-16 border-b-4 border-[#DC2626]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                    <div className="lg:col-span-7 space-y-4">
                      {renderSubPageBackButton()}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#DC2626] text-white text-[11px] sm:text-xs font-mono font-extrabold uppercase">
                        <CmsText
                          cmsKey="ps_banner_badge"
                          defaultValue="EQUIPMENT HIRE & HAULAGE FLEET CATALOGUE · 8 FLEET LISTS"
                          label="Product & Supply Banner Badge"
                          section="Product & Supply Banner"
                        />
                      </div>
                      <h1 className="text-[clamp(1.75rem,5.5vw,3rem)] font-extrabold tracking-tight text-white leading-[1.12]">
                        <CmsText
                          cmsKey="ps_banner_title_1"
                          defaultValue="Forklifts, Excavators, Dozers, Cranes, Backhoes &"
                          label="Product & Supply Title (Part 1)"
                          section="Product & Supply Banner"
                        />{' '}
                        <span className="text-[#DC2626]">
                          <CmsText
                            cmsKey="ps_banner_title_highlight"
                            defaultValue="Haulage Fleet"
                            label="Product & Supply Title (Red Highlight)"
                            section="Product & Supply Banner"
                          />
                        </span>
                      </h1>
                      <p className="text-[15px] sm:text-base text-red-100 leading-[1.65] max-w-2xl">
                        <CmsText
                          cmsKey="ps_banner_desc"
                          defaultValue="Search EIL’s heavy equipment hiring and haulage fleet across 8 specialized categories — Forklifts of different tonnages (3T–45T), Excavators & Swamp Buggies, Dozers, Cranes, Backhoes, Lowbeds, Flatbeds, Tankers, Pneumatic Silo Trucks, and Dump Trucks — and add directly to your Enquiry Basket."
                          label="Product & Supply Banner Description"
                          section="Product & Supply Banner"
                          multiline
                        />
                      </p>
                    </div>
                    <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ y: -6, scale: 1.03 }}
                        className="aspect-[16/10] sm:aspect-auto sm:h-40 rounded-2xl overflow-hidden border-2 border-[#DC2626] relative"
                      >
                        <CmsImage
                          cmsKey="ps_banner_img_1"
                          defaultSrc="/assets/eil/pdf_img_044.jpg"
                          alt="EIL Heavy Equipment Fleet"
                          label="Product & Supply Header Image 1"
                          section="Product & Supply Banner"
                          targetWidth={800}
                          targetHeight={500}
                          aspectLabel="16:10 Header Card"
                          className="w-full h-full object-cover"
                          eager
                        />
                      </motion.div>
                      <motion.div
                        whileHover={{ y: -6, scale: 1.03 }}
                        className="aspect-[16/10] sm:aspect-auto sm:h-40 rounded-2xl overflow-hidden border-2 border-white/25 relative"
                      >
                        <CmsImage
                          cmsKey="ps_banner_img_2"
                          defaultSrc="/assets/eil/gen_lowbed_trailer.jpg"
                          alt="EIL Lowbed & Flatbed Haulage Fleet"
                          label="Product & Supply Header Image 2"
                          section="Product & Supply Banner"
                          targetWidth={800}
                          targetHeight={500}
                          aspectLabel="16:10 Header Card"
                          className="w-full h-full object-cover"
                          eager
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* 1. Interactive Gas Delivery Options Explainer & Recommender */}
                <GasDeliveryExplainerTool
                  onOpenQuoteModal={handleOpenQuoteModal}
                  onAddToEnquiry={handleAddToEnquiry}
                />

                {/* 2. Searchable Product Catalogue & Seven Stock Lists */}
                <StockCatalogueSection
                  onAddToEnquiry={handleAddToEnquiry}
                  onOpenQuoteModal={handleOpenQuoteModal}
                  basketItemIds={basketItemIds}
                  onOpenBasket={handleOpenBasketDrawer}
                />

                {/* 3. Cylinder Services (Rental, Refill, Exchange & Free Oxy-Acetylene Inspection) */}
                <CylinderServicesTool onQuoteSubmitted={handleQuoteSubmitted} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
                  {renderDepartmentContactsRow()}
                </div>
              </motion.div>
            )}

            {/* =================================================================
                PAGE 3: SERVICES
               ================================================================= */}
            {activePage === 'services' && (
              <motion.div
                key="page-services"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {/* Page Header Banner */}
                <div className="bg-[#0A0A0A] text-white py-10 sm:py-12 lg:py-16 border-b-4 border-[#DC2626]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                    <div className="lg:col-span-7 space-y-4">
                      {renderSubPageBackButton()}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#DC2626] text-white text-[11px] sm:text-xs font-mono font-extrabold uppercase">
                        <CmsText
                          cmsKey="srv_banner_badge"
                          defaultValue="SERVICES · EQUIPMENT HIRING · PLANT LEASING · HEAVY HAULAGE"
                          label="Services Page Banner Badge"
                          section="Services Banner"
                        />
                      </div>
                      <h1 className="text-[clamp(1.75rem,5.5vw,3rem)] font-extrabold tracking-tight text-white leading-[1.12]">
                        <CmsText
                          cmsKey="srv_banner_title_1"
                          defaultValue="Heavy Equipment Hiring, Plant Leasing &"
                          label="Services Banner Title (Part 1)"
                          section="Services Banner"
                        />{' '}
                        <span className="text-[#DC2626]">
                          <CmsText
                            cmsKey="srv_banner_title_highlight"
                            defaultValue="Haulage Services"
                            label="Services Banner Title (Red Highlight)"
                            section="Services Banner"
                          />
                        </span>
                      </h1>
                      <p className="text-[15px] sm:text-base text-red-100 leading-[1.65] max-w-2xl">
                        <CmsText
                          cmsKey="srv_banner_desc"
                          defaultValue={`${EIL_SLOGAN} Explore our 6 core equipment leasing and haulage services, use our Open-Ended Equipment Hire Request Tool & Fleet Specifications Gallery, book a Free Pre-Mobilization Site & Route Survey, or review our Operator, Rigging & Haulage HSE Standards.`}
                          label="Services Banner Description"
                          section="Services Banner"
                          multiline
                        />
                      </p>
                      <div
                        data-cms-ignore="true"
                        className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-1"
                      >
                        <button
                          type="button"
                          onClick={() => openServicesWithSubTab('fleet')}
                          className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-full bg-[#DC2626] hover:bg-white text-white hover:text-[#0A0A0A] text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-center"
                        >
                          Equipment Hire Tool &amp; Fleet Gallery
                        </button>
                        <button
                          type="button"
                          onClick={() => openServicesWithSubTab('cylinder-services')}
                          className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-full border border-white/30 hover:bg-white text-white hover:text-[#0A0A0A] text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-center"
                        >
                          Free Site Survey &amp; Fleet Support
                        </button>
                      </div>
                    </div>
                    <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ y: -6, scale: 1.03 }}
                        className="aspect-[16/10] sm:aspect-auto sm:h-40 rounded-2xl overflow-hidden border-2 border-[#DC2626] relative"
                      >
                        <CmsImage
                          cmsKey="srv_banner_img_1"
                          defaultSrc="/assets/eil/pdf_img_019.jpg"
                          alt="EIL Mobile Crane & Lifting Fleet"
                          label="Services Header Image 1"
                          section="Services Banner"
                          targetWidth={800}
                          targetHeight={500}
                          aspectLabel="16:10 Header Card"
                          className="w-full h-full object-cover"
                          eager
                        />
                      </motion.div>
                      <motion.div
                        whileHover={{ y: -6, scale: 1.03 }}
                        className="aspect-[16/10] sm:aspect-auto sm:h-40 rounded-2xl overflow-hidden border-2 border-white/25 relative"
                      >
                        <CmsImage
                          cmsKey="srv_banner_img_2"
                          defaultSrc="/assets/eil/pdf_img_028.jpg"
                          alt="EIL Excavator & Swamp Buggy Fleet"
                          label="Services Header Image 2"
                          section="Services Banner"
                          targetWidth={800}
                          targetHeight={500}
                          aspectLabel="16:10 Header Card"
                          className="w-full h-full object-cover"
                          eager
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <ServicesAndTrainingSection
                  onOpenQuoteModal={handleOpenQuoteModal}
                  onQuoteSubmitted={handleQuoteSubmitted}
                  initialSubTab={servicesSubTab}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 bg-[#FFF8F8]">
                  {renderDepartmentContactsRow()}
                </div>
              </motion.div>
            )}

            {/* =================================================================
                PAGE 4: HOW TO BUY
               ================================================================= */}
            {activePage === 'how-to-buy' && (
              <motion.div
                key="page-how-to-buy"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {/* Page Header Banner */}
                <div className="bg-[#0A0A0A] text-white py-10 sm:py-12 lg:py-16 border-b-4 border-[#DC2626]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                    <div className="lg:col-span-7 space-y-4">
                      {renderSubPageBackButton()}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#DC2626] text-white text-[11px] sm:text-xs font-mono font-extrabold uppercase">
                        <CmsText
                          cmsKey="htb_banner_badge"
                          defaultValue="HOW TO LEASE · OPEN-ENDED HIRE · YARD WALK-IN · FLEET PRIORITY"
                          label="How to Buy Banner Badge"
                          section="How to Buy Banner"
                        />
                      </div>
                      <h1 className="text-[clamp(1.75rem,5.5vw,3rem)] font-extrabold tracking-tight text-white leading-[1.12]">
                        <CmsText
                          cmsKey="htb_banner_title_1"
                          defaultValue="Flexible Leasing Channels &"
                          label="How to Buy Banner Title (Part 1)"
                          section="How to Buy Banner"
                        />{' '}
                        <span className="text-[#DC2626]">
                          <CmsText
                            cmsKey="htb_banner_title_highlight"
                            defaultValue="Corporate Fleet Priority"
                            label="How to Buy Banner Title (Red Highlight)"
                            section="How to Buy Banner"
                          />
                        </span>
                      </h1>
                      <p className="text-[15px] sm:text-base text-red-100 leading-[1.65] max-w-2xl">
                        <CmsText
                          cmsKey="htb_banner_desc"
                          defaultValue="Whether you are a civil, marine, or oil & gas contractor with a Corporate Fleet Account, visiting our Port Harcourt (Plot 213, Old Aba Road) or Warri (9, Etuwewe Road) yard for direct machine inspection, or booking haulage trucks — we make mobilization seamless with no fixed duration limits."
                          label="How to Buy Banner Description"
                          section="How to Buy Banner"
                          multiline
                        />
                      </p>
                    </div>
                    <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ y: -6, scale: 1.03 }}
                        className="aspect-[16/10] sm:aspect-auto sm:h-40 rounded-2xl overflow-hidden border-2 border-[#DC2626] relative"
                      >
                        <CmsImage
                          cmsKey="htb_banner_img_1"
                          defaultSrc="/assets/eil/pdf_img_192.jpg"
                          alt="EIL Forklift & Lifting Fleet"
                          label="How to Buy Header Image 1"
                          section="How to Buy Banner"
                          targetWidth={800}
                          targetHeight={500}
                          aspectLabel="16:10 Header Card"
                          className="w-full h-full object-cover"
                          eager
                        />
                      </motion.div>
                      <motion.div
                        whileHover={{ y: -6, scale: 1.03 }}
                        className="aspect-[16/10] sm:aspect-auto sm:h-40 rounded-2xl overflow-hidden border-2 border-white/25 relative"
                      >
                        <CmsImage
                          cmsKey="htb_banner_img_2"
                          defaultSrc="/assets/eil/pdf_img_021.jpg"
                          alt="EIL Heavy Haulage Dispatch"
                          label="How to Buy Header Image 2"
                          section="How to Buy Banner"
                          targetWidth={800}
                          targetHeight={500}
                          aspectLabel="16:10 Header Card"
                          className="w-full h-full object-cover"
                          eager
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <HowToBuySection
                  onOpenQuoteModal={handleOpenQuoteModal}
                  onOpenBasket={handleOpenBasketDrawer}
                  cmsData={cmsData}
                  isEditMode={isCmsEditMode}
                  onSelectCmsField={setEditingCmsField}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
                  {renderDepartmentContactsRow()}
                </div>
              </motion.div>
            )}

            {/* =================================================================
                PAGE 5: CONTACT & HELP
               ================================================================= */}
            {activePage === 'contact-help' && (
              <motion.div
                key="page-contact-help"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {/* Page Header Banner */}
                <div className="bg-[#0A0A0A] text-white py-10 sm:py-12 lg:py-16 border-b-4 border-[#DC2626]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                    <div className="lg:col-span-7 space-y-4">
                      {renderSubPageBackButton()}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#DC2626] text-white text-[11px] sm:text-xs font-mono font-extrabold uppercase">
                        <CmsText
                          cmsKey="ch_banner_badge"
                          defaultValue="CONTACT & HELP · 2 LOCATIONS (PORT HARCOURT & WARRI) · (+234) 070-3825-9142"
                          label="Contact & Help Banner Badge"
                          section="Contact & Help Banner"
                        />
                      </div>
                      <h1 className="text-[clamp(1.75rem,5.5vw,3rem)] font-extrabold tracking-tight text-white leading-[1.12]">
                        <CmsText
                          cmsKey="ch_banner_title_1"
                          defaultValue="Port Harcourt & Warri Offices &"
                          label="Contact & Help Banner Title (Part 1)"
                          section="Contact & Help Banner"
                        />{' '}
                        <span className="text-[#DC2626]">
                          <CmsText
                            cmsKey="ch_banner_title_highlight"
                            defaultValue="Fleet Quote Desk"
                            label="Contact & Help Banner Title (Red Highlight)"
                            section="Contact & Help Banner"
                          />
                        </span>
                      </h1>
                      <p className="text-[15px] sm:text-base text-red-100 leading-[1.65] max-w-2xl">
                        <CmsText
                          cmsKey="ch_banner_desc"
                          defaultValue="Visit or call our two official operational locations: Port Harcourt Head Office (Plot 213, Old Aba Road, Rumuogba-Obio) and Warri Branch Office (9, Etuwewe Road, Off Deco Road) on (+234) 070-3825-9142. Submit your equipment hire or haulage scope below for rapid quotation."
                          label="Contact & Help Banner Description"
                          section="Contact & Help Banner"
                          multiline
                        />
                      </p>
                    </div>
                    <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ y: -6, scale: 1.03 }}
                        className="aspect-[16/10] sm:aspect-auto sm:h-40 rounded-2xl overflow-hidden border-2 border-[#DC2626] relative"
                      >
                        <CmsImage
                          cmsKey="ch_banner_img_1"
                          defaultSrc="/assets/eil/pdf_img_220.jpg"
                          alt="EIL Customer Service Advisor"
                          label="Contact & Help Header Image 1"
                          section="Contact & Help Banner"
                          targetWidth={800}
                          targetHeight={500}
                          aspectLabel="16:10 Header Card"
                          className="w-full h-full object-cover"
                          eager
                        />
                      </motion.div>
                      <motion.div
                        whileHover={{ y: -6, scale: 1.03 }}
                        className="aspect-[16/10] sm:aspect-auto sm:h-40 rounded-2xl overflow-hidden border-2 border-white/25 relative"
                      >
                        <CmsImage
                          cmsKey="ch_banner_img_2"
                          defaultSrc="/assets/eil/pdf_img_222.jpg"
                          alt="EIL Technical Support Desk"
                          label="Contact & Help Header Image 2"
                          section="Contact & Help Banner"
                          targetWidth={800}
                          targetHeight={500}
                          aspectLabel="16:10 Header Card"
                          className="w-full h-full object-cover"
                          eager
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Interactive Branch & Office Locator */}
                <BranchLocatorSection />

                {/* Embedded On-Page Request a Quote & Drawing Upload Section */}
                <section className="py-12 sm:py-16 bg-white border-t-2 border-[#0A0A0A]/10">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
                    <div
                      id="embedded-quote-form"
                      className="bg-[#FFF8F8] rounded-3xl border-2 border-[#0A0A0A] shadow-lg p-5 sm:p-10"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                        <div className="lg:col-span-5 space-y-5">
                          <span className="inline-block px-3 py-1 rounded bg-[#0A0A0A] text-[#DC2626] text-xs font-mono uppercase tracking-widest font-extrabold">
                            <CmsText
                              cmsKey="ch_quote_desk_badge"
                              defaultValue="Direct Equipment Hire & Haulage Desk"
                              label="Project Quotation Desk Badge"
                              section="Contact & Help — Quote Desk"
                            />
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tracking-tight">
                            <CmsText
                              cmsKey="ch_quote_desk_title"
                              defaultValue="Submit Equipment Hire or Haulage Scope"
                              label="Project Quotation Desk Title"
                              section="Contact & Help — Quote Desk"
                            />
                          </h3>
                          <p className="text-[15px] sm:text-base text-[#3B0707] leading-[1.65]">
                            <CmsText
                              cmsKey="ch_quote_desk_desc"
                              defaultValue="Whether you need Forklifts of different tonnages, Excavators, Swamp Buggies, Dozers, Mobile Cranes, and Backhoes, or heavy road haulage using Lowbeds, Flatbeds, Tankers, Pneumatic Silo Trucks, and Dump Trucks — attach your equipment schedule, BOQ, or cargo manifest below for immediate pricing."
                              label="Project Quotation Desk Description"
                              section="Contact & Help — Quote Desk"
                              multiline
                            />
                          </p>

                          <div className="space-y-3 pt-2">
                            <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#0A0A0A]/15 flex items-start gap-3">
                              <Clock className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                              <div className="text-xs sm:text-sm text-[#3B0707] leading-[1.6]">
                                <strong className="text-[#0A0A0A] block mb-0.5">
                                  <CmsText
                                    cmsKey="ch_quote_box1_title"
                                    defaultValue="Official Opening Hours & 24/7 Special Notice"
                                    label="Quote Box 1 Title"
                                    section="Contact & Help — Quote Desk"
                                  />
                                </strong>
                                <CmsText
                                  cmsKey="ch_quote_box1_desc"
                                  defaultValue="Mon – Fri: 8:00am – 5:30pm | Sat: 8:30am – 4:00pm. On special arrangement during official hours, we operate 24/7 including Sundays and public holidays."
                                  label="Quote Box 1 Description"
                                  section="Contact & Help — Quote Desk"
                                  multiline
                                />
                              </div>
                            </div>

                            <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#0A0A0A]/15 flex items-start gap-3">
                              <FileText className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
                              <div className="text-xs sm:text-sm text-[#3B0707] leading-[1.6]">
                                <strong className="text-[#0A0A0A] block mb-0.5">
                                  <CmsText
                                    cmsKey="ch_quote_box2_title"
                                    defaultValue="Accepted Engineering Files"
                                    label="Quote Box 2 Title"
                                    section="Contact & Help — Quote Desk"
                                  />
                                </strong>
                                <CmsText
                                  cmsKey="ch_quote_box2_desc"
                                  defaultValue="Upload CAD drawings (`.dwg`, `.dxf`), isometric PDFs (`.pdf`), BOQ spreadsheets (`.xlsx`), or site photos (`.jpg`, `.png`)."
                                  label="Quote Box 2 Description"
                                  section="Contact & Help — Quote Desk"
                                  multiline
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-7">
                          {inlineSubmittedQuote ? (
                            <div className="bg-white border-2 border-[#0A0A0A] rounded-2xl p-5 sm:p-6 space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                                  <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                  <span className="text-xs font-mono font-bold text-[#DC2626]">
                                    Ref: {inlineSubmittedQuote.referenceCode}
                                  </span>
                                  <h4 className="text-lg font-extrabold text-[#0A0A0A]">
                                    Project Quote Logged Successfully
                                  </h4>
                                </div>
                              </div>
                              <p className="text-sm font-bold text-[#0A0A0A] leading-[1.65]">
                                Thank you! Your inquiry has been sent to {inlineRoutedEmail} and opened in WhatsApp for instant chat, expect to hear from our representative soon!
                              </p>
                              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                                <a
                                  href={buildDualWhatsAppUrl(
                                    {
                                      name: inlineSubmittedQuote.customerName,
                                      phone: inlineSubmittedQuote.phone,
                                      email: inlineSubmittedQuote.email,
                                      category: inlineSubmittedQuote.serviceType,
                                      message: `Ref: ${inlineSubmittedQuote.referenceCode} | Company: ${inlineSubmittedQuote.companyName} | Qty/Duration: ${inlineSubmittedQuote.quantityOrDuration} | Location: ${inlineSubmittedQuote.location}${inlineSubmittedQuote.projectNotes ? ` | Notes: ${inlineSubmittedQuote.projectNotes}` : ''}`,
                                      referenceCode: inlineSubmittedQuote.referenceCode,
                                      company: inlineSubmittedQuote.companyName,
                                      role: inlineSubmittedQuote.positionTitle,
                                      branch: inlineSubmittedQuote.preferredBranch,
                                      location: inlineSubmittedQuote.location,
                                      quantityOrSchedule: inlineSubmittedQuote.quantityOrDuration,
                                      attachmentName: inlineSubmittedQuote.attachmentName,
                                      attachmentUrl: inlineSubmittedQuote.attachmentUrl,
                                      notes: inlineSubmittedQuote.projectNotes,
                                    },
                                    inlineRoutedEmail
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#0A0A0A] text-white text-xs font-bold transition-colors"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Re-open in WhatsApp
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setInlineSubmittedQuote(null)}
                                  className="w-full sm:w-auto min-h-[48px] px-4 py-2.5 rounded-xl bg-white border-2 border-[#0A0A0A] text-xs font-bold text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-colors cursor-pointer"
                                >
                                  Submit Another Quote
                                </button>
                              </div>
                            </div>
                          ) : (
                            <form onSubmit={handleInlineQuoteSubmit} className="bg-white rounded-3xl border border-[#D4D4D8] p-5 sm:p-8 space-y-6 shadow-xs">
                              {/* Section 1: Customer Details */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0 shadow-xs">
                                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </div>
                                  <h4 className="text-base sm:text-lg font-extrabold text-[#0A0A0A] min-w-0 leading-snug">
                                    Customer Details
                                  </h4>
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
                                      value={inlineCustomerName}
                                      onChange={(e) => setInlineCustomerName(e.target.value)}
                                      placeholder="e.g. Engr. Boma Jack"
                                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626]"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                                      Company Name
                                    </label>
                                    <input
                                      type="text"
                                      value={inlineCompanyName}
                                      onChange={(e) => setInlineCompanyName(e.target.value)}
                                      placeholder="e.g. Offshore Fabrication & EPC Ltd"
                                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626]"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                                      Phone / WhatsApp Number <span className="text-[#DC2626]">*</span>
                                    </label>
                                    <input
                                      type="tel"
                                      required
                                      value={inlinePhone}
                                      onChange={(e) => setInlinePhone(e.target.value)}
                                      placeholder="+234 703 825 9142"
                                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626]"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                                      Email Address
                                    </label>
                                    <input
                                      type="email"
                                      value={inlineEmail}
                                      onChange={(e) => setInlineEmail(e.target.value)}
                                      placeholder="projects@company.com"
                                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626]"
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
                                  <h4 className="text-base sm:text-lg font-extrabold text-[#0A0A0A] min-w-0 leading-snug">
                                    Service &amp; Project Information
                                  </h4>
                                  <div className="hidden sm:block flex-1 h-[1.5px] bg-[#DC2626]" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="sm:col-span-2">
                                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                                      Inquiry Type / Department <span className="text-[#DC2626]">*</span>
                                    </label>
                                    <select
                                      value={inlineServiceType}
                                      onChange={(e) => setInlineServiceType(e.target.value)}
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
                                      value={inlineQuantityOrDuration}
                                      onChange={(e) => setInlineQuantityOrDuration(e.target.value)}
                                      placeholder="e.g. 2x Swamp Buggy / 1x 50T Crane / 60T Lowbed"
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
                                      value={inlineLocation}
                                      onChange={(e) => setInlineLocation(e.target.value)}
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
                                      value={inlinePositionTitle}
                                      onChange={(e) => setInlinePositionTitle(e.target.value)}
                                      placeholder="e.g. Project Manager / Procurement Lead"
                                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626]"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs sm:text-sm font-extrabold text-[#0A0A0A] mb-1.5">
                                      Handling EIL Branch / Yard
                                    </label>
                                    <select
                                      value={inlineBranch}
                                      onChange={(e) => setInlineBranch(e.target.value)}
                                      className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#DC2626]"
                                    >
                                      {(cmsData.branches?.length ? cmsData.branches : EIL_BRANCHES).map((b) => (
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
                                  <h4 className="text-base sm:text-lg font-extrabold text-[#0A0A0A] min-w-0 leading-snug">
                                    Upload Engineering Drawings / Specifications
                                  </h4>
                                  <div className="hidden sm:block flex-1 h-[1.5px] bg-[#DC2626]" />
                                </div>

                                <label
                                  data-cms-ignore="true"
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-5 py-4 rounded-2xl border border-dashed border-[#DC2626] bg-[#FFF0F0] hover:bg-[#FEE2E2]/60 cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    <CloudUpload className="w-9 h-9 sm:w-10 sm:h-10 text-[#DC2626] shrink-0" />
                                    <div className="min-w-0">
                                      <span className="text-xs sm:text-sm font-extrabold text-[#0A0A0A] block break-words sm:truncate">
                                        {inlineFile
                                          ? inlineFile.name
                                          : 'Click to upload CAD drawing, isometric spool sheet, or technical spec'}
                                      </span>
                                      <span className="text-xs text-[#52525B] block mt-0.5">
                                        {inlineFile
                                          ? `${(inlineFile.size / 1024).toFixed(1)} KB attached`
                                          : 'Supports PDF, DWG, DXF, Word, Excel, PNG, JPG'}
                                      </span>
                                      {inlineFile && (
                                        <span className="text-xs font-mono font-bold text-[#DC2626] block mt-1">
                                          {inlineUploadingAttachment
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
                                      handleInlineFileChange(e.target.files?.[0] ? e.target.files[0] : null)
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
                                  <h4 className="text-base sm:text-lg font-extrabold text-[#0A0A0A] min-w-0 leading-snug">
                                    Equipment Specifications, Haulage Route, or Mobilization Scope
                                  </h4>
                                  <div className="hidden sm:block flex-1 h-[1.5px] bg-[#DC2626]" />
                                </div>

                                <textarea
                                  rows={3}
                                  value={inlineNotes}
                                  onChange={(e) => setInlineNotes(e.target.value)}
                                  placeholder="Describe required machine tonnages, site terrain, lowbed/flatbed cargo dimensions, or 24/7 mobilization schedule..."
                                  className="w-full px-4 py-3 rounded-xl border border-[#D4D4D8] bg-white text-sm text-[#0A0A0A] placeholder:text-[#71717A] focus:outline-none focus:border-[#DC2626]"
                                />
                              </div>

                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                                <div className="flex items-start sm:items-center gap-2 text-xs font-medium text-[#DC2626]">
                                  <Info className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5 sm:mt-0" />
                                  <span>
                                    Need 24/7 Sunday or Public Holiday mobilization? Note it above for special arrangement.
                                  </span>
                                </div>
                                <button
                                  type="submit"
                                  disabled={inlineSubmitting || inlineUploadingAttachment}
                                  className="w-full sm:w-auto min-h-[48px] px-7 py-3.5 rounded-full bg-[#DC2626] hover:bg-[#0A0A0A] disabled:opacity-60 text-white font-extrabold text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer shrink-0"
                                >
                                  <Send className="w-4 h-4" />
                                  <span>
                                    {inlineUploadingAttachment
                                      ? 'Preparing Document Link...'
                                      : inlineSubmitting
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

                    {renderDepartmentContactsRow()}
                  </div>
                </section>
              </motion.div>
            )}

            {/* =================================================================
                PAGE 6: ABOUT US
               ================================================================= */}
            {activePage === 'about-us' && (
              <motion.div
                key="page-about-us"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {/* Page Header Banner */}
                <div className="bg-[#0A0A0A] text-white py-10 sm:py-12 lg:py-16 border-b-4 border-[#DC2626]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                    <div className="lg:col-span-7 space-y-4">
                      {renderSubPageBackButton()}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#DC2626] text-white text-[11px] sm:text-xs font-mono font-extrabold uppercase">
                        <CmsText
                          cmsKey="abt_banner_badge"
                          defaultValue="ABOUT US · EST. 2008 · INCORPORATED 2011 · PORT HARCOURT & WARRI"
                          label="About Us Banner Badge"
                          section="About Us Banner"
                        />
                      </div>
                      <h1 className="text-[clamp(1.75rem,5.5vw,3rem)] font-extrabold tracking-tight text-white leading-[1.12]">
                        <CmsText
                          cmsKey="abt_banner_title_1"
                          defaultValue="About"
                          label="About Us Banner Title (Part 1)"
                          section="About Us Banner"
                        />{' '}
                        <span className="text-[#DC2626]">
                          <CmsText
                            cmsKey="abt_banner_title_highlight"
                            defaultValue="Emmadios Industrial Limited"
                            label="About Us Banner Title (Red Highlight)"
                            section="About Us Banner"
                          />
                        </span>{' '}
                        <CmsText
                          cmsKey="abt_banner_title_2"
                          defaultValue="(EIL)"
                          label="About Us Banner Title (Part 2)"
                          section="About Us Banner"
                        />
                      </h1>
                      <p className="text-[15px] sm:text-base text-red-100 leading-[1.65] max-w-2xl">
                        <CmsText
                          cmsKey="abt_banner_desc"
                          defaultValue={`${EIL_SLOGAN} Learn about our corporate evolution from 2008 to today, our Vision & Mission, The EIL Drive (5 Core Values), and our uncompromising Equipment Leasing & Haulage Health & Safety commitment.`}
                          label="About Us Banner Description"
                          section="About Us Banner"
                          multiline
                        />
                      </p>
                    </div>
                    <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ y: -6, scale: 1.03 }}
                        className="aspect-[16/10] sm:aspect-auto sm:h-40 rounded-2xl overflow-hidden border-2 border-[#DC2626] relative"
                      >
                        <CmsImage
                          cmsKey="abt_banner_img_1"
                          defaultSrc="/assets/eil/pdf_img_027.jpg"
                          alt="EIL Heavy Equipment Fleet"
                          label="About Us Header Image 1"
                          section="About Us Banner"
                          targetWidth={800}
                          targetHeight={500}
                          aspectLabel="16:10 Header Card"
                          className="w-full h-full object-cover"
                          eager
                        />
                      </motion.div>
                      <motion.div
                        whileHover={{ y: -6, scale: 1.03 }}
                        className="aspect-[16/10] sm:aspect-auto sm:h-40 rounded-2xl overflow-hidden border-2 border-white/25 relative"
                      >
                        <CmsImage
                          cmsKey="abt_banner_img_2"
                          defaultSrc="/assets/eil/pdf_img_024.jpg"
                          alt="EIL Heavy Haulage Fleet"
                          label="About Us Header Image 2"
                          section="About Us Banner"
                          targetWidth={800}
                          targetHeight={500}
                          aspectLabel="16:10 Header Card"
                          className="w-full h-full object-cover"
                          eager
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <AboutUsSection />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
                  {renderDepartmentContactsRow()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* =====================================================================
            DARK BLACK & RED FOOTER
           ===================================================================== */}
        <footer className="bg-[#0A0A0A] text-white py-8 sm:py-10 border-t-2 border-[#DC2626]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-red-100">
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              <img
                src={resolveAssetUrl(cmsData.brandLogoUrl)}
                onError={handleBrandLogoError}
                alt="EIL Official Logo"
                onClick={handleBrandLogoClick}
                className="h-8 w-auto bg-white px-2 py-1 rounded-md object-contain shrink-0 cursor-pointer select-none"
              />
              <div className="leading-relaxed min-w-0 break-words">
                <span className="block font-extrabold text-white">
                  <CmsText
                    cmsKey="footer_copyright_text"
                    defaultValue={`© ${new Date().getFullYear()} Emmadios Industrial Limited (EIL).`}
                    label="Footer Copyright Text"
                    section="Global Footer"
                  />
                </span>
                <span className="block text-red-200 mt-0.5">
                  <CmsEditableText
                    fieldKey="brandSlogan"
                    value={cmsData.brandSlogan}
                    isEditMode={isCmsEditMode}
                    onSelectField={setEditingCmsField}
                  />
                </span>
              </div>
            </div>
          </div>
        </footer>

        {/* =====================================================================
            SLIDE-OVER DRAWERS, MODALS & STICKY CALL/WHATSAPP BAR
           ===================================================================== */}
        <div data-cms-ignore="true">
          <EnquiryBasketDrawer
            isOpen={basketDrawerOpen}
            onClose={() => setBasketDrawerOpen(false)}
            basket={basket}
            onUpdateQuantity={handleUpdateBasketQuantity}
            onRemoveItem={handleRemoveBasketItem}
            onClearBasket={handleClearBasket}
            onEnquirySubmitted={handleEnquirySubmitted}
          />

          <RequestQuoteModal
            isOpen={quoteModalOpen}
            onClose={() => setQuoteModalOpen(false)}
            initialServiceType={quoteModalPrefillService}
            initialNotes={quoteModalPrefillNotes}
            onQuoteSubmitted={handleQuoteSubmitted}
          />

          <AdminSubmissionsModal
            isOpen={adminModalOpen}
            onClose={() => setAdminModalOpen(false)}
            localQuotes={localQuotes}
            localEnquiries={localEnquiries}
          />
        </div>

        {/* =====================================================================
            STEALTH-MODE CMS ADMIN MODALS & FLOATING TOOLBAR
           ===================================================================== */}
        <StealthAdminLoginModal
          isOpen={stealthLoginModalOpen}
          onClose={() => setStealthLoginModalOpen(false)}
          onAuthenticated={() => {
            setIsAdminAuthenticated(true);
            setIsCmsEditMode(true);
            showToast('Admin CMS Portal authenticated — Edit Mode enabled across all pages.');
          }}
        />

        <CmsFieldEditorModal
          fieldKey={editingCmsField}
          universalRequest={universalEditorReq}
          cmsData={cmsData}
          onClose={() => {
            setEditingCmsField(null);
            setUniversalEditorReq(null);
          }}
          onUpdateField={handleUpdateCmsField}
        />

        <CmsAllFieldsDrawer
          isOpen={cmsAllFieldsDrawerOpen}
          onClose={() => setCmsAllFieldsDrawerOpen(false)}
          cmsData={cmsData}
          onUpdateField={handleUpdateCmsField}
          onSaveChanges={handleSaveCmsChanges}
          onRequestRestoreDefaults={() => {
            setCmsAllFieldsDrawerOpen(false);
            setRestoreConfirmModalOpen(true);
          }}
          isSaving={isSavingCms}
        />

        <RestoreDefaultsConfirmModal
          isOpen={restoreConfirmModalOpen}
          onClose={() => setRestoreConfirmModalOpen(false)}
          onConfirmRestore={handleRestoreFactoryDefaults}
        />

        <StealthAdminToolbar
          isAuthenticated={isAdminAuthenticated}
          isEditMode={isCmsEditMode}
          hasUnsavedChanges={hasUnsavedCmsChanges}
          isSaving={isSavingCms}
          onToggleEditMode={() => setIsCmsEditMode((prev) => !prev)}
          onSaveChanges={handleSaveCmsChanges}
          onOpenAllFieldsDrawer={() => setCmsAllFieldsDrawerOpen(true)}
          onRequestRestoreDefaults={() => setRestoreConfirmModalOpen(true)}
          onOpenSubmissionsLog={handleOpenAdminModal}
          onLogout={handleAdminLogout}
        />

        <div data-cms-ignore="true">
          <StickyContactBar
            basketCount={totalBasketItems}
            onOpenBasket={handleOpenBasketDrawer}
            onOpenQuote={() => handleOpenQuoteModal()}
          />
        </div>
      </div>
    </CmsContext.Provider>
  );
}
