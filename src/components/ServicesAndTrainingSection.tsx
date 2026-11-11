import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Wrench,
  Truck,
  Search,
  ShieldCheck,
  Trash2,
  PlusCircle,
} from 'lucide-react';
import {
  ServiceDetail,
  TrainingCourse,
  EIL_SLOGAN,
} from '../data/eilData';
import { CmsFabricationPortfolioItem } from '../data/cmsDefaults';
import { CmsText, CmsImage, useCms } from './StealthCmsAdmin';
import { QuoteRecord } from './OverlaysAndDrawers';
import { EquipmentHireTool, CylinderServicesTool } from './InteractiveTools';

export type ServicesSubTab = 'services' | 'fleet' | 'cylinder-services' | 'piping' | 'training';

interface ServicesAndTrainingSectionProps {
  onOpenQuoteModal: (prefillService?: string, prefillNotes?: string) => void;
  onQuoteSubmitted: (record: QuoteRecord) => void;
  initialSubTab?: ServicesSubTab;
}

export const ServicesAndTrainingSection: React.FC<ServicesAndTrainingSectionProps> = ({
  onOpenQuoteModal,
  onQuoteSubmitted,
  initialSubTab = 'services',
}) => {
  const { cmsData, isEditMode, updateCmsData } = useCms();
  const servicesList = cmsData.servicesList;
  const fabricationPortfolio = cmsData.fabricationPortfolio;
  const trainingCourses = cmsData.trainingCourses;

  const [activeTab, setActiveTab] = useState<ServicesSubTab>(initialSubTab);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    servicesList[0]?.id || 'fabrication'
  );
  const [courseSearch, setCourseSearch] = useState('');

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const activeService: ServiceDetail =
    servicesList.find((s) => s.id === selectedServiceId) ||
    servicesList[0] || {
      id: 'default-srv',
      number: '01',
      title: 'Engineering Service',
      shortTitle: 'Service',
      tagline: '',
      image: '/assets/eil/pdf_img_028.jpg',
      summary: '',
      highlights: [],
      subSections: [],
      benefits: [],
    };

  const filteredCourses = trainingCourses.filter((c) => {
    const q = courseSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.code.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.whoToAttend.toLowerCase().includes(q) ||
      c.certification.toLowerCase().includes(q)
    );
  });

  // Dynamic List CRUD for Services (01-06+)
  const handleUpdateService = (id: string, patch: Partial<ServiceDetail>) => {
    updateCmsData((prev) => ({
      ...prev,
      servicesList: prev.servicesList.map((s) =>
        s.id === id ? { ...s, ...patch } : s
      ),
    }));
  };

  const handleAddService = () => {
    const nextNum = String(servicesList.length + 1).padStart(2, '0');
    const newSrv: ServiceDetail = {
      id: `custom-service-${Date.now()}`,
      number: nextNum,
      title: 'New EIL Equipment or Haulage Service (Click to Edit)',
      shortTitle: 'New Fleet Service',
      tagline: 'Heavy equipment hiring, plant leasing, and road haulage tailored to your project.',
      image: '/assets/eil/pdf_img_028.jpg',
      secondaryImage: '/assets/eil/gen_lowbed_trailer.jpg',
      summary:
        'Describe the equipment tonnages, haulage trailer configurations, and operational scope of this service here.',
      highlights: [
        'Key service highlight 1 (click to edit)',
        'Key service highlight 2 (click to edit)',
      ],
      subSections: [
        {
          heading: 'Technical Capability & Execution',
          body: 'Provide detailed engineering notes and delivery standards here.',
        },
      ],
      benefits: [
        'On-time project delivery within budget',
        'Certified EIL engineers and HSE compliance',
      ],
    };
    updateCmsData((prev) => ({
      ...prev,
      servicesList: [...prev.servicesList, newSrv],
    }));
    setSelectedServiceId(newSrv.id);
  };

  const handleDeleteService = (id: string) => {
    if (servicesList.length <= 1) return;
    updateCmsData((prev) => {
      const remaining = prev.servicesList.filter((s) => s.id !== id);
      if (selectedServiceId === id && remaining.length > 0) {
        setSelectedServiceId(remaining[0].id);
      }
      return {
        ...prev,
        servicesList: remaining,
      };
    });
  };

  // Dynamic List CRUD for Fabrication Portfolio
  const handleUpdatePortfolio = (
    id: string,
    patch: Partial<CmsFabricationPortfolioItem>
  ) => {
    updateCmsData((prev) => ({
      ...prev,
      fabricationPortfolio: prev.fabricationPortfolio.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }));
  };

  const handleAddPortfolio = () => {
    const newItem: CmsFabricationPortfolioItem = {
      id: `fab-${Date.now()}`,
      title: 'New Equipment or Haulage Capability (Click to Edit)',
      desc: 'Forklifts, Excavators, Dozers, Cranes, Backhoes, Lowbeds, Flatbeds, Tankers, Pneumatic or Dump Trucks.',
      image: '/assets/eil/pdf_img_028.jpg',
    };
    updateCmsData((prev) => ({
      ...prev,
      fabricationPortfolio: [...prev.fabricationPortfolio, newItem],
    }));
  };

  const handleDeletePortfolio = (id: string) => {
    updateCmsData((prev) => ({
      ...prev,
      fabricationPortfolio: prev.fabricationPortfolio.filter((item) => item.id !== id),
    }));
  };

  // Dynamic List CRUD for Training Courses
  const handleUpdateCourse = (indexInFullList: number, patch: Partial<TrainingCourse>) => {
    updateCmsData((prev) => ({
      ...prev,
      trainingCourses: prev.trainingCourses.map((c, idx) =>
        idx === indexInFullList ? { ...c, ...patch } : c
      ),
    }));
  };

  const handleAddCourse = () => {
    const newCourse: TrainingCourse = {
      code: `EIL-HSE-${String(trainingCourses.length + 1).padStart(2, '0')}`,
      title: 'New Equipment Operator, Rigging or Haulage Safety Standard',
      whoToAttend: 'EIL Plant Operators, Riggers, Heavy Haulage Drivers & Project HSE Teams',
      certification: 'EIL Competence & Statutory HSE Compliance',
      duration: 'Continuous / Project-Aligned',
    };
    updateCmsData((prev) => ({
      ...prev,
      trainingCourses: [newCourse, ...prev.trainingCourses],
    }));
  };

  const handleDeleteCourse = (indexInFullList: number) => {
    updateCmsData((prev) => ({
      ...prev,
      trainingCourses: prev.trainingCourses.filter((_, idx) => idx !== indexInFullList),
    }));
  };

  return (
    <section id="services" className="py-12 sm:py-16 lg:py-20 bg-[#FFF8F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Split Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-10 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0A0A0A] text-[#FFFFFF] text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              <CmsText
                cmsKey="srv_sec_badge"
                defaultValue="EIL Heavy Equipment Hiring & Haulage Services"
                label="Services Section Badge"
                section="Services Page"
              />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A0A0A] tracking-tight leading-tight">
              <CmsText
                cmsKey="srv_sec_title_1"
                defaultValue="Heavy-duty industrial"
                label="Services Heading (Prefix)"
                section="Services Page"
              />{' '}
              <span className="text-[#DC2626]">
                <CmsText
                  cmsKey="srv_sec_title_highlight"
                  defaultValue="equipment hiring, leasing"
                  label="Services Heading (Highlight)"
                  section="Services Page"
                />
              </span>{' '}
              <CmsText
                cmsKey="srv_sec_title_2"
                defaultValue="& haulage services."
                label="Services Heading (Suffix)"
                section="Services Page"
              />
            </h2>
            <p className="mt-4 text-[15px] sm:text-base text-[#3B0707] leading-[1.65]">
              <CmsText
                cmsKey="srv_sec_lead"
                defaultValue="Equipment hiring/leasing and heavy road haulage are the core operations at EIL. From Forklifts of different tonnages (3T–45T), Excavators, Swamp Buggies, Dozers, Cranes, and Backhoes to Lowbed, Flatbed, Tanker, Pneumatic, and Dump Truck haulage — we deliver with open-ended schedule flexibility across Nigeria."
                label="Services Lead Paragraph"
                section="Services Page"
                multiline
              />
            </p>
            <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenQuoteModal(activeService.title)}
                className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-between sm:justify-start gap-3 pl-5 pr-2 py-2 rounded-full border-2 border-[#0A0A0A] bg-[#FFFFFF] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#FFFFFF] hover:scale-105 transition-all duration-200 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer group"
              >
                <CmsText
                  cmsKey="srv_sec_cta_btn"
                  defaultValue="Request Equipment / Haulage Quote"
                  label="Services CTA Button"
                  section="Services Page"
                />
                <span className="w-8 h-8 rounded-full bg-[#DC2626] group-hover:bg-[#FFFFFF] group-hover:text-[#0A0A0A] text-[#FFFFFF] flex items-center justify-center transition-colors shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
              <span className="text-xs font-mono-num font-bold text-[#0A0A0A] bg-white px-4 py-2.5 rounded-full border border-[#FECACA] text-center">
                <CmsText
                  cmsKey="srv_sec_phone_pill"
                  defaultValue="Direct Fleet & Haulage Desk: (+234) 070-3825-9142"
                  label="Direct Services Desk Phone"
                  section="Services Page"
                />
              </span>
            </div>
          </motion.div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 lg:pl-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-[#FFFFFF] hover:bg-[#0A0A0A] group p-5 sm:p-6 rounded-3xl border-2 border-[#0A0A0A]/15 hover:border-[#DC2626] transition-all duration-300 shadow-xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#DC2626] text-[#FFFFFF] flex items-center justify-center mb-4">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-extrabold text-[#0A0A0A] group-hover:text-[#FFFFFF] transition-colors">
                <CmsText
                  cmsKey="srv_box1_title"
                  defaultValue="Equipment Hiring & Leasing"
                  label="Services Box 1 Title"
                  section="Services Page"
                />
              </h3>
              <p className="mt-2 text-[15px] sm:text-sm text-[#3B0707] group-hover:text-red-100 leading-[1.65] transition-colors">
                <CmsText
                  cmsKey="srv_box1_desc"
                  defaultValue="Comprehensive plant fleet: Forklifts of different tonnages (3T–45T), Excavators, Swamp Buggies, Dozers (D6–D8), Cranes (25T–150T+), Backhoes, Payloaders & Graders with open-ended lease flexibility."
                  label="Services Box 1 Description"
                  section="Services Page"
                  multiline
                />
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-[#FFFFFF] hover:bg-[#0A0A0A] group p-5 sm:p-6 rounded-3xl border-2 border-[#0A0A0A]/15 hover:border-[#DC2626] transition-all duration-300 shadow-xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#0A0A0A] group-hover:bg-[#DC2626] text-[#FFFFFF] flex items-center justify-center mb-4 transition-colors">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-extrabold text-[#0A0A0A] group-hover:text-[#FFFFFF] transition-colors">
                <CmsText
                  cmsKey="srv_box2_title"
                  defaultValue="Heavy-Duty Haulage Services"
                  label="Services Box 2 Title"
                  section="Services Page"
                />
              </h3>
              <p className="mt-2 text-[15px] sm:text-sm text-[#3B0707] group-hover:text-red-100 leading-[1.65] transition-colors">
                <CmsText
                  cmsKey="srv_box2_desc"
                  defaultValue="Multi-axle Lowbed Trailers (40T–100T+), 40ft & 45ft Flatbeds, Bulk AGO/Water Road Tankers, Pneumatic Cement/Barite Silo Trucks, and 20T–45T Dump Trucks dispatched from Port Harcourt & Warri."
                  label="Services Box 2 Description"
                  section="Services Page"
                  multiline
                />
              </p>
            </motion.div>
          </div>
        </div>

        {/* Sub-Navigation Tabs inside Services */}
        <div
          data-cms-ignore="true"
          className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-3 mb-8 border-b-2 border-[#0A0A0A]/10"
        >
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'services'
                ? 'bg-[#DC2626] text-[#FFFFFF] scale-105 shadow-xs'
                : 'bg-[#FFFFFF] text-[#0A0A0A] border-2 border-[#0A0A0A]/15 hover:bg-[#0A0A0A] hover:text-[#FFFFFF]'
            }`}
          >
            01–06 Equipment &amp; Haulage Services
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fleet')}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'fleet'
                ? 'bg-[#DC2626] text-[#FFFFFF] scale-105 shadow-xs'
                : 'bg-[#FFFFFF] text-[#0A0A0A] border-2 border-[#0A0A0A]/15 hover:bg-[#0A0A0A] hover:text-[#FFFFFF]'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Equipment Hire Tool &amp; Fleet Gallery</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cylinder-services')}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cylinder-services'
                ? 'bg-[#DC2626] text-[#FFFFFF] scale-105 shadow-xs'
                : 'bg-[#FFFFFF] text-[#0A0A0A] border-2 border-[#0A0A0A]/15 hover:bg-[#0A0A0A] hover:text-[#FFFFFF]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Free Site Survey &amp; Fleet Support</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('piping')}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'piping'
                ? 'bg-[#DC2626] text-[#FFFFFF] scale-105 shadow-xs'
                : 'bg-[#FFFFFF] text-[#0A0A0A] border-2 border-[#0A0A0A]/15 hover:bg-[#0A0A0A] hover:text-[#FFFFFF]'
            }`}
          >
            Haulage Fleet Operations (Lowbed, Flatbed, Tanker &amp; Tipper)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('training')}
            className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'training'
                ? 'bg-[#DC2626] text-[#FFFFFF] scale-105 shadow-xs'
                : 'bg-[#FFFFFF] text-[#0A0A0A] border-2 border-[#0A0A0A]/15 hover:bg-[#0A0A0A] hover:text-[#FFFFFF]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Operator, Rigging &amp; Haulage HSE Standards ({trainingCourses.length})</span>
          </button>
        </div>

        {/* TAB 1: NUMBERED SERVICE CARDS (01 to 06+) + ACTIVE DETAIL */}
        {activeTab === 'services' && (
          <div>
            {isEditMode && (
              <div
                data-cms-explicit="true"
                className="mb-5 p-4 rounded-2xl bg-[#ECFDF5] border-2 border-dashed border-[#10B981] flex flex-wrap items-center justify-between gap-3"
              >
                <span className="text-xs font-extrabold text-[#065F46]">
                  Admin Services Controls: Click any service card to view &amp; edit its details, images, highlights, or add/remove contracting services.
                </span>
                <button
                  type="button"
                  onClick={handleAddService}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Add Contracting Service</span>
                </button>
              </div>
            )}

            {/* Numbered Interactive Card Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-3.5 mb-8">
              {servicesList.map((srv, idx) => {
                const isSelected = srv.id === activeService.id;
                return (
                  <motion.div
                    key={srv.id}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                    whileHover={{ y: -8, scale: 1.03 }}
                    onClick={() => setSelectedServiceId(srv.id)}
                    role="button"
                    tabIndex={0}
                    className={`group relative aspect-[16/10] sm:aspect-auto sm:h-68 rounded-3xl overflow-hidden text-left transition-all border-2 cursor-pointer ${
                      isSelected
                        ? 'border-[#DC2626] ring-4 ring-[#DC2626]/25 shadow-lg'
                        : 'border-[#0A0A0A] hover:border-[#DC2626]'
                    }`}
                  >
                    <CmsImage
                      src={srv.image}
                      defaultSrc={srv.image}
                      alt={srv.title}
                      label={`Service ${srv.number} Card Image`}
                      section="Core Contracting Services"
                      targetWidth={800}
                      targetHeight={600}
                      aspectLabel="4:3 Service Card"
                      onSave={(newSrc) => handleUpdateService(srv.id, { image: newSrc })}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div
                      className={`absolute inset-0 transition-colors duration-300 pointer-events-none ${
                        isSelected
                          ? 'bg-gradient-to-t from-[#DC2626]/95 via-[#0A0A0A]/65 to-transparent'
                          : 'bg-gradient-to-t from-[#0A0A0A]/95 via-[#0A0A0A]/45 to-transparent group-hover:from-[#DC2626]/90'
                      }`}
                    />
                    {isEditMode && servicesList.length > 1 && (
                      <button
                        type="button"
                        data-cms-explicit="true"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteService(srv.id);
                        }}
                        title="Delete this service"
                        className="absolute top-2.5 right-2.5 z-40 p-1.5 rounded-lg bg-[#DC2626] text-white hover:bg-red-700 shadow-md cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-4 flex flex-col justify-end z-30">
                      <span className="font-mono-num text-2xl sm:text-3xl font-extrabold text-[#FFFFFF]">
                        <CmsText
                          value={srv.number}
                          defaultValue={srv.number}
                          label="Service Number"
                          section="Core Contracting Services"
                          onSave={(val) => handleUpdateService(srv.id, { number: val })}
                        />
                      </span>
                      <span
                        className={`text-sm sm:text-xs lg:text-sm font-extrabold leading-snug mt-1 ${
                          isSelected ? 'text-[#FFFFFF]' : 'text-red-100 group-hover:text-[#FFFFFF]'
                        }`}
                      >
                        <CmsText
                          value={srv.shortTitle}
                          defaultValue={srv.shortTitle}
                          label="Service Short Card Title"
                          section="Core Contracting Services"
                          onSave={(val) => handleUpdateService(srv.id, { shortTitle: val })}
                        />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Active Service Deep-Dive Card */}
            <motion.div
              key={activeService.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-[#FFFFFF] rounded-3xl border-2 border-[#0A0A0A] p-5 sm:p-10 shadow-sm"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-2xl overflow-hidden border-2 border-[#0A0A0A] aspect-[16/10] sm:aspect-auto sm:h-72 bg-[#0A0A0A]">
                    <CmsImage
                      src={activeService.image}
                      defaultSrc={activeService.image}
                      alt={activeService.title}
                      label={`${activeService.shortTitle} Main Image`}
                      section="Core Contracting Services"
                      targetWidth={1000}
                      targetHeight={700}
                      aspectLabel="10:7 Showcase"
                      onSave={(newSrc) =>
                        handleUpdateService(activeService.id, { image: newSrc })
                      }
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {(activeService.secondaryImage || isEditMode) && (
                    <div className="rounded-2xl overflow-hidden border-2 border-[#0A0A0A]/20 aspect-[16/10] sm:aspect-auto sm:h-48 bg-[#FFF8F8]">
                      <CmsImage
                        src={activeService.secondaryImage || activeService.image}
                        defaultSrc={activeService.secondaryImage || activeService.image}
                        alt={`${activeService.title} secondary view`}
                        label={`${activeService.shortTitle} Secondary Image`}
                        section="Core Contracting Services"
                        targetWidth={800}
                        targetHeight={500}
                        aspectLabel="16:10 Secondary View"
                        onSave={(newSrc) =>
                          handleUpdateService(activeService.id, { secondaryImage: newSrc })
                        }
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0A0A] text-[#FFFFFF] border-l-4 border-[#DC2626] text-[15px] sm:text-sm italic leading-[1.6]">
                    &ldquo;{cmsData.brandSlogan || EIL_SLOGAN}&rdquo;
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0A0A0A] text-[#FFFFFF] text-xs font-mono-num font-bold">
                    <span className="text-[#DC2626]">SERVICE {activeService.number}</span>
                    <span>·</span>
                    <span>PORT HARCOURT &amp; WARRI FLEET OPERATIONS</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] mt-3">
                    <CmsText
                      value={activeService.title}
                      defaultValue={activeService.title}
                      label="Service Full Title"
                      section="Core Contracting Services"
                      onSave={(val) =>
                        handleUpdateService(activeService.id, { title: val })
                      }
                    />
                  </h3>
                  <p className="text-sm font-bold text-[#DC2626] mt-2">
                    <CmsText
                      value={activeService.tagline}
                      defaultValue={activeService.tagline}
                      label="Service Tagline"
                      section="Core Contracting Services"
                      multiline
                      onSave={(val) =>
                        handleUpdateService(activeService.id, { tagline: val })
                      }
                    />
                  </p>
                  <p className="text-[15px] sm:text-base text-[#3B0707] mt-4 leading-[1.65]">
                    <CmsText
                      value={activeService.summary}
                      defaultValue={activeService.summary}
                      label="Service Summary Paragraph"
                      section="Core Contracting Services"
                      multiline
                      onSave={(val) =>
                        handleUpdateService(activeService.id, { summary: val })
                      }
                    />
                  </p>

                  {/* Core Capabilities Checklist */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A0A0A]">
                        What We Cover &amp; Check For
                      </h4>
                      {isEditMode && (
                        <button
                          type="button"
                          data-cms-explicit="true"
                          onClick={() =>
                            handleUpdateService(activeService.id, {
                              highlights: [
                                ...activeService.highlights,
                                'New capability highlight (click to edit)',
                              ],
                            })
                          }
                          className="text-xs font-mono font-extrabold text-[#059669] hover:underline cursor-pointer"
                        >
                          + Add Highlight
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeService.highlights.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-2 text-[15px] sm:text-sm font-medium text-[#0A0A0A] bg-[#FFF8F8] hover:bg-[#0A0A0A] hover:text-[#FFFFFF] p-3.5 rounded-xl border border-[#FECACA] transition-colors duration-200 leading-[1.5]"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                            <CmsText
                              value={item}
                              defaultValue={item}
                              label={`Service Highlight ${idx + 1}`}
                              section="Core Contracting Services"
                              onSave={(val) => {
                                const updated = [...activeService.highlights];
                                updated[idx] = val;
                                handleUpdateService(activeService.id, {
                                  highlights: updated,
                                });
                              }}
                            />
                          </div>
                          {isEditMode && activeService.highlights.length > 1 && (
                            <button
                              type="button"
                              data-cms-explicit="true"
                              onClick={() => {
                                const updated = activeService.highlights.filter(
                                  (_, i) => i !== idx
                                );
                                handleUpdateService(activeService.id, {
                                  highlights: updated,
                                });
                              }}
                              className="text-[#DC2626] hover:text-red-400 text-xs font-mono shrink-0 cursor-pointer"
                              title="Remove highlight"
                            >
                              [×]
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Sub-Sections from PDF */}
                  <div className="mt-6 space-y-4">
                    {activeService.subSections.map((sub, i) => (
                      <div key={i} className="pt-4 border-t border-[#FECACA]">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-base sm:text-sm font-extrabold text-[#0A0A0A]">
                            <CmsText
                              value={sub.heading}
                              defaultValue={sub.heading}
                              label={`Sub-Section ${i + 1} Heading`}
                              section="Core Contracting Services"
                              onSave={(val) => {
                                const updated = [...activeService.subSections];
                                updated[i] = { ...updated[i], heading: val };
                                handleUpdateService(activeService.id, {
                                  subSections: updated,
                                });
                              }}
                            />
                          </h4>
                          {isEditMode && activeService.subSections.length > 1 && (
                            <button
                              type="button"
                              data-cms-explicit="true"
                              onClick={() => {
                                const updated = activeService.subSections.filter(
                                  (_, idx) => idx !== i
                                );
                                handleUpdateService(activeService.id, {
                                  subSections: updated,
                                });
                              }}
                              className="text-xs font-mono text-[#DC2626] hover:underline cursor-pointer"
                            >
                              Delete Sub-Section
                            </button>
                          )}
                        </div>
                        <p className="text-[15px] sm:text-sm text-[#3B0707] mt-1.5 leading-[1.65]">
                          <CmsText
                            value={sub.body}
                            defaultValue={sub.body}
                            label={`Sub-Section ${i + 1} Body`}
                            section="Core Contracting Services"
                            multiline
                            onSave={(val) => {
                              const updated = [...activeService.subSections];
                              updated[i] = { ...updated[i], body: val };
                              handleUpdateService(activeService.id, {
                                subSections: updated,
                              });
                            }}
                          />
                        </p>
                      </div>
                    ))}
                    {isEditMode && (
                      <button
                        type="button"
                        data-cms-explicit="true"
                        onClick={() =>
                          handleUpdateService(activeService.id, {
                            subSections: [
                              ...activeService.subSections,
                              {
                                heading: 'New Sub-Section Heading',
                                body: 'Enter detailed sub-section description here.',
                              },
                            ],
                          })
                        }
                        className="text-xs font-mono font-extrabold text-[#059669] hover:underline cursor-pointer"
                      >
                        + Add Sub-Section
                      </button>
                    )}
                  </div>

                  {/* Customer Benefits */}
                  {activeService.benefits && (
                    <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-[#0A0A0A] text-[#FFFFFF] border-l-4 border-[#DC2626]">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#DC2626]">
                          Your Benefits with EIL
                        </div>
                        {isEditMode && (
                          <button
                            type="button"
                            data-cms-explicit="true"
                            onClick={() =>
                              handleUpdateService(activeService.id, {
                                benefits: [
                                  ...(activeService.benefits || []),
                                  'New customer benefit point',
                                ],
                              })
                            }
                            className="text-[11px] font-mono font-extrabold text-[#10B981] hover:underline cursor-pointer"
                          >
                            + Add Benefit
                          </button>
                        )}
                      </div>
                      <ul className="space-y-1.5 text-[15px] sm:text-sm text-red-100 leading-[1.6]">
                        {activeService.benefits.map((b, idx) => (
                          <li key={idx} className="flex items-start justify-between gap-2">
                            <span>
                              •{' '}
                              <CmsText
                                value={b}
                                defaultValue={b}
                                label={`Benefit ${idx + 1}`}
                                section="Core Contracting Services"
                                onSave={(val) => {
                                  const updated = [...(activeService.benefits || [])];
                                  updated[idx] = val;
                                  handleUpdateService(activeService.id, {
                                    benefits: updated,
                                  });
                                }}
                              />
                            </span>
                            {isEditMode && (activeService.benefits?.length || 0) > 1 && (
                              <button
                                type="button"
                                data-cms-explicit="true"
                                onClick={() => {
                                  const updated = (activeService.benefits || []).filter(
                                    (_, i) => i !== idx
                                  );
                                  handleUpdateService(activeService.id, {
                                    benefits: updated,
                                  });
                                }}
                                className="text-red-400 hover:text-red-200 text-xs font-mono shrink-0 cursor-pointer"
                              >
                                [×]
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-7 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenQuoteModal(
                          activeService.title,
                          `Requesting quotation / appointment for ${activeService.title}.`
                        )
                      }
                      className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-full bg-[#DC2626] text-[#FFFFFF] text-xs font-bold hover:bg-[#0A0A0A] hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Request Quote for {activeService.shortTitle}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                    <a
                      href="tel:+2347038259142"
                      className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-full border-2 border-[#0A0A0A] text-[#0A0A0A] bg-[#FFFFFF] hover:bg-[#0A0A0A] hover:text-[#FFFFFF] text-xs font-bold transition-colors flex items-center justify-center"
                    >
                      Call (+234) 070-3825-9142
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE EQUIPMENT HIRE REQUEST TOOL & FLEET SPECIFICATIONS GALLERY + FLEET PORTFOLIO */}
        {activeTab === 'fleet' && (
          <div className="space-y-12">
            <EquipmentHireTool onQuoteSubmitted={onQuoteSubmitted} />

            {/* Equipment & Haulage Fleet Capabilities Grid */}
            <div className="pt-8 border-t-2 border-[#0A0A0A]/10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#0A0A0A]">
                    <CmsText
                      cmsKey="fab_portfolio_heading"
                      defaultValue="Core Equipment Hiring & Haulage Fleet Capabilities"
                      label="Fleet Portfolio Heading"
                      section="Fleet Capabilities Portfolio"
                    />
                  </h3>
                  <p className="text-[15px] sm:text-base text-[#3B0707] mt-1 leading-[1.65]">
                    <CmsText
                      cmsKey="fab_portfolio_subtitle"
                      defaultValue="Every machine and haulage trailer is workshop-tested, certified, and available for open-ended project deployment with zero fixed time limits across Port Harcourt, Warri, and Nigeria."
                      label="Fleet Portfolio Subtitle"
                      section="Fleet Capabilities Portfolio"
                      multiline
                    />
                  </p>
                </div>
                {isEditMode && (
                  <button
                    type="button"
                    data-cms-explicit="true"
                    onClick={handleAddPortfolio}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold uppercase tracking-wider cursor-pointer shrink-0 shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Add Portfolio Card</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fabricationPortfolio.map((fab, idx) => (
                  <motion.div
                    key={fab.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group bg-[#FFFFFF] hover:bg-[#0A0A0A] rounded-3xl border-2 border-[#0A0A0A]/15 hover:border-[#DC2626] overflow-hidden flex flex-col justify-between transition-colors duration-300 shadow-xs relative"
                  >
                    <div>
                      <div className="aspect-[16/10] sm:aspect-auto sm:h-52 bg-[#0A0A0A] border-b border-[#FECACA] overflow-hidden relative">
                        <CmsImage
                          src={fab.image}
                          defaultSrc={fab.image}
                          alt={fab.title}
                          label={`${fab.title} Image`}
                          section="Fabrication Portfolio"
                          targetWidth={800}
                          targetHeight={500}
                          aspectLabel="16:10 Portfolio Card"
                          onSave={(newSrc) =>
                            handleUpdatePortfolio(fab.id, { image: newSrc })
                          }
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {isEditMode && (
                          <button
                            type="button"
                            data-cms-explicit="true"
                            onClick={() => handleDeletePortfolio(fab.id)}
                            className="absolute top-3 right-3 z-40 p-1.5 rounded-lg bg-[#DC2626] text-white hover:bg-red-700 shadow-md cursor-pointer"
                            title="Delete Portfolio Card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="p-5 sm:p-6">
                        <h4 className="text-base font-extrabold text-[#0A0A0A] group-hover:text-[#FFFFFF] transition-colors">
                          <CmsText
                            value={fab.title}
                            defaultValue={fab.title}
                            label="Portfolio Card Title"
                            section="Fabrication Portfolio"
                            onSave={(val) =>
                              handleUpdatePortfolio(fab.id, { title: val })
                            }
                          />
                        </h4>
                        <p className="text-xs text-[#3B0707] group-hover:text-red-100 mt-2 leading-[1.65] transition-colors">
                          <CmsText
                            value={fab.desc}
                            defaultValue={fab.desc}
                            label="Portfolio Card Description"
                            section="Fabrication Portfolio"
                            multiline
                            onSave={(val) =>
                              handleUpdatePortfolio(fab.id, { desc: val })
                            }
                          />
                        </p>
                      </div>
                    </div>
                    <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-[#FECACA]/40 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-[#DC2626]">
                        Open-Ended Lease · PH &amp; Warri Yards
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenQuoteModal(
                            'Equipment Hiring & Plant Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)',
                            `Equipment / Haulage fleet enquiry: ${fab.title}`
                          )
                        }
                        className="text-xs font-extrabold text-[#0A0A0A] group-hover:text-[#FFFFFF] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Request Fleet Quote</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#DC2626]" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2B: PRE-MOBILIZATION SITE SURVEY & ON-SITE FLEET SUPPORT */}
        {activeTab === 'cylinder-services' && (
          <CylinderServicesTool onQuoteSubmitted={onQuoteSubmitted} />
        )}

        {/* TAB 3: HAULAGE FLEET OPERATIONS (LOWBEDS, FLATBEDS, TANKERS, PNEUMATIC & DUMP TRUCKS) */}
        {activeTab === 'piping' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FFFFFF] rounded-3xl border-2 border-[#0A0A0A] p-5 sm:p-10 space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#DC2626]">
                  <CmsText
                    cmsKey="piping_tab_badge"
                    defaultValue="Lowbed · Flatbed · Tankers · Pneumatic Trucks · Dump Trucks"
                    label="Haulage Operations Badge"
                    section="Haulage Operations Tab"
                  />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] mt-1">
                  <CmsText
                    cmsKey="piping_tab_heading"
                    defaultValue="Heavy-Duty Haulage Services & Specialized Road Logistics"
                    label="Haulage Operations Heading"
                    section="Haulage Operations Tab"
                  />
                </h3>
                <p className="text-[15px] sm:text-base text-[#3B0707] mt-3 leading-[1.65]">
                  <CmsText
                    cmsKey="piping_tab_lead"
                    defaultValue="EIL operates a dedicated heavy-duty road haulage fleet out of Port Harcourt (Plot 213, Old Aba Road) and Warri (9, Etuwewe Road) — mobilizing heavy machinery, containers, coated line pipes, bulk diesel/water, dry bulk cement/barite, and civil construction aggregates safely across Nigeria."
                    label="Haulage Operations Lead Paragraph"
                    section="Haulage Operations Tab"
                    multiline
                  />
                </p>
              </div>
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="aspect-[16/10] sm:aspect-auto sm:h-44 rounded-2xl overflow-hidden border-2 border-[#0A0A0A]">
                  <CmsImage
                    cmsKey="piping_img_1"
                    defaultSrc="/assets/eil/gen_lowbed_trailer.jpg"
                    alt="EIL Lowbed and Flatbed Heavy Haulage"
                    label="Lowbed & Flatbed Haulage Image"
                    section="Haulage Operations Tab"
                    targetWidth={800}
                    targetHeight={500}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="aspect-[16/10] sm:aspect-auto sm:h-44 rounded-2xl overflow-hidden border-2 border-[#0A0A0A]">
                  <CmsImage
                    cmsKey="piping_img_2"
                    defaultSrc="/assets/eil/pdf_img_021.jpg"
                    alt="EIL Tankers, Pneumatic and Dump Trucks"
                    label="Tankers & Dump Trucks Image"
                    section="Haulage Operations Tab"
                    targetWidth={800}
                    targetHeight={500}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 1. Lowbed & Flatbed Heavy Haulage */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#FFF8F8] hover:bg-[#0A0A0A] group border-2 border-[#FECACA] hover:border-[#DC2626] transition-all duration-300">
                <h4 className="text-lg font-extrabold text-[#0A0A0A] group-hover:text-[#FFFFFF]">
                  <CmsText
                    cmsKey="piping_col1_title"
                    defaultValue="1. Lowbed & Flatbed Heavy Haulage"
                    label="Haulage Col 1 Title"
                    section="Haulage Operations Tab"
                  />
                </h4>
                <p className="text-xs text-[#3B0707] group-hover:text-red-200 mt-2 leading-[1.65]">
                  <CmsText
                    cmsKey="piping_col1_sub"
                    defaultValue="Heavy machinery mobilization and container/pipe transport:"
                    label="Haulage Col 1 Subtitle"
                    section="Haulage Operations Tab"
                  />
                </p>
                <ul className="mt-3 space-y-2 text-xs sm:text-xs text-[#0A0A0A] group-hover:text-red-100 leading-[1.6]">
                  <li>• <strong>Multi-Axle Lowbeds (40T – 100T+):</strong> 3-axle, 4-axle &amp; hydraulic gooseneck lowbeds with rear loading ramps and expandable side outriggers.</li>
                  <li>• <strong>Tracked Plant Mobilization:</strong> Safe transport of Excavators, Swamp Buggies, Dozers (CAT D6, D7, D8), Crawler Cranes &amp; Wheel Loaders.</li>
                  <li>• <strong>40ft &amp; 45ft Flatbed Trailers:</strong> Tri-axle decks (30T–45T) with 12 ISO container twist-locks and vertical OCTG pipe stanchions.</li>
                  <li>• <strong>Load Securement &amp; Escort:</strong> Grade-80 load chains, ratchet binders, route survey, and escort vehicle coordination.</li>
                </ul>
              </div>

              {/* 2. Bulk Tankers & Pneumatic Silo Trucks */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#FFF8F8] hover:bg-[#0A0A0A] group border-2 border-[#FECACA] hover:border-[#DC2626] transition-all duration-300">
                <h4 className="text-lg font-extrabold text-[#0A0A0A] group-hover:text-[#FFFFFF]">
                  <CmsText
                    cmsKey="piping_col2_title"
                    defaultValue="2. Bulk Tankers & Pneumatic Silo Trucks"
                    label="Haulage Col 2 Title"
                    section="Haulage Operations Tab"
                  />
                </h4>
                <p className="text-xs text-[#3B0707] group-hover:text-red-200 mt-2 leading-[1.65]">
                  <CmsText
                    cmsKey="piping_col2_sub"
                    defaultValue="Liquid fuel/water bunkering and pressurized dry-powder haulage:"
                    label="Haulage Col 2 Subtitle"
                    section="Haulage Operations Tab"
                  />
                </p>
                <ul className="mt-3 space-y-2 text-xs text-[#0A0A0A] group-hover:text-red-100 leading-[1.6]">
                  <li>• <strong>Diesel (AGO) Road Tankers:</strong> Calibrated 15,000L, 33,000L &amp; 45,000L baffled tankers with PTO pumps and flow meters for site bunkering.</li>
                  <li>• <strong>Industrial Water Tankers / Bowsers:</strong> 15,000L–30,000L water bowsers with pressurized rear spray bars for road compaction &amp; dust control.</li>
                  <li>• <strong>Pneumatic Bulk Silo Trucks (35–50 CBM):</strong> Sealed pressure-discharge tankers for moisture-free bulk Cement, Barite &amp; Bentonite.</li>
                  <li>• <strong>Vertical Silo Discharge:</strong> Onboard high-output air compressors (2.0 Bar) blow dry powder directly into batching or rig silos.</li>
                </ul>
              </div>

              {/* 3. Dump Truck Fleets & Earthmoving Logistics */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#FFF8F8] hover:bg-[#0A0A0A] group border-2 border-[#FECACA] hover:border-[#DC2626] transition-all duration-300">
                <h4 className="text-lg font-extrabold text-[#0A0A0A] group-hover:text-[#FFFFFF]">
                  <CmsText
                    cmsKey="piping_col3_title"
                    defaultValue="3. Dump Trucks / Tippers & Earthworks"
                    label="Haulage Col 3 Title"
                    section="Haulage Operations Tab"
                  />
                </h4>
                <p className="text-xs text-[#3B0707] group-hover:text-red-200 mt-2 leading-[1.65]">
                  <CmsText
                    cmsKey="piping_col3_sub"
                    defaultValue="High-cycle aggregate haulage, sand-filling, and excavation muck-away:"
                    label="Haulage Col 3 Subtitle"
                    section="Haulage Operations Tab"
                  />
                </p>
                <ul className="mt-3 space-y-2 text-xs text-[#0A0A0A] group-hover:text-red-100 leading-[1.6]">
                  <li>• <strong>6x4 &amp; 8x4 Hydraulic Dump Trucks:</strong> 20T–30T (16–20 CBM) and 35T–45T (24–30 CBM) heavy-duty rock/earth tippers.</li>
                  <li>• <strong>Civil &amp; Road Aggregates:</strong> Continuous haulage of sharp sand, laterite sub-base, hardcore stone, and quarry granite.</li>
                  <li>• <strong>Integrated Earthmoving Spreads:</strong> Pair EIL Dump Trucks with our Excavators, Dozers, Payloaders, Motor Graders &amp; Compactors.</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-[#FECACA]">
              <span className="text-[15px] sm:text-sm font-bold text-[#0A0A0A]">
                <CmsText
                  cmsKey="piping_cta_prompt"
                  defaultValue="Need Lowbed, Flatbed, Tanker, Pneumatic Truck, or Dump Truck haulage?"
                  label="Haulage Operations CTA Prompt"
                  section="Haulage Operations Tab"
                />
              </span>
              <button
                type="button"
                onClick={() =>
                  onOpenQuoteModal(
                    'Heavy-Duty Haulage Services (Lowbed, Flatbed, Tankers, Pneumatic & Dump Trucks)'
                  )
                }
                className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-full bg-[#DC2626] text-[#FFFFFF] text-xs font-bold hover:bg-[#0A0A0A] transition-colors cursor-pointer"
              >
                <CmsText
                  cmsKey="piping_cta_btn"
                  defaultValue="Request Haulage Dispatch Quote"
                  label="Haulage Operations CTA Button"
                  section="Haulage Operations Tab"
                />
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 4: OPERATOR, RIGGING & HAULAGE HSE STANDARDS */}
        {activeTab === 'training' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FFFFFF] rounded-3xl border-2 border-[#0A0A0A] p-5 sm:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pb-6 border-b border-[#FECACA]">
              <div className="lg:col-span-8">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#DC2626]">
                  <CmsText
                    cmsKey="training_tab_badge"
                    defaultValue="Certified Crew · Statutory Load Testing · Journey Management · “Zero Accidents”"
                    label="HSE Standards Badge"
                    section="Operator & Haulage HSE Standards"
                  />
                </div>
                <h3 className="text-2xl font-extrabold text-[#0A0A0A] mt-1">
                  <CmsText
                    cmsKey="training_tab_heading"
                    defaultValue="EIL Operator, Rigging & Haulage HSE Qualification Standards"
                    label="HSE Standards Heading"
                    section="Operator & Haulage HSE Standards"
                  />
                </h3>
                <p className="text-[15px] sm:text-sm text-[#3B0707] mt-2 leading-[1.65]">
                  <CmsText
                    cmsKey="training_tab_lead"
                    defaultValue="Every Forklift, Excavator, Swamp Buggy, Dozer, Mobile Crane, Backhoe, and Haulage Truck deployed by EIL is manned by operators, riggers, and drivers qualified to strict statutory and oilfield HSE standards."
                    label="HSE Standards Lead Paragraph"
                    section="Operator & Haulage HSE Standards"
                    multiline
                  />
                </p>
              </div>
              <div className="lg:col-span-4 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#DC2626] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Filter standards (e.g. Crane, Forklift, Lowbed, Swamp Buggy, Pneumatic)..."
                    className="w-full pl-10 pr-4 py-3 text-xs bg-[#FFF8F8] border-2 border-[#0A0A0A]/20 rounded-xl text-[#0A0A0A] placeholder-[#7F1D1D]/60 focus:outline-none focus:border-[#DC2626]"
                  />
                </div>
                {isEditMode && (
                  <button
                    type="button"
                    data-cms-explicit="true"
                    onClick={handleAddCourse}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Add New HSE Standard</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Course Card View (< 768px) */}
            <div className="mt-6 md:hidden space-y-3">
              {filteredCourses.map((course) => {
                const fullIdx = trainingCourses.findIndex((c) => c.code === course.code && c.title === course.title);
                return (
                  <div
                    key={`${course.code}-${fullIdx}`}
                    className="rounded-2xl border-2 border-[#0A0A0A]/15 hover:border-[#DC2626] bg-[#FFF8F8] p-4 space-y-2.5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[#0A0A0A] text-[#DC2626] font-mono-num text-xs font-extrabold">
                        <CmsText
                          value={course.code}
                          defaultValue={course.code}
                          label="Course Code"
                          section="Training Catalogue"
                          onSave={(val) => handleUpdateCourse(fullIdx, { code: val })}
                        />
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-md bg-[#FFF0F0] border border-[#FECACA] text-[#DC2626] font-mono-num text-xs font-extrabold">
                          <CmsText
                            value={course.duration}
                            defaultValue={course.duration}
                            label="Course Duration"
                            section="Training Catalogue"
                            onSave={(val) => handleUpdateCourse(fullIdx, { duration: val })}
                          />
                        </span>
                        {isEditMode && (
                          <button
                            type="button"
                            data-cms-explicit="true"
                            onClick={() => handleDeleteCourse(fullIdx)}
                            className="p-1.5 rounded-lg bg-[#DC2626] text-white hover:bg-red-700 cursor-pointer"
                            title="Delete Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm font-extrabold text-[#0A0A0A] leading-snug break-words">
                      <CmsText
                        value={course.title}
                        defaultValue={course.title}
                        label="Course Title"
                        section="Training Catalogue"
                        onSave={(val) => handleUpdateCourse(fullIdx, { title: val })}
                      />
                    </h4>

                    <p className="text-xs text-[#3B0707] leading-relaxed break-words">
                      <strong className="text-[#0A0A0A]">Who Should Attend:</strong>{' '}
                      <CmsText
                        value={course.whoToAttend}
                        defaultValue={course.whoToAttend}
                        label="Who Should Attend"
                        section="Training Catalogue"
                        multiline
                        onSave={(val) => handleUpdateCourse(fullIdx, { whoToAttend: val })}
                      />
                    </p>

                    <div className="pt-2 border-t border-[#FECACA]/70 flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold text-[#0A0A0A] leading-snug">
                        <CmsText
                          value={course.certification}
                          defaultValue={course.certification}
                          label="Course Certification"
                          section="Training Catalogue"
                          onSave={(val) =>
                            handleUpdateCourse(fullIdx, { certification: val })
                          }
                        />
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenQuoteModal(
                            'Equipment Hiring & Plant Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)',
                            `Enquiring about EIL HSE & Operator Standard ${course.code}: ${course.title} (${course.duration})`
                          )
                        }
                        className="min-h-[38px] px-4 py-2 rounded-xl bg-[#DC2626] text-[#FFFFFF] text-xs font-extrabold hover:bg-[#0A0A0A] transition-all whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Enquire →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop & Tablet Course Table (>= 768px) */}
            <div className="mt-6 hidden md:block overflow-x-auto rounded-2xl border border-[#0A0A0A]/20">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0A0A0A] text-[#FFFFFF] uppercase font-mono font-bold">
                    <th className="py-3.5 px-4">Standard Code</th>
                    <th className="py-3.5 px-4">Competence / HSE Module</th>
                    <th className="py-3.5 px-4">Personnel &amp; Crew Covered</th>
                    <th className="py-3.5 px-4">Verification &amp; Compliance</th>
                    <th className="py-3.5 px-4">Schedule / Mode</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FECACA]">
                  {filteredCourses.map((course) => {
                    const fullIdx = trainingCourses.findIndex(
                      (c) => c.code === course.code && c.title === course.title
                    );
                    return (
                      <tr key={`${course.code}-${fullIdx}`} className="hover:bg-[#FFF5F5] transition-colors">
                        <td className="py-3.5 px-4 font-mono-num font-extrabold text-[#DC2626] whitespace-nowrap align-top">
                          <CmsText
                            value={course.code}
                            defaultValue={course.code}
                            label="Course Code"
                            section="Training Catalogue"
                            onSave={(val) => handleUpdateCourse(fullIdx, { code: val })}
                          />
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-[#0A0A0A] align-top">
                          <div>
                            <CmsText
                              value={course.title}
                              defaultValue={course.title}
                              label="Course Title"
                              section="Training Catalogue"
                              onSave={(val) => handleUpdateCourse(fullIdx, { title: val })}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#3B0707] align-top">
                          <CmsText
                            value={course.whoToAttend}
                            defaultValue={course.whoToAttend}
                            label="Who Should Attend"
                            section="Training Catalogue"
                            multiline
                            onSave={(val) =>
                              handleUpdateCourse(fullIdx, { whoToAttend: val })
                            }
                          />
                        </td>
                        <td className="py-3.5 px-4 font-medium text-[#0A0A0A] align-top">
                          <CmsText
                            value={course.certification}
                            defaultValue={course.certification}
                            label="Course Certification"
                            section="Training Catalogue"
                            onSave={(val) =>
                              handleUpdateCourse(fullIdx, { certification: val })
                            }
                          />
                        </td>
                        <td className="py-3.5 px-4 font-mono-num font-bold text-[#DC2626] whitespace-nowrap align-top">
                          <CmsText
                            value={course.duration}
                            defaultValue={course.duration}
                            label="Course Duration"
                            section="Training Catalogue"
                            onSave={(val) => handleUpdateCourse(fullIdx, { duration: val })}
                          />
                        </td>
                        <td className="py-3.5 px-4 text-right align-top">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                onOpenQuoteModal(
                                  'Equipment Hiring & Plant Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)',
                                  `Enquiring about EIL HSE & Operator Standard ${course.code}: ${course.title} (${course.duration})`
                                )
                              }
                              className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#0A0A0A] text-[#FFFFFF] font-bold hover:bg-[#DC2626] hover:scale-105 transition-all whitespace-nowrap cursor-pointer"
                            >
                              Enquire
                            </button>
                            {isEditMode && (
                              <button
                                type="button"
                                data-cms-explicit="true"
                                onClick={() => handleDeleteCourse(fullIdx)}
                                className="p-2 rounded-lg bg-[#DC2626] text-white hover:bg-red-700 cursor-pointer shrink-0"
                                title="Delete Course"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
