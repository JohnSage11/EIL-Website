/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EIL_SLOGAN,
  EIL_BRANCHES,
  STOCK_CATALOGUE,
  INDUSTRIAL_GASES_DETAIL,
  SERVICES_LIST,
  TRAINING_COURSES,
  EIL_POINT_CARD_RULES,
  EIL_SAFETY_COMMITMENTS,
  StockItem,
  GasDetail,
  ServiceDetail,
  TrainingCourse,
  BranchOffice,
} from './eilData';

export const CMS_STORAGE_KEY = 'eil_site_cms_data_v5_tagline_priority';
export const ADMIN_SESSION_STORAGE_KEY = 'eil_stealth_admin_auth_v1';

export interface CmsDeliveryOptionSpec {
  id: string;
  code: string;
  title: string;
  shortName?: string;
  badge: string;
  capacity: string;
  bestFor?: string;
  handling: string;
  image: string;
  description: string;
  features: string[];
  catalogItemId: string;
}

export interface CmsCylinderServiceModeSpec {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  description: string;
  checklist: string[];
}

export interface CmsFleetMachineSpec {
  id: string;
  name: string;
  category: string;
  capacityRating: string;
  modelSpec: string;
  powerSource?: string;
  crewIncluded?: string;
  image: string;
  highlights: string[];
  catalogItemId?: string;
}

export interface CmsFabricationPortfolioItem {
  id: string;
  title: string;
  desc: string;
  image: string;
}

export interface CmsCoreValueItem {
  id: string;
  title: string;
  description: string;
}

export interface EilCmsData {
  // Brand & Header
  brandLogoUrl: string;
  brandSlogan: string;

  // Hero Section
  heroBadge: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroTitleSuffix: string;
  heroDescriptionPart1: string;
  heroDescriptionHighlight: string;
  heroDescriptionPart2: string;
  heroPrimaryCtaLabel: string;
  heroSecondaryCtaLabel: string;

  // Hero Metric Cards & Showcase Images
  heroMetric1Value: string;
  heroMetric1Label: string;
  heroMetric2Value: string;
  heroMetric2Label: string;
  heroMetric3Value: string;
  heroMetric3Label: string;
  heroPrimaryImage: string;
  heroPrimaryCardTitle: string;
  heroPrimaryCardSubtitle: string;
  heroSecondaryTopImage: string;
  heroSecondaryTopBadge: string;
  heroSecondaryTopTitle: string;
  heroSecondaryBottomImage: string;
  heroSecondaryBottomBadge: string;
  heroSecondaryBottomTitle: string;

  // Partner / Capabilities Strip
  heroAgenciesIntro: string;
  heroAgency1Title: string;
  heroAgency1Sub: string;
  heroAgency2Title: string;
  heroAgency2Sub: string;
  heroAgency3Title: string;
  heroAgency3Sub: string;
  heroAgency4Title: string;
  heroAgency4Sub: string;
  heroAgency5Title: string;
  heroAgency5Sub: string;

  // Equipment Leasing & Haulage Expertise Section
  expertiseTitlePrefix: string;
  expertiseTitleHighlight: string;
  expertiseTitleSuffix: string;
  expertisePortraitImage: string;
  expertisePortraitBadge: string;
  expertiseLeadParagraph: string;
  expertiseBodyParagraphPrefix: string;
  expertiseBodyParagraphStrong: string;
  expertiseBodyParagraphSuffix: string;
  fabricationCardBadge: string;
  fabricationCardTitle: string;
  fabricationCardDesc: string;
  plantHireCardBadge: string;
  plantHireCardTitle: string;
  plantHireCardDesc: string;
  expertisePrimaryCtaLabel: string;
  expertiseSecondaryCtaLabel: string;

  // Interactive Service Tools Cards
  toolsBadge: string;
  toolsTitlePrefix: string;
  toolsTitleHighlight: string;
  toolsTitleSuffix: string;
  toolsSubtitle: string;
  tool1Badge: string;
  tool1Title: string;
  tool1Desc: string;
  tool1Cta: string;
  tool2Badge: string;
  tool2Title: string;
  tool2Desc: string;
  tool2Cta: string;
  tool3Badge: string;
  tool3Title: string;
  tool3Desc: string;
  tool3Cta: string;

  // Division Cards & Point Card
  divisionsBadge: string;
  divisionsTitlePrefix: string;
  divisionsTitleHighlight: string;
  divisionsTitleSuffix: string;
  divisionsSubtitle: string;
  div1Title: string;
  div1Subtitle: string;
  div1Desc: string;
  div1Image: string;
  div2Title: string;
  div2Subtitle: string;
  div2Desc: string;
  div2Image: string;
  div3Title: string;
  div3Subtitle: string;
  div3Desc: string;
  div3Image: string;
  div4Title: string;
  div4Subtitle: string;
  div4Desc: string;
  div4Image: string;
  div5Title: string;
  div5Subtitle: string;
  div5Desc: string;
  div5Image: string;
  div6Badge: string;
  div6Title: string;
  div6Desc: string;
  div6Cta: string;

  // Point Card Spotlight
  pointCardBadge: string;
  pointCardHeading: string;
  pointCardDescription: string;
  pointCardCtaLabel: string;
  pointCardImage: string;

  // Universal Inline Text & Image Map across all pages
  customTexts: Record<string, string>;
  customImages: Record<string, string>;

