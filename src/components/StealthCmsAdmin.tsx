import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import {
  Lock,
  Edit3,
  Save,
  RotateCcw,
  LogOut,
  X,
  Image as ImageIcon,
  Type,
  Upload,
  Sliders,
  AlertTriangle,
  Eye,
  EyeOff,
  Database,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';
import {
  EilCmsData,
  DEFAULT_EIL_CMS_DATA,
  ADMIN_SESSION_STORAGE_KEY,
} from '../data/cmsDefaults';
import { ResilientImage } from './ResilientImage';

export type EilScalarFieldKey = Exclude<
  keyof EilCmsData,
  | 'customTexts'
  | 'customImages'
  | 'stockCatalogue'
  | 'industrialGases'
  | 'deliveryOptions'
  | 'cylinderServiceModes'
  | 'servicesList'
  | 'fleetMachines'
  | 'fabricationPortfolio'
  | 'trainingCourses'
  | 'branches'
  | 'pointCardRules'
  | 'coreValues'
  | 'safetyCommitments'
>;

export interface CmsFieldDescriptor {
  key: EilScalarFieldKey;
  label: string;
  type: 'text' | 'textarea' | 'image';
  section: string;
  targetWidth?: number;
  targetHeight?: number;
  aspectLabel?: string;
  fitMode?: 'cover' | 'contain';
}

export const CMS_FIELD_DESCRIPTORS: CmsFieldDescriptor[] = [
  // Brand & Header
  {
    key: 'brandLogoUrl',
    label: 'Brand Logo Image',
    type: 'image',
    section: 'Brand & Slogan',
    targetWidth: 400,
    targetHeight: 120,
    aspectLabel: '10:3 Proportional Logo',
    fitMode: 'contain',
  },
  { key: 'brandSlogan', label: 'Company Slogan', type: 'text', section: 'Brand & Slogan' },

  // Hero Section
  { key: 'heroBadge', label: 'Hero Top Badge', type: 'text', section: 'Hero Section' },
  { key: 'heroTitlePrefix', label: 'Hero Title (Part 1)', type: 'text', section: 'Hero Section' },
  { key: 'heroTitleHighlight', label: 'Hero Title (Red Highlight)', type: 'text', section: 'Hero Section' },
  { key: 'heroTitleSuffix', label: 'Hero Title (Part 2)', type: 'text', section: 'Hero Section' },
  { key: 'heroDescriptionPart1', label: 'Hero Description (Opening)', type: 'textarea', section: 'Hero Section' },
  { key: 'heroDescriptionHighlight', label: 'Hero Description (Bold Agency Text)', type: 'text', section: 'Hero Section' },
  { key: 'heroDescriptionPart2', label: 'Hero Description (Closing)', type: 'textarea', section: 'Hero Section' },
  { key: 'heroPrimaryCtaLabel', label: 'Hero Primary Button Label', type: 'text', section: 'Hero Section' },
  { key: 'heroSecondaryCtaLabel', label: 'Hero Secondary Button Label', type: 'text', section: 'Hero Section' },

  // Hero Metric Cards & Showcase Images
  { key: 'heroMetric1Value', label: 'Metric 1 Value (e.g. 7 Lists)', type: 'text', section: 'Hero Metrics & Images' },
  { key: 'heroMetric1Label', label: 'Metric 1 Subtitle', type: 'text', section: 'Hero Metrics & Images' },
  { key: 'heroMetric2Value', label: 'Metric 2 Value (e.g. 4 Branches)', type: 'text', section: 'Hero Metrics & Images' },
  { key: 'heroMetric2Label', label: 'Metric 2 Subtitle', type: 'text', section: 'Hero Metrics & Images' },
  { key: 'heroMetric3Value', label: 'Metric 3 Value (e.g. 24/7 Ops)', type: 'text', section: 'Hero Metrics & Images' },
  { key: 'heroMetric3Label', label: 'Metric 3 Subtitle', type: 'text', section: 'Hero Metrics & Images' },
  {
    key: 'heroPrimaryImage',
    label: 'Hero Main Image',
    type: 'image',
    section: 'Hero Metrics & Images',
    targetWidth: 1200,
    targetHeight: 900,
    aspectLabel: '4:3 Landscape Showcase',
    fitMode: 'cover',
  },
  { key: 'heroPrimaryCardTitle', label: 'Hero Main Card Title', type: 'text', section: 'Hero Metrics & Images' },
  { key: 'heroPrimaryCardSubtitle', label: 'Hero Main Card Subtitle', type: 'text', section: 'Hero Metrics & Images' },
  {
    key: 'heroSecondaryTopImage',
    label: 'Hero Top-Right Image',
    type: 'image',
    section: 'Hero Metrics & Images',
    targetWidth: 800,
    targetHeight: 500,
    aspectLabel: '16:10 Landscape Card',
    fitMode: 'cover',
  },
  { key: 'heroSecondaryTopBadge', label: 'Hero Top-Right Badge', type: 'text', section: 'Hero Metrics & Images' },
  { key: 'heroSecondaryTopTitle', label: 'Hero Top-Right Title', type: 'text', section: 'Hero Metrics & Images' },
  {
    key: 'heroSecondaryBottomImage',
    label: 'Hero Bottom-Right Image',
    type: 'image',
    section: 'Hero Metrics & Images',
    targetWidth: 800,
    targetHeight: 500,
    aspectLabel: '16:10 Landscape Card',
    fitMode: 'cover',
  },
  { key: 'heroSecondaryBottomBadge', label: 'Hero Bottom-Right Badge', type: 'text', section: 'Hero Metrics & Images' },
  { key: 'heroSecondaryBottomTitle', label: 'Hero Bottom-Right Title', type: 'text', section: 'Hero Metrics & Images' },

  // Partner Strip
  { key: 'heroAgenciesIntro', label: 'Partner Agencies Strip Intro', type: 'text', section: 'Partner Agencies Strip' },
  { key: 'heroAgency1Title', label: 'Agency 1 Name', type: 'text', section: 'Partner Agencies Strip' },
  { key: 'heroAgency1Sub', label: 'Agency 1 Subtitle', type: 'text', section: 'Partner Agencies Strip' },
  { key: 'heroAgency2Title', label: 'Agency 2 Name', type: 'text', section: 'Partner Agencies Strip' },
  { key: 'heroAgency2Sub', label: 'Agency 2 Subtitle', type: 'text', section: 'Partner Agencies Strip' },
  { key: 'heroAgency3Title', label: 'Agency 3 Name', type: 'text', section: 'Partner Agencies Strip' },
  { key: 'heroAgency3Sub', label: 'Agency 3 Subtitle', type: 'text', section: 'Partner Agencies Strip' },
  { key: 'heroAgency4Title', label: 'Agency 4 Name', type: 'text', section: 'Partner Agencies Strip' },
  { key: 'heroAgency4Sub', label: 'Agency 4 Subtitle', type: 'text', section: 'Partner Agencies Strip' },
  { key: 'heroAgency5Title', label: 'Agency 5 Name', type: 'text', section: 'Partner Agencies Strip' },
  { key: 'heroAgency5Sub', label: 'Agency 5 Subtitle', type: 'text', section: 'Partner Agencies Strip' },

  // Fabrication & Expertise Section
  { key: 'expertiseTitlePrefix', label: 'Expertise Heading (Prefix)', type: 'text', section: 'Fabrication & Expertise' },
  { key: 'expertiseTitleHighlight', label: 'Expertise Heading (Red Highlight)', type: 'text', section: 'Fabrication & Expertise' },
  { key: 'expertiseTitleSuffix', label: 'Expertise Heading (Suffix)', type: 'text', section: 'Fabrication & Expertise' },
  {
    key: 'expertisePortraitImage',
    label: 'Expertise Portrait Image',
    type: 'image',
    section: 'Fabrication & Expertise',
    targetWidth: 900,
    targetHeight: 1125,
    aspectLabel: '4:5 Vertical Portrait',
    fitMode: 'cover',
  },
  { key: 'expertisePortraitBadge', label: 'Expertise Portrait Badge', type: 'text', section: 'Fabrication & Expertise' },
  { key: 'expertiseLeadParagraph', label: 'Expertise Lead Paragraph', type: 'textarea', section: 'Fabrication & Expertise' },
  { key: 'expertiseBodyParagraphPrefix', label: 'Expertise Body (Opening)', type: 'textarea', section: 'Fabrication & Expertise' },
  { key: 'expertiseBodyParagraphStrong', label: 'Expertise Body (Bold Branches)', type: 'text', section: 'Fabrication & Expertise' },
  { key: 'expertiseBodyParagraphSuffix', label: 'Expertise Body (Closing)', type: 'textarea', section: 'Fabrication & Expertise' },
  { key: 'fabricationCardBadge', label: 'Fabrication Card Badge', type: 'text', section: 'Fabrication & Expertise' },
  { key: 'fabricationCardTitle', label: 'Fabrication Card Title', type: 'text', section: 'Fabrication & Expertise' },
  { key: 'fabricationCardDesc', label: 'Fabrication Card Description', type: 'textarea', section: 'Fabrication & Expertise' },
  { key: 'plantHireCardBadge', label: 'Plant Hire Card Badge', type: 'text', section: 'Fabrication & Expertise' },
  { key: 'plantHireCardTitle', label: 'Plant Hire Card Title', type: 'text', section: 'Fabrication & Expertise' },
  { key: 'plantHireCardDesc', label: 'Plant Hire Card Description', type: 'textarea', section: 'Fabrication & Expertise' },
  { key: 'expertisePrimaryCtaLabel', label: 'Expertise Primary CTA', type: 'text', section: 'Fabrication & Expertise' },
  { key: 'expertiseSecondaryCtaLabel', label: 'Expertise Upload CTA', type: 'text', section: 'Fabrication & Expertise' },

  // Interactive Service Tools Cards
  { key: 'toolsBadge', label: 'Tools Section Badge', type: 'text', section: 'Service Tool Cards' },
  { key: 'toolsTitlePrefix', label: 'Tools Heading (Prefix)', type: 'text', section: 'Service Tool Cards' },
  { key: 'toolsTitleHighlight', label: 'Tools Heading (Red Highlight)', type: 'text', section: 'Service Tool Cards' },
  { key: 'toolsTitleSuffix', label: 'Tools Heading (Suffix)', type: 'text', section: 'Service Tool Cards' },
  { key: 'toolsSubtitle', label: 'Tools Section Subtitle', type: 'textarea', section: 'Service Tool Cards' },
  { key: 'tool1Badge', label: 'Service Tool Card 1 Badge', type: 'text', section: 'Service Tool Cards' },
  { key: 'tool1Title', label: 'Service Tool Card 1 Title', type: 'text', section: 'Service Tool Cards' },
  { key: 'tool1Desc', label: 'Service Tool Card 1 Description', type: 'textarea', section: 'Service Tool Cards' },
  { key: 'tool1Cta', label: 'Service Tool Card 1 CTA', type: 'text', section: 'Service Tool Cards' },
  { key: 'tool2Badge', label: 'Service Tool Card 2 Badge', type: 'text', section: 'Service Tool Cards' },
  { key: 'tool2Title', label: 'Service Tool Card 2 Title', type: 'text', section: 'Service Tool Cards' },
  { key: 'tool2Desc', label: 'Service Tool Card 2 Description', type: 'textarea', section: 'Service Tool Cards' },
  { key: 'tool2Cta', label: 'Service Tool Card 2 CTA', type: 'text', section: 'Service Tool Cards' },
  { key: 'tool3Badge', label: 'Service Tool Card 3 Badge', type: 'text', section: 'Service Tool Cards' },
  { key: 'tool3Title', label: 'Service Tool Card 3 Title', type: 'text', section: 'Service Tool Cards' },
  { key: 'tool3Desc', label: 'Service Tool Card 3 Description', type: 'textarea', section: 'Service Tool Cards' },
  { key: 'tool3Cta', label: 'Service Tool Card 3 CTA', type: 'text', section: 'Service Tool Cards' },

  // Division Cards & Point Card
  { key: 'divisionsBadge', label: 'Divisions Section Badge', type: 'text', section: 'Department & Point Cards' },
  { key: 'divisionsTitlePrefix', label: 'Divisions Heading (Prefix)', type: 'text', section: 'Department & Point Cards' },
  { key: 'divisionsTitleHighlight', label: 'Divisions Heading (Red Highlight)', type: 'text', section: 'Department & Point Cards' },
  { key: 'divisionsTitleSuffix', label: 'Divisions Heading (Suffix)', type: 'text', section: 'Department & Point Cards' },
  { key: 'divisionsSubtitle', label: 'Divisions Section Subtitle', type: 'textarea', section: 'Department & Point Cards' },
  { key: 'div1Title', label: 'Division 1 Title (Product & Supply)', type: 'text', section: 'Department & Point Cards' },
  { key: 'div1Subtitle', label: 'Division 1 Subtitle', type: 'text', section: 'Department & Point Cards' },
  { key: 'div1Desc', label: 'Division 1 Description', type: 'textarea', section: 'Department & Point Cards' },
  {
    key: 'div1Image',
    label: 'Division 1 Image (Product & Supply)',
    type: 'image',
    section: 'Department & Point Cards',
    targetWidth: 800,
    targetHeight: 500,
    aspectLabel: '16:10 Division Card',
    fitMode: 'cover',
  },
  { key: 'div2Title', label: 'Division 2 Title (Services)', type: 'text', section: 'Department & Point Cards' },
  { key: 'div2Subtitle', label: 'Division 2 Subtitle', type: 'text', section: 'Department & Point Cards' },
  { key: 'div2Desc', label: 'Division 2 Description', type: 'textarea', section: 'Department & Point Cards' },
  {
    key: 'div2Image',
    label: 'Division 2 Image (Services)',
    type: 'image',
    section: 'Department & Point Cards',
    targetWidth: 800,
    targetHeight: 500,
    aspectLabel: '16:10 Division Card',
    fitMode: 'cover',
  },
  { key: 'div3Title', label: 'Division 3 Title (How to Buy / Point Card)', type: 'text', section: 'Department & Point Cards' },
  { key: 'div3Subtitle', label: 'Division 3 Subtitle (Point Card)', type: 'text', section: 'Department & Point Cards' },
  { key: 'div3Desc', label: 'Division 3 Description (Point Card)', type: 'textarea', section: 'Department & Point Cards' },
  {
    key: 'div3Image',
    label: 'Division 3 Image (How to Buy / Point Card)',
    type: 'image',
    section: 'Department & Point Cards',
    targetWidth: 800,
    targetHeight: 500,
    aspectLabel: '16:10 Division Card',
    fitMode: 'cover',
  },
  { key: 'div4Title', label: 'Division 4 Title (Contact & Help)', type: 'text', section: 'Department & Point Cards' },
  { key: 'div4Subtitle', label: 'Division 4 Subtitle', type: 'text', section: 'Department & Point Cards' },
  { key: 'div4Desc', label: 'Division 4 Description', type: 'textarea', section: 'Department & Point Cards' },
  {
    key: 'div4Image',
    label: 'Division 4 Image (Contact & Help)',
    type: 'image',
    section: 'Department & Point Cards',
    targetWidth: 800,
    targetHeight: 500,
    aspectLabel: '16:10 Division Card',
    fitMode: 'cover',
  },
  { key: 'div5Title', label: 'Division 5 Title (About Us)', type: 'text', section: 'Department & Point Cards' },
  { key: 'div5Subtitle', label: 'Division 5 Subtitle', type: 'text', section: 'Department & Point Cards' },
  { key: 'div5Desc', label: 'Division 5 Description', type: 'textarea', section: 'Department & Point Cards' },
  {
    key: 'div5Image',
    label: 'Division 5 Image (About Us)',
    type: 'image',
    section: 'Department & Point Cards',
    targetWidth: 800,
    targetHeight: 500,
    aspectLabel: '16:10 Division Card',
    fitMode: 'cover',
  },
  { key: 'div6Badge', label: 'Division 6 CTA Card Badge', type: 'text', section: 'Department & Point Cards' },
  { key: 'div6Title', label: 'Division 6 CTA Card Title', type: 'text', section: 'Department & Point Cards' },
  { key: 'div6Desc', label: 'Division 6 CTA Card Description', type: 'textarea', section: 'Department & Point Cards' },
  { key: 'div6Cta', label: 'Division 6 CTA Button Text', type: 'text', section: 'Department & Point Cards' },

  // Point Card Spotlight
  { key: 'pointCardBadge', label: 'EIL Point Card Badge', type: 'text', section: 'EIL Point Card Spotlight' },
  { key: 'pointCardHeading', label: 'EIL Point Card Heading', type: 'text', section: 'EIL Point Card Spotlight' },
  { key: 'pointCardDescription', label: 'EIL Point Card Description', type: 'textarea', section: 'EIL Point Card Spotlight' },
  { key: 'pointCardCtaLabel', label: 'EIL Point Card Button Label', type: 'text', section: 'EIL Point Card Spotlight' },
  {
    key: 'pointCardImage',
    label: 'EIL Point Card Image',
    type: 'image',
    section: 'EIL Point Card Spotlight',
    targetWidth: 960,
    targetHeight: 600,
    aspectLabel: '16:10 Loyalty Card Showcase',
    fitMode: 'cover',
  },
];

// ============================================================================
// UNIVERSAL CMS EDITOR PAYLOAD & CONTEXT
// ============================================================================
export interface UniversalEditorRequest {
  type: 'text' | 'textarea' | 'image';
  label: string;
  section?: string;
  currentValue: string;
  defaultValue: string;
  targetWidth?: number;
  targetHeight?: number;
  aspectLabel?: string;
  fitMode?: 'cover' | 'contain';
  onSave: (newValue: string) => void;
}

export interface CmsContextValue {
  cmsData: EilCmsData;
  isEditMode: boolean;
  isAdminAuthenticated: boolean;
  updateCmsData: (updater: (prev: EilCmsData) => EilCmsData) => void;
  getText: (key: string, defaultValue: string) => string;
  getImage: (key: string, defaultSrc: string) => string;
  openUniversalEditor: (req: UniversalEditorRequest) => void;
  onSelectField: (fieldKey: EilScalarFieldKey) => void;
}

export const CmsContext = createContext<CmsContextValue>({
  cmsData: DEFAULT_EIL_CMS_DATA,
  isEditMode: false,
  isAdminAuthenticated: false,
  updateCmsData: () => {},
  getText: (_k, def) => def,
  getImage: (_k, def) => def,
  openUniversalEditor: () => {},
  onSelectField: () => {},
});

export const useCms = () => useContext(CmsContext);

// ============================================================================
// HTML5 CANVAS AUTO-DIMENSIONING ENGINE (SCALES UP OR DOWN EVENLY)
// ============================================================================
export interface AutoDimensionResult {
  resizedFile: File;
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
  targetWidth: number;
  targetHeight: number;
}

export async function autoDimensionImageFile(
  file: File,
  targetWidth = 1200,
  targetHeight = 900,
  fitMode: 'cover' | 'contain' = 'cover'
): Promise<AutoDimensionResult> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const originalWidth = img.naturalWidth || img.width || targetWidth;
      const originalHeight = img.naturalHeight || img.height || targetHeight;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const scale =
        fitMode === 'contain'
          ? Math.min(targetWidth / originalWidth, targetHeight / originalHeight)
          : Math.max(targetWidth / originalWidth, targetHeight / originalHeight);

      const drawWidth = Math.round(originalWidth * scale);
      const drawHeight = Math.round(originalHeight * scale);
      const offsetX = Math.round((targetWidth - drawWidth) / 2);
      const offsetY = Math.round((targetHeight - drawHeight) / 2);

      const isPngOrWebp =
        fitMode === 'contain' ||
        file.type === 'image/png' ||
        file.type === 'image/webp' ||
        file.type === 'image/svg+xml';

      if (fitMode === 'cover' && !isPngOrWebp) {
        ctx.fillStyle = '#0A0A0A';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      } else {
        ctx.clearRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      const outputMime = fitMode === 'contain' || file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = outputMime === 'image/jpeg' ? 0.85 : undefined;
      const dataUrl = canvas.toDataURL(outputMime, quality);

      canvas.toBlob(
        (blob) => {
          const ext = outputMime === 'image/png' ? 'png' : 'jpg';
          const baseName = file.name.replace(/\.[^/.]+$/, '') || 'eil_cms_image';
          const resizedFile = blob
            ? new File([blob], `${baseName}_${targetWidth}x${targetHeight}.${ext}`, {
                type: outputMime,
              })
            : file;

          resolve({
            resizedFile,
            dataUrl,
            originalWidth,
            originalHeight,
            targetWidth,
            targetHeight,
          });
        },
        outputMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode selected image file'));
    };

    img.src = objectUrl;
  });
}

