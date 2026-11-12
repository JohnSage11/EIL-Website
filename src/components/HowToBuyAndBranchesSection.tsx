import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Clock,
  CreditCard,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  EIL_BRANCHES,
  EIL_POINT_CARD_RULES,
  EIL_SAFETY_COMMITMENTS,
  BranchOffice,
} from '../data/eilData';
import {
  EilCmsData,
  DEFAULT_EIL_CMS_DATA,
  CmsCoreValueItem,
} from '../data/cmsDefaults';
import {
  useCms,
  CmsEditableText,
  CmsText,
  CmsImage,
  EilScalarFieldKey,
} from './StealthCmsAdmin';
import {
  resolveAssetUrl,
  handleBrandLogoError,
} from './ResilientImage';

interface HowToBuySectionProps {
  onOpenQuoteModal: (prefillService?: string, prefillNotes?: string) => void;
  onOpenBasket: () => void;
  cmsData?: EilCmsData;
  isEditMode?: boolean;
  onSelectCmsField?: (fieldKey: EilScalarFieldKey) => void;
}

export const HowToBuySection: React.FC<HowToBuySectionProps> = ({
  onOpenQuoteModal,
  onOpenBasket,
}) => {
  const { cmsData, isEditMode, updateCmsData, onSelectField } = useCms();
  const [howToBuyTab, setHowToBuyTab] = useState<'ordering' | 'point-card'>('ordering');

  const pointCardRules = cmsData.pointCardRules || EIL_POINT_CARD_RULES;

  const handleUpdatePointCardRule = (idx: number, newRule: string) => {
    updateCmsData((prev) => ({
      ...prev,
      pointCardRules: (prev.pointCardRules || EIL_POINT_CARD_RULES).map((r, i) =>
        i === idx ? newRule : r
      ),
    }));
  };

  const handleAddPointCardRule = () => {
    updateCmsData((prev) => ({
      ...prev,
      pointCardRules: [
        ...(prev.pointCardRules || EIL_POINT_CARD_RULES),
        'New EIL Point Card loyalty rule — click to edit details.',
      ],
    }));
  };

  const handleDeletePointCardRule = (idx: number) => {
    updateCmsData((prev) => ({
      ...prev,
      pointCardRules: (prev.pointCardRules || EIL_POINT_CARD_RULES).filter((_, i) => i !== idx),
    }));
  };

  return (
    <section id="how-to-buy" className="py-12 sm:py-16 lg:py-20 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0A0A0A] text-[#FFFFFF] text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              <CmsText
                cmsKey="htb_header_badge"
                defaultValue="Open-Ended Leasing · Corporate Call-Off · Walk-In Desk · Fleet Priority"
                label="How to Buy Header Badge"
                section="How to Buy"
              />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A0A0A] tracking-tight break-words">
              <CmsText
                cmsKey="htb_header_title_1"
                defaultValue="How to Lease Equipment &"
                label="How to Buy Title (Part 1)"
                section="How to Buy"
              />{' '}
              <span className="text-[#DC2626]">
                <CmsText
                  cmsKey="htb_header_title_highlight"
                  defaultValue="Book Haulage Services"
                  label="How to Buy Title (Red Highlight)"
                  section="How to Buy"
                />
              </span>
            </h2>
            <p className="mt-3 text-[15px] sm:text-base text-[#3B0707] max-w-2xl leading-[1.65] break-words">
              <CmsText
                cmsKey="htb_header_subtitle"
                defaultValue="At EIL, hiring heavy machinery (Forklifts, Excavators, Swamp Buggies, Dozers, Cranes, Backhoes) and booking haulage trucks (Lowbeds, Flatbeds, Tankers, Pneumatic & Dump Trucks) is streamlined, transparent, and open-ended — with no fixed duration limits."
                label="How to Buy Intro Paragraph"
                section="How to Buy"
                multiline
              />
            </p>
          </div>

          {/* Segmented Tab Switcher */}
          <div
            data-cms-ignore="true"
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 bg-[#0A0A0A] rounded-2xl w-full sm:w-auto shrink-0"
          >
            <button
              type="button"
              onClick={() => setHowToBuyTab('ordering')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center cursor-pointer ${
                howToBuyTab === 'ordering'
                  ? 'bg-[#DC2626] text-[#FFFFFF] sm:scale-105'
                  : 'text-[#FFFFFF] hover:text-[#DC2626]'
              }`}
            >
              <CmsText
                cmsKey="htb_tab_1_label"
                defaultValue="Leasing Plans & Yard Dispatch"
                label="How to Buy Tab 1 Label"
                section="How to Buy"
              />
            </button>
            <button
              type="button"
              onClick={() => setHowToBuyTab('point-card')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                howToBuyTab === 'point-card'
                  ? 'bg-[#DC2626] text-[#FFFFFF] sm:scale-105'
                  : 'text-[#FFFFFF] hover:text-[#DC2626]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <CmsText
                cmsKey="htb_tab_2_label"
                defaultValue="Corporate Fleet Priority & Rewards"
                label="How to Buy Tab 2 Label"
                section="How to Buy"
              />
            </button>
          </div>
        </div>

        {howToBuyTab === 'ordering' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-5 sm:p-6 rounded-3xl bg-[#FFF8F8] hover:bg-[#0A0A0A] border-2 border-[#0A0A0A]/15 hover:border-[#DC2626] flex flex-col justify-between transition-all duration-300 shadow-xs min-w-0"
              >
                <div className="min-w-0">
                  <span className="inline-block px-2.5 py-1 rounded bg-[#DC2626] text-[#FFFFFF] font-mono-num text-xs font-extrabold">
                    <CmsText
                      cmsKey="htb_opt1_code"
                      defaultValue="OPTION 01"
                      label="Option 1 Code"
                      section="How to Buy"
                    />
                  </span>
                  <h3 className="text-lg font-extrabold text-[#0A0A0A] group-hover:text-[#FFFFFF] mt-3 transition-colors break-words">
                    <CmsText
                      cmsKey="htb_opt1_title"
                      defaultValue="Registered Corporate Fleet Account"
                      label="Option 1 Title"
                      section="How to Buy"
                    />
                  </h3>
                  <p className="text-[15px] sm:text-xs text-[#3B0707] group-hover:text-red-100 mt-2 leading-[1.65] transition-colors break-words">
                    <CmsText
                      cmsKey="htb_opt1_desc"
                      defaultValue="Register a corporate contractor account with EIL for tailored milestone or monthly billing plans. Lease Forklifts, Excavators, Dozers, Cranes, Backhoes, and Haulage Trucks with open-ended schedule flexibility — no fixed time limits."
                      label="Option 1 Description"
                      section="How to Buy"
                      multiline
                    />
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#FECACA]/40 text-xs font-mono-num font-bold text-[#DC2626]">
                  <CmsText
                    cmsKey="htb_opt1_footer"
                    defaultValue="Tel / WhatsApp: (+234) 070-3825-9142"
                    label="Option 1 Phone Footer"
                    section="How to Buy"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-5 sm:p-6 rounded-3xl bg-[#FFF8F8] hover:bg-[#0A0A0A] border-2 border-[#0A0A0A]/15 hover:border-[#DC2626] flex flex-col justify-between transition-all duration-300 shadow-xs min-w-0"
              >
                <div className="min-w-0">
                  <span className="inline-block px-2.5 py-1 rounded bg-[#0A0A0A] group-hover:bg-[#DC2626] text-[#FFFFFF] font-mono-num text-xs font-extrabold transition-colors">
                    <CmsText
                      cmsKey="htb_opt2_code"
                      defaultValue="OPTION 02"
                      label="Option 2 Code"
                      section="How to Buy"
                    />
                  </span>
                  <h3 className="text-lg font-extrabold text-[#0A0A0A] group-hover:text-[#FFFFFF] mt-3 transition-colors break-words">
                    <CmsText
                      cmsKey="htb_opt2_title"
                      defaultValue="Direct Yard Walk-In & Inspection"
                      label="Option 2 Title"
                      section="How to Buy"
                    />
                  </h3>
                  <p className="text-[15px] sm:text-xs text-[#3B0707] group-hover:text-red-100 mt-2 leading-[1.65] transition-colors break-words">
                    <CmsText
                      cmsKey="htb_opt2_desc"
                      defaultValue="Visit our Port Harcourt Head Office (Plot 213, Old Aba Road, Rumuogba-Obio) or Warri Branch (9, Etuwewe Road, Off Deco Road) to physically inspect machines, verify load test certificates, and arrange immediate lowbed or haulage dispatch."
                      label="Option 2 Description"
                      section="How to Buy"
                      multiline
                    />
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#FECACA]/40 text-xs text-[#DC2626] font-extrabold">
                  <CmsText
                    cmsKey="htb_opt2_footer"
                    defaultValue="Port Harcourt (Old Aba Rd) & Warri Yards"
                    label="Option 2 Footer"
                    section="How to Buy"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.16 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-5 sm:p-6 rounded-3xl bg-[#FFF8F8] hover:bg-[#0A0A0A] border-2 border-[#0A0A0A]/15 hover:border-[#DC2626] flex flex-col justify-between transition-all duration-300 shadow-xs min-w-0"
              >
                <div className="min-w-0">
                  <span className="inline-block px-2.5 py-1 rounded bg-[#DC2626] text-[#FFFFFF] font-mono-num text-xs font-extrabold">
                    <CmsText
                      cmsKey="htb_opt3_code"
                      defaultValue="OPTION 03"
                      label="Option 3 Code"
                      section="How to Buy"
                    />
                  </span>
                  <h3 className="text-lg font-extrabold text-[#0A0A0A] group-hover:text-[#FFFFFF] mt-3 transition-colors break-words">
                    <CmsEditableText
                      fieldKey="pointCardHeading"
                      value={cmsData.pointCardHeading}
                      isEditMode={isEditMode}
                      onSelectField={onSelectField}
                    />
                  </h3>
                  <p className="text-[15px] sm:text-xs text-[#3B0707] group-hover:text-red-100 mt-2 leading-[1.65] transition-colors break-words">
                    <CmsEditableText
                      fieldKey="pointCardDescription"
                      value={cmsData.pointCardDescription}
                      isEditMode={isEditMode}
                      onSelectField={onSelectField}
                    />
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHowToBuyTab('point-card')}
                  className="mt-5 pt-3 border-t border-[#FECACA]/40 text-xs font-extrabold text-[#DC2626] group-hover:text-[#FFFFFF] hover:underline text-left flex items-center justify-between cursor-pointer"
                >
                  <CmsText
                    cmsKey="htb_opt3_cta"
                    defaultValue="Read Point Card Rules"
                    label="Option 3 CTA"
                    section="How to Buy"
                  />
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            </div>

            {/* Official Hours Card in Dark Black & Red */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-4 p-5 sm:p-8 rounded-3xl bg-[#0A0A0A] text-[#FFFFFF] border-2 border-[#DC2626] flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#DC2626]">
                  <Clock className="w-4 h-4 text-[#DC2626]" />
                  <CmsText
                    cmsKey="htb_hours_badge"
                    defaultValue="Official Operating Hours"
                    label="Operating Hours Badge"
                    section="How to Buy"
                  />
                </div>
                <h3 className="text-xl font-extrabold mt-2 text-[#FFFFFF]">
                  <CmsText
                    cmsKey="htb_hours_title"
                    defaultValue="Open Monday–Saturday + 24/7 Special Arrangement"
                    label="Operating Hours Title"
                    section="How to Buy"
                  />
                </h3>
                <div className="mt-5 space-y-3 text-sm border-t border-white/15 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-red-200">
                      <CmsText
                        cmsKey="htb_hours_row1_day"
                        defaultValue="Monday to Friday"
                        label="Hours Row 1 Day"
                        section="How to Buy"
                      />
                    </span>
                    <span className="font-mono-num font-bold text-[#FFFFFF]">
                      <CmsText
                        cmsKey="htb_hours_row1_time"
                        defaultValue="8:00am – 5:30pm"
                        label="Hours Row 1 Time"
                        section="How to Buy"
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-red-200">
                      <CmsText
                        cmsKey="htb_hours_row2_day"
                        defaultValue="Saturdays"
                        label="Hours Row 2 Day"
                        section="How to Buy"
                      />
                    </span>
                    <span className="font-mono-num font-bold text-[#FFFFFF]">
                      <CmsText
                        cmsKey="htb_hours_row2_time"
                        defaultValue="8:30am – 4:00pm"
                        label="Hours Row 2 Time"
                        section="How to Buy"
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-red-200">
                      <CmsText
                        cmsKey="htb_hours_row3_day"
                        defaultValue="Sundays & Public Holidays"
                        label="Hours Row 3 Day"
                        section="How to Buy"
                      />
                    </span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-[#DC2626] text-[#FFFFFF]">
                      <CmsText
                        cmsKey="htb_hours_row3_time"
                        defaultValue="24/7 on Notice"
                        label="Hours Row 3 Badge"
                        section="How to Buy"
                      />
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-[14px] sm:text-xs text-red-100/90 leading-[1.65]">
                  <CmsText
                    cmsKey="htb_hours_note"
                    defaultValue="On special arrangement by giving notice during official hours, we operate 24/7 even on Sundays and public holidays to ensure you meet target."
                    label="Operating Hours Note"
                    section="How to Buy"
                    multiline
                  />
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onOpenBasket}
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#DC2626] hover:bg-[#FFFFFF] hover:text-[#0A0A0A] text-xs font-extrabold text-[#FFFFFF] transition-all duration-200 cursor-pointer"
                >
                  <CmsText
                    cmsKey="htb_hours_cta"
                    defaultValue="Open Enquiry Basket to Place Order"
                    label="Operating Hours Button"
                    section="How to Buy"
                  />
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Concise EIL Point Card Tab */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FFF8F8] rounded-3xl border-2 border-[#0A0A0A] p-5 sm:p-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Visual Recreation of the EIL Point Card from Page 98 of PDF with Official Logo */}
              <div className="lg:col-span-5">
                <motion.div
                  whileHover={{ scale: 1.03, rotate: -1 }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#FFFFFF] border-2 border-[#0A0A0A] rounded-3xl p-5 sm:p-6 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-2 border-b-2 border-[#0A0A0A] pb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={resolveAssetUrl(cmsData.brandLogoUrl)}
                        onError={handleBrandLogoError}
                        alt="Emmadios Industrial Limited Official Logo"
                        className="h-10 sm:h-12 w-auto object-contain shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#0A0A0A] uppercase">
                          <CmsText
                            cmsKey="htb_pc_card_org"
                            defaultValue="EMMADIOS INDUSTRIAL LIMITED"
                            label="Point Card Org Title"
                            section="EIL Point Card"
                          />
                        </div>
                        <div className="text-[11px] font-extrabold text-[#DC2626]">
                          <CmsText
                            cmsKey="htb_pc_card_sub"
                            defaultValue="EIL POINT CARD · CASHLESS ACCOUNT"
                            label="Point Card Subtitle"
                            section="EIL Point Card"
                          />
                        </div>
                      </div>
                    </div>
                    <span className="font-mono-num text-xs font-extrabold px-2 py-0.5 rounded bg-[#0A0A0A] text-[#FFFFFF] shrink-0">
                      <CmsText
                        cmsKey="htb_pc_card_no"
                        defaultValue="NO-1"
                        label="Point Card Number Tag"
                        section="EIL Point Card"
                      />
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 font-mono-num text-xs">
                    <div className="border-b border-[#FECACA] pb-1.5">
                      <span className="text-[10px] text-[#7F1D1D] block">
                        <CmsText
                          cmsKey="htb_pc_field1_lbl"
                          defaultValue="COMPANY / CUSTOMER NAME:"
                          label="Point Card Field 1 Label"
                          section="EIL Point Card"
                        />
                      </span>
                      <span className="font-extrabold text-[#0A0A0A]">
                        <CmsText
                          cmsKey="htb_pc_field1_val"
                          defaultValue="REGISTERED EIL PARTNER ACCOUNT"
                          label="Point Card Field 1 Value"
                          section="EIL Point Card"
                        />
                      </span>
                    </div>
                    <div className="border-b border-[#FECACA] pb-1.5">
                      <span className="text-[10px] text-[#7F1D1D] block">
                        <CmsText
                          cmsKey="htb_pc_field2_lbl"
                          defaultValue="REGISTRATION NO (ACCOUNT NO):"
                          label="Point Card Field 2 Label"
                          section="EIL Point Card"
                        />
                      </span>
                      <span className="font-extrabold text-[#0A0A0A]">
                        <CmsText
                          cmsKey="htb_pc_field2_val"
                          defaultValue="EIL-REG-2011-0400"
                          label="Point Card Field 2 Value"
                          section="EIL Point Card"
                        />
                      </span>
                    </div>
                    <div className="border-b border-[#FECACA] pb-1.5">
                      <span className="text-[10px] text-[#7F1D1D] block">
                        <CmsText
                          cmsKey="htb_pc_field3_lbl"
                          defaultValue="POINT CARD NO:"
                          label="Point Card Field 3 Label"
                          section="EIL Point Card"
                        />
                      </span>
                      <span className="font-extrabold text-[#DC2626]">
                        <CmsText
                          cmsKey="htb_pc_field3_val"
                          defaultValue="EIL-PC-00894-NG"
                          label="Point Card Field 3 Value"
                          section="EIL Point Card"
                        />
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-center text-[#0A0A0A] bg-[#FEF2F2] rounded-lg leading-snug">
                    <CmsText
                      cmsKey="htb_pc_footer_motto"
                      defaultValue="MORE POINT, MORE TREAT. IT IS YOUR RESPONSIBILITY TO CLAIM YOUR POINT."
                      label="Point Card Motto"
                      section="EIL Point Card"
                    />
                  </div>
                </motion.div>
              </div>

              {/* EIL Point Card Rules & How You Collect / Spend Points */}
              <div className="lg:col-span-7 min-w-0">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#DC2626] break-words">
                  <CmsEditableText
                    fieldKey="pointCardBadge"
                    value={cmsData.pointCardBadge}
                    isEditMode={isEditMode}
                    onSelectField={onSelectField}
                  />
                </div>
                <h3 className="text-2xl font-extrabold text-[#0A0A0A] mt-1 break-words">
                  <CmsEditableText
                    fieldKey="pointCardHeading"
                    value={cmsData.pointCardHeading}
                    isEditMode={isEditMode}
                    onSelectField={onSelectField}
                  />
                </h3>
                <p className="text-[15px] sm:text-base text-[#3B0707] mt-2 leading-[1.65] break-words">
                  <CmsEditableText
                    fieldKey="pointCardDescription"
                    value={cmsData.pointCardDescription}
                    isEditMode={isEditMode}
                    onSelectField={onSelectField}
                  />
                </p>

                <div className="mt-5 space-y-2.5">
                  {pointCardRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-2.5 text-[14px] sm:text-sm font-medium text-[#0A0A0A] bg-[#FFFFFF] hover:bg-[#0A0A0A] hover:text-[#FFFFFF] p-3.5 sm:p-4 rounded-xl border border-[#0A0A0A]/15 transition-colors duration-200 leading-[1.55]"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <CmsText
                          value={rule}
                          defaultValue={EIL_POINT_CARD_RULES[idx] || rule}
                          label={`Point Card Rule #${idx + 1}`}
                          section="EIL Point Card Rules"
                          multiline
                          onSave={(val) => handleUpdatePointCardRule(idx, val)}
                        />
                      </div>
                      {isEditMode && (
                        <button
                          type="button"
                          data-cms-explicit="true"
                          onClick={() => handleDeletePointCardRule(idx)}
                          className="p-1.5 rounded-lg bg-[#DC2626] text-white hover:bg-[#B91C1C] shrink-0 cursor-pointer"
                          title="Delete Point Card Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  {isEditMode && (
                    <button
                      type="button"
                      data-cms-explicit="true"
                      onClick={handleAddPointCardRule}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Point Card Rule</span>
                    </button>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenQuoteModal(
                        'EIL Point Card Inquiry',
                        'Requesting registration for a company/individual EIL Point Card cashless account.'
                      )
                    }
                    className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-full bg-[#DC2626] text-[#FFFFFF] text-xs font-extrabold hover:bg-[#0A0A0A] hover:scale-105 transition-all cursor-pointer flex items-center justify-center"
                  >
                    <CmsEditableText
                      fieldKey="pointCardCtaLabel"
                      value={cmsData.pointCardCtaLabel}
                      isEditMode={isEditMode}
                      onSelectField={onSelectField}
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

// ============================================================================
// BRANCH AND OFFICE LOCATOR SECTION
// ============================================================================
export const BranchLocatorSection: React.FC = () => {
  const { cmsData, isEditMode, updateCmsData } = useCms();
  const branches = cmsData.branches?.length ? cmsData.branches : EIL_BRANCHES;

  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0].id);

  const selectedBranch =
    branches.find((b) => b.id === selectedBranchId) || branches[0];

  const handleUpdateBranch = (
    branchId: string,
    updater: (b: BranchOffice) => BranchOffice
  ) => {
    updateCmsData((prev) => ({
      ...prev,
      branches: (prev.branches?.length ? prev.branches : EIL_BRANCHES).map((b) =>
        b.id === branchId ? updater(b) : b
      ),
    }));
  };

  const handleAddBranch = () => {
    const newBranch: BranchOffice = {
      id: `branch-${Date.now()}`,
      name: 'New EIL Operations Branch',
      shortName: 'New Branch',
      badge: 'OPERATIONS BRANCH',
      addressLines: ['New Industrial Layout Address', 'Rivers / Delta State, Nigeria'],
      city: 'Port-Harcourt',
      state: 'Rivers State',
      phone: '(+234) 070-3825-9142',
      hours: [
        'Mon – Fri: 7:30 AM – 6:00 PM',
        'Saturday: 8:00 AM – 4:00 PM',
        '24/7 Project Mobilization & Dispatch on Request',
      ],
      specialNote:
        'Heavy equipment hiring/leasing yard and lowbed/flatbed/tanker/dump truck haulage dispatch desk.',
      capabilities: [
        'Heavy Equipment Hiring & Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)',
        'Lowbed, Flatbed, Tanker, Pneumatic & Dump Truck Haulage',
        'On-Site Preventive Fleet Maintenance & Pre-Mobilization Site Surveys',
      ],
      coordinates: EIL_BRANCHES[0].coordinates,
      mapEmbedUrl: EIL_BRANCHES[0].mapEmbedUrl,
      directionsUrl: EIL_BRANCHES[0].directionsUrl,
    };
    updateCmsData((prev) => ({
      ...prev,
      branches: [...(prev.branches?.length ? prev.branches : EIL_BRANCHES), newBranch],
    }));
    setSelectedBranchId(newBranch.id);
  };

  const handleDeleteBranch = (branchId: string) => {
    if (branches.length <= 1) return;
    updateCmsData((prev) => {
      const remaining = (prev.branches?.length ? prev.branches : EIL_BRANCHES).filter(
        (b) => b.id !== branchId
      );
      return {
        ...prev,
        branches: remaining,
      };
    });
    if (selectedBranchId === branchId) {
      const firstRemaining = branches.find((b) => b.id !== branchId);
      if (firstRemaining) setSelectedBranchId(firstRemaining.id);
    }
  };

  return (
    <section id="branches" className="py-12 sm:py-16 lg:py-20 bg-[#FFF8F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0A0A0A] text-[#FFFFFF] text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
              <CmsText
                cmsKey="branches_header_badge"
                defaultValue="Port Harcourt (Plot 213, Old Aba Road) · Warri (9, Etuwewe Road)"
                label="Branches Section Badge"
                section="Branch Locator"
              />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A0A0A] tracking-tight">
              <CmsText
                cmsKey="branches_header_title_1"
                defaultValue="Port Harcourt & Warri"
                label="Branches Title (Part 1)"
                section="Branch Locator"
              />{' '}
              <span className="text-[#DC2626]">
                <CmsText
                  cmsKey="branches_header_title_highlight"
                  defaultValue="Branch Locator"
                  label="Branches Title (Red Highlight)"
                  section="Branch Locator"
                />
              </span>
            </h2>
            <p className="mt-3 text-[15px] sm:text-base text-[#3B0707] max-w-2xl leading-[1.65]">
              <CmsText
                cmsKey="branches_header_subtitle"
                defaultValue="Select either of our two official operational locations in Port Harcourt (Rivers State) and Warri (Delta State) to view interactive maps, operating hours, direct phone/WhatsApp (+234 703 825 9142), and turn-by-turn directions."
                label="Branches Intro Paragraph"
                section="Branch Locator"
                multiline
              />
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isEditMode && (
              <button
                type="button"
                data-cms-explicit="true"
                onClick={handleAddBranch}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Branch</span>
              </button>
            )}
            <div className="text-xs font-mono-num text-[#0A0A0A] bg-white px-4 py-2.5 rounded-xl border border-[#0A0A0A]/15 break-words">
              Email:{' '}
              <a
                href="mailto:info@emmadios.com"
                className="text-[#DC2626] font-extrabold underline"
              >
                <CmsText
                  cmsKey="branches_header_email"
                  defaultValue="info@emmadios.com"
                  label="Branches Official Email"
                  section="Branch Locator"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Branch Selector Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {branches.map((branch, idx) => {
              const isSelected = branch.id === selectedBranch.id;
              return (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.06 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={() => setSelectedBranchId(branch.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedBranchId(branch.id);
                  }}
                  className={`p-5 sm:p-6 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'bg-[#0A0A0A] text-[#FFFFFF] border-[#DC2626] ring-4 ring-[#DC2626]/20 shadow-lg'
                      : 'bg-[#FFFFFF] text-[#0A0A0A] border-[#0A0A0A]/15 hover:border-[#DC2626]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#DC2626] text-[#FFFFFF]">
                        <CmsText
                          value={branch.badge}
                          defaultValue={branch.badge}
                          label={`${branch.name} — Badge`}
                          section="Branch Locator"
                          onSave={(val) =>
                            handleUpdateBranch(branch.id, (b) => ({ ...b, badge: val }))
                          }
                        />
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isEditMode && branches.length > 1 && (
                          <button
                            type="button"
                            data-cms-explicit="true"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBranch(branch.id);
                            }}
                            className="p-1.5 rounded-lg bg-[#DC2626] text-white hover:bg-[#B91C1C] cursor-pointer"
                            title="Delete Branch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <MapPin className="w-4 h-4 text-[#DC2626] shrink-0" />
                      </div>
                    </div>
                    <h3
                      className={`text-base font-extrabold mt-2 ${
                        isSelected ? 'text-[#FFFFFF]' : 'text-[#0A0A0A]'
                      }`}
                    >
                      <CmsText
                        value={branch.name}
                        defaultValue={branch.name}
                        label={`${branch.name} — Name`}
                        section="Branch Locator"
                        onSave={(val) =>
                          handleUpdateBranch(branch.id, (b) => ({ ...b, name: val }))
                        }
                      />
                    </h3>
                    <div
                      className={`mt-2.5 space-y-0.5 text-xs ${
                        isSelected ? 'text-red-100' : 'text-[#3B0707]'
                      }`}
                    >
                      {branch.addressLines.map((line, i) => (
                        <div key={i}>
                          <CmsText
                            value={line}
                            defaultValue={line}
                            label={`${branch.name} — Address Line ${i + 1}`}
                            section="Branch Locator"
                            onSave={(val) =>
                              handleUpdateBranch(branch.id, (b) => ({
                                ...b,
                                addressLines: b.addressLines.map((l, idxLine) =>
                                  idxLine === i ? val : l
                                ),
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div
                      className={`mt-3 pt-3 border-t space-y-1 text-xs ${
                        isSelected ? 'border-white/15' : 'border-[#FECACA]'
                      }`}
                    >
                      <div
                        className={`font-mono-num font-extrabold ${
                          isSelected ? 'text-[#FFFFFF]' : 'text-[#0A0A0A]'
                        }`}
                      >
                        Tel:{' '}
                        <CmsText
                          value={branch.phone}
                          defaultValue={branch.phone}
                          label={`${branch.name} — Phone`}
                          section="Branch Locator"
                          onSave={(val) =>
                            handleUpdateBranch(branch.id, (b) => ({ ...b, phone: val }))
                          }
                        />
                      </div>
                      {branch.hours.map((h, i) => (
                        <div
                          key={i}
                          className={`text-[11px] ${
                            isSelected ? 'text-red-200' : 'text-[#DC2626]'
                          }`}
                        >
                          <CmsText
                            value={h}
                            defaultValue={h}
                            label={`${branch.name} — Hours Line ${i + 1}`}
                            section="Branch Locator"
                            onSave={(val) =>
                              handleUpdateBranch(branch.id, (b) => ({
                                ...b,
                                hours: b.hours.map((hr, idxHr) => (idxHr === i ? val : hr)),
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`mt-4 pt-3 border-t flex items-center justify-between gap-2 ${
                      isSelected ? 'border-white/15' : 'border-[#FECACA]'
                    }`}
                  >
                    <a
                      href={branch.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-extrabold hover:underline flex items-center gap-1 text-[#DC2626]"
                    >
                      <span>Get Directions</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`tel:${branch.phone.replace(/[^+\d]/g, '')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="min-h-[36px] inline-flex items-center px-3 py-1.5 rounded-md bg-[#DC2626] text-[#FFFFFF] text-[11px] font-bold hover:bg-[#B91C1C] transition-colors"
                    >
                      Call Branch
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Map & Selected Branch Details */}
          <div className="lg:col-span-6 bg-[#FFFFFF] rounded-3xl border-2 border-[#0A0A0A] overflow-hidden flex flex-col justify-between shadow-sm">
            <div className="h-64 sm:h-80 w-full bg-[#0A0A0A] relative border-b-2 border-[#0A0A0A]">
              <iframe
                title={`Map for ${selectedBranch.name}`}
                src={selectedBranch.mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#DC2626]">
                    <CmsText
                      cmsKey="branches_selected_label"
                      defaultValue="Selected Location Details"
                      label="Selected Location Label"
                      section="Branch Locator"
                    />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#0A0A0A] mt-0.5">
                    <CmsText
                      value={selectedBranch.name}
                      defaultValue={selectedBranch.name}
                      label={`${selectedBranch.name} — Title`}
                      section="Branch Locator"
                      onSave={(val) =>
                        handleUpdateBranch(selectedBranch.id, (b) => ({ ...b, name: val }))
                      }
                    />
                  </h3>
                </div>
                <a
                  href={selectedBranch.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-full bg-[#0A0A0A] hover:bg-[#DC2626] text-[#FFFFFF] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="mt-2 text-[14px] sm:text-xs text-[#3B0707] leading-[1.6]">
                <CmsText
                  value={selectedBranch.specialNote}
                  defaultValue={selectedBranch.specialNote}
                  label={`${selectedBranch.name} — Special Note`}
                  section="Branch Locator"
                  multiline
                  onSave={(val) =>
                    handleUpdateBranch(selectedBranch.id, (b) => ({
                      ...b,
                      specialNote: val,
                    }))
                  }
                />
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedBranch.capabilities.map((cap, i) => (
                  <div
                    key={i}
                    className="text-xs font-semibold text-[#0A0A0A] bg-[#FFF8F8] px-3 py-2.5 rounded-xl border border-[#FECACA] flex items-center justify-between gap-2"
                  >
                    <span>
                      •{' '}
                      <CmsText
                        value={cap}
                        defaultValue={cap}
                        label={`${selectedBranch.name} — Capability ${i + 1}`}
                        section="Branch Locator"
                        onSave={(val) =>
                          handleUpdateBranch(selectedBranch.id, (b) => ({
                            ...b,
                            capabilities: b.capabilities.map((c, idxCap) =>
                              idxCap === i ? val : c
                            ),
                          }))
                        }
                      />
                    </span>
                    {isEditMode && (
                      <button
                        type="button"
                        data-cms-explicit="true"
                        onClick={() =>
                          handleUpdateBranch(selectedBranch.id, (b) => ({
                            ...b,
                            capabilities: b.capabilities.filter((_, idxCap) => idxCap !== i),
                          }))
                        }
                        className="p-1 rounded bg-[#DC2626] text-white hover:bg-[#B91C1C] shrink-0 cursor-pointer"
                        title="Delete Capability"
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
                      handleUpdateBranch(selectedBranch.id, (b) => ({
                        ...b,
                        capabilities: [...b.capabilities, 'New Branch Capability'],
                      }))
                    }
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Capability</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// ABOUT US, OUR COMMITMENT, THE EIL DRIVE & VISION/MISSION SECTION
// ============================================================================
export const AboutUsSection: React.FC = () => {
  const { cmsData, isEditMode, updateCmsData } = useCms();
  const [aboutTab, setAboutTab] = useState<'history' | 'commitment' | 'drive' | 'vision'>(
    'history'
  );

  const coreValues = cmsData.coreValues?.length
    ? cmsData.coreValues
    : DEFAULT_EIL_CMS_DATA.coreValues;
  const safetyCommitments = cmsData.safetyCommitments?.length
    ? cmsData.safetyCommitments
    : EIL_SAFETY_COMMITMENTS;

  const handleUpdateCoreValue = (
    id: string,
    updater: (v: CmsCoreValueItem) => CmsCoreValueItem
  ) => {
    updateCmsData((prev) => ({
      ...prev,
      coreValues: (prev.coreValues?.length
        ? prev.coreValues
        : DEFAULT_EIL_CMS_DATA.coreValues
      ).map((v) => (v.id === id ? updater(v) : v)),
    }));
  };

  const handleAddCoreValue = () => {
    const newVal: CmsCoreValueItem = {
      id: `cv-${Date.now()}`,
      title: 'New Core Value',
      description:
        'Describe this EIL core value and how it guides our heavy equipment hiring, leasing, and haulage operations.',
    };
    updateCmsData((prev) => ({
      ...prev,
      coreValues: [
        ...(prev.coreValues?.length ? prev.coreValues : DEFAULT_EIL_CMS_DATA.coreValues),
        newVal,
      ],
    }));
  };

  const handleDeleteCoreValue = (id: string) => {
    updateCmsData((prev) => ({
      ...prev,
      coreValues: (prev.coreValues?.length
        ? prev.coreValues
        : DEFAULT_EIL_CMS_DATA.coreValues
      ).filter((v) => v.id !== id),
    }));
  };

  const handleUpdateSafetyCommitment = (idx: number, newVal: string) => {
    updateCmsData((prev) => ({
      ...prev,
      safetyCommitments: (prev.safetyCommitments?.length
        ? prev.safetyCommitments
        : EIL_SAFETY_COMMITMENTS
      ).map((s, i) => (i === idx ? newVal : s)),
    }));
  };

  const handleAddSafetyCommitment = () => {
    updateCmsData((prev) => ({
      ...prev,
      safetyCommitments: [
        ...(prev.safetyCommitments?.length ? prev.safetyCommitments : EIL_SAFETY_COMMITMENTS),
        'New Health & Safety Commitment — click to edit.',
      ],
    }));
  };

  const handleDeleteSafetyCommitment = (idx: number) => {
    updateCmsData((prev) => ({
      ...prev,
      safetyCommitments: (prev.safetyCommitments?.length
        ? prev.safetyCommitments
        : EIL_SAFETY_COMMITMENTS
      ).filter((_, i) => i !== idx),
    }));
  };

  return (
    <section id="about-eil" className="py-12 sm:py-16 lg:py-20 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0A0A0A] text-[#FFFFFF] text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              <CmsText
                cmsKey="about_section_badge"
                defaultValue="About Emmadios Industrial Limited · Est. 2008 · Incorporated 2011"
                label="About Section Badge"
                section="About Us"
              />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0A0A0A] tracking-tight">
              <CmsText
                cmsKey="about_section_title_1"
                defaultValue="Indigenous Engineering Strength with"
                label="About Section Heading (Part 1)"
                section="About Us"
              />{' '}
              <span className="text-[#DC2626]">
                <CmsText
                  cmsKey="about_section_title_highlight"
                  defaultValue="Over 400 Employees"
                  label="About Section Heading (Red Highlight)"
                  section="About Us"
                />
              </span>
            </h2>
          </div>

          <div
            data-cms-ignore="true"
            className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 p-1.5 bg-[#0A0A0A] rounded-2xl w-full sm:w-auto"
          >
            {[
              { id: 'history', label: 'Company History' },
              { id: 'vision', label: 'Vision & Mission' },
              { id: 'drive', label: 'The EIL Drive (Values)' },
              { id: 'commitment', label: 'Health & Safety Policy' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAboutTab(tab.id as typeof aboutTab)}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-extrabold transition-all text-center cursor-pointer ${
                  aboutTab === tab.id
                    ? 'bg-[#DC2626] text-[#FFFFFF] sm:scale-105'
                    : 'text-[#FFFFFF] hover:text-[#DC2626]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {aboutTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FFF8F8] rounded-3xl border-2 border-[#0A0A0A] p-5 sm:p-10"
          >
            <div className="lg:col-span-5 space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl overflow-hidden border-2 border-[#0A0A0A] aspect-[4/3] sm:aspect-auto sm:h-80 bg-[#0A0A0A] relative"
              >
                <CmsImage
                  cmsKey="about_history_image"
                  defaultSrc="/assets/eil/pdf_img_027.jpg"
                  alt="EIL Heavy Equipment and Haulage Fleet"
                  label="Company History Fleet Image"
                  section="About Us — History"
                  targetWidth={960}
                  targetHeight={720}
                  aspectLabel="4:3 Landscape"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#0A0A0A] text-[#FFFFFF]">
                  <div className="text-xl sm:text-2xl font-mono font-extrabold text-[#DC2626]">
                    <CmsText
                      cmsKey="about_stat_1_val"
                      defaultValue="2008 / 2011"
                      label="History Stat 1 Value"
                      section="About Us — History"
                    />
                  </div>
                  <div className="text-xs text-red-100 mt-0.5">
                    <CmsText
                      cmsKey="about_stat_1_lbl"
                      defaultValue="Founded & Incorporated"
                      label="History Stat 1 Label"
                      section="About Us — History"
                    />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#DC2626] text-[#FFFFFF]">
                  <div className="text-xl sm:text-2xl font-mono font-extrabold text-[#FFFFFF]">
                    <CmsText
                      cmsKey="about_stat_2_val"
                      defaultValue="PH & Warri"
                      label="History Stat 2 Value"
                      section="About Us — History"
                    />
                  </div>
                  <div className="text-xs text-red-100 mt-0.5">
                    <CmsText
                      cmsKey="about_stat_2_lbl"
                      defaultValue="Operational Fleet Yards"
                      label="History Stat 2 Label"
                      section="About Us — History"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-4 text-[15px] sm:text-base text-[#3B0707] leading-[1.65]">
              <h3 className="text-2xl font-extrabold text-[#0A0A0A]">
                <CmsText
                  cmsKey="about_history_heading"
                  defaultValue="Indigenous Heavy Equipment Hiring, Plant Leasing & Haulage Leader"
                  label="Company History Heading"
                  section="About Us — History"
                />
              </h3>
              <p>
                <CmsText
                  cmsKey="about_history_p1"
                  defaultValue="EMMADIOS INDUSTRIAL LIMITED (EIL) is an indigenous heavy equipment leasing and road haulage company founded in 2008 and incorporated as a limited liability company in 2011. From inception, EIL has focused on providing dependable machinery hire and heavy-duty logistics across the Niger Delta and Nigeria."
                  label="Company History Paragraph 1"
                  section="About Us — History"
                  multiline
                />
              </p>
              <p>
                <CmsText
                  cmsKey="about_history_p2"
                  defaultValue="Today, EIL operates a comprehensive fleet of heavy machinery for hire and lease — including Forklifts of different tonnages (3T–45T & Reach Stackers), Tracked Excavators, Amphibious Swamp Buggies, Dozers (CAT D6, D7 & D8), Mobile & Crawler Cranes (25T–150T+), Backhoe Loaders, Wheel Payloaders, Motor Graders, Vibratory Compactors, Air Compressors, and Diesel Generators — alongside specialized Haulage Services using Multi-Axle Lowbeds, 40ft/45ft Flatbeds, Bulk AGO/Water Tankers, Pneumatic Silo Trucks, and 6x4/8x4 Dump Trucks."
                  label="Company History Paragraph 2"
                  section="About Us — History"
                  multiline
                />
              </p>
              <p>
                <CmsText
                  cmsKey="about_history_p3"
                  defaultValue="Operating from our two strategic yards in Port Harcourt (Plot 213, Old Aba Road, Rumuogba-Obio) and Warri (9, Etuwewe Road, Off Deco Road), our certified operators, riggers, drivers, and mobile mechanics support civil, marine, industrial, and oilfield projects with open-ended lease flexibility."
                  label="Company History Paragraph 3"
                  section="About Us — History"
                  multiline
                />
              </p>
            </div>
          </motion.div>
        )}

        {aboutTab === 'vision' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              className="p-6 sm:p-8 rounded-3xl bg-[#0A0A0A] text-[#FFFFFF] border-2 border-[#DC2626]"
            >
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#DC2626]">
                <CmsText
                  cmsKey="about_vision_badge"
                  defaultValue="Our Vision"
                  label="Vision Card Badge"
                  section="About Us — Vision & Mission"
                />
              </div>
              <h3 className="text-2xl font-extrabold text-[#FFFFFF] mt-2">
                <CmsText
                  cmsKey="about_vision_title"
                  defaultValue="Nigeria’s Premier Equipment Leasing & Heavy Haulage Partner"
                  label="Vision Card Title"
                  section="About Us — Vision & Mission"
                />
              </h3>
              <p className="mt-4 text-[15px] sm:text-base text-red-100 leading-[1.65]">
                <CmsText
                  cmsKey="about_vision_body"
                  defaultValue="“To remain the leading heavy equipment hiring, plant leasing, and specialized haulage contractor in Nigeria — delivering mechanically sound machinery, certified operators, and safe cargo transport to every project site.”"
                  label="Vision Statement"
                  section="About Us — Vision & Mission"
                  multiline
                />
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              className="p-6 sm:p-8 rounded-3xl bg-[#FFF8F8] border-2 border-[#0A0A0A]"
            >
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#DC2626]">
                <CmsText
                  cmsKey="about_mission_badge"
                  defaultValue="Our Mission"
                  label="Mission Card Badge"
                  section="About Us — Vision & Mission"
                />
              </div>
              <h3 className="text-2xl font-extrabold text-[#0A0A0A] mt-2">
                <CmsText
                  cmsKey="about_mission_title"
                  defaultValue="Readily Available Fleet with Open-Ended Flexibility"
                  label="Mission Card Title"
                  section="About Us — Vision & Mission"
                />
              </h3>
              <p className="mt-4 text-[15px] sm:text-base text-[#3B0707] leading-[1.65]">
                <CmsText
                  cmsKey="about_mission_body"
                  defaultValue="“To make heavy equipment leasing (Forklifts, Excavators, Swamp Buggies, Dozers, Cranes, Backhoes) and specialized haulage services (Lowbeds, Flatbeds, Tankers, Pneumatic & Dump Trucks) readily available at every point in time, with open-ended schedule flexibility and uncompromising safety.”"
                  label="Mission Statement"
                  section="About Us — Vision & Mission"
                  multiline
                />
              </p>
            </motion.div>
          </motion.div>
        )}

        {aboutTab === 'drive' && (
          <div className="space-y-6">
            {isEditMode && (
              <div className="flex justify-end">
                <button
                  type="button"
                  data-cms-explicit="true"
                  onClick={handleAddCoreValue}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Core Value</span>
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreValues.map((val, idx) => (
                <motion.div
                  key={val.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.06 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group p-5 sm:p-6 rounded-3xl bg-[#FFF8F8] hover:bg-[#0A0A0A] border-2 border-[#0A0A0A]/15 hover:border-[#DC2626] transition-all duration-300 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono-num text-xs font-extrabold text-[#DC2626]">
                      0{idx + 1} · CORE VALUE
                    </div>
                    {isEditMode && (
                      <button
                        type="button"
                        data-cms-explicit="true"
                        onClick={() => handleDeleteCoreValue(val.id)}
                        className="p-1.5 rounded-lg bg-[#DC2626] text-white hover:bg-[#B91C1C] cursor-pointer"
                        title="Delete Core Value"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-lg font-extrabold text-[#0A0A0A] group-hover:text-[#FFFFFF] mt-1 transition-colors">
                    <CmsText
                      value={val.title}
                      defaultValue={val.title}
                      label={`Core Value #${idx + 1} Title`}
                      section="The EIL Drive"
                      onSave={(newTitle) =>
                        handleUpdateCoreValue(val.id, (v) => ({ ...v, title: newTitle }))
                      }
                    />
                  </h3>
                  <p className="text-[14px] sm:text-sm text-[#3B0707] group-hover:text-red-100 mt-2 leading-[1.65] transition-colors">
                    <CmsText
                      value={val.description}
                      defaultValue={val.description}
                      label={`Core Value #${idx + 1} Description`}
                      section="The EIL Drive"
                      multiline
                      onSave={(newDesc) =>
                        handleUpdateCoreValue(val.id, (v) => ({ ...v, description: newDesc }))
                      }
                    />
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {aboutTab === 'commitment' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FFF8F8] rounded-3xl border-2 border-[#0A0A0A] p-5 sm:p-10"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div className="max-w-3xl">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#DC2626]">
                  <CmsText
                    cmsKey="about_safety_badge"
                    defaultValue="Our Commitment to Health & Safety"
                    label="Safety Tab Badge"
                    section="About Us — Health & Safety"
                  />
                </div>
                <h3 className="text-2xl font-extrabold text-[#0A0A0A] mt-1">
                  <CmsText
                    cmsKey="about_safety_motto"
                    defaultValue="“Together we stand! Divided we fall!”"
                    label="Safety Tab Motto"
                    section="About Us — Health & Safety"
                  />
                </h3>
                <p className="text-[15px] sm:text-base text-[#3B0707] mt-2 leading-[1.65]">
                  <CmsText
                    cmsKey="about_safety_intro"
                    defaultValue="At EIL, we value the health, safety, and well-being of our employees, customers, contractors, guests, and visitors. We believe that the standard of health and safety required by law is only a minimum, and we continually seek to exceed legal requirements throughout our business:"
                    label="Safety Intro Paragraph"
                    section="About Us — Health & Safety"
                    multiline
                  />
                </p>
              </div>
              {isEditMode && (
                <button
                  type="button"
                  data-cms-explicit="true"
                  onClick={handleAddSafetyCommitment}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Commitment</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {safetyCommitments.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-2.5 p-3.5 sm:p-4 rounded-xl bg-[#FFFFFF] hover:bg-[#0A0A0A] hover:text-[#FFFFFF] border border-[#0A0A0A]/15 text-[14px] sm:text-sm font-medium text-[#0A0A0A] transition-colors duration-200 leading-[1.55]"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <ShieldCheck className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                    <CmsText
                      value={item}
                      defaultValue={EIL_SAFETY_COMMITMENTS[i] || item}
                      label={`Safety Commitment #${i + 1}`}
                      section="About Us — Health & Safety"
                      multiline
                      onSave={(val) => handleUpdateSafetyCommitment(i, val)}
                    />
                  </div>
                  {isEditMode && (
                    <button
                      type="button"
                      data-cms-explicit="true"
                      onClick={() => handleDeleteSafetyCommitment(i)}
                      className="p-1.5 rounded-lg bg-[#DC2626] text-white hover:bg-[#B91C1C] shrink-0 cursor-pointer"
                      title="Delete Safety Commitment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export const HowToBuyAndBranchesSection: React.FC<HowToBuySectionProps> = ({
  onOpenQuoteModal,
  onOpenBasket,
}) => {
  return (
    <>
      <HowToBuySection onOpenQuoteModal={onOpenQuoteModal} onOpenBasket={onOpenBasket} />
      <BranchLocatorSection />
      <AboutUsSection />
    </>
  );
};