  // Dynamic Lists (Full CRUD in Edit Mode)
  stockCatalogue: StockItem[];
  industrialGases: GasDetail[];
  deliveryOptions: CmsDeliveryOptionSpec[];
  cylinderServiceModes: CmsCylinderServiceModeSpec[];
  servicesList: ServiceDetail[];
  fleetMachines: CmsFleetMachineSpec[];
  fabricationPortfolio: CmsFabricationPortfolioItem[];
  trainingCourses: TrainingCourse[];
  branches: BranchOffice[];
  pointCardRules: string[];
  coreValues: CmsCoreValueItem[];
  safetyCommitments: string[];
}

export const DEFAULT_DELIVERY_OPTIONS: CmsDeliveryOptionSpec[] = [
  {
    id: 'lowbed-haulage',
    code: 'MODE 01 · LOWBED TRAILERS',
    title: 'Lowbed Heavy Equipment Mobilization (40T – 100T+)',
    shortName: 'Lowbed Trailer (40T–100T+)',
    badge: '40T – 100T+ MULTI-AXLE LOWBEDS',
    capacity: '40 Tons, 60 Tons, 80 Tons to 100+ Tons Payload',
    bestFor: 'Excavators, Swamp Buggies, Dozers (D6–D8), Cranes, Loaders & Heavy Skids',
    handling: 'Hydraulic Rear Ramps · Outriggers · Grade-80 Chain Lashing',
    image: '/assets/eil/gen_lowbed_trailer.jpg',
    description:
      'Heavy-duty 3-axle, 4-axle, and multi-axle gooseneck Lowbed Trailers engineered for safe road mobilization of Tracked Excavators, Swamp Buggies, Dozers (D6–D8), Cranes, Backhoes, and oversized industrial skids across Nigeria.',
    features: [
      'Hydraulic and heavy spring-assisted rear ramps for self-propelled tracked plant',
      'Expandable side outriggers (up to 3.5m width) for Swamp Buggies and Crawler Cranes',
      'Supplied with Grade-80 load chains, ratchet binders, route survey & escort support',
      'Dispatched directly from Port Harcourt (Old Aba Road) and Warri (Etuwewe Road)',
    ],
    catalogItemId: 'hl-lowbed-40t-60t',
  },
  {
    id: 'flatbed-haulage',
    code: 'MODE 02 · FLATBED TRAILERS',
    title: '40ft & 45ft Flatbed Cargo, Pipe & Container Haulage',
    shortName: '40ft / 45ft Flatbed Trailer',
    badge: '40FT & 45FT FLATBED FLEET',
    capacity: '30 Tons to 45 Tons Tri-Axle Deck Payload',
    bestFor: '20ft/40ft Containers, OCTG Casing & Line Pipes, Structural Steel & Skids',
    handling: 'ISO Twist-Locks · Pipe Stanchions · Crane / Forklift Offload',
    image: '/assets/eil/gen_flatbed_trailer.jpg',
    description:
      'Versatile 40ft and extended 45ft Flatbed Semi-Trailers fitted with container twist-locks and removable vertical steel pipe stanchions for hauling 20ft/40ft containers, OCTG casing pipes, coated line pipes, structural steel, and crated machinery.',
    features: [
      '12 integrated container twist-locks for secure port-to-site container evacuation',
      'Heavy vertical side stanchions (bolsters) and rubber/timber cradles for coated pipes',
      'Can be paired with EIL Forklifts (3T–45T), Mobile Cranes, or Hiab Self-Loaders',
      'Available for single-trip charter, convoy shuttles, or open-ended project retainers',
    ],
    catalogItemId: 'hl-flatbed-40ft',
  },
  {
    id: 'tanker-pneumatic-haulage',
    code: 'MODE 03 · TANKERS & PNEUMATIC',
    title: 'Bulk Road Tankers (AGO/Water) & Pneumatic Silo Trucks',
    shortName: 'Tanker & Pneumatic Silo Truck',
    badge: 'LIQUID & DRY-BULK TANKER FLEET',
    capacity: '15,000L – 45,000L Tankers & 35–50 CBM Pneumatic Silos',
    bestFor: 'Bulk Diesel (AGO), Road Compaction Water, Bulk Cement, Barite & Bentonite',
    handling: 'PTO Discharge Pump / Flow Meter · 2.0 Bar Pneumatic Compressor',
    image: '/assets/eil/pdf_img_021.jpg',
    description:
      'Dedicated bulk liquid and dry-powder tanker fleet: calibrated road tankers and bowsers for Diesel (AGO) bunkering and compaction water, plus pressurized Pneumatic Silo Trucks for blowing bulk cement, barite, and bentonite into vertical silos.',
    features: [
      '33,000L–45,000L AGO Tankers & 15,000L–30,000L Water Bowsers with rear spray bars',
      '35–50 CBM Pneumatic Bulk Silo Trucks with onboard air compressors for vertical discharge',
      'Calibrated flow meters, anti-static earthing reels, spark arrestors, and safety relief valves',
      'Supports drilling rigs, concrete batching plants, roadworks, and remote camps',
    ],
    catalogItemId: 'tk-pneumatic-cement-40cbm',
  },
  {
    id: 'dump-truck-haulage',
    code: 'MODE 04 · DUMP TRUCKS / TIPPERS',
    title: 'Heavy Hydraulic Dump Trucks (6x4 & 8x4 Tippers — 20T to 45T)',
    shortName: 'Dump Truck / Tipper Fleet',
    badge: '16 CBM – 30 CBM TIPPER FLEET',
    capacity: '20 Tons, 30 Tons & 45 Tons (6x4 & 8x4 Axles)',
    bestFor: 'Sharp Sand Reclamation, Quarry Granite, Laterite Sub-Base & Excavation Spoil',
    handling: 'Front Telescopic Hydraulic Tipping Ram · Off-Road Diff-Locks',
    image: '/assets/eil/gen_dump_truck.jpg',
    description:
      'Rugged 6x4 (10-tyre) and 8x4 (12-tyre) heavy-duty Hydraulic Dump Trucks engineered for high-cycle aggregate haulage, sharp sand reclamation filling, laterite road sub-base supply, quarry granite transport, and site excavation spoil removal.',
    features: [
      'Heavy-duty Hardox/high-tensile steel rock and earth tipping bodies (16 CBM – 30 CBM)',
      'Available as standalone tipper fleets or paired with EIL Excavators, Dozers & Payloaders',
      'Open-ended project fleet leasing with zero fixed duration limits',
      'Supported by EIL mobile field mechanics for continuous multi-shift earthworks',
    ],
    catalogItemId: 'dt-tipper-20t-30t-6x4',
  },
];