// ============================================================================
// 1. INLINE EDITABLE TEXT & IMAGE WRAPPERS (SCALAR & UNIVERSAL)
// ============================================================================
interface CmsEditableTextProps {
  fieldKey: EilScalarFieldKey;
  value: string;
  isEditMode: boolean;
  onSelectField: (fieldKey: EilScalarFieldKey) => void;
  className?: string;
  as?: 'span' | 'div' | 'p';
}

export const CmsEditableText: React.FC<CmsEditableTextProps> = ({
  fieldKey,
  value,
  isEditMode,
  onSelectField,
  className = '',
  as: Component = 'span',
}) => {
  const safeClasses = `break-words [overflow-wrap:anywhere] min-w-0 max-w-full ${className}`;

  if (!isEditMode) {
    return (
      <Component data-cms-explicit="true" className={safeClasses}>
        {value}
      </Component>
    );
  }

  return (
    <Component
      data-cms-explicit="true"
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onSelectField(fieldKey);
      }}
      title={`Click to edit: ${String(fieldKey)}`}
      className={`${safeClasses} relative inline-block rounded-md outline-2 outline-dashed outline-[#10B981] bg-[#10B981]/10 hover:bg-[#10B981]/25 px-1 -mx-0.5 cursor-pointer transition-all`}
    >
      {value}
      <span className="inline-flex items-center justify-center ml-1.5 px-1.5 py-0.5 rounded bg-[#0A0A0A] text-[#10B981] text-[9px] font-mono font-extrabold uppercase tracking-wider align-middle shadow-xs">
        <Edit3 className="w-2.5 h-2.5 mr-0.5" />
        Edit
      </span>
    </Component>
  );
};

