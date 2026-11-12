import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Calendar,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Send,
  MessageCircle,
  Sparkles,
  UserCheck,
  Plus,
  Trash2,
} from 'lucide-react';
import { EIL_BRANCHES, STOCK_CATALOGUE, StockItem } from '../data/eilData';
import {
  DEFAULT_DELIVERY_OPTIONS,
  DEFAULT_CYLINDER_SERVICE_MODES,
  DEFAULT_FLEET_MACHINES,
  CmsDeliveryOptionSpec,
  CmsCylinderServiceModeSpec,
  CmsFleetMachineSpec,
} from '../data/cmsDefaults';
import {
  QuoteRecord,
  SERVICE_TYPE_OPTIONS,
  EMAIL_ROUTES,
  resolveTargetEmail,
  buildDualWhatsAppUrl,
  dispatchFormSubmitEmail,
  DualSubmissionInput,
} from './OverlaysAndDrawers';
import { useCms, CmsText, CmsImage } from './StealthCmsAdmin';

// ============================================================================
// 1. GAS DELIVERY OPTIONS EXPLAINER & INTERACTIVE RECOMMENDER
// ============================================================================
interface GasDeliveryExplainerProps {
  onOpenQuoteModal: (prefillService?: string, prefillNotes?: string) => void;
  onAddToEnquiry: (item: StockItem, quantity: number) => void;
}