export const DEFAULT_CYLINDER_SERVICE_MODES: CmsCylinderServiceModeSpec[] = [
  {
    id: 'free-inspection',
    title: 'Free Pre-Mobilization Site & Route Survey',
    subtitle: 'Complimentary engineering assessment of lifting radii, terrain & haulage routes',
    badge: '100% FREE SITE & ROUTE SURVEY',
    image: '/assets/eil/pdf_img_031.jpg',
    description:
      'Before mobilizing heavy cranes, swamp buggies, bulldozers, or multi-axle lowbeds, EIL dispatches an experienced operations engineer to inspect your project site, ground-bearing conditions, crane setup area, and highway route clearances at zero cost.',
    checklist: [
      'Ground-bearing and terrain assessment (dry land, muddy right-of-way, or mangrove swamp)',
      'Crane working radius, boom length, load weight, and outrigger mat sizing check',
      'Lowbed / Flatbed access road width, bridge weight limit, and overhead cable clearance check',
      'Recommended fleet sizing (Forklifts, Excavators, Dozers, Cranes, Backhoes, Haulage Trucks) & formal quote',
    ],
  },
  {
    id: 'preventive-maintenance',
    title: 'On-Site Preventive Fleet Maintenance & Field Service',
    subtitle: 'Mobile workshop vans and scheduled servicing directly on your workfront',
    badge: 'ON-SITE ENGINEERING SUPPORT',
    image: '/assets/eil/pdf_img_191.jpg',
    description:
      'Every piece of equipment leased from EIL is supported by our Port Harcourt and Warri mechanical, hydraulic, and heavy-diesel teams. We perform all routine servicing on your site so your operators stay productive.',
    checklist: [
      '150-point pre-mobilization mechanical, hydraulic, and safety certification before yard exit',
      'Scheduled mobile service van visits for engine oil, filters, and hydraulic system checks',
      'On-site hydraulic hose crimping, electrical diagnostics, and undercarriage adjustments',
      'Option to station a dedicated resident mechanic on site for multi-machine project spreads',
    ],
  },
  {
    id: 'open-ended-leasing',
    title: 'Open-Ended Lease Extension & Fleet Scaling',
    subtitle: 'No fixed duration limits — extend or add machines anytime during your project',
    badge: 'NO FIXED TIME LIMITS',
    image: '/assets/eil/pdf_img_028.jpg',
    description:
      'There are no fixed duration limits or countdown timers on EIL equipment hiring and haulage leases. Keep leased machinery on site for as long as your scope requires, or scale up with additional forklifts, cranes, excavators, or trucks on demand.',
    checklist: [
      'Open-ended hire structure with zero countdown timers or rigid cutoff penalties',
      'Seamless mid-project addition of extra Forklifts, Excavators, Dozers, Cranes, or Trucks',
      'Swap machine tonnages mid-project as your workfront transitions (e.g., D8 Dozer to 140H Grader)',
      'Coordinated lowbed demobilization once your site team confirms project completion',
    ],
  },
  {
    id: 'backup-replacement',
    title: 'Rapid Breakdown Response & Backup Machine Replacement',
    subtitle: 'Priority emergency field repair or standby unit replacement from PH & Warri yards',
    badge: 'ZERO-DOWNTIME GUARANTEE',
    image: '/assets/eil/pdf_img_192.jpg',
    description:
      'Should any leased EIL machine experience an unexpected mechanical fault during active operations, our Port Harcourt (Old Aba Road) and Warri (Etuwewe Road) yards provide immediate field intervention or dispatch a replacement machine.',
    checklist: [
      'Direct hotline priority dispatch via (+234) 070-3825-9142',
      'Immediate deployment of mobile mechanical & hydraulic troubleshooting crew',
      'Fast replacement of critical wear components from EIL in-house spare parts stock',
      'Lowbed mobilization of a standby replacement unit if extended workshop repair is required',
    ],
  },
];

