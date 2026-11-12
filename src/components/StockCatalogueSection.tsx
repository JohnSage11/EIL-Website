import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Plus,
  Check,
  SlidersHorizontal,
  ArrowRight,
  Flame,
  Wrench,
  Layers,
  Trash2,
  PlusCircle,
} from 'lucide-react';
import { StockItem, GasDetail, INDUSTRIAL_GASES_DETAIL } from '../data/eilData';
import { CmsText, CmsImage, useCms } from './StealthCmsAdmin';

interface StockCatalogueSectionProps {
  onAddToEnquiry: (item: StockItem, quantity: number) => void;
  onOpenQuoteModal: (prefillService?: string, prefillNotes?: string) => void;
  basketItemIds: Record<string, number>;
  onOpenBasket: () => void;
}

const CATEGORIES: Array<'All' | StockItem['category']> = [
  'All',
  'Forklifts & Lifting',
  'Excavators & Swamp Buggies',
  'Dozers & Earthmoving',
  'Mobile & Crawler Cranes',
  'Backhoes & Loaders',
  'Lowbed & Flatbed Haulage',
  'Tankers & Pneumatic Trucks',
  'Dump Trucks & Support Plant',
];

const CATEGORY_PREVIEW_META: Record<
  Exclude<StockItem['category'], 'All'>,
  { image: string; intro: string; phone: string; code: string }
> = {
  'Forklifts & Lifting': {
    code: '01',
    image: '/assets/eil/pdf_img_044.jpg',
    intro:
      '3-Ton, 5-Ton, 7-Ton, 10-Ton, 15-Ton, and 25T–32T Diesel Industrial Forklifts, 45T Container Reach Stackers, and 17m Rough-Terrain Telehandlers supplied with certified operators.',
    phone: '(+234) 070-3825-9142',
  },
  'Excavators & Swamp Buggies': {
    code: '02',
    image: '/assets/eil/pdf_img_028.jpg',
    intro:
      '20T, 30T, and 36T–45T Tracked Hydraulic Excavators (CAT 320/330/336 class), 16m–20m Long-Reach Dredging Booms, Hydraulic Rock Breakers, and Pontoon Amphibious Swamp Buggies.',
    phone: '(+234) 070-3825-9142',
  },
  'Dozers & Earthmoving': {
    code: '03',
    image: '/assets/eil/gen_bulldozer.jpg',
    intro:
      'CAT D6R/D6H, D7G/D7R, and D8R/D8T Crawler Bulldozers (Standard & LGP Swamp Tracks), CAT 140H/140K Motor Graders, and 10T–20T Single-Drum Vibratory Soil Compactors.',
    phone: '(+234) 070-3825-9142',
  },
  'Mobile & Crawler Cranes': {
    code: '04',
    image: '/assets/eil/pdf_img_019.jpg',
    intro:
      '25T–50T 4x4 Rough-Terrain Cranes, 50T–150T+ All-Terrain Hydraulic Mobile Cranes, 50T–100T Lattice-Boom Crawler Cranes, and 10T–20T Truck-Mounted Hiab Self-Loaders.',
    phone: '(+234) 070-3825-9142',
  },
  'Backhoes & Loaders': {
    code: '05',
    image: '/assets/eil/gen_backhoe_loader.jpg',
    intro:
      '4WD Backhoe Loaders (CAT 428 / JCB 3CX), Front-End Wheel Loaders / Payloaders (CAT 950 / 966 class, 3.0–4.6 CBM), Skid-Steer Bobcat Loaders, and Wheeled Excavators.',
    phone: '(+234) 070-3825-9142',
  },
  'Lowbed & Flatbed Haulage': {
    code: '06',
    image: '/assets/eil/gen_lowbed_trailer.jpg',
    intro:
      '40T, 60T, 80T to 100T+ Multi-Axle Gooseneck Lowbed Trailers for heavy plant mobilization, plus 40ft & 45ft Flatbed Trailers with ISO Twist-Locks and OCTG Pipe Stanchions.',
    phone: '(+234) 070-3825-9142',
  },
  'Tankers & Pneumatic Trucks': {
    code: '07',
    image: '/assets/eil/pdf_img_021.jpg',
    intro:
      'Calibrated 15,000L–45,000L Bulk Diesel (AGO) Road Tankers, Pressurized Spray Water Bowsers, and 35–50 CBM Pneumatic Bulk Silo Trucks for Cement, Barite & Bentonite.',
    phone: '(+234) 070-3825-9142',
  },
  'Dump Trucks & Support Plant': {
    code: '08',
    image: '/assets/eil/gen_dump_truck.jpg',
    intro:
      '20T–45T 6x4 & 8x4 Heavy Hydraulic Dump Trucks (Tippers), Soundproof Diesel Generators (100–500 kVA), Rotary Air Compressors (185–750 CFM), Lighting Towers & Dewatering Pumps.',
    phone: '(+234) 070-3825-9142',
  },
};

const QUICK_SEARCH_TERMS = [
  'Forklift',
  'Excavator',
  'Dozer',
  'Crane',
  'Backhoe',
  'Lowbed',
  'Flatbed',
  'Tanker',
  'Pneumatic',
  'Dump Truck',
  'Swamp Buggy',
  'Payloader',
];