interface CmsEditableImageProps {
  fieldKey: EilScalarFieldKey;
  src: string;
  alt: string;
  isEditMode: boolean;
  onSelectField: (fieldKey: EilScalarFieldKey) => void;
  className?: string;
  eager?: boolean;
}

export const CmsEditableImage: React.FC<CmsEditableImageProps> = ({
  fieldKey,
  src,
  alt,
  isEditMode,
  onSelectField,
  className = 'w-full h-full object-cover',
  eager = false,
}) => {
  const descriptor = CMS_FIELD_DESCRIPTORS.find((d) => d.key === fieldKey);
  const targetW = descriptor?.targetWidth || 1200;
  const targetH = descriptor?.targetHeight || 900;
  const aspectLabel = descriptor?.aspectLabel || 'Auto-Fit';

  return (
    <div data-cms-explicit="true" className="relative w-full h-full overflow-hidden">
      <ResilientImage
        src={src}
        alt={alt}
        className={`${className} object-cover w-full h-full`}
        eager={eager}
      />
      {isEditMode && (
        <button
          type="button"
          data-cms-explicit="true"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelectField(fieldKey);
          }}
          className="absolute inset-0 z-30 bg-[#0A0A0A]/55 hover:bg-[#0A0A0A]/75 border-4 border-dashed border-[#10B981] flex flex-col items-center justify-start pt-2.5 sm:pt-3.5 px-2 pb-2 gap-1 text-white transition-all cursor-pointer text-center"
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981] text-[#0A0A0A] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider shadow-lg">
            <Upload className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>Change Image</span>
          </span>
          <span className="text-[10px] font-mono font-bold text-[#10B981] bg-[#0A0A0A]/90 border border-[#10B981]/40 px-2 py-0.5 rounded-md max-w-full truncate">
            {targetW}×{targetH}px ({aspectLabel}) · Auto-Fit
          </span>
        </button>
      )}
    </div>
  );
};