export const DEFAULT_FLEET_MACHINES: CmsFleetMachineSpec[] = [
  {
    id: 'forklifts-all-tonnages',
    name: 'Forklifts of Different Tonnages (3T – 45T & Reach Stackers)',
    category: 'Forklifts & Material Handling',
    capacityRating: '3T / 5T / 7T / 10T / 15T / 25T–45T',
    modelSpec: 'Diesel Industrial Forklifts (3T–32T), 45T Container Reach Stackers & 17m Telehandlers',
    image: '/assets/eil/pdf_img_044.jpg',
    highlights: [
      'Available across all tonnages: 3T, 5T, 7T, 10T, 15T, 16T, 25T, 32T & 45T Reach Stackers',
      'Duplex & triplex wide-view masts with hydraulic side-shift, fork positioners & pipe clamps',
      'Supplied with certified forklift operators and valid third-party lifting test certificates',
    ],
    catalogItemId: 'fk-7t-10t-diesel',
  },
  {
    id: 'excavators-swamp-buggies',
    name: 'Excavators & Amphibious Swamp Buggies',
    category: 'Excavators & Swamp Plant',
    capacityRating: '20T – 45T Tracked / Long-Reach / Swamp Pontoon',
    modelSpec: 'CAT 320 / 330 / 336 Tracked Excavators, 18m Long-Reach & Pontoon Swamp Buggies',
    image: '/assets/eil/pdf_img_028.jpg',
    highlights: [
      'Standard 20T, 30T & 36T–45T tracked hydraulic excavators with 0.9 to 2.2 CBM buckets',
      'Pontoon-mounted Amphibious Swamp Buggies for Niger Delta creeks, marshes & pipeline RoW',
      'Available with 16m–20m long-reach dredging booms or hydraulic rock-breaker hammers',
    ],
    catalogItemId: 'ex-cat-320-20t',
  },
  {
    id: 'dozers-bulldozers',
    name: 'Dozers / Bulldozers (CAT D6, D7G/D7R, D8R/D8T)',
    category: 'Dozers & Earthmoving',
    capacityRating: '165 HP – 310+ HP Standard & LGP Swamp Tracks',
    modelSpec: 'CAT D6R/D6H, D7G/D7R & D8R/D8T Crawler Dozers + Graders & Compactors',
    image: '/assets/eil/gen_bulldozer.jpg',
    highlights: [
      'Standard grouser and wide-pad LGP (Low Ground Pressure) swamp track configurations',
      'Semi-Universal (SU), Straight, and 6-way angle blades with rear rippers or winches',
      'Ideal for virgin bush clearing, sand-fill spreading, RoW leveling & heavy earthworks',
    ],
    catalogItemId: 'dz-cat-d7g',
  },
  {
    id: 'cranes-mobile-crawler',
    name: 'Cranes (25T – 150T+ Mobile, Crawler & Hiab Cranes)',
    category: 'Mobile & Crawler Cranes',
    capacityRating: '25T / 35T / 50T / 70T / 100T – 150T+',
    modelSpec: 'Rough-Terrain (4x4), All-Terrain Hydraulic Mobile Cranes, Crawler Cranes & Hiabs',
    image: '/assets/eil/pdf_img_019.jpg',
    highlights: [
      '25T–50T Rough-Terrain (RT) and 50T–150T+ All-Terrain (AT) telescopic mobile cranes',
      '50T–100T Lattice-Boom Crawler Cranes & 10T–20T Truck-Mounted Hiab Self-Loaders',
      'Computerized LMI/SLI safety systems, outrigger mats, certified riggers & valid test certificates',
    ],
    catalogItemId: 'cr-at-70t-80t',
  },
  {
    id: 'backhoes-loaders-graders',
    name: 'Backhoes, Wheel Payloaders, Graders & Support Plant',
    category: 'Backhoes, Loaders & Road Plant',
    capacityRating: '4x4 Backhoes · 3.0–4.6 CBM Payloaders · 140H Graders',
    modelSpec: 'CAT 428 / JCB 3CX Backhoes, CAT 950/966 Payloaders, 140H/140K Graders & Rollers',
    image: '/assets/eil/gen_backhoe_loader.jpg',
    highlights: [
      '4WD Backhoe Loaders with front 4-in-1 clamshell bucket and rear extendable trenching dipper',
      'Front-End Wheel Loaders (Payloaders 950/966), Motor Graders & 10T–20T Vibratory Compactors',
      'Site Support Plant: 100–500 kVA Generators, 185–750 CFM Air Compressors & Light Towers',
    ],
    catalogItemId: 'bl-backhoe-428',
  },
  {
    id: 'haulage-lowbed-flatbed-tanker-dump',
    name: 'Haulage Fleet: Lowbeds, Flatbeds, Tankers, Pneumatic & Dump Trucks',
    category: 'Heavy Haulage Fleet',
    capacityRating: '40T–100T Lowbed · 40ft/45ft Flatbed · Tanker · Tipper',
    modelSpec: 'Multi-Axle Lowbeds, 40ft/45ft Flatbeds, AGO/Water Tankers, Pneumatic Silos & Tippers',
    image: '/assets/eil/gen_lowbed_trailer.jpg',
    highlights: [
      'Lowbed Trailers (40T–100T+) for heavy plant mobilization & 40ft/45ft Flatbeds for pipes/containers',
      'Bulk Road Tankers (AGO Diesel & Water Bowsers) & Pneumatic Silo Trucks (Cement, Barite, Bentonite)',
      '6x4 & 8x4 Heavy Hydraulic Dump Trucks / Tippers (20T–45T) for sand, granite & earthworks',
    ],
    catalogItemId: 'hl-lowbed-40t-60t',
  },
];