export const GasDeliveryExplainerTool: React.FC<GasDeliveryExplainerProps> = ({
  onOpenQuoteModal,
  onAddToEnquiry,
}) => {
  const { cmsData, isEditMode, updateCmsData } = useCms();
  const deliveryOptions = cmsData.deliveryOptions?.length
    ? cmsData.deliveryOptions
    : DEFAULT_DELIVERY_OPTIONS;

  const [usageScale, setUsageScale] = useState<'low' | 'mixed' | 'offshore' | 'continuous'>('offshore');
  const [gasCombo, setGasCombo] = useState<string>('Tracked Excavator / Dozer / Swamp Buggy Mobilization');
  const [siteHandling, setSiteHandling] = useState<'trolley' | 'forklift-crane' | 'central-pipe'>('forklift-crane');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('lowbed-haulage');
  const [rackQty, setRackQty] = useState<number>(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [highlightRecommendedPulse, setHighlightRecommendedPulse] = useState(false);

  const optionCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const deepDivePanelRef = useRef<HTMLDivElement | null>(null);

  const recommendedId = useMemo<string>(() => {
    if (usageScale === 'continuous') {
      return 'dump-truck-haulage';
    }
    if (usageScale === 'low') {
      return 'tanker-pneumatic-haulage';
    }
    if (usageScale === 'mixed') {
      return 'flatbed-haulage';
    }
    return 'lowbed-haulage';
  }, [usageScale]);

  const activeOption =
    deliveryOptions.find((o) => o.id === selectedOptionId) ||
    deliveryOptions.find((o) => o.id === recommendedId) ||
    deliveryOptions[0];

  const recommendedOption =
    deliveryOptions.find((o) => o.id === recommendedId) ||
    deliveryOptions[Math.min(2, deliveryOptions.length - 1)] ||
    deliveryOptions[0];

  const scrollToRecommendedMode = (targetId: string) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const deepDiveEl = deepDivePanelRef.current;
        const cardEl = optionCardRefs.current[targetId];
        const targetEl = deepDiveEl || cardEl;
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 60);
    });
  };

  const handleApplyRecommendation = () => {
    const targetId = recommendedOption.id;
    setSelectedOptionId(targetId);
    setHighlightRecommendedPulse(true);
    scrollToRecommendedMode(targetId);
    setTimeout(() => {
      setHighlightRecommendedPulse(false);
    }, 2000);
  };

  const handleAddRecommendedToBasket = () => {
    const matchedStock =
      STOCK_CATALOGUE.find((item) => item.id === activeOption.catalogItemId) ||
      STOCK_CATALOGUE[0];
    const customItem: StockItem = {
      ...matchedStock,
      id: `del-${activeOption.id}-${Date.now()}`,
      name: `${activeOption.title} (${gasCombo})`,
      spec: `${activeOption.capacity} · ${activeOption.handling}`,
    };
    onAddToEnquiry(customItem, rackQty);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  const handleUpdateDeliveryOption = (
    id: string,
    updater: (opt: CmsDeliveryOptionSpec) => CmsDeliveryOptionSpec
  ) => {
    updateCmsData((prev) => ({
      ...prev,
      deliveryOptions: (prev.deliveryOptions?.length
        ? prev.deliveryOptions
        : DEFAULT_DELIVERY_OPTIONS
      ).map((opt) => (opt.id === id ? updater(opt) : opt)),
    }));
  };

  const handleAddDeliveryOption = () => {
    const nextIdx = deliveryOptions.length + 1;
    const newOpt: CmsDeliveryOptionSpec = {
      id: `del-opt-${Date.now()}`,
      code: `MODE 0${nextIdx}`,
      title: 'New Haulage Trailer / Fleet Dispatch Mode',
      shortName: 'Custom Haulage Mode',
      badge: 'Custom Haulage Fleet',
      capacity: 'Custom Tonnage / Volume Capacity',
      bestFor: 'Heavy machinery, project cargo, bulk liquids/powders, or civil aggregates',
      handling: 'Certified EIL loading, chaining, and journey management',
      description:
        'Describe this haulage trailer configuration, payload tonnage, and route capability.',
      features: [
        'Dispatched with certified EIL heavy-haulage driver & load restraint',
        'Express mobilization from Port Harcourt & Warri yards',
      ],
      image: '/assets/eil/gen_lowbed_trailer.jpg',
      catalogItemId: 'hl-lowbed-40t-60t',
    };
    updateCmsData((prev) => ({
      ...prev,
      deliveryOptions: [
        ...(prev.deliveryOptions?.length ? prev.deliveryOptions : DEFAULT_DELIVERY_OPTIONS),
        newOpt,
      ],
    }));
    setSelectedOptionId(newOpt.id);
  };

  const handleDeleteDeliveryOption = (id: string) => {
    if (deliveryOptions.length <= 1) return;
    updateCmsData((prev) => ({
      ...prev,
      deliveryOptions: (prev.deliveryOptions?.length
        ? prev.deliveryOptions
        : DEFAULT_DELIVERY_OPTIONS
      ).filter((o) => o.id !== id),
    }));
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FFF8F8] border-b-2 border-[#0A0A0A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0A0A0A] text-[#FFFFFF] text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#DC2626]" />
              <CmsText
                cmsKey="gas_del_badge"
                defaultValue="Interactive Haulage & Fleet Dispatch Configurator"
                label="Haulage Configurator Badge"
                section="Haulage Configurator Tool"
              />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A0A0A] tracking-tight">
              <CmsText
                cmsKey="gas_del_title_1"
                defaultValue="Choose the Right"
                label="Haulage Title (Part 1)"
                section="Haulage Configurator Tool"
              />{' '}
              <span className="text-[#DC2626]">
                <CmsText
                  cmsKey="gas_del_title_highlight"
                  defaultValue="Haulage & Trailer Mode"
                  label="Haulage Title (Red Highlight)"
                  section="Haulage Configurator Tool"
                />
              </span>{' '}
              <CmsText
                cmsKey="gas_del_title_2"
                defaultValue="for Your Project"
                label="Haulage Title (Part 2)"
                section="Haulage Configurator Tool"
              />
            </h2>
            <p className="mt-2 text-[15px] sm:text-base text-[#3B0707] max-w-2xl leading-[1.65]">
              <CmsText
                cmsKey="gas_del_subtitle"
                defaultValue="From 40T–100T+ Multi-Axle Lowbeds for heavy machinery mobilization to 40ft/45ft Flatbeds, Bulk AGO/Water Tankers, Pneumatic Cement/Barite Silo Trucks, and 20T–45T Dump Trucks — select your haulage requirement below for an instant fleet recommendation and quote."
                label="Haulage Configurator Subtitle"
                section="Haulage Configurator Tool"
                multiline
              />
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            {isEditMode && (
              <button
                type="button"
                data-cms-explicit="true"
                onClick={handleAddDeliveryOption}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Haulage Mode</span>
              </button>
            )}
            <div className="text-xs font-mono font-bold text-[#0A0A0A] bg-white px-4 py-2.5 rounded-xl border-2 border-[#0A0A0A]">
              <CmsText
                cmsKey="gas_del_agent_tag"
                defaultValue="Port Harcourt & Warri Haulage Desk: (+234) 070-3825-9142"
                label="Haulage Desk Tag"
                section="Haulage Configurator Tool"
              />
            </div>
          </div>
        </div>

        {/* Interactive 3-Step Recommender Bar */}
        <div className="bg-[#0A0A0A] text-white rounded-3xl p-5 sm:p-8 border-2 border-[#DC2626] mb-10 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6 pb-4 border-b border-white/15">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#DC2626] font-extrabold block">
                <CmsText
                  cmsKey="gas_del_step_badge"
                  defaultValue="Step-by-Step Haulage & Mobilization Selector"
                  label="Configurator Step Badge"
                  section="Haulage Configurator Tool"
                />
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                <CmsText
                  cmsKey="gas_del_step_heading"
                  defaultValue="Select Your Cargo Type, Payload & Site Offloading Method"
                  label="Configurator Heading"
                  section="Haulage Configurator Tool"
                />
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#DC2626] text-white text-xs font-extrabold">
              Recommended: {recommendedOption.shortName || recommendedOption.title}
            </span>
          </div>

          <div data-cms-ignore="true" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Cargo Category */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-red-200 font-bold mb-2">
                1. Primary Haulage Requirement
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'offshore',
                    label: 'Heavy Plant Mobilization (40T–100T+ Lowbed)',
                    defaultCombo: 'Tracked Excavator / Dozer / Swamp Buggy Mobilization',
                    defaultHandling: 'trolley' as const,
                    modeId: 'lowbed-haulage',
                  },
                  {
                    id: 'mixed',
                    label: 'Containers, OCTG Pipes & Steel (40ft/45ft Flatbed)',
                    defaultCombo: '20ft/40ft Containers, Coated Line Pipes & Structural Steel',
                    defaultHandling: 'forklift-crane' as const,
                    modeId: 'flatbed-haulage',
                  },
                  {
                    id: 'low',
                    label: 'Bulk Liquid (AGO/Water) or Dry Powder (Pneumatic Silo)',
                    defaultCombo: 'Bulk AGO Diesel, Compaction Water, or Silo Cement/Barite',
                    defaultHandling: 'central-pipe' as const,
                    modeId: 'tanker-pneumatic-haulage',
                  },
                  {
                    id: 'continuous',
                    label: 'Sand-Filling, Granite & Earthworks (Dump Trucks)',
                    defaultCombo: 'Sharp Sand, Laterite, Quarry Granite & Spoil Tipping',
                    defaultHandling: 'central-pipe' as const,
                    modeId: 'dump-truck-haulage',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setUsageScale(opt.id as typeof usageScale);
                      setGasCombo(opt.defaultCombo);
                      setSiteHandling(opt.defaultHandling);
                      setSelectedOptionId(opt.modeId);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${
                      usageScale === opt.id
                        ? 'bg-[#DC2626] text-white border-[#DC2626] scale-[1.02]'
                        : 'bg-[#161616] text-red-100 border-white/15 hover:border-[#DC2626]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Cargo / Machine Specification */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-red-200 font-bold mb-2">
                2. Specific Machine or Cargo Load
              </label>
              <div className="space-y-2">
                {[
                  {
                    combo: 'Tracked Excavator / Dozer / Swamp Buggy Mobilization',
                    scale: 'offshore' as const,
                    handling: 'trolley' as const,
                    modeId: 'lowbed-haulage',
                  },
                  {
                    combo: '20ft/40ft Containers, Coated Line Pipes & Structural Steel',
                    scale: 'mixed' as const,
                    handling: 'forklift-crane' as const,
                    modeId: 'flatbed-haulage',
                  },
                  {
                    combo: 'Bulk AGO Diesel, Compaction Water, or Silo Cement/Barite',
                    scale: 'low' as const,
                    handling: 'central-pipe' as const,
                    modeId: 'tanker-pneumatic-haulage',
                  },
                  {
                    combo: 'Sharp Sand, Laterite, Quarry Granite & Spoil Tipping',
                    scale: 'continuous' as const,
                    handling: 'central-pipe' as const,
                    modeId: 'dump-truck-haulage',
                  },
                ].map((item) => (
                  <button
                    key={item.combo}
                    type="button"
                    onClick={() => {
                      setGasCombo(item.combo);
                      setUsageScale(item.scale);
                      setSiteHandling(item.handling);
                      setSelectedOptionId(item.modeId);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${
                      gasCombo === item.combo
                        ? 'bg-[#DC2626] text-white border-[#DC2626] scale-[1.02]'
                        : 'bg-[#161616] text-red-100 border-white/15 hover:border-[#DC2626]'
                    }`}
                  >
                    {item.combo}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Site Handling & Recommendation Action */}
            <div className="flex flex-col justify-between">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-red-200 font-bold mb-2">
                  3. Site Loading &amp; Offloading Support
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'trolley', label: 'Self-Propelled Ramp Loading (Lowbed Ramps)' },
                    { id: 'forklift-crane', label: 'Requires EIL Forklift (3T–45T) or Mobile Crane' },
                    { id: 'central-pipe', label: 'PTO Pump / Pneumatic Compressor / Hydraulic Tipper' },
                  ].map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        setSiteHandling(h.id as typeof siteHandling);
                        if (h.id === 'trolley') {
                          setUsageScale('offshore');
                          setGasCombo('Tracked Excavator / Dozer / Swamp Buggy Mobilization');
                          setSelectedOptionId('lowbed-haulage');
                        } else if (h.id === 'forklift-crane' && (usageScale === 'low' || usageScale === 'continuous')) {
                          setUsageScale('mixed');
                          setGasCombo('20ft/40ft Containers, Coated Line Pipes & Structural Steel');
                          setSelectedOptionId('flatbed-haulage');
                        } else if (h.id === 'central-pipe' && (usageScale === 'offshore' || usageScale === 'mixed')) {
                          setUsageScale('low');
                          setGasCombo('Bulk AGO Diesel, Compaction Water, or Silo Cement/Barite');
                          setSelectedOptionId('tanker-pneumatic-haulage');
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${
                        siteHandling === h.id
                          ? 'bg-[#DC2626] text-white border-[#DC2626] scale-[1.02]'
                          : 'bg-[#161616] text-red-100 border-white/15 hover:border-[#DC2626]'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyRecommendation}
                className="mt-4 w-full py-3 px-4 rounded-xl bg-white hover:bg-[#DC2626] text-[#0A0A0A] hover:text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99]"
              >
                <span>View Recommended Mode: {recommendedOption.shortName || recommendedOption.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4+ Interactive Delivery Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {deliveryOptions.map((opt, idx) => {
            const isSelected = activeOption.id === opt.id;
            const isRecommended = recommendedId === opt.id;
            return (
              <motion.div
                key={opt.id}
                ref={(el) => {
                  optionCardRefs.current[opt.id] = el;
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => {
                  setSelectedOptionId(opt.id);
                  scrollToRecommendedMode(opt.id);
                }}
                className={`rounded-3xl overflow-hidden border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0A0A0A] text-white border-[#DC2626] ring-4 ring-[#DC2626]/25 shadow-xl'
                    : 'bg-white text-[#0A0A0A] border-[#0A0A0A]/15 hover:border-[#DC2626]'
                }`}
              >
                <div>
                  <div className="h-40 relative overflow-hidden bg-[#0A0A0A]">
                    <CmsImage
                      src={opt.image}
                      defaultSrc={DEFAULT_DELIVERY_OPTIONS.find((d) => d.id === opt.id)?.image || opt.image}
                      alt={opt.title}
                      label={`${opt.title} — Image`}
                      section="Haulage & Trailer Modes"
                      targetWidth={800}
                      targetHeight={500}
                      aspectLabel="16:10 Card"
                      onSave={(newSrc) =>
                        handleUpdateDeliveryOption(opt.id, (o) => ({ ...o, image: newSrc }))
                      }
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-transparent to-transparent pointer-events-none" />
                    <div className={`absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-1.5 ${isEditMode ? 'z-50' : 'z-20'}`}>
                      <span className="px-2.5 py-0.5 rounded bg-[#0A0A0A]/90 text-white font-mono text-[10px] font-extrabold">
                        <CmsText
                          value={opt.code}
                          defaultValue={opt.code}
                          label={`${opt.title} — Code`}
                          section="Gas Delivery Options"
                          onSave={(val) =>
                            handleUpdateDeliveryOption(opt.id, (o) => ({ ...o, code: val }))
                          }
                        />
                      </span>
                      <div className="flex items-center gap-1">
                        {isRecommended && (
                          <span className="px-2.5 py-0.5 rounded bg-[#DC2626] text-white text-[10px] font-extrabold uppercase">
                            Recommended
                          </span>
                        )}
                        {isEditMode && deliveryOptions.length > 1 && (
                          <button
                            type="button"
                            data-cms-explicit="true"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDeliveryOption(opt.id);
                            }}
                            className="p-1 rounded bg-[#DC2626] text-white hover:bg-[#B91C1C] cursor-pointer"
                            title="Delete Delivery Option"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="text-[11px] font-mono font-bold text-[#DC2626] block">
                      <CmsText
                        value={opt.badge}
                        defaultValue={opt.badge}
                        label={`${opt.title} — Badge`}
                        section="Gas Delivery Options"
                        onSave={(val) =>
                          handleUpdateDeliveryOption(opt.id, (o) => ({ ...o, badge: val }))
                        }
                      />
                    </span>
                    <h4
                      className={`text-base font-extrabold mt-1 ${
                        isSelected ? 'text-white' : 'text-[#0A0A0A]'
                      }`}
                    >
                      <CmsText
                        value={opt.title}
                        defaultValue={opt.title}
                        label={`${opt.title} — Title`}
                        section="Gas Delivery Options"
                        onSave={(val) =>
                          handleUpdateDeliveryOption(opt.id, (o) => ({ ...o, title: val }))
                        }
                      />
                    </h4>
                    <p
                      className={`text-xs mt-2 leading-relaxed ${
                        isSelected ? 'text-red-100' : 'text-[#3B0707]'
                      }`}
                    >
                      <CmsText
                        value={opt.description}
                        defaultValue={opt.description}
                        label={`${opt.title} — Description`}
                        section="Gas Delivery Options"
                        multiline
                        onSave={(val) =>
                          handleUpdateDeliveryOption(opt.id, (o) => ({
                            ...o,
                            description: val,
                          }))
                        }
                      />
                    </p>
                  </div>
                </div>
                <div
                  className={`px-5 pb-4 pt-3 border-t text-xs font-extrabold flex items-center justify-between ${
                    isSelected ? 'border-white/15 text-[#DC2626]' : 'border-[#FECACA] text-[#0A0A0A]'
                  }`}
                >
                  <span>{isSelected ? 'Selected Setup' : 'Inspect Option'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Option Deep-Dive & Direct Quote Action Bar */}
        <motion.div
          ref={deepDivePanelRef}
          key={activeOption.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-3xl border-2 p-5 sm:p-8 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center transition-all duration-300 scroll-mt-24 ${
            highlightRecommendedPulse
              ? 'border-[#DC2626] ring-4 ring-[#DC2626]/30 shadow-2xl'
              : 'border-[#0A0A0A]'
          }`}
        >
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {activeOption.id === recommendedOption.id && (
                <span className="px-3 py-1 rounded bg-[#DC2626] text-white font-mono text-xs font-extrabold uppercase tracking-wider">
                  Recommended Mode
                </span>
              )}
              <span className="px-3 py-1 rounded bg-[#0A0A0A] text-white font-mono text-xs font-extrabold">
                <CmsText
                  value={activeOption.code}
                  defaultValue={activeOption.code}
                  label={`${activeOption.title} — Code`}
                  section="Gas Delivery Options"
                  onSave={(val) =>
                    handleUpdateDeliveryOption(activeOption.id, (o) => ({ ...o, code: val }))
                  }
                />
              </span>
              <span className="px-3 py-1 rounded bg-[#FEF2F2] text-[#DC2626] text-xs font-extrabold">
                <CmsText
                  value={activeOption.capacity}
                  defaultValue={activeOption.capacity}
                  label={`${activeOption.title} — Capacity`}
                  section="Gas Delivery Options"
                  onSave={(val) =>
                    handleUpdateDeliveryOption(activeOption.id, (o) => ({
                      ...o,
                      capacity: val,
                    }))
                  }
                />
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0A0A0A]">
              <CmsText
                value={activeOption.title}
                defaultValue={activeOption.title}
                label={`${activeOption.title} — Title`}
                section="Gas Delivery Options"
                onSave={(val) =>
                  handleUpdateDeliveryOption(activeOption.id, (o) => ({ ...o, title: val }))
                }
              />{' '}
              — Configured for <span className="text-[#DC2626]">{gasCombo}</span>
            </h3>
            <p className="text-[15px] sm:text-base text-[#3B0707] leading-[1.65]">
              <CmsText
                value={activeOption.description}
                defaultValue={activeOption.description}
                label={`${activeOption.title} — Description`}
                section="Gas Delivery Options"
                multiline
                onSave={(val) =>
                  handleUpdateDeliveryOption(activeOption.id, (o) => ({
                    ...o,
                    description: val,
                  }))
                }
              />
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {activeOption.features.map((f, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#FECACA] text-xs font-semibold text-[#0A0A0A] flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                    <CmsText
                      value={f}
                      defaultValue={f}
                      label={`${activeOption.title} — Feature #${i + 1}`}
                      section="Gas Delivery Options"
                      onSave={(val) =>
                        handleUpdateDeliveryOption(activeOption.id, (o) => ({
                          ...o,
                          features: o.features.map((feat, idxF) => (idxF === i ? val : feat)),
                        }))
                      }
                    />
                  </div>
                  {isEditMode && (
                    <button
                      type="button"
                      data-cms-explicit="true"
                      onClick={() =>
                        handleUpdateDeliveryOption(activeOption.id, (o) => ({
                          ...o,
                          features: o.features.filter((_, idxF) => idxF !== i),
                        }))
                      }
                      className="p-1 rounded bg-[#DC2626] text-white hover:bg-[#B91C1C] shrink-0 cursor-pointer"
                      title="Delete Feature"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {isEditMode && (
                <button
                  type="button"
                  data-cms-explicit="true"
                  onClick={() =>
                    handleUpdateDeliveryOption(activeOption.id, (o) => ({
                      ...o,
                      features: [...o.features, 'New Delivery Feature'],
                    }))
                  }
                  className="inline-flex items-center justify-center gap-1.5 p-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Feature</span>
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#FFF8F8] rounded-2xl p-5 sm:p-6 border-2 border-[#0A0A0A]/15 space-y-4">
            <div className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#0A0A0A]">
              <CmsText
                cmsKey="gas_del_order_box_title"
                defaultValue="Book or Quote This Haulage Trailer Mode"
                label="Order Box Title"
                section="Haulage Configurator Tool"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <label className="text-xs font-bold text-[#3B0707]">
                <CmsText
                  cmsKey="gas_del_order_qty_label"
                  defaultValue="Number of Trailers / Trucks Required:"
                  label="Order Box Quantity Label"
                  section="Haulage Configurator Tool"
                />
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={rackQty}
                onChange={(e) => setRackQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 px-3 py-2 rounded-xl border-2 border-[#0A0A0A] bg-white text-center font-mono font-extrabold text-sm text-[#0A0A0A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  onOpenQuoteModal(
                    'Heavy-Duty Haulage Services (Lowbed, Flatbed, Tankers, Pneumatic & Dump Trucks)',
                    `Selected Haulage Mode: ${activeOption.title} | Cargo/Load: ${gasCombo} | Quantity: ${rackQty} Trailer(s)/Truck(s) | Handling: ${activeOption.handling}`
                  )
                }
                className="min-h-[48px] py-3 px-4 rounded-xl bg-[#DC2626] hover:bg-[#0A0A0A] text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CmsText
                  cmsKey="gas_del_quote_btn"
                  defaultValue="Get Instant Quote"
                  label="Get Instant Quote Button"
                  section="Haulage Configurator Tool"
                />
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleAddRecommendedToBasket}
                className="min-h-[48px] py-3 px-4 rounded-xl bg-[#0A0A0A] hover:bg-[#DC2626] text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{addedFeedback ? 'Added to Basket!' : 'Add to Enquiry Basket'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================================
// 2. PRE-MOBILIZATION SITE SURVEY, FLEET MAINTENANCE & SUPPORT SCHEDULING TOOL
// ============================================================================
interface CylinderServicesToolProps {
  onQuoteSubmitted: (record: QuoteRecord) => void;
}

export const CylinderServicesTool: React.FC<CylinderServicesToolProps> = ({
  onQuoteSubmitted,
}) => {
  const { cmsData, isEditMode, updateCmsData } = useCms();
  const cylinderModes = cmsData.cylinderServiceModes?.length
    ? cmsData.cylinderServiceModes
    : DEFAULT_CYLINDER_SERVICE_MODES;

  const [selectedModeId, setSelectedModeId] = useState<string>('free-inspection');
  const [preferredDate, setPreferredDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>('Morning (8:00am – 12:00pm)');
  const [selectedGases, setSelectedGases] = useState<string[]>([
    'Forklifts (3T – 45T)',
    'Excavators & Swamp Buggies',
  ]);
  const [cylinderCount, setCylinderCount] = useState<number>(2);
  const [inquiryCategory, setInquiryCategory] = useState(
    'Equipment Hiring & Plant Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)'
  );
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [preferredBranch, setPreferredBranch] = useState(EIL_BRANCHES[0].name);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<QuoteRecord | null>(null);
  const [routedTargetEmail, setRoutedTargetEmail] = useState<string>(EMAIL_ROUTES.INFO);
  const [errorMsg, setErrorMsg] = useState('');

  const activeMode =
    cylinderModes.find((m) => m.id === selectedModeId) || cylinderModes[0];

  const handleUpdateCylinderMode = (
    id: string,
    updater: (m: CmsCylinderServiceModeSpec) => CmsCylinderServiceModeSpec
  ) => {
    updateCmsData((prev) => ({
      ...prev,
      cylinderServiceModes: (prev.cylinderServiceModes?.length
        ? prev.cylinderServiceModes
        : DEFAULT_CYLINDER_SERVICE_MODES
      ).map((m) => (m.id === id ? updater(m) : m)),
    }));
  };

  const handleAddCylinderMode = () => {
    const newMode: CmsCylinderServiceModeSpec = {
      id: `cyl-mode-${Date.now()}`,
      badge: 'CUSTOM FLEET SUPPORT',
      title: 'New Site Survey or Fleet Support Mode',
      subtitle: 'Certified EIL engineering, route survey & field mechanic support',
      description:
        'Describe this pre-mobilization site assessment, crane lift study, or on-site preventive maintenance service.',
      checklist: [
        'Certified EIL field engineer & mechanical inspection',
        'Available across Port Harcourt & Warri operational yards',
      ],
      image: '/assets/eil/pdf_img_031.jpg',
    };
    updateCmsData((prev) => ({
      ...prev,
      cylinderServiceModes: [
        ...(prev.cylinderServiceModes?.length
          ? prev.cylinderServiceModes
          : DEFAULT_CYLINDER_SERVICE_MODES),
        newMode,
      ],
    }));
    setSelectedModeId(newMode.id);
  };

  const handleDeleteCylinderMode = (id: string) => {
    if (cylinderModes.length <= 1) return;
    updateCmsData((prev) => ({
      ...prev,
      cylinderServiceModes: (prev.cylinderServiceModes?.length
        ? prev.cylinderServiceModes
        : DEFAULT_CYLINDER_SERVICE_MODES
      ).filter((m) => m.id !== id),
    }));
  };

  const toggleGas = (gas: string) => {
    setSelectedGases((prev) =>
      prev.includes(gas) ? prev.filter((g) => g !== gas) : [...prev, gas]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !siteLocation.trim() || !preferredDate) {
      setErrorMsg('Please provide your Name, Phone Number, Preferred Date, and Project Site Location.');
      return;
    }
    setErrorMsg('');

    const targetEmail = resolveTargetEmail(inquiryCategory);
    setRoutedTargetEmail(targetEmail);

    const generatedRefCode = `EIL-SRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const scheduleSummary = `${cylinderCount} Machine(s)/Truck(s) · Preferred Date: ${preferredDate} (${timeSlot})`;
    const specsSummary = `• Support Mode: ${activeMode.title}\n• Equipment / Haulage Fleet: ${selectedGases.join(', ') || 'Heavy Equipment & Haulage Fleet'}`;

    const compiledMessage = [
      `Support Mode: ${activeMode.title}`,
      `Units & Schedule: ${cylinderCount} Machine(s)/Truck(s) · Date: ${preferredDate} (${timeSlot})`,
      `Company: ${companyName.trim() || 'Direct Project Client'}`,
      `Site Location: ${siteLocation.trim()}`,
      `Branch: ${preferredBranch}`,
      `Fleet Involved: ${selectedGases.join(', ') || 'Heavy Equipment & Haulage Fleet'}`,
      notes.trim() ? `Notes: ${notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    const dualInput: DualSubmissionInput = {
      name: customerName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      category: inquiryCategory,
      message: compiledMessage,
      referenceCode: generatedRefCode,
      company: companyName.trim() || 'Direct Project Client',
      role: 'Project / Plant / Logistics Coordinator',
      branch: preferredBranch,
      location: siteLocation.trim(),
      quantityOrSchedule: scheduleSummary,
      itemsOrSpecs: specsSummary,
      notes: notes.trim(),
    };

    const whatsappUrl = buildDualWhatsAppUrl(dualInput, targetEmail);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setSubmitting(true);

    const payload = {
      customerName: customerName.trim(),
      companyName: companyName.trim() || 'Direct Project Client',
      positionTitle: 'Project / Plant / Logistics Coordinator',
      email: email.trim(),
      phone: phone.trim(),
      serviceType: inquiryCategory,
      quantityOrDuration: scheduleSummary,
      location: siteLocation.trim(),
      preferredBranch,
      projectNotes: `Mode: ${activeMode.title} | Fleet Involved: ${selectedGases.join(', ') || 'Heavy Equipment & Haulage Fleet'}. ${notes.trim()}`,
    };

    const [, apiResult] = await Promise.allSettled([
      dispatchFormSubmitEmail(dualInput, targetEmail),
      fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    ]);

    let finalRecord: QuoteRecord = {
      id: `q-srv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      referenceCode: generatedRefCode,
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
        // Fallback
      }
    }

    setSubmittedRecord(finalRecord);
    onQuoteSubmitted(finalRecord);
    setCustomerName('');
    setCompanyName('');
    setPhone('');
    setEmail('');
    setSiteLocation('');
    setNotes('');
    setSubmitting(false);
  };

  return (
    <section id="cylinder-services-tool" className="py-12 sm:py-16 bg-white border-t-2 border-[#0A0A0A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#DC2626] text-white text-xs font-mono font-extrabold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <CmsText
                cmsKey="cyl_tool_badge"
                defaultValue="Pre-Mobilization Site Survey & On-Site Fleet Support Desk"
                label="Site Survey Tool Badge"
                section="Site Survey & Fleet Support Tool"
              />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A0A0A] tracking-tight">
              <CmsText
                cmsKey="cyl_tool_title_1"
                defaultValue="Free Site & Route Survey, Preventive Servicing &"
                label="Site Survey Tool Title (Part 1)"
                section="Site Survey & Fleet Support Tool"
              />{' '}
              <span className="text-[#DC2626]">
                <CmsText
                  cmsKey="cyl_tool_title_highlight"
                  defaultValue="Open-Ended Fleet Support"
                  label="Site Survey Tool Title (Red Highlight)"
                  section="Site Survey & Fleet Support Tool"
                />
              </span>
            </h2>
            <p className="mt-2 text-[15px] sm:text-base text-[#3B0707] max-w-2xl leading-[1.65]">
              <CmsText
                cmsKey="cyl_tool_subtitle"
                defaultValue="Schedule a complimentary Pre-Mobilization Site & Route Survey, request on-site preventive maintenance for leased plant, or book open-ended fleet scaling from our Port Harcourt and Warri yards."
                label="Site Survey Tool Subtitle"
                section="Site Survey & Fleet Support Tool"
                multiline
              />
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            {isEditMode && (
              <button
                type="button"
                data-cms-explicit="true"
                onClick={handleAddCylinderMode}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Support Mode</span>
              </button>
            )}
            <div className="text-xs font-mono font-bold text-white bg-[#0A0A0A] px-4 py-2.5 rounded-xl border-l-4 border-[#DC2626]">
              <CmsText
                cmsKey="cyl_tool_phone_tag"
                defaultValue="Direct Fleet & Survey Line: (+234) 070-3825-9142"
                label="Site Survey Tool Phone Tag"
                section="Site Survey & Fleet Support Tool"
              />
            </div>
          </div>
        </div>

        {/* 4+ Service Mode Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {cylinderModes.map((mode) => {
            const isSelected = activeMode.id === mode.id;
            const isFreeInspection = mode.id === 'free-inspection';
            return (
              <motion.div
                key={mode.id}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => setSelectedModeId(mode.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedModeId(mode.id);
                }}
                className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0A0A0A] text-white border-[#DC2626] ring-4 ring-[#DC2626]/25 shadow-xl'
                    : 'bg-[#FFF8F8] text-[#0A0A0A] border-[#0A0A0A]/15 hover:border-[#DC2626]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded font-mono text-[10px] font-extrabold uppercase ${
                        isFreeInspection
                          ? 'bg-[#DC2626] text-white'
                          : isSelected
                          ? 'bg-white text-[#0A0A0A]'
                          : 'bg-[#0A0A0A] text-white'
                      }`}
                    >
                      <CmsText
                        value={mode.badge}
                        defaultValue={mode.badge}
                        label={`${mode.title} — Badge`}
                        section="Fleet & Haulage Modes"
                        onSave={(val) =>
                          handleUpdateCylinderMode(mode.id, (m) => ({ ...m, badge: val }))
                        }
                      />
                    </span>
                    {isEditMode && cylinderModes.length > 1 && (
                      <button
                        type="button"
                        data-cms-explicit="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCylinderMode(mode.id);
                        }}
                        className="p-1 rounded bg-[#DC2626] text-white hover:bg-[#B91C1C] cursor-pointer"
                        title="Delete Service Mode"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <h3
                    className={`text-base font-extrabold mt-3 leading-snug ${
                      isSelected ? 'text-white' : 'text-[#0A0A0A]'
                    }`}
                  >
                    <CmsText
                      value={mode.title}
                      defaultValue={mode.title}
                      label={`${mode.title} — Title`}
                      section="Cylinder Service Modes"
                      onSave={(val) =>
                        handleUpdateCylinderMode(mode.id, (m) => ({ ...m, title: val }))
                      }
                    />
                  </h3>
                  <p
                    className={`text-xs mt-1.5 leading-relaxed ${
                      isSelected ? 'text-red-100' : 'text-[#3B0707]'
                    }`}
                  >
                    <CmsText
                      value={mode.subtitle}
                      defaultValue={mode.subtitle}
                      label={`${mode.title} — Subtitle`}
                      section="Cylinder Service Modes"
                      onSave={(val) =>
                        handleUpdateCylinderMode(mode.id, (m) => ({ ...m, subtitle: val }))
                      }
                    />
                  </p>
                </div>

                <div
                  className={`mt-4 pt-3 border-t text-xs font-extrabold flex items-center justify-between ${
                    isSelected ? 'border-white/15 text-[#DC2626]' : 'border-[#FECACA] text-[#DC2626]'
                  }`}
                >
                  <span>{isSelected ? 'Selected in Form Below' : 'Select This Service'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Interactive Split: Left Checklist & Image / Right Date-Picker Booking Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-[#FFF8F8] rounded-3xl border-2 border-[#0A0A0A] p-5 sm:p-10 shadow-lg">
          {/* Left Column: Active Service Mode Details */}
          <div className="lg:col-span-5 space-y-5">
            <div className="aspect-[16/10] sm:aspect-auto sm:h-56 rounded-2xl overflow-hidden border-2 border-[#0A0A0A] relative bg-[#0A0A0A]">
              <CmsImage
                src={activeMode.image}
                defaultSrc={activeMode.image}
                alt={activeMode.title}
                label={`${activeMode.title} — Image`}
                section="Cylinder Service Modes"
                targetWidth={960}
                targetHeight={600}
                aspectLabel="16:10 Showcase"
                onSave={(newSrc) =>
                  handleUpdateCylinderMode(activeMode.id, (m) => ({ ...m, image: newSrc }))
                }
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white z-20">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#DC2626] font-extrabold block">
                  <CmsText
                    value={activeMode.badge}
                    defaultValue={activeMode.badge}
                    label={`${activeMode.title} — Badge`}
                    section="Cylinder Service Modes"
                    onSave={(val) =>
                      handleUpdateCylinderMode(activeMode.id, (m) => ({ ...m, badge: val }))
                    }
                  />
                </span>
                <div className="text-lg font-extrabold leading-tight">
                  <CmsText
                    value={activeMode.title}
                    defaultValue={activeMode.title}
                    label={`${activeMode.title} — Title`}
                    section="Cylinder Service Modes"
                    onSave={(val) =>
                      handleUpdateCylinderMode(activeMode.id, (m) => ({ ...m, title: val }))
                    }
                  />
                </div>
              </div>
            </div>

            <p className="text-[15px] sm:text-sm text-[#3B0707] leading-[1.65]">
              <CmsText
                value={activeMode.description}
                defaultValue={activeMode.description}
                label={`${activeMode.title} — Description`}
                section="Cylinder Service Modes"
                multiline
                onSave={(val) =>
                  handleUpdateCylinderMode(activeMode.id, (m) => ({
                    ...m,
                    description: val,
                  }))
                }
              />
            </p>

            <div className="bg-white rounded-2xl p-5 border border-[#0A0A0A]/15 space-y-2.5">
              <div className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#0A0A0A]">
                What Is Included in {activeMode.title}:
              </div>
              {activeMode.checklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-2.5 text-[14px] sm:text-sm font-medium text-[#0A0A0A]"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                    <CmsText
                      value={item}
                      defaultValue={item}
                      label={`${activeMode.title} — Checklist #${idx + 1}`}
                      section="Cylinder Service Modes"
                      onSave={(val) =>
                        handleUpdateCylinderMode(activeMode.id, (m) => ({
                          ...m,
                          checklist: m.checklist.map((c, i) => (i === idx ? val : c)),
                        }))
                      }
                    />
                  </div>
                  {isEditMode && (
                    <button
                      type="button"
                      data-cms-explicit="true"
                      onClick={() =>
                        handleUpdateCylinderMode(activeMode.id, (m) => ({
                          ...m,
                          checklist: m.checklist.filter((_, i) => i !== idx),
                        }))
                      }
                      className="p-1 rounded bg-[#DC2626] text-white hover:bg-[#B91C1C] shrink-0 cursor-pointer"
                      title="Delete Checklist Item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {isEditMode && (
                <button
                  type="button"
                  data-cms-explicit="true"
                  onClick={() =>
                    handleUpdateCylinderMode(activeMode.id, (m) => ({
                      ...m,
                      checklist: [...m.checklist, 'New Inspection / Service Checklist Point'],
                    }))
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Checklist Item</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Unified Booking & Date Picker Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-8 border-2 border-[#0A0A0A]/15">
            {submittedRecord ? (
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-extrabold text-[#DC2626]">
                      Booking Ref: {submittedRecord.referenceCode}
                    </span>
                    <h3 className="text-xl font-extrabold text-[#0A0A0A] mt-0.5">
                      {activeMode.title} Scheduled!
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-[#0A0A0A] mt-1.5 leading-relaxed">
                      Thank you! Your inquiry has been sent to {routedTargetEmail} and opened in WhatsApp for instant chat, expect to hear from our representative soon!
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={buildDualWhatsAppUrl(
                      {
                        name: submittedRecord.customerName,
                        phone: submittedRecord.phone,
                        email: submittedRecord.email,
                        category: submittedRecord.serviceType,
                        message: `Ref: ${submittedRecord.referenceCode} | Schedule & Qty: ${submittedRecord.quantityOrDuration} | Location: ${submittedRecord.location} | Details: ${submittedRecord.projectNotes}`,
                        referenceCode: submittedRecord.referenceCode,
                        company: submittedRecord.companyName,
                        role: submittedRecord.positionTitle,
                        branch: submittedRecord.preferredBranch,
                        location: submittedRecord.location,
                        quantityOrSchedule: submittedRecord.quantityOrDuration,
                        notes: submittedRecord.projectNotes,
                      },
                      routedTargetEmail
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#DC2626] hover:bg-[#0A0A0A] text-white text-xs font-extrabold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Re-open in WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setSubmittedRecord(null)}
                    className="px-5 py-3 rounded-xl border-2 border-[#0A0A0A] text-xs font-extrabold text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-colors cursor-pointer"
                  >
                    Book Another Survey / Fleet Support
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#FECACA] pb-3">
                  <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#DC2626]">
                    <CmsText
                      cmsKey="cyl_form_badge"
                      defaultValue="Schedule Free Site Survey or Fleet Support"
                      label="Site Survey Form Header Badge"
                      section="Site Survey & Fleet Support Tool"
                    />
                  </span>
                  <span className="text-xs font-bold text-[#0A0A0A]">
                    Mode: {activeMode.title}
                  </span>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-100 border border-[#DC2626] text-xs font-bold text-[#0A0A0A]">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                    Inquiry Type / Department *
                  </label>
                  <select
                    value={inquiryCategory}
                    onChange={(e) => setInquiryCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs font-bold text-[#0A0A0A] bg-white focus:outline-none focus:border-[#DC2626]"
                  >
                    {SERVICE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Picker + Time Slot + Machine Count */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      Preferred Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs font-mono font-bold text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      Time Window
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs font-bold text-[#0A0A0A] bg-white focus:outline-none focus:border-[#DC2626]"
                    >
                      <option value="Morning (8:00am – 12:00pm)">Morning (8:00am – 12:00pm)</option>
                      <option value="Afternoon (12:00pm – 5:30pm)">Afternoon (12:00pm – 5:30pm)</option>
                      <option value="Urgent 24/7 Mobilization Notice">Urgent 24/7 Mobilization Notice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      No. of Machines / Trucks *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      required
                      value={cylinderCount}
                      onChange={(e) =>
                        setCylinderCount(Math.max(1, parseInt(e.target.value, 10) || 1))
                      }
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs font-mono font-bold text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                </div>

                {/* Equipment / Haulage Multi-Select Chips */}
                <div data-cms-ignore="true">
                  <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1.5">
                    Select Equipment or Haulage Fleet Involved
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Forklifts (3T – 45T)',
                      'Excavators & Swamp Buggies',
                      'Dozers (CAT D6, D7, D8)',
                      'Mobile & Crawler Cranes',
                      'Backhoes, Payloaders & Graders',
                      'Lowbed & Flatbed Trailers',
                      'Tankers, Pneumatic & Dump Trucks',
                    ].map((gas) => {
                      const active = selectedGases.includes(gas);
                      return (
                        <button
                          key={gas}
                          type="button"
                          onClick={() => toggleGas(gas)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            active
                              ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                              : 'bg-[#FFF8F8] text-[#0A0A0A] border-[#0A0A0A]/15 hover:border-[#DC2626]'
                          }`}
                        >
                          {active ? '✓ ' : '+ '}
                          {gas}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customer & Location Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      Full Name / Project Contact *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Engr. Tariye Briggs"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      Company / Contractor Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Niger Delta Civil & Marine Contractors"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 703 825 9142"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="projects@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      Project Site Address or Route Corridor *
                    </label>
                    <input
                      type="text"
                      required
                      value={siteLocation}
                      onChange={(e) => setSiteLocation(e.target.value)}
                      placeholder="e.g. Trans-Amadi Port Harcourt, Onne, or Warri"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      Handling EIL Branch
                    </label>
                    <select
                      value={preferredBranch}
                      onChange={(e) => setPreferredBranch(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs text-[#0A0A0A] bg-white focus:outline-none focus:border-[#DC2626]"
                    >
                      {(cmsData.branches?.length ? cmsData.branches : EIL_BRANCHES).map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                    Specific Instructions (Terrain Conditions, Crane Radius, or Route Notes)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Requesting pre-mobilization route survey for 80T Lowbed & 70T Crane..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full min-h-[48px] py-3.5 px-6 rounded-xl bg-[#DC2626] hover:bg-[#0A0A0A] text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>
                    {submitting
                      ? 'Submitting Schedule...'
                      : `Confirm ${activeMode.title} (${preferredDate})`}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// 3. EQUIPMENT HIRE REQUEST TOOL & INTERACTIVE FLEET SPECIFICATIONS GALLERY
// ============================================================================
interface EquipmentHireToolProps {
  onQuoteSubmitted: (record: QuoteRecord) => void;
}

export type FleetMachineSpec = CmsFleetMachineSpec;
export const FLEET_SPECIFICATIONS_GALLERY = DEFAULT_FLEET_MACHINES;

export const EquipmentHireTool: React.FC<EquipmentHireToolProps> = ({
  onQuoteSubmitted,
}) => {
  const { cmsData, isEditMode, updateCmsData } = useCms();
  const fleetMachines = cmsData.fleetMachines?.length
    ? cmsData.fleetMachines
    : DEFAULT_FLEET_MACHINES;

  const [selectedMachineId, setSelectedMachineId] = useState<string>(
    fleetMachines[0].id
  );
  const [unitCount, setUnitCount] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date(Date.now() + 86400000 * 2);
    return d.toISOString().split('T')[0];
  });
  const [operatorOption, setOperatorOption] = useState<
    | 'With Qualified EIL Operator + RAMS (Recommended)'
    | 'Full Lifting Crew (Operator + Appointed Person + Slingers)'
    | 'Dry Hire (Machine Only — Workshop Tested)'
  >('With Qualified EIL Operator + RAMS (Recommended)');
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryCategory, setInquiryCategory] = useState(
    'Equipment Hiring & Plant Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)'
  );
  const [email, setEmail] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [preferredBranch, setPreferredBranch] = useState(EIL_BRANCHES[0].name);
  const [scopeNotes, setScopeNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedHire, setSubmittedHire] = useState<QuoteRecord | null>(null);
  const [routedTargetEmail, setRoutedTargetEmail] = useState<string>(EMAIL_ROUTES.HIRE);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedMachine =
    fleetMachines.find((m) => m.id === selectedMachineId) || fleetMachines[0];

  const handleUpdateFleetMachine = (
    id: string,
    updater: (m: CmsFleetMachineSpec) => CmsFleetMachineSpec
  ) => {
    updateCmsData((prev) => ({
      ...prev,
      fleetMachines: (prev.fleetMachines?.length
        ? prev.fleetMachines
        : DEFAULT_FLEET_MACHINES
      ).map((m) => (m.id === id ? updater(m) : m)),
    }));
  };

  const handleAddFleetMachine = () => {
    const newMachine: CmsFleetMachineSpec = {
      id: `machine-${Date.now()}`,
      name: 'New Heavy Plant / Equipment Unit',
      category: 'Forklifts & Material Handling',
      modelSpec: 'Workshop-Tested Heavy Industrial Plant Specification',
      capacityRating: 'High-Capacity SWL / Tonnage Rating',
      powerSource: 'Heavy-Duty Industrial Diesel',
      crewIncluded: 'Qualified EIL Operator, RAMS & Maintenance Support',
      highlights: [
        'Supplied with full Risk Assessment & Method Statement (RAMS)',
        'Open-ended flexible project lease across Port Harcourt, Warri & Nigeria',
      ],
      image: '/assets/eil/pdf_img_028.jpg',
    };
    updateCmsData((prev) => ({
      ...prev,
      fleetMachines: [
        ...(prev.fleetMachines?.length ? prev.fleetMachines : DEFAULT_FLEET_MACHINES),
        newMachine,
      ],
    }));
    setSelectedMachineId(newMachine.id);
  };

  const handleDeleteFleetMachine = (id: string) => {
    if (fleetMachines.length <= 1) return;
    updateCmsData((prev) => ({
      ...prev,
      fleetMachines: (prev.fleetMachines?.length
        ? prev.fleetMachines
        : DEFAULT_FLEET_MACHINES
      ).filter((m) => m.id !== id),
    }));
  };

  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !projectLocation.trim()) {
      setErrorMsg('Please enter your Name, Phone Number, and Project Mobilization Location.');
      return;
    }
    setErrorMsg('');

    const targetEmail = resolveTargetEmail(inquiryCategory);
    setRoutedTargetEmail(targetEmail);

    const generatedHireRef = `EIL-HIRE-${Math.floor(1000 + Math.random() * 9000)}`;
    const hireDurationSummary = `${unitCount} Unit(s) · Open-Ended Flexible Lease (Mobilizing ${startDate})`;
    const machineSpecsSummary = `• Machine: ${selectedMachine.name} (${selectedMachine.modelSpec})\n• Operator / Crew Option: ${operatorOption}`;

    const compiledMessage = [
      `Machine: ${selectedMachine.name} (${selectedMachine.modelSpec})`,
      `Units & Schedule: ${unitCount} Unit(s) · Open-Ended Flexible Lease (Mobilizing ${startDate})`,
      `Operator/Crew Option: ${operatorOption}`,
      `Company: ${companyName.trim() || 'Direct Project Contractor'}`,
      `Site Location: ${projectLocation.trim()}`,
      `Handling Branch: ${preferredBranch}`,
      scopeNotes.trim() ? `Notes: ${scopeNotes.trim()}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    const dualInput: DualSubmissionInput = {
      name: customerName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      category: inquiryCategory,
      message: compiledMessage,
      referenceCode: generatedHireRef,
      company: companyName.trim() || 'Direct Project Contractor',
      role: 'Plant & Equipment Hire Coordinator',
      branch: preferredBranch,
      location: projectLocation.trim(),
      quantityOrSchedule: hireDurationSummary,
      itemsOrSpecs: machineSpecsSummary,
      notes: scopeNotes.trim(),
    };

    const whatsappUrl = buildDualWhatsAppUrl(dualInput, targetEmail);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    setSubmitting(true);

    const payload = {
      customerName: customerName.trim(),
      companyName: companyName.trim() || 'Direct Project Contractor',
      positionTitle: 'Plant & Equipment Hire Coordinator',
      email: email.trim(),
      phone: phone.trim(),
      serviceType: inquiryCategory,
      quantityOrDuration: hireDurationSummary,
      location: projectLocation.trim(),
      preferredBranch,
      projectNotes: `Machine: ${selectedMachine.name} (${selectedMachine.modelSpec}) | Operator/Crew Option: ${operatorOption}. ${scopeNotes.trim()}`,
    };

    const [, apiResult] = await Promise.allSettled([
      dispatchFormSubmitEmail(dualInput, targetEmail),
      fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    ]);

    let finalHire: QuoteRecord = {
      id: `q-hire-${Date.now()}`,
      createdAt: new Date().toISOString(),
      referenceCode: generatedHireRef,
      ...payload,
      status: 'New',
    };

    if (apiResult.status === 'fulfilled' && apiResult.value.ok) {
      try {
        const data = await apiResult.value.json();
        if (data?.submission) {
          finalHire = data.submission;
        }
      } catch {
        // Fallback
      }
    }

    setSubmittedHire(finalHire);
    onQuoteSubmitted(finalHire);
    setCustomerName('');
    setCompanyName('');
    setPhone('');
    setEmail('');
    setProjectLocation('');
    setScopeNotes('');
    setSubmitting(false);
  };

  return (
    <div className="space-y-12">
      {/* PART A: INTERACTIVE FLEET GALLERY WITH SPECIFICATIONS */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-[#DC2626] block">
              <CmsText
                cmsKey="fleet_step1_badge"
                defaultValue="Step 1: Select Machine from Fleet Specifications Gallery"
                label="Fleet Gallery Step 1 Badge"
                section="Equipment Hire Tool"
              />
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] mt-1">
              <CmsText
                cmsKey="fleet_step1_heading"
                defaultValue="Heavy Equipment Lease Fleet & Technical Specifications"
                label="Fleet Gallery Heading"
                section="Equipment Hire Tool"
              />
            </h3>
            <p className="text-sm text-[#3B0707] mt-1">
              <CmsText
                cmsKey="fleet_step1_subtitle"
                defaultValue="Click any machine card below to load its specifications into the Equipment Hire Request Tool."
                label="Fleet Gallery Subtitle"
                section="Equipment Hire Tool"
              />
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isEditMode && (
              <button
                type="button"
                data-cms-explicit="true"
                onClick={handleAddFleetMachine}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Fleet Machine</span>
              </button>
            )}
            <a
              href="#hire-configurator-form"
              className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-full bg-[#0A0A0A] text-white text-xs font-extrabold hover:bg-[#DC2626] transition-colors text-center shrink-0"
            >
              Jump to Hire Date &amp; Operator Picker ↓
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fleetMachines.map((machine, idx) => {
            const isSelected = machine.id === selectedMachine.id;
            return (
              <motion.div
                key={machine.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => setSelectedMachineId(machine.id)}
                className={`group rounded-3xl overflow-hidden border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0A0A0A] text-white border-[#DC2626] ring-4 ring-[#DC2626]/25 shadow-2xl'
                    : 'bg-white text-[#0A0A0A] border-[#0A0A0A]/15 hover:border-[#DC2626] shadow-xs'
                }`}
              >
                <div>
                  <div className="h-52 relative overflow-hidden bg-[#0A0A0A]">
                    <CmsImage
                      src={machine.image}
                      defaultSrc={DEFAULT_FLEET_MACHINES.find((m) => m.id === machine.id)?.image || machine.image}
                      alt={machine.name}
                      label={`${machine.name} — Image`}
                      section="Fleet Machines"
                      targetWidth={960}
                      targetHeight={600}
                      aspectLabel="16:10 Fleet Card"
                      onSave={(newSrc) =>
                        handleUpdateFleetMachine(machine.id, (m) => ({
                          ...m,
                          image: newSrc,
                        }))
                      }
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-transparent to-transparent pointer-events-none" />
                    <div className={`absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-1.5 ${isEditMode ? 'z-50' : 'z-20'}`}>
                      <span className="px-2.5 py-1 rounded bg-[#0A0A0A]/90 text-white font-mono text-[10px] font-extrabold">
                        <CmsText
                          value={machine.category}
                          defaultValue={machine.category}
                          label={`${machine.name} — Category`}
                          section="Fleet Machines"
                          onSave={(val) =>
                            handleUpdateFleetMachine(machine.id, (m) => ({
                              ...m,
                              category: val as CmsFleetMachineSpec['category'],
                            }))
                          }
                        />
                      </span>
                      <div className="flex items-center gap-1">
                        {isSelected && (
                          <span className="px-2.5 py-1 rounded bg-[#DC2626] text-white text-[10px] font-extrabold uppercase">
                            Selected for Hire
                          </span>
                        )}
                        {isEditMode && fleetMachines.length > 1 && (
                          <button
                            type="button"
                            data-cms-explicit="true"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFleetMachine(machine.id);
                            }}
                            className="p-1.5 rounded bg-[#DC2626] text-white hover:bg-[#B91C1C] cursor-pointer"
                            title="Delete Machine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white z-20">
                      <span className="text-[11px] font-mono text-[#DC2626] font-extrabold block">
                        <CmsText
                          value={machine.capacityRating}
                          defaultValue={machine.capacityRating}
                          label={`${machine.name} — Capacity Rating`}
                          section="Fleet Machines"
                          onSave={(val) =>
                            handleUpdateFleetMachine(machine.id, (m) => ({
                              ...m,
                              capacityRating: val,
                            }))
                          }
                        />
                      </span>
                      <h4 className="text-base font-extrabold leading-snug">
                        <CmsText
                          value={machine.name}
                          defaultValue={machine.name}
                          label={`${machine.name} — Name`}
                          section="Fleet Machines"
                          onSave={(val) =>
                            handleUpdateFleetMachine(machine.id, (m) => ({ ...m, name: val }))
                          }
                        />
                      </h4>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div
                      className={`text-xs font-mono font-bold p-2.5 rounded-xl border ${
                        isSelected
                          ? 'bg-[#161616] text-red-100 border-white/15'
                          : 'bg-[#FFF8F8] text-[#0A0A0A] border-[#FECACA]'
                      }`}
                    >
                      <span className="text-[#DC2626] font-extrabold block">Specification:</span>
                      <CmsText
                        value={machine.modelSpec}
                        defaultValue={machine.modelSpec}
                        label={`${machine.name} — Specification`}
                        section="Fleet Machines"
                        onSave={(val) =>
                          handleUpdateFleetMachine(machine.id, (m) => ({
                            ...m,
                            modelSpec: val,
                          }))
                        }
                      />
                    </div>

                    <ul className="space-y-1.5 text-xs">
                      {machine.highlights.map((h, i) => (
                        <li
                          key={i}
                          className={`flex items-start justify-between gap-2 ${
                            isSelected ? 'text-red-100' : 'text-[#3B0707]'
                          }`}
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#DC2626] shrink-0 mt-0.5" />
                            <CmsText
                              value={h}
                              defaultValue={h}
                              label={`${machine.name} — Highlight #${i + 1}`}
                              section="Fleet Machines"
                              onSave={(val) =>
                                handleUpdateFleetMachine(machine.id, (m) => ({
                                  ...m,
                                  highlights: m.highlights.map((hl, idxH) =>
                                    idxH === i ? val : hl
                                  ),
                                }))
                              }
                            />
                          </div>
                          {isEditMode && (
                            <button
                              type="button"
                              data-cms-explicit="true"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateFleetMachine(machine.id, (m) => ({
                                  ...m,
                                  highlights: m.highlights.filter((_, idxH) => idxH !== i),
                                }));
                              }}
                              className="p-1 rounded bg-[#DC2626] text-white hover:bg-[#B91C1C] shrink-0 cursor-pointer"
                              title="Delete Highlight"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </li>
                      ))}
                      {isEditMode && (
                        <li>
                          <button
                            type="button"
                            data-cms-explicit="true"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateFleetMachine(machine.id, (m) => ({
                                ...m,
                                highlights: [...m.highlights, 'New Machine Highlight'],
                              }));
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#10B981] text-[#0A0A0A] text-[11px] font-extrabold cursor-pointer mt-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Add Highlight</span>
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div
                  className={`px-5 pb-5 pt-3 border-t flex items-center justify-between text-xs font-extrabold ${
                    isSelected ? 'border-white/15 text-[#DC2626]' : 'border-[#FECACA] text-[#0A0A0A]'
                  }`}
                >
                  <span>{isSelected ? '✓ Loaded in Hire Tool Below' : 'Pick Machine for Hire'}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* PART B: INTERACTIVE EQUIPMENT HIRE REQUEST CONFIGURATOR */}
      <div
        id="hire-configurator-form"
        className="bg-[#0A0A0A] text-white rounded-3xl border-2 border-[#DC2626] p-5 sm:p-10 shadow-2xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Selected Machine Summary & Operator Policy */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="inline-block px-3 py-1 rounded bg-[#DC2626] text-white text-xs font-mono font-extrabold uppercase">
                <CmsText
                  cmsKey="fleet_step2_badge"
                  defaultValue="Step 2: Configure Mobilization, Location & Operator"
                  label="Hire Tool Step 2 Badge"
                  section="Equipment Hire Tool"
                />
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                <CmsText
                  cmsKey="fleet_step2_heading"
                  defaultValue="Open-Ended Equipment Hire & Haulage Request"
                  label="Hire Tool Step 2 Heading"
                  section="Equipment Hire Tool"
                />
              </h3>
              <p className="text-[15px] sm:text-sm text-red-100 mt-2 leading-[1.65]">
                <CmsText
                  cmsKey="fleet_step2_desc"
                  defaultValue="Pick your required machine or haulage unit, select your preferred mobilization date, specify whether an EIL certified operator/lifting crew is required, and send directly to our Port Harcourt & Warri Fleet Desk."
                  label="Hire Tool Step 2 Description"
                  section="Equipment Hire Tool"
                  multiline
                />
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#161616] border border-white/15 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-[#DC2626] font-extrabold">
                Currently Selected Machine / Fleet Class
              </div>
              <div className="text-lg font-extrabold text-white">{selectedMachine.name}</div>
              <div className="text-xs text-red-200 font-mono">{selectedMachine.modelSpec}</div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                <span className="text-red-200">Lease Schedule Policy:</span>
                <span className="px-2.5 py-1 rounded bg-[#DC2626] text-white font-mono font-extrabold">
                  Open-Ended / Flexible · {unitCount} Unit(s)
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#161616] border-l-4 border-[#DC2626] text-[14px] sm:text-xs text-red-100 space-y-1 leading-[1.6]">
              <div className="font-extrabold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#DC2626] shrink-0" />
                <CmsText
                  cmsKey="fleet_rams_title"
                  defaultValue="Certified EIL Operator, Rigging Crew & Open-Ended Lease"
                  label="Operator & RAMS Box Title"
                  section="Equipment Hire Tool"
                />
              </div>
              <p>
                <CmsText
                  cmsKey="fleet_rams_desc"
                  defaultValue="All Forklifts, Excavators, Swamp Buggies, Dozers, Cranes, Backhoes, and Haulage Trucks are supplied with valid third-party test certificates, certified operators/drivers, and open-ended lease flexibility with no fixed time limits."
                  label="Operator & RAMS Box Text"
                  section="Equipment Hire Tool"
                  multiline
                />
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Hire Form */}
          <div className="lg:col-span-7 bg-white text-[#0A0A0A] rounded-2xl p-5 sm:p-8">
            {submittedHire ? (
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-extrabold text-[#DC2626]">
                      Hire Request Ref: {submittedHire.referenceCode}
                    </span>
                    <h4 className="text-xl font-extrabold text-[#0A0A0A] mt-0.5">
                      Equipment Hire Request Sent to Fleet Operations
                    </h4>
                    <p className="text-xs sm:text-sm font-bold text-[#0A0A0A] mt-1.5 leading-relaxed">
                      Thank you! Your inquiry has been sent to {routedTargetEmail} and opened in WhatsApp for instant chat, expect to hear from our representative soon!
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FFF8F8] border border-[#FECACA] text-xs space-y-1">
                  <div>
                    <strong>Operator &amp; Crew Selection:</strong> {operatorOption}
                  </div>
                  <div>
                    <strong>Handling EIL Yard / Branch:</strong> {submittedHire.preferredBranch}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={buildDualWhatsAppUrl(
                      {
                        name: submittedHire.customerName,
                        phone: submittedHire.phone,
                        email: submittedHire.email,
                        category: submittedHire.serviceType,
                        message: `Ref: ${submittedHire.referenceCode} | Machine: ${selectedMachine.name} | Schedule & Qty: ${submittedHire.quantityOrDuration} | Operator Option: ${operatorOption} | Location: ${submittedHire.location}`,
                        referenceCode: submittedHire.referenceCode,
                        company: submittedHire.companyName,
                        role: submittedHire.positionTitle,
                        branch: submittedHire.preferredBranch,
                        location: submittedHire.location,
                        quantityOrSchedule: submittedHire.quantityOrDuration,
                        itemsOrSpecs: `• Machine: ${selectedMachine.name} (${selectedMachine.modelSpec})\n• Operator / Crew Option: ${operatorOption}`,
                        notes: submittedHire.projectNotes,
                      },
                      routedTargetEmail
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#DC2626] hover:bg-[#0A0A0A] text-white text-xs font-extrabold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Re-open in WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setSubmittedHire(null)}
                    className="px-5 py-3 rounded-xl border-2 border-[#0A0A0A] text-xs font-extrabold text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-colors cursor-pointer"
                  >
                    Request Another Machine
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleHireSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-100 border border-[#DC2626] text-xs font-bold text-[#0A0A0A]">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                    Inquiry Type / Department *
                  </label>
                  <select
                    value={inquiryCategory}
                    onChange={(e) => setInquiryCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs font-bold text-[#0A0A0A] bg-white focus:outline-none focus:border-[#DC2626]"
                  >
                    {SERVICE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Machine Selector + Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  <div className="sm:col-span-9">
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      1. Pick Machine / Fleet Class *
                    </label>
                    <select
                      value={selectedMachine.id}
                      onChange={(e) => setSelectedMachineId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs font-bold text-[#0A0A0A] bg-white focus:outline-none focus:border-[#DC2626]"
                    >
                      {fleetMachines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} — {m.capacityRating}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      Units *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={unitCount}
                      onChange={(e) =>
                        setUnitCount(Math.max(1, parseInt(e.target.value, 10) || 1))
                      }
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-center font-mono font-extrabold text-xs text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                </div>

                {/* Preferred Mobilization Date & Open-Ended Lease Policy (NO FIXED DURATION / NO TIMER) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      2. Preferred Mobilization Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 font-mono text-xs font-bold text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="px-3.5 py-2.5 rounded-xl bg-[#FFF8F8] border-2 border-[#DC2626]/40 text-center">
                      <span className="text-[10px] font-mono uppercase text-[#7F1D1D] block">
                        Lease Schedule Policy
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-extrabold text-[#DC2626]">
                        Open-Ended · No Fixed Time Limit
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operator Needed Toggle */}
                <div data-cms-ignore="true">
                  <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1.5">
                    3. Is an Operator or Lifting Crew Needed? *
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {(
                      [
                        'With Qualified EIL Operator + RAMS (Recommended)',
                        'Full Lifting Crew (Operator + Appointed Person + Slingers)',
                        'Dry Hire (Machine Only — Workshop Tested)',
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setOperatorOption(opt)}
                        className={`px-3.5 py-2.5 rounded-xl border-2 text-left text-xs font-extrabold transition-all cursor-pointer flex items-center justify-between ${
                          operatorOption === opt
                            ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                            : 'bg-[#FFF8F8] text-[#0A0A0A] border-[#0A0A0A]/15 hover:border-[#DC2626]'
                        }`}
                      >
                        <span>{opt}</span>
                        {operatorOption === opt && (
                          <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location & Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      4. Project / Site Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                      placeholder="e.g. Port Harcourt, Warri, Bonny Island, Onne"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      Dispatch EIL Yard / Branch
                    </label>
                    <select
                      value={preferredBranch}
                      onChange={(e) => setPreferredBranch(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs text-[#0A0A0A] bg-white focus:outline-none focus:border-[#DC2626]"
                    >
                      {(cmsData.branches?.length ? cmsData.branches : EIL_BRANCHES).map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Engr. / Plant Coordinator"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Contractor / Industrial Company"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 703 825 9142"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="plant@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0A0A0A] mb-1">
                    Site Conditions / Tonnage / Lowbed Mobilization Notes
                  </label>
                  <input
                    type="text"
                    value={scopeNotes}
                    onChange={(e) => setScopeNotes(e.target.value)}
                    placeholder="e.g. Swamp terrain access required, or pair with Lowbed / Dump Truck haulage..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0A0A0A]/20 text-xs text-[#0A0A0A] focus:outline-none focus:border-[#DC2626]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full min-h-[48px] py-3.5 px-6 rounded-xl bg-[#DC2626] hover:bg-[#0A0A0A] text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>
                    {submitting
                      ? 'Sending Request to Fleet Team...'
                      : `Send Equipment Hire Request (${unitCount} Unit${unitCount > 1 ? 's' : ''})`}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