// ============================================================================
// 1B. UNIVERSAL <CmsText> & <CmsImage> FOR ANY PAGE, SUB-TAB, OR DYNAMIC LIST
// ============================================================================
interface CmsTextProps {
  cmsKey?: string;
  value?: string;
  defaultValue: string;
  label?: string;
  section?: string;
  multiline?: boolean;
  onSave?: (newValue: string) => void;
  className?: string;
  as?: 'span' | 'div' | 'p';
}

export const CmsText: React.FC<CmsTextProps> = ({
  cmsKey,
  value,
  defaultValue,
  label = 'Content Text',
  section = 'Page Content',
  multiline = false,
  onSave,
  className = '',
  as: Component = 'span',
}) => {
  const { isEditMode, getText, updateCmsData, openUniversalEditor } = useCms();
  const resolvedValue =
    value !== undefined
      ? value
      : cmsKey
      ? getText(cmsKey, defaultValue)
      : defaultValue;

  const safeClasses = `break-words [overflow-wrap:anywhere] min-w-0 max-w-full ${className}`;

  if (!isEditMode) {
    return (
      <Component data-cms-explicit="true" className={safeClasses}>
        {resolvedValue}
      </Component>
    );
  }

  return (
    <Component
      data-cms-explicit="true"
      onClick={(e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openUniversalEditor({
          type: multiline || resolvedValue.length > 85 ? 'textarea' : 'text',
          label,
          section,
          currentValue: resolvedValue,
          defaultValue,
          onSave: (newVal) => {
            if (onSave) {
              onSave(newVal);
            } else if (cmsKey) {
              updateCmsData((prev) => ({
                ...prev,
                customTexts: {
                  ...prev.customTexts,
                  [cmsKey]: newVal,
                },
              }));
            }
          },
        });
      }}
      title={`Click to edit: ${label}`}
      className={`${safeClasses} relative inline-block rounded-md outline-2 outline-dashed outline-[#10B981] bg-[#10B981]/10 hover:bg-[#10B981]/25 px-1 -mx-0.5 cursor-pointer transition-all`}
    >
      {resolvedValue}
      <span className="inline-flex items-center justify-center ml-1.5 px-1.5 py-0.5 rounded bg-[#0A0A0A] text-[#10B981] text-[9px] font-mono font-extrabold uppercase tracking-wider align-middle shadow-xs">
        <Edit3 className="w-2.5 h-2.5 mr-0.5" />
        Edit
      </span>
    </Component>
  );
};

interface CmsImageProps {
  cmsKey?: string;
  src?: string;
  defaultSrc: string;
  alt: string;
  label?: string;
  section?: string;
  targetWidth?: number;
  targetHeight?: number;
  aspectLabel?: string;
  fitMode?: 'cover' | 'contain';
  onSave?: (newSrc: string) => void;
  className?: string;
  eager?: boolean;
}

export const CmsImage: React.FC<CmsImageProps> = ({
  cmsKey,
  src,
  defaultSrc,
  alt,
  label = 'Section Image',
  section = 'Page Visuals',
  targetWidth = 960,
  targetHeight = 600,
  aspectLabel = '16:10 Landscape',
  fitMode = 'cover',
  onSave,
  className = 'w-full h-full object-cover',
  eager = false,
}) => {
  const { isEditMode, getImage, updateCmsData, openUniversalEditor } = useCms();
  const resolvedSrc =
    src !== undefined ? src : cmsKey ? getImage(cmsKey, defaultSrc) : defaultSrc;

  return (
    <div data-cms-explicit="true" className="relative w-full h-full overflow-hidden">
      <ResilientImage
        src={resolvedSrc}
        alt={alt}
        className={`${className} object-cover w-full h-full`}
        eager={eager}
      />
      {isEditMode && (
        <button
          type="button"
          data-cms-explicit="true"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openUniversalEditor({
              type: 'image',
              label,
              section,
              currentValue: resolvedSrc,
              defaultValue: defaultSrc,
              targetWidth,
              targetHeight,
              aspectLabel,
              fitMode,
              onSave: (newVal) => {
                if (onSave) {
                  onSave(newVal);
                } else if (cmsKey) {
                  updateCmsData((prev) => ({
                    ...prev,
                    customImages: {
                      ...prev.customImages,
                      [cmsKey]: newVal,
                    },
                  }));
                }
              },
            });
          }}
          className="absolute inset-0 z-30 bg-[#0A0A0A]/55 hover:bg-[#0A0A0A]/75 border-4 border-dashed border-[#10B981] flex flex-col items-center justify-start pt-2.5 sm:pt-3.5 px-2 pb-2 gap-1 text-white transition-all cursor-pointer text-center"
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981] text-[#0A0A0A] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider shadow-lg">
            <Upload className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>Change Image</span>
          </span>
          <span className="text-[10px] font-mono font-bold text-[#10B981] bg-[#0A0A0A]/90 border border-[#10B981]/40 px-2 py-0.5 rounded-md max-w-full truncate">
            {targetWidth}×{targetHeight}px ({aspectLabel}) · Auto-Fit
          </span>
        </button>
      )}
    </div>
  );
};

// ============================================================================
// 1C. UNIVERSAL DOM CLICK-TO-EDIT INSPECTOR (GUARANTEES 100% PAGE COVERAGE)
// ============================================================================
function computeElementCmsKey(el: HTMLElement, pageKey: string): string {
  if (el.dataset.cmsDomKey) {
    return el.dataset.cmsDomKey;
  }
  const tag = el.tagName.toLowerCase();
  if (tag === 'img') {
    const imgEl = el as HTMLImageElement;
    const origSrc = imgEl.dataset.cmsOrigSrc || imgEl.getAttribute('src') || 'img';
    const altText = (imgEl.getAttribute('alt') || '').slice(0, 40).replace(/\s+/g, '_');
    const key = `dom_img_${pageKey}_${altText}_${origSrc.slice(-28)}`;
    el.dataset.cmsDomKey = key;
    if (!imgEl.dataset.cmsOrigSrc) {
      imgEl.dataset.cmsOrigSrc = origSrc;
    }
    return key;
  }
  const origText = (el.dataset.cmsOrigText || el.innerText || '').trim();
  if (!el.dataset.cmsOrigText && origText) {
    el.dataset.cmsOrigText = origText;
  }
  const slug = origText
    .slice(0, 48)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  // Include sibling index for uniqueness
  const parentTag = el.parentElement?.tagName.toLowerCase() || 'root';
  const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
  const idx = siblings.indexOf(el);
  const key = `dom_txt_${pageKey}_${parentTag}_${tag}_${idx}_${slug}`;
  el.dataset.cmsDomKey = key;
  return key;
}