export const DEFAULT_FABRICATION_PORTFOLIO: CmsFabricationPortfolioItem[] = [
  {
    id: 'fab-1',
    title: 'Forklifts of Different Tonnages (3T to 45T & Reach Stackers)',
    desc: 'Diesel counterbalance forklifts (3T, 5T, 7T, 10T, 15T, 25T–32T), 45T Container Reach Stackers, and 17m Rough-Terrain Telehandlers for pipe yards, ports, and warehouses.',
    image: '/assets/eil/pdf_img_192.jpg',
  },
  {
    id: 'fab-2',
    title: 'Excavators & Amphibious Swamp Buggies',
    desc: 'CAT 320, 330 & 336 Tracked Hydraulic Excavators, 16m–20m Long-Reach Dredging Booms, Hydraulic Rock Breakers, and Pontoon Swamp Buggies for land and mangrove terrains.',
    image: '/assets/eil/pdf_img_030.jpg',
  },
  {
    id: 'fab-3',
    title: 'Crawler Dozers / Bulldozers (CAT D6, D7 & D8)',
    desc: 'Heavy tracked bulldozers in Standard and Low Ground Pressure (LGP) swamp configurations with Semi-U blades, hydraulic rippers, and towing winches for clearing and earthworks.',
    image: '/assets/eil/gen_bulldozer.jpg',
  },
  {
    id: 'fab-4',
    title: 'Mobile Hydraulic Cranes (25T–150T+), Crawler Cranes & Hiabs',
    desc: 'Rough-Terrain (4x4) and All-Terrain Telescopic Cranes, 50T–100T Lattice Crawler Cranes, and 10T–20T Truck-Mounted Hiab Self-Loaders with certified operators and riggers.',
    image: '/assets/eil/pdf_img_198.jpg',
  },
  {
    id: 'fab-5',
    title: 'Backhoe Loaders, Wheel Payloaders, Motor Graders & Rollers',
    desc: '4x4 Backhoe Loaders (CAT 428 / JCB 3CX), CAT 950/966 Wheel Loaders (Payloaders), CAT 140H/140K Motor Graders, and 10T–20T Vibratory Soil Compactors.',
    image: '/assets/eil/gen_grader_compactor.jpg',
  },
  {
    id: 'fab-6',
    title: 'Lowbed, Flatbed, Tanker, Pneumatic & Dump Truck Haulage Fleet',
    desc: '40T–100T+ Multi-Axle Lowbeds, 40ft & 45ft Flatbeds, Bulk AGO/Water Tankers, Pneumatic Cement/Barite Silo Trucks, and 20T–45T 6x4/8x4 Hydraulic Dump Trucks.',
    image: '/assets/eil/pdf_img_024.jpg',
  },
];

export const DEFAULT_CORE_VALUES: CmsCoreValueItem[] = [
  {
    id: 'val-1',
    title: '1. Fleet Reliability & Mechanical Uptime',
    description:
      'Every Forklift, Excavator, Dozer, Crane, Backhoe, and Haulage Truck undergoes a 150-point pre-mobilization inspection and routine on-site preventive maintenance.',
  },
  {
    id: 'val-2',
    title: '2. Uncompromising Operational Safety (HSE)',
    description:
      'Valid third-party load test certificates, calibrated crane LMI systems, Grade-80 lowbed chain restraint, and strict Journey Management govern every dispatch.',
  },
  {
    id: 'val-3',
    title: '3. Open-Ended Lease Flexibility',
    description:
      'We impose no fixed duration limits or countdown constraints on equipment leases — supporting your project timeline from mobilization through final completion.',
  },
  {
    id: 'val-4',
    title: '4. Rapid Mobilization from Port Harcourt & Warri',
    description:
      'Strategically positioned yards at Plot 213, Old Aba Road (Port Harcourt) and 9, Etuwewe Road (Warri) enable fast deployment across the Niger Delta and nationwide.',
  },
  {
    id: 'val-5',
    title: '5. Competent Operators, Riggers & Drivers',
    description:
      'Our fleet is operated by veteran plant operators, certified crane riggers, heavy-haulage drivers, and responsive mobile field mechanics.',
  },
];