export const StockCatalogueSection: React.FC<StockCatalogueSectionProps> = ({
  onAddToEnquiry,
  onOpenQuoteModal,
  basketItemIds,
  onOpenBasket,
}) => {
  const { cmsData, isEditMode, updateCmsData } = useCms();
  const stockList = cmsData.stockCatalogue;
  const gasList = cmsData.industrialGases;

  const [selectedCategory, setSelectedCategory] = useState<'All' | StockItem['category']>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [pointsOnly, setPointsOnly] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [recentlyAdded, setRecentlyAdded] = useState<Record<string, boolean>>({});
  const [showGasReference, setShowGasReference] = useState(false);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stockList.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (pointsOnly && !item.pointsEligible) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.subcategory.toLowerCase().includes(q) ||
        item.spec.toLowerCase().includes(q)
      );
    });
  }, [stockList, selectedCategory, searchQuery, pointsOnly]);

  const handleQtyChange = (id: string, val: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, val) }));
  };

  const handleAdd = (item: StockItem) => {
    const qty = quantities[item.id] || 1;
    onAddToEnquiry(item, qty);
    setRecentlyAdded((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setRecentlyAdded((prev) => ({ ...prev, [item.id]: false }));
    }, 1400);
  };

  // Dynamic List CRUD for Stock Items
  const handleUpdateStockItem = (id: string, patch: Partial<StockItem>) => {
    updateCmsData((prev) => ({
      ...prev,
      stockCatalogue: prev.stockCatalogue.map((it) =>
        it.id === id ? { ...it, ...patch } : it
      ),
    }));
  };

  const handleAddStockItem = () => {
    const defaultCategory: StockItem['category'] =
      selectedCategory === 'All' ? 'Forklifts & Lifting' : selectedCategory;
    const newItem: StockItem = {
      id: `custom-stock-${Date.now()}`,
      name: 'New Equipment or Haulage Unit (Click to Edit)',
      category: defaultCategory,
      subcategory: 'Heavy Fleet Unit',
      spec: 'Specify tonnage capacity, boom reach, axle configuration, or project application here.',
      availability: 'Available for Hire',
      unit: 'Unit',
      pointsEligible: true,
    };
    updateCmsData((prev) => ({
      ...prev,
      stockCatalogue: [newItem, ...prev.stockCatalogue],
    }));
  };

  const handleDeleteStockItem = (id: string) => {
    updateCmsData((prev) => ({
      ...prev,
      stockCatalogue: prev.stockCatalogue.filter((it) => it.id !== id),
    }));
  };

  // Dynamic List CRUD for Equipment & Haulage Fleet Reference Cards
  const handleUpdateGasItem = (index: number, patch: Partial<GasDetail>) => {
    updateCmsData((prev) => ({
      ...prev,
      industrialGases: prev.industrialGases.map((g, idx) =>
        idx === index ? { ...g, ...patch } : g
      ),
    }));
  };

  const handleAddGasItem = () => {
    const newGas: GasDetail = {
      name: 'New Fleet Class',
      formula: 'FLEET',
      group: 'Heavy Haulage Trailers',
      image: '/assets/eil/gen_lowbed_trailer.jpg',
      features: [
        'Available for open-ended project hire or haulage charter',
        'Dispatched with certified operator/driver from Port Harcourt or Warri',
      ],
    };
    updateCmsData((prev) => ({
      ...prev,
      industrialGases: [...prev.industrialGases, newGas],
    }));
  };

  const handleDeleteGasItem = (index: number) => {
    updateCmsData((prev) => ({
      ...prev,
      industrialGases: prev.industrialGases.filter((_, idx) => idx !== index),
    }));
  };

  const activeCategoryMeta =
    selectedCategory !== 'All' ? CATEGORY_PREVIEW_META[selectedCategory] : null;

  return (
    <section id="stock-catalogue" className="py-12 sm:py-16 lg:py-20 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0A0A0A] text-[#FFFFFF] text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <Layers className="w-3.5 h-3.5 text-[#DC2626]" />
              <CmsText
                cmsKey="stock_cat_badge"
                defaultValue="Equipment Hire & Haulage Fleet · Port Harcourt & Warri"
                label="Stock Catalogue Badge"
                section="Product & Supply"
              />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A0A0A] tracking-tight">
              <CmsText
                cmsKey="stock_cat_heading_1"
                defaultValue="Searchable Equipment Hire &"
                label="Stock Catalogue Heading (Part 1)"
                section="Product & Supply"
              />{' '}
              <span className="text-[#DC2626]">
                <CmsText
                  cmsKey="stock_cat_heading_2"
                  defaultValue="Haulage Fleet Catalogue"
                  label="Stock Catalogue Heading (Highlight)"
                  section="Product & Supply"
                />
              </span>
            </h2>
            <p className="mt-3 text-[15px] sm:text-base text-[#3B0707] max-w-2xl leading-[1.65]">
              <CmsText
                cmsKey="stock_cat_intro"
                defaultValue="EIL maintains a comprehensive fleet of heavy machinery for hire/lease (Forklifts of different tonnages, Excavators, Swamp Buggies, Dozers, Cranes, Backhoes, Payloaders, Graders) and specialized Haulage Services (Lowbeds, Flatbeds, Bulk Tankers, Pneumatic Silo Trucks, and Dump Trucks) with open-ended schedule flexibility. Add multiple units to your Enquiry Basket for a consolidated quote."
                label="Stock Catalogue Intro Paragraph"
                section="Product & Supply"
                multiline
              />
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowGasReference((prev) => !prev)}
              className="w-full sm:w-auto min-h-[48px] px-4 py-2.5 text-xs font-bold rounded-full border-2 border-[#0A0A0A] text-[#0A0A0A] bg-[#FFFFFF] hover:bg-[#0A0A0A] hover:text-[#FFFFFF] hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>
                {showGasReference
                  ? 'Hide Fleet Technical Specs Guide'
                  : 'View Equipment & Haulage Fleet Specs Guide'}
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                onOpenQuoteModal(
                  selectedCategory === 'All' ? 'Equipment Hiring & Haulage Fleet' : selectedCategory,
                  'Requesting commercial quote for equipment hire or haulage services.'
                )
              }
              className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 text-xs font-bold rounded-full bg-[#DC2626] text-[#FFFFFF] hover:bg-[#0A0A0A] hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <CmsText
                cmsKey="stock_cat_cta_btn"
                defaultValue="Request Custom Fleet Quote"
                label="Stock Catalogue Quote Button"
                section="Product & Supply"
              />
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* Scroll-Animated Product & Supply Division Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-10">
          {(Object.keys(CATEGORY_PREVIEW_META) as Array<Exclude<StockItem['category'], 'All'>>).map(
            (cat, idx) => {
              const meta = CATEGORY_PREVIEW_META[cat];
              const isSelected = selectedCategory === cat;
              const catSlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '_');
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={{ y: -6, scale: 1.03 }}
                  onClick={() =>
                    setSelectedCategory((prev) => (prev === cat ? 'All' : cat))
                  }
                  role="button"
                  tabIndex={0}
                  className={`group relative rounded-2xl overflow-hidden text-left border-2 transition-colors duration-200 cursor-pointer flex flex-col justify-between h-40 p-3.5 ${
                    isSelected
                      ? 'border-[#DC2626] ring-2 ring-[#DC2626]/30 bg-[#0A0A0A]'
                      : 'border-[#0A0A0A]/15 hover:border-[#DC2626] bg-[#0A0A0A]'
                  }`}
                >
                  <div className={`absolute inset-0 ${isEditMode ? 'z-30' : ''}`}>
                    <CmsImage
                      cmsKey={`stock_cat_card_img_${catSlug}`}
                      src={
                        cmsData.customImages?.[`stock_cat_card_img_${catSlug}`] ||
                        cmsData.customImages?.[`stock_spotlight_img_${cat}`] ||
                        cmsData.customImages?.[`ai_default_${meta.image}`]
                      }
                      defaultSrc={meta.image}
                      alt={cat}
                      label={`${cat} Category Card Image`}
                      section="Product & Supply"
                      targetWidth={800}
                      targetHeight={500}
                      aspectLabel="16:10 Category Card"
                      onSave={(newSrc) => {
                        const isReset = !newSrc || newSrc === meta.image;
                        updateCmsData((prev) => {
                          const nextCustomImages = { ...prev.customImages };
                          if (isReset) {
                            delete nextCustomImages[`stock_cat_card_img_${catSlug}`];
                            delete nextCustomImages[`stock_spotlight_img_${cat}`];
                            if (meta.image.includes('/gen_')) {
                              delete nextCustomImages[`ai_default_${meta.image}`];
                            }
                          } else {
                            nextCustomImages[`stock_cat_card_img_${catSlug}`] = newSrc;
                            nextCustomImages[`stock_spotlight_img_${cat}`] = newSrc;
                            if (meta.image.includes('/gen_')) {
                              nextCustomImages[`ai_default_${meta.image}`] = newSrc;
                            }
                          }
                          return {
                            ...prev,
                            customImages: nextCustomImages,
                          };
                        });
                      }}
                      className="w-full h-full object-cover opacity-55 group-hover:opacity-75 group-hover:scale-110 transition-all duration-500"
                    />
                    <div
                      className={`absolute inset-0 transition-colors duration-300 pointer-events-none ${
                        isSelected
                          ? 'bg-gradient-to-t from-[#DC2626]/95 via-[#0A0A0A]/65 to-[#0A0A0A]/30'
                          : 'bg-gradient-to-t from-[#0A0A0A]/95 via-[#0A0A0A]/55 to-transparent group-hover:from-[#DC2626]/90'
                      }`}
                    />
                  </div>
                  <div className="relative z-10 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded bg-[#0A0A0A]/80 text-[#FFFFFF] font-mono text-[10px] font-bold">
                      {meta.code}
                    </span>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded bg-[#FFFFFF] text-[#DC2626] text-[9px] font-extrabold uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="relative z-10 pointer-events-none">
                    <div className="text-xs font-extrabold text-[#FFFFFF] leading-tight group-hover:text-[#FFFFFF] pointer-events-auto inline-block">
                      <CmsText
                        cmsKey={`stock_cat_card_title_${catSlug}`}
                        defaultValue={cat}
                        label={`${cat} Card Title`}
                        section="Product & Supply"
                      />
                    </div>
                    <div data-cms-ignore="true" className="text-[10px] font-mono text-red-200 mt-0.5 pointer-events-none">
                      {stockList.filter((i) => i.category === cat).length} groups →
                    </div>
                  </div>
                </motion.div>
              );
            }
          )}
        </div>

        {/* Collapsible Industrial Gas Technical Reference (also always visible if Edit Mode is ON so Admin can edit it easily) */}
        {(showGasReference || isEditMode) && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-5 sm:p-8 rounded-3xl bg-[#0A0A0A] text-[#FFFFFF] border-2 border-[#DC2626]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/15">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#DC2626] font-bold">
                  <CmsText
                    cmsKey="gas_ref_badge"
                    defaultValue="EIL Heavy Equipment Hiring & Haulage Technical Matrix"
                    label="Fleet Reference Badge"
                    section="Fleet Technical Reference"
                  />
                </span>
                <h3 className="text-xl font-extrabold text-[#FFFFFF] mt-1">
                  <CmsText
                    cmsKey="gas_ref_heading"
                    defaultValue="Equipment Tonnages, Earthmoving Classes & Haulage Trailer Specifications"
                    label="Fleet Reference Heading"
                    section="Fleet Technical Reference"
                  />
                </h3>
                <p className="text-[15px] sm:text-base text-red-100 mt-1 leading-[1.65]">
                  <CmsText
                    cmsKey="gas_ref_subtitle"
                    defaultValue="Available for immediate mobilization from our Port Harcourt (Plot 213, Old Aba Road) and Warri (9, Etuwewe Road) yards with open-ended, flexible project lease terms."
                    label="Fleet Reference Subtitle"
                    section="Fleet Technical Reference"
                    multiline
                  />
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                <span className="text-xs font-mono-num text-[#DC2626] bg-white px-3 py-1.5 rounded-lg font-bold">
                  <CmsText
                    cmsKey="gas_ref_phone"
                    defaultValue="Fleet Desk: (+234) 070-3825-9142"
                    label="Fleet Supply Desk Phone"
                    section="Fleet Technical Reference"
                  />
                </span>
                {isEditMode && (
                  <button
                    type="button"
                    data-cms-explicit="true"
                    onClick={handleAddGasItem}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-md"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Add Fleet Card</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
              {gasList.map((gas, gIdx) => {
                const defaultGasImg =
                  INDUSTRIAL_GASES_DETAIL[gIdx]?.image || gas.image || '/assets/eil/pdf_img_028.jpg';
                return (
                <div
                  key={`${gas.name}-${gIdx}`}
                  className="bg-[#141414] hover:bg-[#1F1F1F] rounded-2xl p-4 border border-white/15 hover:border-[#DC2626] transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    <div className="aspect-[16/10] rounded-xl overflow-hidden mb-3 border border-white/10 bg-[#0A0A0A] relative">
                      <CmsImage
                        src={gas.image || defaultGasImg}
                        defaultSrc={defaultGasImg}
                        alt={gas.name}
                        label={`Fleet Spec ${gIdx + 1}: ${gas.name} Image`}
                        section="Fleet Technical Reference"
                        targetWidth={800}
                        targetHeight={500}
                        aspectLabel="16:10 Fleet Spec Card"
                        onSave={(newSrc) => handleUpdateGasItem(gIdx, { image: newSrc })}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono text-red-300">
                        <CmsText
                          value={gas.group}
                          defaultValue={gas.group}
                          label={`Gas ${gIdx + 1} Group`}
                          section="Industrial Gas Reference"
                          onSave={(val) =>
                            handleUpdateGasItem(gIdx, {
                              group: val as GasDetail['group'],
                            })
                          }
                        />
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono-num text-xs font-extrabold px-2 py-0.5 rounded bg-[#DC2626] text-[#FFFFFF]">
                          <CmsText
                            value={gas.formula}
                            defaultValue={gas.formula}
                            label={`Gas ${gIdx + 1} Formula`}
                            section="Industrial Gas Reference"
                            onSave={(val) => handleUpdateGasItem(gIdx, { formula: val })}
                          />
                        </span>
                        {isEditMode && (
                          <button
                            type="button"
                            data-cms-explicit="true"
                            onClick={() => handleDeleteGasItem(gIdx)}
                            title="Delete this gas card"
                            className="p-1 rounded-md bg-[#DC2626] hover:bg-red-700 text-white cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 className="text-base font-extrabold text-[#FFFFFF] mb-2">
                      <CmsText
                        value={gas.name}
                        defaultValue={gas.name}
                        label={`Gas ${gIdx + 1} Name`}
                        section="Industrial Gas Reference"
                        onSave={(val) => handleUpdateGasItem(gIdx, { name: val })}
                      />
                    </h4>
                    <ul className="space-y-1.5 text-xs text-red-100/90">
                      {gas.features.map((feat, fIdx) => (
                        <li key={fIdx} className="leading-snug flex items-start justify-between gap-1">
                          <span>
                            •{' '}
                            <CmsText
                              value={feat}
                              defaultValue={feat}
                              label={`Gas ${gas.name} Feature ${fIdx + 1}`}
                              section="Industrial Gas Reference"
                              onSave={(val) => {
                                const updated = [...gas.features];
                                updated[fIdx] = val;
                                handleUpdateGasItem(gIdx, { features: updated });
                              }}
                            />
                          </span>
                          {isEditMode && gas.features.length > 1 && (
                            <button
                              type="button"
                              data-cms-explicit="true"
                              onClick={() => {
                                const updated = gas.features.filter((_, i) => i !== fIdx);
                                handleUpdateGasItem(gIdx, { features: updated });
                              }}
                              className="text-red-400 hover:text-red-200 text-[10px] font-mono shrink-0 cursor-pointer"
                              title="Remove feature"
                            >
                              [×]
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                    {isEditMode && (
                      <button
                        type="button"
                        data-cms-explicit="true"
                        onClick={() =>
                          handleUpdateGasItem(gIdx, {
                            features: [...gas.features, 'New gas specification bullet'],
                          })
                        }
                        className="mt-2 text-[10px] font-mono font-bold text-[#10B981] hover:underline cursor-pointer block"
                      >
                        + Add Bullet Point
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(gas.name.split(' ')[0]);
                      setShowGasReference(false);
                    }}
                    className="mt-4 pt-2.5 border-t border-white/10 text-xs font-bold text-[#DC2626] group-hover:text-[#FFFFFF] text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>Filter in Stock List</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Search & Filter Control Bar */}
        <div className="bg-[#FFF8F8] border-2 border-[#0A0A0A]/10 rounded-3xl p-5 sm:p-6 mb-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-7 relative">
              <Search className="w-5 h-5 text-[#DC2626] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search equipment or haulage fleet (e.g. "Forklift", "Excavator", "Dozer", "Crane", "Backhoe", "Lowbed", "Flatbed", "Tanker", "Pneumatic", "Dump Truck")...'
                className="w-full pl-12 pr-20 py-3.5 bg-[#FFFFFF] border-2 border-[#0A0A0A]/20 rounded-xl text-sm font-medium text-[#0A0A0A] placeholder-[#7F1D1D]/60 focus:outline-none focus:border-[#DC2626] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-bold text-[#FFFFFF] bg-[#0A0A0A] hover:bg-[#DC2626] rounded-md transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="lg:col-span-5 flex flex-wrap items-center justify-between lg:justify-end gap-3">
              <button
                type="button"
                onClick={() => setPointsOnly((prev) => !prev)}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-extrabold border-2 transition-all duration-200 whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer shadow-xs ${
                  pointsOnly
                    ? 'bg-[#DC2626] text-[#FFFFFF] border-[#DC2626] ring-4 ring-[#DC2626]/20 scale-[1.02]'
                    : 'bg-[#FFFFFF] text-[#0A0A0A] border-[#0A0A0A]/20 hover:border-[#DC2626] hover:text-[#DC2626]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>
                  Priority Corporate Fleet Units ({stockList.filter((i) => i.pointsEligible).length})
                </span>
                {pointsOnly && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-[#0A0A0A] text-[#FFFFFF] font-mono text-[10px] uppercase">
                    Active
                  </span>
                )}
              </button>

              <div className="text-xs font-mono-num text-[#3B0707]">
                Showing <strong className="text-[#0A0A0A] font-extrabold">{filteredItems.length}</strong> of{' '}
                {stockList.length} fleet groups
              </div>
            </div>
          </div>

          {pointsOnly && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-2xl bg-[#0A0A0A] text-[#FFFFFF] border-2 border-[#DC2626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-[11px] font-mono font-extrabold uppercase tracking-wider text-[#DC2626]">
                  <span>★ Priority Corporate Fleet Filter Active</span>
                  <span>·</span>
                  <span>{filteredItems.length} Flagship Units Shown</span>
                </div>
                <p className="text-xs text-red-100 leading-relaxed max-w-2xl">
                  Showing high-demand flagship equipment and haulage trailers eligible for{' '}
                  <strong className="text-white">Immediate PH &amp; Warri Yard Dispatch</strong>,{' '}
                  <strong className="text-white">Open-Ended Corporate Call-Off Priority</strong>, and{' '}
                  <strong className="text-white">EIL Volume Partner Rebates</strong>.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() =>
                    onOpenQuoteModal(
                      'Equipment Hiring & Plant Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)',
                      `Priority Corporate Fleet Enquiry (${filteredItems.length} flagship units${
                        selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''
                      })`
                    )
                  }
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-[#DC2626] hover:bg-white text-white hover:text-[#0A0A0A] text-xs font-extrabold transition-colors cursor-pointer text-center"
                >
                  Request Priority Fleet Quote →
                </button>
                <button
                  type="button"
                  onClick={() => setPointsOnly(false)}
                  className="px-3 py-2 rounded-xl border border-white/25 hover:border-white text-xs font-bold text-red-100 hover:text-white transition-colors cursor-pointer"
                >
                  Show All {stockList.length} Units
                </button>
              </div>
            </motion.div>
          )}

          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#0A0A0A] font-bold">Quick search:</span>
            {QUICK_SEARCH_TERMS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setSearchQuery(term)}
                className={`px-2.5 py-1.5 rounded-md transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  searchQuery.toLowerCase() === term.toLowerCase()
                    ? 'bg-[#DC2626] text-[#FFFFFF] font-bold scale-105'
                    : 'bg-[#FFFFFF] text-[#0A0A0A] border border-[#0A0A0A]/15 hover:bg-[#0A0A0A] hover:text-[#FFFFFF] hover:border-[#0A0A0A]'
                }`}
              >
                {term}
              </button>
            ))}
          </div>

          {/* Category Segmented Filter Bar */}
          <div className="mt-5 pt-4 border-t border-[#FECACA] flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              const count =
                cat === 'All'
                  ? stockList.length
                  : stockList.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#DC2626] text-[#FFFFFF] shadow-xs scale-[1.03]'
                      : 'bg-[#FFFFFF] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#FFFFFF] border border-[#0A0A0A]/15'
                  }`}
                >
                  {cat} <span className="font-mono-num opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Category Spotlight Banner */}
        {activeCategoryMeta && selectedCategory !== 'All' && (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border-2 border-[#0A0A0A] bg-[#0A0A0A] text-[#FFFFFF]"
          >
            <div className="lg:col-span-4 aspect-[16/10] sm:h-52 lg:h-auto relative overflow-hidden">
              <CmsImage
                cmsKey={`stock_spotlight_img_${selectedCategory}`}
                src={
                  cmsData.customImages?.[`stock_spotlight_img_${selectedCategory}`] ||
                  cmsData.customImages?.[
                    `stock_cat_card_img_${selectedCategory.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
                  ] ||
                  cmsData.customImages?.[`ai_default_${activeCategoryMeta.image}`]
                }
                defaultSrc={activeCategoryMeta.image}
                alt={selectedCategory}
                label={`${selectedCategory} Spotlight Image`}
                section="Product & Supply"
                targetWidth={800}
                targetHeight={500}
                aspectLabel="16:10 Spotlight Banner"
                onSave={(newSrc) => {
                  const catSlug = selectedCategory.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                  const isReset = !newSrc || newSrc === activeCategoryMeta.image;
                  updateCmsData((prev) => {
                    const nextCustomImages = { ...prev.customImages };
                    if (isReset) {
                      delete nextCustomImages[`stock_spotlight_img_${selectedCategory}`];
                      delete nextCustomImages[`stock_cat_card_img_${catSlug}`];
                      if (activeCategoryMeta.image.includes('/gen_')) {
                        delete nextCustomImages[`ai_default_${activeCategoryMeta.image}`];
                      }
                    } else {
                      nextCustomImages[`stock_spotlight_img_${selectedCategory}`] = newSrc;
                      nextCustomImages[`stock_cat_card_img_${catSlug}`] = newSrc;
                      if (activeCategoryMeta.image.includes('/gen_')) {
                        nextCustomImages[`ai_default_${activeCategoryMeta.image}`] = newSrc;
                      }
                    }
                    return {
                      ...prev,
                      customImages: nextCustomImages,
                    };
                  });
                }}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="lg:col-span-8 p-5 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#DC2626]">
                  <CmsText
                    cmsKey={`stock_spotlight_badge_${selectedCategory}`}
                    defaultValue={`EIL Product & Supply Division · List ${activeCategoryMeta.code}`}
                    label={`${selectedCategory} Spotlight Badge`}
                    section="Product & Supply"
                  />
                </div>
                <h3 className="text-2xl font-extrabold text-[#FFFFFF] mt-1">
                  <CmsText
                    cmsKey={`stock_spotlight_title_${selectedCategory}`}
                    defaultValue={selectedCategory}
                    label={`${selectedCategory} Spotlight Title`}
                    section="Product & Supply"
                  />
                </h3>
                <p className="text-[15px] sm:text-base text-red-100 mt-2 leading-[1.65]">
                  <CmsText
                    cmsKey={`stock_spotlight_intro_${selectedCategory}`}
                    defaultValue={activeCategoryMeta.intro}
                    label={`${selectedCategory} Spotlight Description`}
                    section="Product & Supply"
                    multiline
                  />
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs text-red-200">
                <span>
                  Open-ended, flexible project lease terms available for all {selectedCategory} units.
                </span>
                <span className="font-mono-num font-bold text-[#FFFFFF] bg-[#DC2626] px-3 py-1 rounded-md">
                  Direct Fleet Desk: {activeCategoryMeta.phone}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Admin Add Stock Item Bar when Edit Mode is ON */}
        {isEditMode && (
          <div
            data-cms-explicit="true"
            className="mb-5 p-4 rounded-2xl bg-[#ECFDF5] border-2 border-dashed border-[#10B981] flex flex-wrap items-center justify-between gap-3"
          >
            <div className="text-xs font-extrabold text-[#065F46]">
              Admin Catalogue Controls: Click any item’s name, category, specification, or status below to edit inline, or add/remove fleet items.
            </div>
            <button
              type="button"
              onClick={handleAddStockItem}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>
                + Add New Fleet Item{' '}
                {selectedCategory !== 'All' ? `(${selectedCategory})` : ''}
              </span>
            </button>
          </div>
        )}

        {/* Filterable Stock Table */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4 bg-[#FFF8F8] rounded-3xl border-2 border-[#FECACA]">
            <Wrench className="w-10 h-10 text-[#DC2626] mx-auto mb-3 opacity-80" />
            <h3 className="text-lg font-extrabold text-[#0A0A0A]">
              No listed fleet unit matched &ldquo;{searchQuery}&rdquo;
            </h3>
            <p className="text-[15px] sm:text-base text-[#3B0707] max-w-md mx-auto mt-1 leading-[1.65]">
              We have additional heavy plant machinery and specialized haulage trucks available across our Port Harcourt and Warri yards. Call (+234) 070-3825-9142 or request a quote below.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setPointsOnly(false);
                }}
                className="min-h-[44px] px-4 py-2 text-xs font-bold rounded-lg border-2 border-[#0A0A0A] text-[#0A0A0A] bg-[#FFFFFF] hover:bg-[#0A0A0A] hover:text-[#FFFFFF] transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
              <button
                type="button"
                onClick={() =>
                  onOpenQuoteModal(
                    'Equipment Hiring & Plant Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)',
                    `Enquiring about equipment / haulage unit: ${searchQuery}`
                  )
                }
                className="min-h-[44px] px-4 py-2 text-xs font-bold rounded-lg bg-[#DC2626] text-[#FFFFFF] hover:bg-[#0A0A0A] transition-colors cursor-pointer"
              >
                Request Custom Fleet Quote
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View (< 768px) */}
            <div className="md:hidden space-y-3.5">
              {filteredItems.map((item) => {
                const inBasketCount = basketItemIds[item.id] || 0;
                const justAdded = recentlyAdded[item.id];
                const qty = quantities[item.id] || 1;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border-2 border-[#0A0A0A]/15 hover:border-[#DC2626] bg-[#FFFFFF] p-4 shadow-xs space-y-3 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FFF0F0] border border-[#FECACA] text-[11px] font-extrabold text-[#DC2626]">
                        <CmsText
                          value={item.category}
                          defaultValue={item.category}
                          label="Item Category"
                          section="Stock Catalogue"
                          onSave={(val) =>
                            handleUpdateStockItem(item.id, {
                              category: val as StockItem['category'],
                            })
                          }
                        />
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-[#3B0707]">
                          <CmsText
                            value={item.subcategory}
                            defaultValue={item.subcategory}
                            label="Item Subcategory"
                            section="Stock Catalogue"
                            onSave={(val) =>
                              handleUpdateStockItem(item.id, { subcategory: val })
                            }
                          />
                        </span>
                        {isEditMode && (
                          <button
                            type="button"
                            data-cms-explicit="true"
                            onClick={() => handleDeleteStockItem(item.id)}
                            className="p-1.5 rounded-lg bg-[#DC2626] text-white hover:bg-red-700 cursor-pointer"
                            title="Delete Stock Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-extrabold text-[#0A0A0A] leading-snug break-words">
                        <CmsText
                          value={item.name}
                          defaultValue={item.name}
                          label="Stock Item Name"
                          section="Stock Catalogue"
                          onSave={(val) => handleUpdateStockItem(item.id, { name: val })}
                        />
                      </h5>
                      <p className="text-xs text-[#3B0707] mt-1 leading-relaxed break-words">
                        <CmsText
                          value={item.spec}
                          defaultValue={item.spec}
                          label="Stock Item Specification"
                          section="Stock Catalogue"
                          multiline
                          onSave={(val) => handleUpdateStockItem(item.id, { spec: val })}
                        />
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#FECACA]/60 text-[11px]">
                      <span className="font-bold text-[#0A0A0A]">
                        <CmsText
                          value={item.availability}
                          defaultValue={item.availability}
                          label="Availability Status"
                          section="Stock Catalogue"
                          onSave={(val) =>
                            handleUpdateStockItem(item.id, {
                              availability: val as StockItem['availability'],
                            })
                          }
                        />
                      </span>
                      <span className="font-semibold text-[#DC2626]">
                        {item.pointsEligible
                          ? '★ Priority Corporate Fleet · Unit: '
                          : 'Standard Hire Fleet · Unit: '}
                        <CmsText
                          value={item.unit}
                          defaultValue={item.unit}
                          label="Stock Unit (e.g. Cylinder, Unit, Set)"
                          section="Stock Catalogue"
                          onSave={(val) => handleUpdateStockItem(item.id, { unit: val })}
                        />
                      </span>
                    </div>

                    <div className="pt-1 flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <label
                          htmlFor={`mobile-qty-${item.id}`}
                          className="text-[11px] font-mono font-extrabold text-[#0A0A0A] uppercase"
                        >
                          Qty:
                        </label>
                        <input
                          id={`mobile-qty-${item.id}`}
                          type="number"
                          min={1}
                          max={999}
                          aria-label={`Quantity for ${item.name}`}
                          value={qty}
                          onChange={(e) =>
                            handleQtyChange(item.id, parseInt(e.target.value, 10) || 1)
                          }
                          className="w-16 min-h-[42px] py-2 px-2 text-center font-mono-num text-xs font-bold border-2 border-[#0A0A0A]/20 rounded-xl text-[#0A0A0A] bg-[#FFFFFF] focus:outline-none focus:border-[#DC2626]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAdd(item)}
                        className={`flex-1 min-h-[42px] px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                          justAdded
                            ? 'bg-[#0A0A0A] text-[#FFFFFF]'
                            : 'bg-[#DC2626] text-[#FFFFFF] hover:bg-[#0A0A0A]'
                        }`}
                      >
                        {justAdded ? (
                          <>
                            <Check className="w-4 h-4 text-[#DC2626] shrink-0" />
                            <span>Added to Enquiry</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 shrink-0" />
                            <span>Add to Enquiry</span>
                          </>
                        )}
                      </button>
                    </div>

                    {inBasketCount > 0 && (
                      <div className="pt-0.5 text-right">
                        <button
                          type="button"
                          onClick={onOpenBasket}
                          className="text-xs font-mono-num font-extrabold text-[#DC2626] hover:text-[#0A0A0A] underline inline-block cursor-pointer"
                        >
                          In basket: {inBasketCount} {item.unit}(s) — View Basket →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop & Tablet Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto border-2 border-[#0A0A0A] rounded-3xl bg-[#FFFFFF] shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0A0A0A] text-[#FFFFFF] text-[11px] font-mono font-bold uppercase tracking-wider">
                    <th className="py-4 px-4 sm:px-6">Category &amp; Subcategory</th>
                    <th className="py-4 px-4">Item / Stock Description</th>
                    <th className="py-4 px-4">Size, Spec &amp; Application</th>
                    <th className="py-4 px-4">Availability &amp; Points</th>
                    <th className="py-4 px-4 sm:px-6 text-right">Enquiry Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FECACA] text-sm">
                  {filteredItems.map((item) => {
                    const inBasketCount = basketItemIds[item.id] || 0;
                    const justAdded = recentlyAdded[item.id];
                    const qty = quantities[item.id] || 1;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-[#FFF5F5] transition-colors duration-150 group"
                      >
                        <td className="py-4 px-4 sm:px-6 align-top">
                          <div className="text-xs font-extrabold text-[#DC2626]">
                            <CmsText
                              value={item.category}
                              defaultValue={item.category}
                              label="Item Category"
                              section="Stock Catalogue"
                              onSave={(val) =>
                                handleUpdateStockItem(item.id, {
                                  category: val as StockItem['category'],
                                })
                              }
                            />
                          </div>
                          <div className="text-xs font-medium text-[#3B0707] mt-0.5">
                            <CmsText
                              value={item.subcategory}
                              defaultValue={item.subcategory}
                              label="Item Subcategory"
                              section="Stock Catalogue"
                              onSave={(val) =>
                                handleUpdateStockItem(item.id, { subcategory: val })
                              }
                            />
                          </div>
                        </td>

                        <td className="py-4 px-4 align-top">
                          <div className="font-extrabold text-[#0A0A0A] group-hover:text-[#DC2626] transition-colors leading-snug">
                            <CmsText
                              value={item.name}
                              defaultValue={item.name}
                              label="Stock Item Name"
                              section="Stock Catalogue"
                              onSave={(val) => handleUpdateStockItem(item.id, { name: val })}
                            />
                          </div>
                        </td>

                        <td className="py-4 px-4 align-top max-w-md">
                          <p className="text-xs text-[#3B0707] leading-relaxed font-medium">
                            <CmsText
                              value={item.spec}
                              defaultValue={item.spec}
                              label="Stock Item Specification"
                              section="Stock Catalogue"
                              multiline
                              onSave={(val) => handleUpdateStockItem(item.id, { spec: val })}
                            />
                          </p>
                        </td>

                        <td className="py-4 px-4 align-top">
                          <div className="text-xs font-bold text-[#0A0A0A]">
                            <CmsText
                              value={item.availability}
                              defaultValue={item.availability}
                              label="Availability Status"
                              section="Stock Catalogue"
                              onSave={(val) =>
                                handleUpdateStockItem(item.id, {
                                  availability: val as StockItem['availability'],
                                })
                              }
                            />
                          </div>
                          <div className="text-[11px] font-semibold text-[#DC2626] mt-0.5">
                            {item.pointsEligible
                              ? '★ Priority Corporate Fleet · Unit: '
                              : 'Standard Hire Fleet · Unit: '}
                            <CmsText
                              value={item.unit}
                              defaultValue={item.unit}
                              label="Stock Unit"
                              section="Stock Catalogue"
                              onSave={(val) => handleUpdateStockItem(item.id, { unit: val })}
                            />
                          </div>
                        </td>

                        <td className="py-4 px-4 sm:px-6 align-top text-right">
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              min={1}
                              max={999}
                              aria-label={`Quantity for ${item.name}`}
                              value={qty}
                              onChange={(e) =>
                                handleQtyChange(item.id, parseInt(e.target.value, 10) || 1)
                              }
                              className="w-14 py-1.5 px-2 text-center font-mono-num text-xs font-bold border-2 border-[#0A0A0A]/20 rounded-lg text-[#0A0A0A] bg-[#FFFFFF] focus:outline-none focus:border-[#DC2626]"
                            />
                            <button
                              type="button"
                              onClick={() => handleAdd(item)}
                              className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                                justAdded
                                  ? 'bg-[#0A0A0A] text-[#FFFFFF] scale-105'
                                  : 'bg-[#DC2626] text-[#FFFFFF] hover:bg-[#0A0A0A] hover:scale-105'
                              }`}
                            >
                              {justAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-[#DC2626]" />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add to Enquiry</span>
                                </>
                              )}
                            </button>
                            {isEditMode && (
                              <button
                                type="button"
                                data-cms-explicit="true"
                                onClick={() => handleDeleteStockItem(item.id)}
                                className="p-2 rounded-lg bg-[#DC2626] text-white hover:bg-red-700 cursor-pointer shrink-0"
                                title="Delete Stock Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          {inBasketCount > 0 && (
                            <button
                              type="button"
                              onClick={onOpenBasket}
                              className="mt-1.5 text-[11px] font-mono-num font-bold text-[#DC2626] hover:text-[#0A0A0A] hover:underline inline-block cursor-pointer"
                            >
                              In basket: {inBasketCount} {item.unit}(s) →
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Bottom Note from PDF */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A0A0A] text-[#FFFFFF] border border-[#DC2626]/40 text-xs sm:text-sm leading-[1.6]">
          <div>
            <strong className="text-[#DC2626]">
              <CmsText
                cmsKey="stock_bottom_note_bold"
                defaultValue="Need a machine tonnage or haulage truck not listed above?"
                label="Bottom Note Bold Title"
                section="Product & Supply"
              />
            </strong>{' '}
            <CmsText
              cmsKey="stock_bottom_note_body"
              defaultValue="We have additional equipment and haulage trailers across our Port Harcourt (Old Aba Road) and Warri (Etuwewe Road) yards. Email info@emmadios.com or call/WhatsApp (+234) 070-3825-9142 for immediate mobilization."
              label="Bottom Note Body"
              section="Product & Supply"
              multiline
            />
          </div>
          <button
            type="button"
            onClick={onOpenBasket}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-lg bg-[#DC2626] text-[#FFFFFF] text-xs font-bold hover:bg-[#FFFFFF] hover:text-[#0A0A0A] transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center justify-center"
          >
            <CmsText
              cmsKey="stock_bottom_note_btn"
              defaultValue="Review Enquiry Basket"
              label="Bottom Note Button"
              section="Product & Supply"
            />
          </button>
        </div>
      </div>
    </section>
  );
};