function isEligibleLeafTextElement(el: HTMLElement): boolean {
  if (el.closest('[data-cms-ignore="true"]') || el.closest('[data-cms-explicit="true"]')) {
    return false;
  }
  const tag = el.tagName.toLowerCase();
  const allowedTags = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'span',
    'li',
    'strong',
    'em',
    'td',
    'th',
    'label',
    'a',
    'button',
    'div',
  ];
  if (!allowedTags.includes(tag)) return false;
  if (el.closest('input, select, textarea, iframe, svg')) return false;

  // Must have non-empty direct text content and no block-level element children with their own text
  const childElements = Array.from(el.children) as HTMLElement[];
  const hasNestedTextElements = childElements.some((child) => {
    const cTag = child.tagName.toLowerCase();
    if (cTag === 'svg' || cTag === 'path' || cTag === 'br' || cTag === 'img') return false;
    return (child.innerText || '').trim().length > 0;
  });
  if (hasNestedTextElements) return false;

  const text = (el.innerText || '').trim();
  return text.length > 0;
}

export const UniversalDomCmsInspector: React.FC<{ activePageKey: string }> = ({
  activePageKey,
}) => {
  const { cmsData, isEditMode, updateCmsData, openUniversalEditor } = useCms();

  // Apply stored customTexts & customImages overrides + decorate elements in Edit Mode
  const syncDomOverridesAndDecorations = useCallback(() => {
    const root = document.getElementById('eil-site-root');
    if (!root) return;

    // 1. Process all <img> elements not inside [data-cms-explicit] or [data-cms-ignore]
    const images = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
    for (const img of images) {
      if (img.closest('[data-cms-explicit="true"]') || img.closest('[data-cms-ignore="true"]')) {
        continue;
      }
      const key = computeElementCmsKey(img, activePageKey);
      const overrideSrc = cmsData.customImages?.[key];
      const origSrc = img.dataset.cmsOrigSrc || img.getAttribute('src') || '';
      if (overrideSrc && img.getAttribute('src') !== overrideSrc) {
        img.setAttribute('src', overrideSrc);
      } else if (!overrideSrc && origSrc && img.getAttribute('src') !== origSrc) {
        img.setAttribute('src', origSrc);
      }

      if (isEditMode) {
        img.classList.add(
          'outline-3',
          'outline-dashed',
          'outline-[#10B981]',
          'cursor-pointer',
          'hover:opacity-85',
          'transition-all'
        );
        img.title = 'Click to change image (Auto-Dimensioned)';
      } else {
        img.classList.remove(
          'outline-3',
          'outline-dashed',
          'outline-[#10B981]',
          'cursor-pointer',
          'hover:opacity-85'
        );
        if (img.title === 'Click to change image (Auto-Dimensioned)') {
          img.removeAttribute('title');
        }
      }
    }

    // 2. Process all eligible leaf text elements
    const allElements = Array.from(
      root.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,li,strong,em,td,th,label,a,button,div')
    ) as HTMLElement[];

    for (const el of allElements) {
      if (!isEligibleLeafTextElement(el)) {
        if (el.dataset.cmsDecorated === 'true') {
          el.classList.remove(
            'outline-1',
            'outline-dashed',
            'outline-[#10B981]',
            'bg-[#10B981]/10',
            'hover:bg-[#10B981]/25',
            'rounded-xs',
            'cursor-pointer'
          );
          delete el.dataset.cmsDecorated;
        }
        continue;
      }

      const key = computeElementCmsKey(el, activePageKey);
      const overrideText = cmsData.customTexts?.[key];
      const origText = el.dataset.cmsOrigText;

      // Preserve any child SVG icons while updating text nodes
      const updateElementTextNode = (targetText: string) => {
        const textNodes = Array.from(el.childNodes).filter(
          (n) => n.nodeType === Node.TEXT_NODE && (n.textContent || '').trim().length > 0
        );
        if (textNodes.length > 0) {
          textNodes[0].textContent = targetText;
          for (let i = 1; i < textNodes.length; i++) {
            textNodes[i].textContent = '';
          }
        } else if (el.children.length === 0) {
          el.innerText = targetText;
        }
      };

      if (overrideText !== undefined && (el.innerText || '').trim() !== overrideText) {
        updateElementTextNode(overrideText);
      } else if (
        overrideText === undefined &&
        origText !== undefined &&
        (el.innerText || '').trim() !== origText
      ) {
        updateElementTextNode(origText);
      }

      if (isEditMode) {
        el.dataset.cmsDecorated = 'true';
        el.classList.add(
          'outline-1',
          'outline-dashed',
          'outline-[#10B981]',
          'bg-[#10B981]/10',
          'hover:bg-[#10B981]/25',
          'rounded-xs',
          'cursor-pointer'
        );
      } else if (el.dataset.cmsDecorated === 'true') {
        el.classList.remove(
          'outline-1',
          'outline-dashed',
          'outline-[#10B981]',
          'bg-[#10B981]/10',
          'hover:bg-[#10B981]/25',
          'rounded-xs',
          'cursor-pointer'
        );
        delete el.dataset.cmsDecorated;
      }
    }
  }, [activePageKey, cmsData.customTexts, cmsData.customImages, isEditMode]);

  useEffect(() => {
    const timer1 = setTimeout(syncDomOverridesAndDecorations, 40);
    const timer2 = setTimeout(syncDomOverridesAndDecorations, 350);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [syncDomOverridesAndDecorations]);

  // Global click interceptor when Edit Mode is ON for DOM-decorated elements
  useEffect(() => {
    if (!isEditMode) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Ignore clicks inside admin modals/toolbars or explicit CMS wrappers
      if (
        target.closest('[data-cms-ignore="true"]') ||
        target.closest('[data-cms-explicit="true"]')
      ) {
        return;
      }

      // Check if user clicked an <img>
      const clickedImg = target.closest('img') as HTMLImageElement | null;
      if (
        clickedImg &&
        !clickedImg.closest('[data-cms-explicit="true"]') &&
        !clickedImg.closest('[data-cms-ignore="true"]')
      ) {
        e.preventDefault();
        e.stopPropagation();
        const key = computeElementCmsKey(clickedImg, activePageKey);
        const origSrc = clickedImg.dataset.cmsOrigSrc || clickedImg.getAttribute('src') || '';
        const currentSrc = cmsData.customImages?.[key] || clickedImg.getAttribute('src') || origSrc;
        const rect = clickedImg.getBoundingClientRect();
        const targetW = rect.width > 60 ? Math.round(rect.width * 2) : 800;
        const targetH = rect.height > 40 ? Math.round(rect.height * 2) : 500;

        openUniversalEditor({
          type: 'image',
          label: clickedImg.alt || 'Page Image',
          section: `Page: ${activePageKey.toUpperCase()}`,
          currentValue: currentSrc,
          defaultValue: origSrc,
          targetWidth: targetW,
          targetHeight: targetH,
          aspectLabel: 'Auto-Matched Slot',
          fitMode: 'cover',
          onSave: (newVal) => {
            updateCmsData((prev) => ({
              ...prev,
              customImages: {
                ...prev.customImages,
                [key]: newVal,
              },
            }));
          },
        });
        return;
      }

      // Check if user clicked a decorated leaf text element
      const decoratedEl = target.closest('[data-cms-decorated="true"]') as HTMLElement | null;
      if (decoratedEl) {
        // Allow tab switching buttons to switch tabs if they have data-cms-allow-click, otherwise edit text
        e.preventDefault();
        e.stopPropagation();
        const key = computeElementCmsKey(decoratedEl, activePageKey);
        const origText = (decoratedEl.dataset.cmsOrigText || decoratedEl.innerText || '').trim();
        const currentText = cmsData.customTexts?.[key] ?? (decoratedEl.innerText || '').trim();

        openUniversalEditor({
          type: currentText.length > 80 ? 'textarea' : 'text',
          label: origText.slice(0, 42) || 'Text Element',
          section: `Page: ${activePageKey.toUpperCase()}`,
          currentValue: currentText,
          defaultValue: origText,
          onSave: (newVal) => {
            updateCmsData((prev) => ({
              ...prev,
              customTexts: {
                ...prev.customTexts,
                [key]: newVal,
              },
            }));
          },
        });
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [isEditMode, activePageKey, cmsData.customImages, cmsData.customTexts, openUniversalEditor, updateCmsData]);

  return null;
};

// ============================================================================
// 2. STEALTH ADMIN LOGIN MODAL (TRIGGERED BY 10 LOGO TAPS)
// ============================================================================
interface StealthAdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export const StealthAdminLoginModal: React.FC<StealthAdminLoginModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setShowPassword(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'Admin' && password === 'Emmadiossince2008') {
      const token = `eil_cms_auth_${Date.now()}`;
      try {
        localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, token);
      } catch {
        // ignore storage errors
      }
      setErrorMsg(null);
      onAuthenticated();
      onClose();
    } else {
      setErrorMsg('Invalid Admin credentials. Please verify your username and password.');
    }
  };

  return (
    <div
      data-cms-ignore="true"
      className="fixed inset-0 z-[70] bg-[#0A0A0A]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="w-full max-w-md max-h-[90vh] bg-white rounded-3xl border-2 border-[#0A0A0A] shadow-2xl overflow-hidden flex flex-col my-auto">
        <div className="bg-[#0A0A0A] text-white px-6 py-5 border-b-2 border-[#DC2626] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DC2626] text-white flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#10B981] font-extrabold block">
                ADMIN CMS PORTAL · EIL
              </span>
              <h3 className="text-lg font-extrabold text-white leading-tight">
                Authorized Admin Sign-In
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#DC2626] text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Admin Login"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#DC2626] text-xs font-bold text-[#DC2626] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-[#0A0A0A] uppercase tracking-wider mb-1.5">
              Admin Username
            </label>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Admin Username"
              className="w-full px-4 py-3 rounded-xl border-2 border-[#0A0A0A]/20 focus:border-[#DC2626] text-sm font-semibold text-[#0A0A0A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#0A0A0A] uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Admin Password"
                className="w-full pl-4 pr-11 py-3 rounded-xl border-2 border-[#0A0A0A]/20 focus:border-[#DC2626] text-sm font-semibold text-[#0A0A0A] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 px-3.5 flex items-center justify-center text-[#0A0A0A]/55 hover:text-[#DC2626] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs font-extrabold text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#0A0A0A] text-white text-xs font-extrabold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
            >
              Unlock CMS Toolbar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 3. SINGLE FIELD & UNIVERSAL EDITOR MODAL (TEXT OR AUTO-DIMENSIONED IMAGE)
// ============================================================================
interface CmsFieldEditorModalProps {
  fieldKey: EilScalarFieldKey | null;
  universalRequest?: UniversalEditorRequest | null;
  cmsData: EilCmsData;
  onClose: () => void;
  onUpdateField: (key: EilScalarFieldKey, newValue: string) => void;
}

export const CmsFieldEditorModal: React.FC<CmsFieldEditorModalProps> = ({
  fieldKey,
  universalRequest = null,
  cmsData,
  onClose,
  onUpdateField,
}) => {
  const descriptor = fieldKey ? CMS_FIELD_DESCRIPTORS.find((d) => d.key === fieldKey) : null;
  const [draftValue, setDraftValue] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    if (universalRequest) {
      setDraftValue(universalRequest.currentValue || '');
      setUploadStatus(null);
    } else if (fieldKey) {
      setDraftValue((cmsData[fieldKey] as string) || '');
      setUploadStatus(null);
    }
  }, [fieldKey, universalRequest, cmsData]);

  const activeConfig = universalRequest
    ? {
        type: universalRequest.type,
        label: universalRequest.label,
        section: universalRequest.section || 'Site Content Editor',
        defaultValue: universalRequest.defaultValue,
        targetWidth: universalRequest.targetWidth || 1200,
        targetHeight: universalRequest.targetHeight || 900,
        aspectLabel: universalRequest.aspectLabel || '4:3 Landscape',
        fitMode: universalRequest.fitMode || 'cover',
      }
    : descriptor && fieldKey
    ? {
        type: descriptor.type,
        label: descriptor.label,
        section: descriptor.section,
        defaultValue: DEFAULT_EIL_CMS_DATA[fieldKey] as string,
        targetWidth: descriptor.targetWidth || 1200,
        targetHeight: descriptor.targetHeight || 900,
        aspectLabel: descriptor.aspectLabel || '4:3 Landscape',
        fitMode: descriptor.fitMode || 'cover',
      }
    : null;

  if (!activeConfig) return null;

  const {
    type,
    label,
    section,
    defaultValue,
    targetWidth,
    targetHeight,
    aspectLabel,
    fitMode,
  } = activeConfig;

  const handleImageFileUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingImage(true);
    setUploadStatus(
      `Auto-dimensioning image to ${targetWidth} × ${targetHeight} px...`
    );

    try {
      const dimResult = await autoDimensionImageFile(
        file,
        targetWidth,
        targetHeight,
        fitMode
      );

      setDraftValue(dimResult.dataUrl);
      setUploadStatus(
        `Auto-dimensioned (${dimResult.originalWidth}×${dimResult.originalHeight} px → ${dimResult.targetWidth}×${dimResult.targetHeight} px) and ready! Click "Apply Field Update" below.`
      );
      setUploadingImage(false);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setDraftValue(reader.result);
          setUploadStatus('Image loaded from device! Click "Apply Field Update" below.');
        }
        setUploadingImage(false);
      };
      reader.onerror = () => {
        setUploadStatus('Could not read file. Please try another image file.');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (universalRequest) {
      universalRequest.onSave(draftValue);
    } else if (fieldKey) {
      onUpdateField(fieldKey, draftValue);
    }
    onClose();
  };

  return (
    <div
      data-cms-ignore="true"
      className="fixed inset-0 z-[70] bg-[#0A0A0A]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="w-full max-w-lg max-h-[90vh] bg-white rounded-3xl border-2 border-[#0A0A0A] shadow-2xl overflow-hidden flex flex-col my-auto">
        <div className="bg-[#0A0A0A] text-white px-5 sm:px-6 py-4 border-b-2 border-[#10B981] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {type === 'image' ? (
              <ImageIcon className="w-5 h-5 text-[#10B981] shrink-0" />
            ) : (
              <Type className="w-5 h-5 text-[#10B981] shrink-0" />
            )}
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#10B981] font-extrabold block">
                {section}
              </span>
              <h3 className="text-base font-extrabold text-white truncate">
                Edit: {label}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#DC2626] text-white flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
          {type === 'image' ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border-2 border-[#10B981] space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#065F46]">
                    <Maximize2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span>
                      Required Dimensions: {targetWidth} × {targetHeight} px ({aspectLabel})
                    </span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#10B981] text-[#0A0A0A] font-mono text-[10px] font-extrabold uppercase">
                    Auto-Resize Active
                  </span>
                </div>
                <p className="text-[11px] text-[#065F46] leading-relaxed">
                  Upload any image size from your device — the system automatically scales it evenly (up or down) to fit the exact <strong>{targetWidth} × {targetHeight} px</strong> slot requirement without breaking the page layout.
                </p>
              </div>

              <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden border-2 border-[#0A0A0A] bg-[#0A0A0A] relative flex items-center justify-center">
                <ResilientImage
                  src={draftValue || defaultValue}
                  alt={label}
                  className={`w-full h-full ${
                    fitMode === 'contain' ? 'object-contain p-4 bg-white' : 'object-cover'
                  }`}
                />
                <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-[#0A0A0A]/85 text-[#10B981] font-mono text-[10px] font-bold border border-[#10B981]/40">
                  Target Output: {targetWidth} × {targetHeight} px
                </span>
              </div>

              <label className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border-2 border-dashed border-[#DC2626] bg-[#FFF8F8] hover:bg-[#FEE2E2]/50 cursor-pointer transition-colors shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-extrabold text-[#0A0A0A] block truncate">
                      {uploadingImage
                        ? 'Auto-Dimensioning & Uploading...'
                        : 'Upload New Image File from Your Device'}
                    </span>
                    <span className="text-[11px] text-[#71717A] block">
                      PNG, JPG, WEBP · Automatically scaled to {targetWidth} × {targetHeight} px
                    </span>
                  </div>
                </div>
                <span className="px-3.5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#0A0A0A] text-white text-xs font-extrabold shrink-0 transition-colors">
                  Choose File
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageFileUpload(e.target.files?.[0] ? e.target.files[0] : null)
                  }
                  className="hidden"
                />
              </label>

              {uploadStatus && (
                <div className="text-xs font-bold text-[#065F46] bg-[#ECFDF5] border border-[#10B981] px-3.5 py-2.5 rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                  <span>{uploadStatus}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-extrabold text-[#52525B] uppercase tracking-wider mb-1">
                  Or Paste Direct Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={draftValue.startsWith('data:') ? '' : draftValue}
                  onChange={(e) => setDraftValue(e.target.value)}
                  placeholder={
                    draftValue.startsWith('data:')
                      ? 'Using auto-dimensioned uploaded device image'
                      : 'https://... or /assets/eil/...'
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-[#0A0A0A]/20 focus:border-[#DC2626] text-xs font-mono text-[#0A0A0A] focus:outline-none"
                />
              </div>
            </div>
          ) : type === 'textarea' ? (
            <div>
              <label className="block text-xs font-extrabold text-[#0A0A0A] uppercase tracking-wider mb-1.5">
                Content Text
              </label>
              <textarea
                rows={4}
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#0A0A0A]/20 focus:border-[#DC2626] text-sm text-[#0A0A0A] leading-relaxed focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-extrabold text-[#0A0A0A] uppercase tracking-wider mb-1.5">
                Text Value
              </label>
              <input
                type="text"
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#0A0A0A]/20 focus:border-[#DC2626] text-sm font-semibold text-[#0A0A0A] focus:outline-none"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#0A0A0A]/10">
            <button
              type="button"
              onClick={() => {
                setDraftValue(defaultValue);
                setUploadStatus('Reverted this field to factory default.');
              }}
              className="text-xs font-bold text-[#DC2626] hover:underline cursor-pointer"
            >
              Reset this field to default
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#0A0A0A]/20 text-xs font-bold text-[#0A0A0A] hover:bg-[#F4F4F5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingImage}
                className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Apply Field Update
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 4. ALL CMS FIELDS DRAWER (BULK EDITOR WITH DEVICE UPLOAD & AUTO-DIMENSIONING)
// ============================================================================
interface CmsAllFieldsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cmsData: EilCmsData;
  onUpdateField: (key: EilScalarFieldKey, newValue: string) => void;
  onSaveChanges: () => void;
  onRequestRestoreDefaults: () => void;
  isSaving: boolean;
}

export const CmsAllFieldsDrawer: React.FC<CmsAllFieldsDrawerProps> = ({
  isOpen,
  onClose,
  cmsData,
  onUpdateField,
  onSaveChanges,
  onRequestRestoreDefaults,
  isSaving,
}) => {
  const sections = Array.from(new Set(CMS_FIELD_DESCRIPTORS.map((d) => d.section)));
  const [activeSection, setActiveSection] = useState<string>(sections[0]);
  const [uploadingKey, setUploadingKey] = useState<EilScalarFieldKey | null>(null);
  const [drawerUploadNotes, setDrawerUploadNotes] = useState<
    Partial<Record<EilScalarFieldKey, string>>
  >({});

  if (!isOpen) return null;

  const sectionFields = CMS_FIELD_DESCRIPTORS.filter((d) => d.section === activeSection);

  const handleDrawerDeviceUpload = async (
    field: CmsFieldDescriptor,
    file: File | null
  ) => {
    if (!file) return;
    const targetW = field.targetWidth || 1200;
    const targetH = field.targetHeight || 900;
    const fitMode = field.fitMode || 'cover';

    setUploadingKey(field.key);
    setDrawerUploadNotes((prev) => ({
      ...prev,
      [field.key]: `Auto-dimensioning to ${targetW} × ${targetH} px...`,
    }));

    try {
      const dimResult = await autoDimensionImageFile(
        file,
        targetW,
        targetH,
        fitMode
      );

      onUpdateField(field.key, dimResult.dataUrl);

      setDrawerUploadNotes((prev) => ({
        ...prev,
        [field.key]: `Auto-dimensioned (${dimResult.originalWidth}×${dimResult.originalHeight} px → ${dimResult.targetWidth}×${dimResult.targetHeight} px)`,
      }));
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateField(field.key, reader.result);
          setDrawerUploadNotes((prev) => ({
            ...prev,
            [field.key]: 'Image loaded from device.',
          }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div
      data-cms-ignore="true"
      className="fixed inset-0 z-[70] bg-[#0A0A0A]/75 backdrop-blur-xs flex justify-end"
    >
      <div className="w-full max-w-2xl bg-white h-full flex flex-col border-l-2 border-[#0A0A0A] shadow-2xl">
        {/* Header */}
        <div className="bg-[#0A0A0A] text-white px-5 sm:px-6 py-4 border-b-2 border-[#DC2626] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#10B981] font-extrabold block">
              EIL CENTRALIZED CMS STORE
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              Edit Homepage &amp; Site Content
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#DC2626] text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="px-4 py-3 bg-[#FFF8F8] border-b border-[#0A0A0A]/15 flex items-center gap-2 overflow-x-auto shrink-0">
          {sections.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setActiveSection(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                activeSection === sec
                  ? 'bg-[#DC2626] text-white'
                  : 'bg-white text-[#0A0A0A] border border-[#0A0A0A]/15 hover:border-[#DC2626]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Fields List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {sectionFields.map((field) => {
            const val = (cmsData[field.key] as string) || '';
            const isImg = field.type === 'image';
            const targetW = field.targetWidth || 1200;
            const targetH = field.targetHeight || 900;
            const aspectLabel = field.aspectLabel || '4:3';
            const statusNote = drawerUploadNotes[field.key];

            return (
              <div
                key={field.key}
                className="p-4 rounded-2xl bg-[#FFF8F8] border border-[#0A0A0A]/15 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-extrabold text-[#0A0A0A] uppercase tracking-wider">
                    {field.label}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateField(field.key, DEFAULT_EIL_CMS_DATA[field.key] as string);
                      setDrawerUploadNotes((prev) => ({
                        ...prev,
                        [field.key]: 'Reverted to default image/text.',
                      }));
                    }}
                    className="text-[11px] font-mono font-bold text-[#DC2626] hover:underline cursor-pointer shrink-0"
                  >
                    Reset Default
                  </button>
                </div>

                {isImg ? (
                  <div className="space-y-3">
                    <div className="px-3 py-2 rounded-xl bg-[#ECFDF5] border border-[#10B981] flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold text-[#065F46]">
                        Required Dimensions: {targetW} × {targetH} px ({aspectLabel})
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#059669]">
                        Auto-Dimensions Any Uploaded File
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden border-2 border-[#0A0A0A]/20 bg-[#0A0A0A] shrink-0 flex items-center justify-center">
                        <ResilientImage
                          src={val}
                          alt={field.label}
                          className={`w-full h-full ${
                            field.fitMode === 'contain'
                              ? 'object-contain p-2 bg-white'
                              : 'object-cover'
                          }`}
                        />
                      </div>

                      <div className="flex-1 space-y-2 min-w-0">
                        <label className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#0A0A0A] text-white text-xs font-extrabold cursor-pointer transition-colors shadow-2xs">
                          <Upload className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {uploadingKey === field.key
                              ? 'Auto-Dimensioning...'
                              : 'Upload Image from Device'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleDrawerDeviceUpload(
                                field,
                                e.target.files?.[0] ? e.target.files[0] : null
                              )
                            }
                            className="hidden"
                          />
                        </label>

                        <input
                          type="text"
                          value={val.startsWith('data:') ? '' : val}
                          onChange={(e) => onUpdateField(field.key, e.target.value)}
                          placeholder={
                            val.startsWith('data:')
                              ? `Auto-dimensioned device image (${targetW}×${targetH} px)`
                              : 'Or paste image URL...'
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-[#0A0A0A]/20 bg-white text-xs font-mono text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                        />
                      </div>
                    </div>

                    {statusNote && (
                      <div className="text-[11px] font-bold text-[#065F46] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                        <span>{statusNote}</span>
                      </div>
                    )}
                  </div>
                ) : field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={val}
                    onChange={(e) => onUpdateField(field.key, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#0A0A0A]/20 bg-white text-xs sm:text-sm text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                  />
                ) : (
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => onUpdateField(field.key, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#0A0A0A]/20 bg-white text-xs sm:text-sm font-medium text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 bg-[#0A0A0A] text-white border-t-2 border-[#DC2626] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onRequestRestoreDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#DC2626]/20 hover:bg-[#DC2626] border border-[#DC2626] text-white text-xs font-extrabold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Factory Defaults</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                onSaveChanges();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. RESTORE FACTORY DEFAULTS CONFIRMATION MODAL (SCROLLABLE & UNOBSTRUCTED)
// ============================================================================
interface RestoreDefaultsConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRestore: () => void;
}

export const RestoreDefaultsConfirmModal: React.FC<RestoreDefaultsConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmRestore,
}) => {
  if (!isOpen) return null;

  return (
    <div
      data-cms-ignore="true"
      className="fixed inset-0 z-[70] bg-[#0A0A0A]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="w-full max-w-md max-h-[85vh] bg-white rounded-3xl border-2 border-[#DC2626] shadow-2xl overflow-hidden flex flex-col my-auto">
        <div className="bg-[#0A0A0A] text-white px-5 sm:px-6 py-4 border-b-2 border-[#DC2626] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#DC2626] text-white flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#DC2626] font-extrabold block">
                FACTORY RESET CONFIRMATION
              </span>
              <h3 className="text-base font-extrabold text-white truncate">
                Restore Default State
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close confirmation modal"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#DC2626] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
          <p className="text-sm sm:text-base font-bold text-[#0A0A0A] leading-relaxed">
            Are you sure you want to undo all updates and revert the entire site back to its original default state?
          </p>
          <p className="text-xs sm:text-sm text-[#3B0707] leading-relaxed">
            This will permanently clear all custom CMS edits, images, and added/deleted list items across all 6 pages, restoring all original EIL texts, catalogues, and default images immediately.
          </p>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-[#0A0A0A]/10">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs font-extrabold text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmRestore();
                onClose();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#0A0A0A] text-white text-xs font-extrabold uppercase tracking-wider transition-colors shadow-md cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Yes, Restore Defaults</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 6. COLLAPSIBLE FLOATING STEALTH ADMIN TOOLBAR (VISIBLE ONLY WHEN AUTHENTICATED)
// ============================================================================
interface StealthAdminToolbarProps {
  isAuthenticated: boolean;
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onToggleEditMode: () => void;
  onSaveChanges: () => void;
  onOpenAllFieldsDrawer: () => void;
  onRequestRestoreDefaults: () => void;
  onOpenSubmissionsLog: () => void;
  onLogout: () => void;
}

export const StealthAdminToolbar: React.FC<StealthAdminToolbarProps> = ({
  isAuthenticated,
  isEditMode,
  hasUnsavedChanges,
  isSaving,
  onToggleEditMode,
  onSaveChanges,
  onOpenAllFieldsDrawer,
  onRequestRestoreDefaults,
  onOpenSubmissionsLog,
  onLogout,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <div
      data-cms-ignore="true"
      className="fixed bottom-14 sm:bottom-14 inset-x-0 z-50 px-2.5 sm:px-6 pointer-events-none flex justify-center"
    >
      {isCollapsed ? (
        <div className="pointer-events-auto bg-[#0A0A0A]/95 backdrop-blur-md text-white rounded-full border-2 border-[#10B981] shadow-2xl px-3.5 py-2 flex items-center gap-2.5">
          <span className="text-xs font-extrabold text-[#10B981] whitespace-nowrap">
            {isEditMode ? 'Edit Mode ON (All Pages)' : 'Admin Toolbar'}
          </span>

          {hasUnsavedChanges && (
            <button
              type="button"
              disabled={isSaving}
              onClick={onSaveChanges}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-[11px] font-extrabold cursor-pointer transition-colors"
            >
              <Save className="w-3 h-3" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap"
            title="Expand Admin Panel Buttons"
          >
            <ChevronUp className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Expand Controls</span>
          </button>
        </div>
      ) : (
        <div className="pointer-events-auto w-full max-w-4xl bg-[#0A0A0A]/95 backdrop-blur-md text-white rounded-2xl border-2 border-[#10B981] shadow-2xl px-3 py-2.5 sm:px-5 sm:py-3 flex flex-col items-center justify-center gap-2 sm:gap-2.5">
          <div className="w-full flex flex-wrap items-center justify-center gap-2 text-center px-1">
            <span className="text-[11px] sm:text-xs text-white/90 font-semibold text-center leading-snug">
              {isEditMode
                ? 'Edit Mode Active Across All 6 Pages — Click any text/image to edit or use + Add / Delete on lists, then click Save Changes.'
                : 'Toggle Edit Mode to modify texts, images, and lists across all 6 pages.'}
            </span>
            {hasUnsavedChanges && (
              <span className="px-2 py-0.5 rounded bg-[#DC2626] text-white text-[10px] font-mono font-extrabold uppercase shrink-0">
                Unsaved Edits
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/15 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
              title="Minimize Admin Panel Buttons"
            >
              <ChevronDown className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Minimize</span>
            </button>
          </div>

          <div className="w-full grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onToggleEditMode}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                isEditMode
                  ? 'bg-[#10B981] text-[#0A0A0A] shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              {isEditMode ? (
                <Eye className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Edit3 className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="truncate">
                {isEditMode ? 'Edit Mode (ON)' : 'Toggle Edit Mode'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenAllFieldsDrawer}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[11px] sm:text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap"
              title="Open Centralized CMS Editor Drawer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span className="truncate">CMS Fields</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={onSaveChanges}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer shadow-sm whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>

            <button
              type="button"
              onClick={onRequestRestoreDefaults}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[11px] sm:text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap"
              title="Restore Factory Defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Restore Default State</span>
            </button>

            <button
              type="button"
              onClick={onOpenSubmissionsLog}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[11px] sm:text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap"
              title="View Customer Quote & Basket Submissions Logs"
            >
              <Database className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
              <span className="truncate">Logs / Inquiries</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-white/10 hover:bg-[#DC2626] text-white border border-white/20 hover:border-[#DC2626] text-[11px] sm:text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