export const DEFAULT_EIL_CMS_DATA: EilCmsData = {
  brandLogoUrl: '/assets/aistudio/image_48cb6700.png',
  brandSlogan: EIL_SLOGAN,

  heroBadge: 'HEAVY EQUIPMENT LEASING · PLANT HIRE & NATIONWIDE HAULAGE SERVICES',
  heroTitlePrefix: 'Heavy Equipment',
  heroTitleHighlight: 'Hiring, Leasing',
  heroTitleSuffix: '& Haulage Services.',
  heroDescriptionPart1:
    'Emmadios Industrial Limited (EIL) is a premier heavy equipment leasing and industrial haulage contractor specializing in ',
  heroDescriptionHighlight:
    'Forklifts (3T–45T), Excavators, Swamp Buggies, Dozers, Cranes & Backhoes',
  heroDescriptionPart2:
    ' alongside nationwide Lowbed, Flatbed, Tanker, Pneumatic Truck, and Dump Truck haulage from our Port Harcourt and Warri operational yards.',
  heroPrimaryCtaLabel: 'Explore Equipment & Haulage Catalogue',
  heroSecondaryCtaLabel: 'Request Hire or Haulage Quote',

  heroMetric1Value: '8 Fleet',
  heroMetric1Label: 'Equipment & Haulage Categories',
  heroMetric2Value: '2 Yards',
  heroMetric2Label: 'Port Harcourt & Warri Offices',
  heroMetric3Value: 'Flexible',
  heroMetric3Label: 'Open-Ended Lease Duration',

  heroPrimaryImage: '/assets/eil/pdf_img_028.jpg',
  heroPrimaryCardTitle: 'Heavy Plant Hiring & Nationwide Haulage Fleet',
  heroPrimaryCardSubtitle:
    'Forklifts · Excavators · Dozers · Cranes · Backhoes · Lowbeds · Flatbeds · Tankers · Pneumatic & Dump Trucks',
  heroSecondaryTopImage: '/assets/eil/pdf_img_044.jpg',
  heroSecondaryTopBadge: 'CRANES, FORKLIFTS & EARTHMOVING',
  heroSecondaryTopTitle: '3T–45T Forklifts, 25T–150T+ Cranes, Excavators, Dozers & Backhoes',
  heroSecondaryBottomImage: '/assets/eil/gen_lowbed_trailer.jpg',
  heroSecondaryBottomBadge: 'HEAVY HAULAGE & BULK LOGISTICS',
  heroSecondaryBottomTitle: 'Lowbeds, Flatbeds, Bulk Tankers, Pneumatic Silo & Dump Trucks',

  heroAgenciesIntro: 'CORE EIL EQUIPMENT HIRING & HAULAGE CAPABILITIES',
  heroAgency1Title: 'Forklifts & Cranes',
  heroAgency1Sub: '3T–45T Forklifts, Reach Stackers, 25T–150T+ Mobile & Crawler Cranes',
  heroAgency2Title: 'Excavators & Dozers',
  heroAgency2Sub: 'Tracked Excavators, Swamp Buggies & CAT D6, D7, D8 Bulldozers',
  heroAgency3Title: 'Backhoes & Road Plant',
  heroAgency3Sub: '4x4 Backhoe Loaders, Wheel Payloaders, Motor Graders & Rollers',
  heroAgency4Title: 'Lowbed & Flatbed Haulage',
  heroAgency4Sub: '40T–100T+ Multi-Axle Lowbeds & 40ft/45ft Flatbed Trailers',
  heroAgency5Title: 'Tankers, Pneumatic & Tippers',
  heroAgency5Sub: 'AGO/Water Tankers, Pneumatic Bulk Silo Trucks & 20T–45T Dump Trucks',

  expertiseTitlePrefix: 'Built for Heavy-Duty',
  expertiseTitleHighlight: 'Equipment Leasing & Haulage',
  expertiseTitleSuffix: 'Across Land, Swamp & Industrial Corridors',
  expertisePortraitImage: '/assets/eil/pdf_img_027.jpg',
  expertisePortraitBadge: 'EIL FLEET OPERATIONS · PORT HARCOURT & WARRI',
  expertiseLeadParagraph:
    'Emmadios Industrial Limited (EIL) delivers dependable heavy plant hiring and specialized road haulage for civil engineering, oil & gas, marine, and industrial projects across Nigeria.',
  expertiseBodyParagraphPrefix:
    'Every machine and trailer in our fleet is dispatched with certified operators, valid third-party statutory certificates, and mobile mechanic support from our two operational locations in ',
  expertiseBodyParagraphStrong:
    'Port Harcourt (Plot 213, Old Aba Road, Rumuogba-Obio) and Warri (9, Etuwewe Road, Off Deco Road)',
  expertiseBodyParagraphSuffix:
    ' — with open-ended, flexible leasing that imposes zero fixed time limits on your project.',
  fabricationCardBadge: 'PILLAR 01 · HEAVY EQUIPMENT HIRING & LEASING',
  fabricationCardTitle: 'Forklifts, Excavators, Dozers, Cranes & Backhoes',
  fabricationCardDesc:
    '3T–45T Forklifts, Reach Stackers, Tracked Excavators, Amphibious Swamp Buggies, CAT D6–D8 Bulldozers, 25T–150T+ Cranes, 4x4 Backhoes, Payloaders, Graders & Compactors.',
  plantHireCardBadge: 'PILLAR 02 · HEAVY-DUTY HAULAGE SERVICES',
  plantHireCardTitle: 'Lowbed, Flatbed, Tankers, Pneumatic & Dump Trucks',
  plantHireCardDesc:
    '40T–100T+ Lowbed Trailers, 40ft & 45ft Flatbeds, Bulk AGO/Water Road Tankers, Pressurized Pneumatic Cement/Barite Silo Trucks, and 20T–45T Hydraulic Dump Trucks.',
  expertisePrimaryCtaLabel: 'Explore EIL Services & Fleet',
  expertiseSecondaryCtaLabel: 'Request Equipment / Haulage Quote',

  toolsBadge: 'Interactive Fleet Configurators & Booking Desk',
  toolsTitlePrefix: 'Configure Your',
  toolsTitleHighlight: 'Equipment Hire, Haulage & Site Survey',
  toolsTitleSuffix: 'Online',
  toolsSubtitle:
    'Select your required Haulage Trailer mode, schedule a complimentary Pre-Mobilization Site & Route Survey, or reserve Forklifts, Excavators, Dozers, Cranes, and Backhoes with open-ended lease flexibility.',
  tool1Badge: '1. HAULAGE DISPATCH MODES',
  tool1Title: 'Lowbed, Flatbed, Tanker, Pneumatic & Dump Truck Haulage',
  tool1Desc:
    'Configure 40T–100T+ Lowbeds, 40ft/45ft Flatbeds, Bulk AGO/Water Tankers, Pneumatic Cement/Barite Silo Trucks, or 20T–45T Dump Trucks.',
  tool1Cta: 'Open Haulage Configurator →',
  tool2Badge: '2. FREE SITE & ROUTE SURVEY',
  tool2Title: 'Pre-Mobilization Site Survey & On-Site Fleet Maintenance',
  tool2Desc:
    'Book a 100% FREE pre-mobilization site/route inspection, schedule preventive on-site fleet servicing, or request standby backup support.',
  tool2Cta: 'Schedule Site Survey / Support →',
  tool3Badge: '3. OPEN-ENDED PLANT LEASING',
  tool3Title: 'Heavy Equipment Hiring & Leasing Desk',
  tool3Desc:
    'Reserve Forklifts of different tonnages, Excavators, Swamp Buggies, Dozers, Cranes, Backhoes, Payloaders, and Graders with no fixed duration limits.',
  tool3Cta: 'Book Equipment for Hire →',

  divisionsBadge: 'Complete Site Navigation',
  divisionsTitlePrefix: 'Explore Every',
  divisionsTitleHighlight: 'EIL Division & Fleet Hub',
  divisionsTitleSuffix: 'Direct',
  divisionsSubtitle:
    'Jump straight to our 8-Category Equipment & Haulage Catalogue, Contracting Services, Flexible Leasing Plans, or our Port Harcourt and Warri Branch Offices.',
  div1Title: 'Equipment & Haulage Catalogue',
  div1Subtitle: '8 Specialized Plant & Trailer Categories',
  div1Desc:
    'Browse Forklifts (3T–45T), Excavators & Swamp Buggies, Dozers, Mobile & Crawler Cranes, Backhoes & Loaders, Lowbeds, Flatbeds, Tankers, Pneumatic & Dump Trucks.',
  div1Image: '/assets/eil/pdf_img_044.jpg',
  div2Title: 'Equipment Leasing & Haulage Services',
  div2Subtitle: '6 Core Operational Pillars + Safety Standards',
  div2Desc:
    'Explore Heavy Equipment Hiring, Lowbed/Flatbed/Tanker/Pneumatic/Dump Truck Haulage, Swamp Earthmoving, Crane Lifting, On-Site Fleet Maintenance & Route Surveys.',
  div2Image: '/assets/eil/pdf_img_019.jpg',
  div3Title: 'How to Lease & Corporate Plans',
  div3Subtitle: 'Open-Ended Leasing · Fleet Priority · Corporate Accounts',
  div3Desc:
    'Learn how our open-ended equipment hire and haulage dispatch works — with zero fixed duration limits, custom call-off accounts, and priority fleet allocation.',
  div3Image: '/assets/eil/gen_lowbed_trailer.jpg',
  div4Title: 'Port Harcourt & Warri Yards',
  div4Subtitle: '2 Operational Locations · (+234) 070-3825-9142',
  div4Desc:
    'Connect directly with our Port Harcourt Office (Plot 213, Old Aba Road, Rumuogba-Obio) and Warri Branch (9, Etuwewe Road, Off Deco Road) via phone or WhatsApp.',
  div4Image: '/assets/eil/pdf_img_031.jpg',
  div5Title: 'About EIL & Safety Policy',
  div5Subtitle: 'Corporate Profile · Vision · Fleet HSE Standards',
  div5Desc:
    'Discover EIL’s corporate track record, Vision & Mission, 5 Core Operational Values, and our strict Lifting, Earthmoving & Haulage HSE policy.',
  div5Image: '/assets/eil/pdf_img_220.jpg',
  div6Badge: 'DIRECT FLEET DESK · (+234) 070-3825-9142',
  div6Title: 'Need Immediate Equipment Mobilization or Haulage?',
  div6Desc:
    'Send your equipment list, cargo tonnage, or site location for a rapid commercial quotation from our Port Harcourt or Warri operations desk.',
  div6Cta: 'Open Instant Quote Form',

  pointCardBadge: 'CORPORATE FLEET PRIORITY & PARTNER REWARDS',
  pointCardHeading: 'EIL Corporate Fleet Priority & Volume Partner Program',
  pointCardDescription:
    'Contractors and corporate clients who lease multiple machines or bundle Equipment Hire with EIL Lowbed, Flatbed, Tanker, Pneumatic, and Dump Truck haulage enjoy priority yard dispatch, open-ended lease flexibility, and volume rebates.',
  pointCardCtaLabel: 'Learn How Corporate Fleet Priority Works',
  pointCardImage: '/assets/eil/pdf_img_192.jpg',

  customTexts: {},
  customImages: {},

  stockCatalogue: STOCK_CATALOGUE,
  industrialGases: INDUSTRIAL_GASES_DETAIL,
  deliveryOptions: DEFAULT_DELIVERY_OPTIONS,
  cylinderServiceModes: DEFAULT_CYLINDER_SERVICE_MODES,
  servicesList: SERVICES_LIST,
  fleetMachines: DEFAULT_FLEET_MACHINES,
  fabricationPortfolio: DEFAULT_FABRICATION_PORTFOLIO,
  trainingCourses: TRAINING_COURSES,
  branches: EIL_BRANCHES,
  pointCardRules: EIL_POINT_CARD_RULES,
  coreValues: DEFAULT_CORE_VALUES,
  safetyCommitments: EIL_SAFETY_COMMITMENTS,
};

function isLegacyGasOrInvalidCmsPayload(raw: Record<string, unknown>): boolean {
  let serialized = '';
  try {
    serialized = JSON.stringify(raw);
  } catch {
    serialized = '';
  }

  if (
    /B\.O\.C|Air Liquide|Gas & Welding|Industrial Gas|Oxy-Acetylene|081-5926|070-4617|084-301|2349066861289|Atako|Igbo Etche|Umuazu|images\.unsplash\.com|eil_logo_clean|pdf_img_041|pdf_img_190|Heavy Equipment Hiring, Plant Leasing & Haulage Services Across Nigeria\./i.test(
      serialized
    )
  ) {
    return true;
  }

  if (
    Array.isArray(raw.stockCatalogue) &&
    raw.stockCatalogue.length > 0 &&
    raw.stockCatalogue.every((it: { pointsEligible?: boolean }) => it?.pointsEligible === true)
  ) {
    return true;
  }

  if (Array.isArray(raw.branches) && raw.branches.length > 2) {
    return true;
  }

  return false;
}

export function sanitizeCmsData(rawInput: unknown): EilCmsData {
  if (!rawInput || typeof rawInput !== 'object') {
    return { ...DEFAULT_EIL_CMS_DATA };
  }

  const raw = rawInput as Partial<EilCmsData> & Record<string, unknown>;

  if (isLegacyGasOrInvalidCmsPayload(raw)) {
    return { ...DEFAULT_EIL_CMS_DATA };
  }

  return {
    ...DEFAULT_EIL_CMS_DATA,
    ...raw,
    customTexts:
      raw.customTexts && typeof raw.customTexts === 'object' && !Array.isArray(raw.customTexts)
        ? (raw.customTexts as Record<string, string>)
        : {},
    customImages:
      raw.customImages && typeof raw.customImages === 'object' && !Array.isArray(raw.customImages)
        ? (raw.customImages as Record<string, string>)
        : {},
    stockCatalogue:
      Array.isArray(raw.stockCatalogue) && raw.stockCatalogue.length > 0
        ? raw.stockCatalogue
        : DEFAULT_EIL_CMS_DATA.stockCatalogue,
    industrialGases:
      Array.isArray(raw.industrialGases) && raw.industrialGases.length > 0
        ? raw.industrialGases
        : DEFAULT_EIL_CMS_DATA.industrialGases,
    deliveryOptions:
      Array.isArray(raw.deliveryOptions) && raw.deliveryOptions.length > 0
        ? raw.deliveryOptions
        : DEFAULT_EIL_CMS_DATA.deliveryOptions,
    cylinderServiceModes:
      Array.isArray(raw.cylinderServiceModes) && raw.cylinderServiceModes.length > 0
        ? raw.cylinderServiceModes
        : DEFAULT_EIL_CMS_DATA.cylinderServiceModes,
    servicesList:
      Array.isArray(raw.servicesList) && raw.servicesList.length > 0
        ? raw.servicesList
        : DEFAULT_EIL_CMS_DATA.servicesList,
    fleetMachines:
      Array.isArray(raw.fleetMachines) && raw.fleetMachines.length > 0
        ? raw.fleetMachines
        : DEFAULT_EIL_CMS_DATA.fleetMachines,
    fabricationPortfolio:
      Array.isArray(raw.fabricationPortfolio) && raw.fabricationPortfolio.length > 0
        ? raw.fabricationPortfolio
        : DEFAULT_EIL_CMS_DATA.fabricationPortfolio,
    trainingCourses:
      Array.isArray(raw.trainingCourses) && raw.trainingCourses.length > 0
        ? raw.trainingCourses
        : DEFAULT_EIL_CMS_DATA.trainingCourses,
    branches:
      Array.isArray(raw.branches) && raw.branches.length > 0 && raw.branches.length <= 2
        ? raw.branches
        : DEFAULT_EIL_CMS_DATA.branches,
    pointCardRules:
      Array.isArray(raw.pointCardRules) && raw.pointCardRules.length > 0
        ? raw.pointCardRules
        : DEFAULT_EIL_CMS_DATA.pointCardRules,
    coreValues:
      Array.isArray(raw.coreValues) && raw.coreValues.length > 0
        ? raw.coreValues
        : DEFAULT_EIL_CMS_DATA.coreValues,
    safetyCommitments:
      Array.isArray(raw.safetyCommitments) && raw.safetyCommitments.length > 0
        ? raw.safetyCommitments
        : DEFAULT_EIL_CMS_DATA.safetyCommitments,
  };
}

export function loadLocalCmsData(): EilCmsData {
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_EIL_CMS_DATA };
    const parsed = JSON.parse(raw);
    return sanitizeCmsData(parsed);
  } catch {
    return { ...DEFAULT_EIL_CMS_DATA };
  }
}

export function saveLocalCmsData(data: EilCmsData): void {
  try {
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Could not persist CMS data to localStorage:', err);
  }
}

export async function fetchSharedCmsData(): Promise<EilCmsData | null> {
  const endpoints = ['/api/cms', '/cms-api.php'];
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) continue;
      const json = await res.json();
      const payload = json?.cmsData || json?.data || json;
      if (payload && typeof payload === 'object' && 'heroTitlePrefix' in payload) {
        const sanitized = sanitizeCmsData(payload);
        saveLocalCmsData(sanitized);
        return sanitized;
      }
    } catch {
      // Try next endpoint or fallback to localStorage
    }
  }
  return null;
}

export async function saveSharedCmsData(
  data: EilCmsData
): Promise<{ persistedRemote: boolean; endpoint?: string }> {
  saveLocalCmsData(data);
  const endpoints = ['/api/cms', '/cms-api.php'];
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ action: 'save', cmsData: data }),
      });
      if (res.ok) {
        return { persistedRemote: true, endpoint };
      }
    } catch {
      // Fallback to next endpoint
    }
  }
  return { persistedRemote: false };
}

export async function resetSharedCmsData(): Promise<EilCmsData> {
  const fresh = { ...DEFAULT_EIL_CMS_DATA };
  saveLocalCmsData(fresh);
  const endpoints = ['/api/cms', '/cms-api.php'];
  for (const endpoint of endpoints) {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ action: 'reset', cmsData: fresh }),
      });
    } catch {
      // Ignore network errors
    }
  }
  return fresh;
}
