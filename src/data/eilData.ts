/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const EIL_SLOGAN =
  'If you can think it, it is doable. If it is doable, it is achievable with EIL!';

export interface StockItem {
  id: string;
  category:
    | 'Forklifts & Lifting'
    | 'Excavators & Swamp Buggies'
    | 'Dozers & Earthmoving'
    | 'Mobile & Crawler Cranes'
    | 'Backhoes & Loaders'
    | 'Lowbed & Flatbed Haulage'
    | 'Tankers & Pneumatic Trucks'
    | 'Dump Trucks & Support Plant';
  subcategory: string;
  name: string;
  spec: string;
  unit: string;
  availability: 'In Stock' | 'Available for Hire' | 'Made to Order';
  pointsEligible: boolean;
}

export interface GasDetail {
  name: string;
  formula: string;
  group:
    | 'Heavy Haulage Trailers'
    | 'Bulk & Tanker Fleet'
    | 'Earthmoving & Swamp Plant'
    | 'Lifting & Material Handling'
    | string;
  image?: string;
  features: string[];
}

export interface ServiceDetail {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  tagline: string;
  image: string;
  secondaryImage?: string;
  summary: string;
  highlights: string[];
  subSections: {
    heading: string;
    body: string;
  }[];
  benefits?: string[];
}

export interface TrainingCourse {
  code: string;
  title: string;
  whoToAttend: string;
  certification: string;
  duration: string;
}

export interface BranchOffice {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  addressLines: string[];
  city: string;
  state: string;
  phone: string;
  hours: string[];
  coordinates: { lat: number; lng: number };
  mapEmbedUrl: string;
  directionsUrl: string;
  capabilities: string[];
  specialNote: string;
}

export const EIL_BRANCHES: BranchOffice[] = [
  {
    id: 'ph-aba-road',
    name: 'Port Harcourt Head Office — Old Aba Road',
    shortName: 'Port Harcourt (Old Aba Rd)',
    badge: 'PORT HARCOURT HEAD OFFICE',
    addressLines: [
      'Plot 213, Old Aba Road',
      'Rumuogba-Obio, Port-Harcourt',
      'Rivers State, Nigeria',
    ],
    city: 'Port-Harcourt',
    state: 'Rivers State',
    phone: '(+234) 070-3825-9142',
    hours: [
      'Mon – Fri: 7:30 AM – 6:00 PM',
      'Saturday: 8:00 AM – 4:00 PM',
      '24/7 Project Mobilization & Dispatch on Request',
    ],
    coordinates: { lat: 4.8328, lng: 7.0386 },
    mapEmbedUrl:
      'https://maps.google.com/maps?q=Plot%20213%20Old%20Aba%20Road%20Rumuogba%20Port%20Harcourt%20Rivers%20State%20Nigeria&t=&z=15&ie=UTF8&iwloc=&output=embed',
    directionsUrl:
      'https://www.google.com/maps/search/?api=1&query=Plot+213+Old+Aba+Road+Rumuogba+Obio+Port+Harcourt+Nigeria',
    capabilities: [
      'Heavy Equipment Hire & Leasing (Forklifts, Excavators, Dozers, Cranes, Backhoes)',
      'Heavy-Duty Haulage Dispatch (Lowbeds, Flatbeds, Tankers, Pneumatic & Dump Trucks)',
      'Pre-Mobilization Site Survey, Route Reconnaissance & Crane Lift Planning',
      'Corporate Account Desk, Open-Ended Fleet Leasing & 24/7 Field Mechanic Support',
    ],
    specialNote:
      'Primary Rivers State operations hub for heavy plant leasing, crane dispatch, and nationwide lowbed/flatbed/tanker haulage mobilization.',
  },
  {
    id: 'warri-etuwewe',
    name: 'Warri Branch Office — Etuwewe Road',
    shortName: 'Warri (Etuwewe Rd)',
    badge: 'WARRI DELTA STATE BRANCH',
    addressLines: [
      '9, Etuwewe Road, Off Deco Road',
      'P.O. Box 894, Warri',
      'Delta State, Nigeria',
    ],
    city: 'Warri',
    state: 'Delta State',
    phone: '(+234) 070-3825-9142',
    hours: [
      'Mon – Fri: 7:30 AM – 6:00 PM',
      'Saturday: 8:00 AM – 4:00 PM',
      '24/7 Project Mobilization & Dispatch on Request',
    ],
    coordinates: { lat: 5.5174, lng: 5.7501 },
    mapEmbedUrl:
      'https://maps.google.com/maps?q=9%20Etuwewe%20Road%20Off%20Deco%20Road%20Warri%20Delta%20State%20Nigeria&t=&z=15&ie=UTF8&iwloc=&output=embed',
    directionsUrl:
      'https://www.google.com/maps/search/?api=1&query=9+Etuwewe+Road+Off+Deco+Road+Warri+Delta+State+Nigeria',
    capabilities: [
      'Delta State Heavy Equipment Leasing (Swamp Buggies, Excavators, Dozers, Cranes, Forklifts)',
      'Lowbed, Flatbed, Bulk Tanker, Pneumatic Silo & Dump Truck Haulage Operations',
      'On-Site Preventive Fleet Maintenance & Mobile Field Service Crew',
      'Swamp & Land Earthmoving Spreads for Oilfield, Marine & Civil Contractors',
    ],
    specialNote:
      'Strategic Delta State operational yard serving Warri, Ughelli, Sapele, Koko, Escravos, and surrounding Niger Delta workfronts.',
  },
];

export const INDUSTRIAL_GASES_DETAIL: GasDetail[] = [
  {
    name: 'Lowbed Trailers (40T – 100T+)',
    formula: 'LOWBED',
    group: 'Heavy Haulage Trailers',
    image: '/assets/eil/gen_lowbed_trailer.jpg',
    features: [
      '3-axle, 4-axle & multi-axle hydraulic gooseneck lowbed trailers (40T, 60T, 80T to 100T+ payload)',
      'Heavy-duty rear loading ramps and expandable side outriggers for tracked excavators, dozers, swamp buggies & cranes',
      'Supplied with certified Grade-80 load-restraint chains, ratchet binders, route survey & escort support',
    ],
  },
  {
    name: 'Flatbed Trailers (40ft & 45ft)',
    formula: 'FLATBED',
    group: 'Heavy Haulage Trailers',
    image: '/assets/eil/gen_flatbed_trailer.jpg',
    features: [
      '40ft and extended 45ft high-tensile tri-axle flatbed decks (30T – 45T payload capacity)',
      'Equipped with ISO container twist-locks and removable vertical steel stanchions for OCTG casing & line pipes',
      'Ideal for port cargo clearance, structural steel, generator skids, and nationwide project shuttles',
    ],
  },
  {
    name: 'Bulk Tankers (AGO/Diesel & Water)',
    formula: 'TANKER',
    group: 'Bulk & Tanker Fleet',
    image: '/assets/eil/pdf_img_021.jpg',
    features: [
      'Calibrated, baffled road tankers and rigid site bowsers (15,000L, 30,000L, 33,000L to 45,000L capacities)',
      'PTO-driven high-flow discharge pumps, calibrated flow meters, and long dispensing hoses for site diesel bunkering',
      'Pressurized water bowser configurations with rear spray bars for road compaction, dust control & hydro-testing',
    ],
  },
  {
    name: 'Pneumatic Silo Trucks (Dry Bulk)',
    formula: 'PNEUMATIC',
    group: 'Bulk & Tanker Fleet',
    image: '/assets/eil/gen_pneumatic_truck.jpg',
    features: [
      '35 CBM to 50 CBM pressurized dry-bulk silo tankers for moisture-free cement, barite, bentonite & fly ash haulage',
      'Onboard high-output rotary-screw/piston air compressors (2.0 Bar) for rapid vertical discharge into batching or rig silos',
      'Hydro-tested pressure vessels with certified relief valves and trained pneumatic discharge operators',
    ],
  },
  {
    name: 'Dump Trucks / Tippers (20T – 45T)',
    formula: 'TIPPER',
    group: 'Bulk & Tanker Fleet',
    image: '/assets/eil/gen_dump_truck.jpg',
    features: [
      'Rugged 6x4 (10-tyre) and 8x4 (12-tyre) hydraulic dump trucks with 16 CBM to 30 CBM heavy rock/earth bodies',
      'High-ground-clearance hub-reduction bogie axles with differential locks for unimproved construction haul roads',
      'Deployed for sharp sand, laterite filling, quarry granite delivery, and site excavation muck-away',
    ],
  },
  {
    name: 'Forklifts of All Tonnages (3T – 45T)',
    formula: 'FORKLIFT',
    group: 'Lifting & Material Handling',
    image: '/assets/eil/pdf_img_044.jpg',
    features: [
      'Complete tonnage range: 3T, 5T, 7T, 10T, 15T, 16T, 25T, 32T Diesel Forklifts & 45T Container Reach Stackers',
      'Wide-view duplex/triplex masts, hydraulic side-shifters, fork positioners, and pipe-clamp options',
      'Third-party load-tested with valid statutory lifting certificates and certified forklift operators',
    ],
  },
  {
    name: 'Excavators & Swamp Buggies',
    formula: 'EXCAVATOR',
    group: 'Earthmoving & Swamp Plant',
    image: '/assets/eil/pdf_img_028.jpg',
    features: [
      '20T, 30T & 36T+ Tracked Hydraulic Excavators (CAT 320 / 330 / 336 class) with 0.9 to 2.1 CBM buckets',
      '16m – 20m Long-Reach Boom Excavators and hydraulic rock-breaker hammer attachments',
      'Pontoon-mounted Amphibious Swamp Buggies engineered for Niger Delta mangrove creeks, wetlands & pipeline RoW',
    ],
  },
  {
    name: 'Dozers / Bulldozers (D6, D7, D8)',
    formula: 'DOZER',
    group: 'Earthmoving & Swamp Plant',
    image: '/assets/eil/gen_bulldozer.jpg',
    features: [
      'CAT D6R/D6H, D7G/D7R, and D8R/D8T heavy crawler bulldozers (165 HP to 310+ HP)',
      'Available in both standard single-grouser tracks and wide-pad LGP (Low Ground Pressure) swamp configurations',
      'Equipped with Semi-U / Straight blades, rear multi-shank hydraulic rippers, or heavy recovery winches',
    ],
  },
  {
    name: 'Mobile & Crawler Cranes (25T – 150T+)',
    formula: 'CRANE',
    group: 'Lifting & Material Handling',
    image: '/assets/eil/pdf_img_019.jpg',
    features: [
      '25T–50T 4x4 Rough-Terrain (RT) Cranes and 50T–150T+ All-Terrain (AT) Telescopic Hydraulic Mobile Cranes',
      '50T–100T Lattice-Boom Crawler Cranes and 10T–20T Truck-Mounted Hiab Self-Loading Cranes',
      'Calibrated LMI/SLI computer systems, outrigger mats, certified rigging loft, and experienced crane crews',
    ],
  },
  {
    name: 'Backhoes, Payloaders & Road Plant',
    formula: 'BACKHOE',
    group: 'Earthmoving & Swamp Plant',
    image: '/assets/eil/gen_backhoe_loader.jpg',
    features: [
      '4x4 Backhoe Loaders (CAT 428 / JCB 3CX) with front 4-in-1 loader bucket and rear extendable trenching dipper',
      'Front-End Wheel Loaders / Payloaders (CAT 950 / 966 class, 3.0–4.5 CBM) for stockpiles and batching plants',
      'CAT 140H/140K Motor Graders and 10T–20T Single-Drum Vibratory Soil Compactors (smooth & padfoot)',
    ],
  },
];

export const STOCK_CATALOGUE: StockItem[] = [
  // =========================================================================
  // 1. FORKLIFTS & LIFTING (6 ITEMS)
  // =========================================================================
  {
    id: 'fk-3t-diesel',
    category: 'Forklifts & Lifting',
    subcategory: 'Light Industrial Forklifts (3T)',
    name: '3-Ton Diesel Industrial Counterbalance Forklift',
    spec: '3,000 kg capacity · 3.0m–4.5m Duplex/Triplex container mast · Side-shift · Pneumatic or solid yard tires',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'fk-5t-diesel',
    category: 'Forklifts & Lifting',
    subcategory: 'Medium Yard Forklifts (5T)',
    name: '5-Ton Heavy-Duty Diesel Yard Forklift',
    spec: '5,000 kg capacity · Wide-view mast · Hydraulic fork positioner · Certified overhead guard & beacon',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'fk-7t-10t-diesel',
    category: 'Forklifts & Lifting',
    subcategory: 'Heavy Yard Forklifts (7T – 10T)',
    name: '7-Ton & 10-Ton Heavy Industrial Diesel Forklift',
    spec: '7,000 kg – 10,000 kg capacity · Dual front drive tires · 1.8m–2.4m forged forks for oilfield skids & steel',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'fk-15t-16t-pipe',
    category: 'Forklifts & Lifting',
    subcategory: 'Oilfield Pipe-Handling Forklifts (15T – 16T)',
    name: '15-Ton / 16-Ton Oilfield & Pipe-Yard Forklift',
    spec: '15,000 kg – 16,000 kg at 600mm/900mm load center · Heavy planetary axle · Optional OCTG pipe clamp',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'fk-25t-32t-heavy',
    category: 'Forklifts & Lifting',
    subcategory: 'Super-Heavy Terminal Forklifts (25T – 32T)',
    name: '25-Ton to 32-Ton Super-Heavy Terminal Forklift',
    spec: '25,000 kg – 32,000 kg capacity · Loaded 20ft container, BOP & heavy module handling · Enclosed ROPS cabin',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'fk-45t-reach-stacker',
    category: 'Forklifts & Lifting',
    subcategory: 'Reach Stackers & Telehandlers (4T – 45T)',
    name: '45-Ton Container Reach Stacker & 17m Telehandler',
    spec: '45T telescopic container spreader (20ft/40ft 5-high) or 4T/17m 4WD Rough-Terrain Telescopic Handler',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: true,
  },

  // =========================================================================
  // 2. EXCAVATORS & SWAMP BUGGIES (6 ITEMS)
  // =========================================================================
  {
    id: 'ex-cat-320-20t',
    category: 'Excavators & Swamp Buggies',
    subcategory: 'Standard Tracked Excavators (20T)',
    name: '20-Ton Tracked Hydraulic Excavator (CAT 320 Class)',
    spec: '20T–22T operating weight · 0.9–1.2 CBM general purpose bucket · 6.5m digging depth · Steel triple-grouser tracks',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'ex-cat-330-30t',
    category: 'Excavators & Swamp Buggies',
    subcategory: 'Heavy Tracked Excavators (30T)',
    name: '30-Ton Heavy Tracked Excavator (CAT 330 Class)',
    spec: '30T–32T operating weight · 1.5–1.8 CBM heavy rock/earth bucket · High breakout force for pipeline & mass trenching',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'ex-cat-336-36t',
    category: 'Excavators & Swamp Buggies',
    subcategory: 'Mass Production Excavators (36T – 45T)',
    name: '36-Ton to 45-Ton Mass Production Excavator (CAT 336 / 345 Class)',
    spec: '36T–45T class · 2.0–2.4 CBM heavy duty bucket · Bulk earthworks, quarry loading & deep foundation excavation',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'ex-swamp-buggy-std',
    category: 'Excavators & Swamp Buggies',
    subcategory: 'Amphibious Swamp Buggies',
    name: 'Amphibious Hydraulic Excavator (Swamp Buggy)',
    spec: 'Sealed multi-compartment steel pontoon undercarriage · Ultra-low ground pressure for mangrove swamps & creeks',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'ex-long-reach-18m',
    category: 'Excavators & Swamp Buggies',
    subcategory: 'Long-Reach Boom Excavators (16m – 20m)',
    name: 'Long-Reach Boom Hydraulic Excavator (16m – 20m Reach)',
    spec: '16m to 20m extended boom & stick · Canal dredging, river desilting, slope trimming & deep cofferdam work',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'ex-rock-breaker',
    category: 'Excavators & Swamp Buggies',
    subcategory: 'Demolition & Rock Breaker Fleet',
    name: 'Tracked Excavator with Hydraulic Rock Breaker / Hammer',
    spec: '20T–33T carrier fitted with heavy-duty hydraulic percussion breaker chisel for concrete demolition & rock trenching',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },

  // =========================================================================
  // 3. DOZERS & EARTHMOVING (6 ITEMS)
  // =========================================================================
  {
    id: 'dz-cat-d6r',
    category: 'Dozers & Earthmoving',
    subcategory: 'Medium Crawler Dozers (CAT D6)',
    name: 'CAT D6R / D6H Crawler Bulldozer (Standard & LGP Swamp)',
    spec: '165–185 HP · Semi-U or 6-way angle blade · Available in standard track or wide-pad LGP swamp shoes',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'dz-cat-d7g',
    category: 'Dozers & Earthmoving',
    subcategory: 'Heavy Crawler Dozers (CAT D7)',
    name: 'CAT D7G / D7R Heavy Crawler Bulldozer',
    spec: '200–240 HP · Heavy Straight/Semi-U blade with tilt · Rear multi-shank ripper or heavy towing winch',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'dz-cat-d8r',
    category: 'Dozers & Earthmoving',
    subcategory: 'Super-Heavy Production Dozers (CAT D8)',
    name: 'CAT D8R / D8T Super-Heavy Production Dozer with Ripper',
    spec: '305–310+ HP · 8.7–11.7 CBM Semi-U rock blade · Single/triple-shank hydraulic ripper · Elevated sprocket drive',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'dz-grader-140h',
    category: 'Dozers & Earthmoving',
    subcategory: 'Motor Graders (12ft – 14ft Blade)',
    name: 'Motor Grader (CAT 140H / 140K / 140G Class)',
    spec: '165–195 HP tandem drive · 12ft / 14ft hydraulic moldboard blade · Rear scarifier/ripper for road sub-base profiling',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'dz-roller-smooth-12t',
    category: 'Dozers & Earthmoving',
    subcategory: 'Vibratory Soil Compactors (10T – 20T)',
    name: '10-Ton to 20-Ton Single-Drum Vibratory Soil Compactor (Smooth Drum)',
    spec: '10T, 12T, 16T & 20T classes · 2,130mm vibratory steel drum · Dual-amplitude vibration for sand & stone base',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'dz-roller-padfoot',
    category: 'Dozers & Earthmoving',
    subcategory: 'Padfoot & Pneumatic Rollers',
    name: 'Padfoot (Sheep-Foot) Vibratory Soil Compactor & Pneumatic Roller',
    spec: 'Heavy tamping-foot drum compactor for cohesive laterite/clay embankments & pneumatic tire finish rollers',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },

  // =========================================================================
  // 4. MOBILE & CRAWLER CRANES (6 ITEMS)
  // =========================================================================
  {
    id: 'cr-rt-25t-35t',
    category: 'Mobile & Crawler Cranes',
    subcategory: 'Rough-Terrain Cranes (25T – 35T)',
    name: '25-Ton & 35-Ton 4x4 Rough-Terrain (RT) Hydraulic Mobile Crane',
    spec: '25T–35T capacity · 24m–31m telescopic boom + fly jib · 4WD & 4-wheel crab steer · Certified LMI & rigging gear',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'cr-rt-50t',
    category: 'Mobile & Crawler Cranes',
    subcategory: 'Rough-Terrain & All-Terrain Cranes (50T)',
    name: '50-Ton Rough-Terrain / All-Terrain Hydraulic Mobile Crane',
    spec: '50T capacity · 35m–40m main telescopic boom · Computerized Safe Load Indicator (SLI) · Full outrigger mats',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'cr-at-70t-80t',
    category: 'Mobile & Crawler Cranes',
    subcategory: 'Heavy Telescopic Mobile Cranes (70T – 80T)',
    name: '70-Ton & 80-Ton All-Terrain Telescopic Mobile Crane',
    spec: '70T–80T capacity · 44m–50m telescopic boom + bi-fold swing-away jib · Heavy mechanical & vessel erection',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'cr-at-100t-150t',
    category: 'Mobile & Crawler Cranes',
    subcategory: 'Super-Heavy All-Terrain Cranes (100T – 150T+)',
    name: '100-Ton to 150-Ton+ Heavy-Lift All-Terrain Mobile Crane',
    spec: '100T, 120T & 150T+ multi-axle heavy crane · 50m–60m boom · Includes ballast trailer, Lift Supervisor & Riggers',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'cr-crawler-50t-100t',
    category: 'Mobile & Crawler Cranes',
    subcategory: 'Lattice-Boom Crawler Cranes (50T – 100T)',
    name: '50-Ton to 100-Ton Lattice-Boom Tracked Crawler Crane',
    spec: '50T–100T capacity · Pin-connected tubular lattice boom (18m–60m) · Steel tracks for piling, jetty & tank erection',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'cr-hiab-10t-20t',
    category: 'Mobile & Crawler Cranes',
    subcategory: 'Truck-Mounted Hiab Cranes (10T – 20T)',
    name: 'Truck-Mounted Crane (Hiab Self-Loader — 10T to 20T Crane / 15T–30T Bed)',
    spec: '10T, 15T & 20T hydraulic knuckle/telescopic boom crane mounted on 6x4 flatbed truck for self-loading & delivery',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },

  // =========================================================================
  // 5. BACKHOES & LOADERS (5 ITEMS)
  // =========================================================================
  {
    id: 'bl-backhoe-428',
    category: 'Backhoes & Loaders',
    subcategory: '4x4 Backhoe Loaders',
    name: '4x4 Backhoe Loader (CAT 428 / JCB 3CX & 4CX Class)',
    spec: '4WD · 1.0 CBM 4-in-1 front loader bucket + 4.5m–5.5m extendable rear backhoe trenching arm · Stabilizer legs',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'bl-payloader-950',
    category: 'Backhoes & Loaders',
    subcategory: 'Medium Wheel Loaders (CAT 950)',
    name: 'Front-End Wheel Loader / Payloader (CAT 950 Class — 3.0–3.5 CBM)',
    spec: 'Articulated 4WD wheel loader · 3.0–3.5 CBM aggregate/sand bucket · Fast dump cycle for tippers & batching plants',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'bl-payloader-966',
    category: 'Backhoes & Loaders',
    subcategory: 'Heavy Quarry Wheel Loaders (CAT 966)',
    name: 'Heavy Quarry & Reclamation Wheel Loader (CAT 966 Class — 4.2–4.6 CBM)',
    spec: '24T–26T operating weight · 4.2–4.6 CBM heavy rock/sand bucket · High-production stockpile & quarry loading',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'bl-skid-steer-bobcat',
    category: 'Backhoes & Loaders',
    subcategory: 'Compact Skid-Steer Loaders',
    name: 'Skid-Steer Bobcat Compact Utility Loader',
    spec: 'Zero-turn compact wheel/track loader · 0.5 CBM bucket & pallet fork attachment for confined yards & slabs',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'bl-wheel-excavator',
    category: 'Backhoes & Loaders',
    subcategory: 'Wheeled Rubber-Tire Excavators',
    name: 'Wheeled Rubber-Tire Hydraulic Excavator (CAT M315 / M318 Class)',
    spec: '16T–19T mobile rubber-tired excavator with hydraulic outriggers & dozer blade for paved/urban roadworks',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },

  // =========================================================================
  // 6. LOWBED & FLATBED HAULAGE (6 ITEMS)
  // =========================================================================
  {
    id: 'hl-lowbed-40t-60t',
    category: 'Lowbed & Flatbed Haulage',
    subcategory: '3-Axle & 4-Axle Lowbed Trailers (40T – 60T)',
    name: '40-Ton to 60-Ton 3-Axle & 4-Axle Lowbed Trailer Haulage',
    spec: 'Low-profile drop deck with rear loading ramps & side outriggers · Hauls Excavators, Dozers, Cranes & Loaders',
    unit: 'Trip / Lease',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'hl-lowbed-80t-100t',
    category: 'Lowbed & Flatbed Haulage',
    subcategory: 'Multi-Axle Heavy Lowbeds (80T – 100T+)',
    name: '80-Ton to 100-Ton+ Multi-Axle Heavy-Haul Lowbed Trailer',
    spec: 'Reinforced wide-body multi-axle gooseneck lowbed · Hauls Swamp Buggies, D8/D9 Dozers, Crawler Cranes & Vessels',
    unit: 'Trip / Lease',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'hl-flatbed-40ft',
    category: 'Lowbed & Flatbed Haulage',
    subcategory: '40ft Container & Cargo Flatbeds',
    name: '40ft Tri-Axle Heavy-Duty Flatbed Trailer (30T – 40T Payload)',
    spec: '12.2m steel deck · 12 ISO container twist-locks · Hauls 20ft/40ft containers, steel plates & palletized cargo',
    unit: 'Trip / Lease',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'hl-flatbed-45ft-pipe',
    category: 'Lowbed & Flatbed Haulage',
    subcategory: '45ft Pipe-Haulage Flatbeds with Stanchions',
    name: '45ft Extended Flatbed & OCTG Pipe-Haulage Trailer with Stanchions',
    spec: '13.7m deck · Heavy vertical side pipe stanchions (bolsters) & timber cradles for 12m+ coated line pipes & beams',
    unit: 'Trip / Lease',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'hl-stepdeck-trailer',
    category: 'Lowbed & Flatbed Haulage',
    subcategory: 'Step-Deck & Semi-Lowbed Trailers',
    name: 'Semi-Lowbed / Step-Deck Equipment & Cargo Trailer (35T – 50T)',
    spec: 'Step-frame semi-trailer with winch & ramps for wheeled machinery, tractors, generators & high-cube skids',
    unit: 'Trip / Lease',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'hl-escort-convoy',
    category: 'Lowbed & Flatbed Haulage',
    subcategory: 'Heavy-Haul Convoy & Route Survey',
    name: 'Multi-Trailer Project Convoy & Wide-Load Escort Logistics',
    spec: 'Synchronized multi-lowbed/flatbed fleet mobilization with pilot escort vehicles, route survey & journey management',
    unit: 'Convoy / Lease',
    availability: 'Available for Hire',
    pointsEligible: false,
  },

  // =========================================================================
  // 7. TANKERS & PNEUMATIC TRUCKS (5 ITEMS)
  // =========================================================================
  {
    id: 'tk-ago-tanker-33k',
    category: 'Tankers & Pneumatic Trucks',
    subcategory: 'Bulk Diesel (AGO) Road Tankers',
    name: '33,000L – 45,000L Bulk Diesel (AGO) Road Tanker Trailer',
    spec: 'Calibrated multi-compartment baffled petroleum tanker · PTO pump, flow meter, spark arrestor & earthing reel',
    unit: 'Trip / Lease',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'tk-site-fuel-bowser-15k',
    category: 'Tankers & Pneumatic Trucks',
    subcategory: 'Rigid On-Site Fuel Bowsers',
    name: '10,000L – 20,000L Rigid 6x4 On-Site Fuel Dispensing Bowser',
    spec: 'Self-pumping mobile site diesel bowser with digital meter & dispensing nozzle for refueling plant on site',
    unit: 'Unit / Lease',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'tk-water-bowser-20k',
    category: 'Tankers & Pneumatic Trucks',
    subcategory: 'Water Tankers & Spray Bowsers',
    name: '20,000L – 30,000L Pressurized Water Tanker / Road Spray Bowser',
    spec: 'Baffled steel water tank · Self-priming suction/discharge pump + rear pressurized spray bar for compaction & dust control',
    unit: 'Unit / Lease',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'tk-pneumatic-cement-40cbm',
    category: 'Tankers & Pneumatic Trucks',
    subcategory: 'Pneumatic Bulk Cement Silo Trucks',
    name: 'Pneumatic Bulk Cement Silo Tanker Truck (35 CBM – 50 CBM)',
    spec: 'Pressurized dry-bulk V-hopper vessel (2.0 Bar) + onboard rotary-screw air compressor for vertical silo discharge',
    unit: 'Trip / Lease',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'tk-pneumatic-barite-bentonite',
    category: 'Tankers & Pneumatic Trucks',
    subcategory: 'Oilfield Pneumatic Barite & Bentonite Trucks',
    name: 'Oilfield Pneumatic Barite, Bentonite & Class-G Cement Bulk Truck',
    spec: 'High-pressure pneumatic bulk powder tanker with moisture-sealed cones & 4-inch discharge hoses for rig mud plants',
    unit: 'Trip / Lease',
    availability: 'Available for Hire',
    pointsEligible: false,
  },

  // =========================================================================
  // 8. DUMP TRUCKS & SUPPORT PLANT (6 ITEMS)
  // =========================================================================
  {
    id: 'dt-tipper-20t-30t-6x4',
    category: 'Dump Trucks & Support Plant',
    subcategory: '6x4 Heavy Dump Trucks (20T – 30T)',
    name: '20-Ton & 30-Ton 6x4 Heavy-Duty Hydraulic Dump Truck (Tipper)',
    spec: '16 CBM – 20 CBM heavy steel tipping body · 6x4 hub-reduction off-road axles · Sharp sand, granite & laterite haulage',
    unit: 'Unit / Fleet',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'dt-tipper-40t-8x4',
    category: 'Dump Trucks & Support Plant',
    subcategory: '8x4 High-Volume Dump Trucks (40T)',
    name: '40-Ton 8x4 (12-Tyre) High-Volume Rock & Earthworks Dump Truck',
    spec: '25 CBM – 30 CBM Hardox rock body · Twin-steer 8x4 chassis · High-volume reclamation sand-filling & quarry stone',
    unit: 'Unit / Fleet',
    availability: 'Available for Hire',
    pointsEligible: true,
  },
  {
    id: 'dt-generator-100-500kva',
    category: 'Dump Trucks & Support Plant',
    subcategory: 'Industrial Diesel Generators (100 – 500 kVA)',
    name: 'Soundproof Industrial Diesel Generators (100 kVA – 500 kVA)',
    spec: '100 kVA, 250 kVA, 350 kVA & 500 kVA prime power · 415V 3-Phase · Acoustic canopy for sites, camps & batching plants',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'dt-compressor-185-750cfm',
    category: 'Dump Trucks & Support Plant',
    subcategory: 'Towable Rotary Air Compressors',
    name: 'Towable Rotary-Screw Diesel Air Compressors (185 CFM – 750 CFM)',
    spec: '7–12 Bar working pressure · Wheeled towable chassis for pipeline pigging, sandblasting & pneumatic breakers',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'dt-light-tower-9m',
    category: 'Dump Trucks & Support Plant',
    subcategory: 'Mobile Site Lighting Towers',
    name: 'Mobile Diesel Telescopic Floodlight Tower (9m Mast / 4x1000W)',
    spec: 'Trailer-mounted diesel generator light tower · 360° rotatable lamp array · 4-point wind outriggers for 24hr night work',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
  {
    id: 'dt-dewatering-pump-6in',
    category: 'Dump Trucks & Support Plant',
    subcategory: 'Trench & Swamp Dewatering Pumps',
    name: 'Heavy-Duty 4-Inch to 8-Inch Diesel Trash & Trench Dewatering Pump',
    spec: 'Self-priming high-head diesel centrifugal pump on skid/wheels with suction & layflat discharge hoses',
    unit: 'Unit',
    availability: 'Available for Hire',
    pointsEligible: false,
  },
];

export const SERVICES_LIST: ServiceDetail[] = [
  {
    id: 'equipment-hiring-leasing',
    number: '01',
    title: 'Heavy Equipment Hiring & Plant Leasing',
    shortTitle: '01. Equipment Hire & Leasing',
    tagline:
      'Forklifts of different tonnages, Excavators, Dozers, Cranes, Backhoes & Earthmoving Machinery with Open-Ended Lease Flexibility.',
    image: '/assets/eil/pdf_img_028.jpg',
    secondaryImage: '/assets/eil/pdf_img_044.jpg',
    summary:
      'Emmadios Industrial Limited (EIL) maintains a comprehensive, job-ready fleet of heavy industrial, construction, and earthmoving equipment across our Port Harcourt (Plot 213, Old Aba Road) and Warri (9, Etuwewe Road) yards. There are no fixed durations or rigid time limits on our leases — we support your operations for as long as your project requires.',
    highlights: [
      'Forklifts of different tonnages: 3T, 5T, 7T, 10T, 15T, 25T–32T Diesel Forklifts, 45T Reach Stackers & Telehandlers',
      'Excavators: 20T–45T Tracked Hydraulic Excavators, Long-Reach Booms (16m–20m) & Amphibious Swamp Buggies',
      'Dozers: CAT D6R/D6H, D7G/D7R & D8R/D8T Bulldozers in Standard and LGP Swamp Track configurations',
      'Cranes: 25T–150T+ Rough-Terrain & All-Terrain Mobile Cranes, Crawler Cranes & Truck-Mounted Hiabs',
      'Backhoes & Road Plant: 4x4 Backhoe Loaders, Wheel Loaders (Payloaders), Motor Graders & Vibratory Compactors',
    ],
    subSections: [
      {
        heading: 'Open-Ended Lease Flexibility (No Fixed Time Limits)',
        body: 'Construction, marine, and oilfield schedules frequently shift. EIL provides open-ended leasing without restrictive countdown timers — mobilize immediately and keep the equipment on site until your milestone is achieved.',
      },
      {
        heading: 'Certified Operators & Pre-Mobilization QA/QC',
        body: 'Every machine is dispatched with valid third-party statutory test certificates, a 150-point pre-mobilization mechanical/hydraulic audit, and an experienced, HSE-inducted operator.',
      },
    ],
    benefits: [
      'Immediate dispatch from Port Harcourt and Warri operational yards',
      'Routine on-site preventive maintenance handled by EIL mobile mechanics',
      'Standby backup replacement guarantee to eliminate project downtime',
    ],
  },
  {
    id: 'heavy-haulage-logistics',
    number: '02',
    title: 'Heavy-Duty Haulage & Specialized Logistics Services',
    shortTitle: '02. Haulage Services',
    tagline:
      'Lowbeds, Flatbeds, Bulk Tankers, Pneumatic Silo Trucks & Dump Trucks Operating Across Nigeria.',
    image: '/assets/eil/gen_lowbed_trailer.jpg',
    secondaryImage: '/assets/eil/pdf_img_021.jpg',
    summary:
      'EIL operates a specialized heavy road-haulage fleet engineered for moving oversized plant machinery, oilfield tubulars, ISO containers, bulk fuels/water, pressurized dry-bulk powders, and civil construction aggregates safely from our Port Harcourt and Warri hubs to any destination in Nigeria.',
    highlights: [
      'Lowbed Trailers (40T, 60T, 80T to 100T+ Multi-Axle) with loading ramps for Excavators, Dozers, Swamp Buggies & Cranes',
      'Flatbed Trailers (40ft & 45ft with Twist-Locks & Pipe Stanchions) for Containers, OCTG Pipes & Structural Steel',
      'Tankers (15,000L to 45,000L Baffled Road Tankers & Bowsers) for Bulk Diesel (AGO) & Compaction/Industrial Water',
      'Pneumatic Trucks (35–50 CBM Pressurized Silo Tankers) with onboard compressors for Bulk Cement, Barite & Bentonite',
      'Dump Trucks / Tippers (20T–45T 6x4 & 8x4 Hydraulic Rock/Earth Bodies) for Sand-Filling, Granite & Earthworks',
    ],
    subSections: [
      {
        heading: 'Route Survey, Load Restraint & Journey Management',
        body: 'All heavy and oversized haulage movements are preceded by route clearance verification, certified Grade-80 chain/ratchet lashing, and strict Journey Management monitoring from departure to site delivery.',
      },
      {
        heading: 'Single-Trip Charter or Dedicated Project Fleet Retainer',
        body: 'Hire individual trailers for point-to-point mobilization or retain a multi-truck convoy of Lowbeds, Flatbeds, Pneumatic Trucks, Tankers, or Dump Trucks on an open-ended project basis.',
      },
    ],
    benefits: [
      'Turnkey plant loading & offloading using EIL Cranes, Forklifts, and Lowbed Ramps',
      'Experienced heavy-haulage drivers familiar with Niger Delta and interstate corridors',
      'Full petroleum, pressure-vessel, and heavy-cargo HSE compliance',
    ],
  },
  {
    id: 'earthmoving-swamp-operations',
    number: '03',
    title: 'Earthmoving, Land Clearing & Swamp Buggy Operations',
    shortTitle: '03. Earthmoving & Swamp Plant',
    tagline:
      'Synchronized Bulldozer, Excavator, Swamp Buggy, Grader & Dump Truck Spreads for Land and Swamp Projects.',
    image: '/assets/eil/pdf_img_014.jpg',
    secondaryImage: '/assets/eil/gen_bulldozer.jpg',
    summary:
      'Executing civil infrastructure and pipeline Right-of-Way (RoW) works in the Niger Delta requires rugged terrain capability. EIL deploys integrated earthmoving spreads combining Amphibious Swamp Buggies, LGP Swamp Dozers, Tracked Excavators, Wheel Payloaders, Motor Graders, Vibratory Rollers, and Dump Trucks.',
    highlights: [
      'Pontoon-mounted Amphibious Excavators (Swamp Buggies) for mangrove creeks, marshlands & riverine dredging',
      'CAT D6, D7 & D8 Bulldozers for virgin forest clearing, tree stumping, and sand-stockpile spreading',
      'High-speed Excavator + Payloader + 6x4/8x4 Dump Truck fleets for mass excavation and reclamation filling',
      'CAT 140H/140K Motor Graders, 10T–20T Vibratory Compactors & Water Bowsers for haul-road and pad construction',
    ],
    subSections: [
      {
        heading: 'Swamp & Riverine Workfront Expertise',
        body: 'Our amphibious swamp buggies and wide-track LGP bulldozers are specifically ballasted and sealed for soft peat, tidal flats, and waterlogged pipeline corridors across Rivers and Delta States.',
      },
      {
        heading: 'Turnkey Lowbed Mobilization & Field Support',
        body: 'EIL handles the complete heavy-lowbed mobilization of all earthmoving units to your workfront and stations field mechanics to maintain peak daily cubic-meter productivity.',
      },
    ],
    benefits: [
      'Single-source fleet coordination for clearing, trenching, grading, and compaction',
      'Matched loader-to-tipper ratios to eliminate truck queuing on site',
      'Flexible open-ended deployment across dry-land and swamp phases',
    ],
  },
  {
    id: 'crane-lifting-material-handling',
    number: '04',
    title: 'Mobile Crane Lifting, Rigging & Material Handling',
    shortTitle: '04. Cranes & Forklift Fleet',
    tagline:
      'Certified 25T–150T+ Mobile & Crawler Cranes, 3T–45T Forklifts, Reach Stackers & Hiab Self-Loaders.',
    image: '/assets/eil/pdf_img_019.jpg',
    secondaryImage: '/assets/eil/pdf_img_192.jpg',
    summary:
      'From 3-Ton warehouse forklifts to 45-Ton Container Reach Stackers and 150-Ton All-Terrain Hydraulic Mobile Cranes, EIL provides third-party certified lifting machinery, rigging tackle, and competent lifting crews for supply bases, fabrication yards, plant turnarounds, and heavy construction.',
    highlights: [
      'Forklifts across all tonnages: 3T, 5T, 7T, 10T, 15T, 16T, 25T, 32T & 45T Container Reach Stackers',
      'Rough-Terrain (4x4) and All-Terrain Hydraulic Mobile Cranes (25T, 35T, 50T, 70T, 100T, 150T+)',
      '50T–100T Lattice-Boom Crawler Cranes for heavy duty-cycle lifting, piling, and marine jetty works',
      '10T–20T Truck-Mounted Hiab Self-Loading Cranes for rapid pick-up, haulage, and site placement',
    ],
    subSections: [
      {
        heading: 'Statutory Certification & Safe Load Monitoring',
        body: 'All EIL cranes and forklifts carry current third-party proof-load test certificates, calibrated computerized Load Moment Indicators (LMI/SLI), anti-two-block switches, and inspected slings/shackles.',
      },
      {
        heading: 'Engineered Lift Plans & Certified Rigging Crews',
        body: 'For heavy or complex lifts, our lifting specialists conduct site radius/ground-bearing assessments and supply certified crane operators, riggers, and banksmen.',
      },
    ],
    benefits: [
      'Exact tonnage matching from 3 Tons up to 150+ Tons',
      'Compliant with IOC, terminal, and EPC lifting safety standards',
      'Open-ended hire for yard operations, shutdowns, or structural erection',
    ],
  },
  {
    id: 'fleet-maintenance-field-support',
    number: '05',
    title: 'On-Site Fleet Maintenance, Field Service & Backup Guarantee',
    shortTitle: '05. Fleet Maintenance & Support',
    tagline:
      'Mobile Workshop Vans, Preventive Servicing & Standby Replacement Units for Zero Project Downtime.',
    image: '/assets/eil/pdf_img_191.jpg',
    secondaryImage: '/assets/eil/pdf_img_220.jpg',
    summary:
      'Equipment reliability is the foundation of EIL’s reputation. Our mechanical, hydraulic, and heavy-diesel workshops in Port Harcourt and Warri provide full preventive maintenance on your project site, backed by mobile service vans and an equipment replacement guarantee.',
    highlights: [
      '150-point pre-mobilization mechanical, hydraulic, transmission, and undercarriage inspection before dispatch',
      'Scheduled on-site preventive maintenance (engine oil, filters, hydraulic servicing) included in leases',
      'Mobile field service vans equipped with diagnostic tools, hydraulic hose presses, and critical spares',
      'Dedicated resident mechanics assigned to multi-machine or remote swamp/land project spreads',
    ],
    subSections: [
      {
        heading: 'Rapid Field Response & Replacement Guarantee',
        body: 'If a leased machine encounters a mechanical issue on site, our Port Harcourt or Warri engineering team dispatches a mobile repair crew immediately or mobilizes a replacement unit to protect your critical path.',
      },
      {
        heading: 'Genuine OEM Spares & In-House Overhaul Capability',
        body: 'We maintain deep spare-parts stock for CAT, Komatsu, Tadano, Grove, Liebherr, JCB, Mack, and Howo machines across our two operational branches.',
      },
    ],
    benefits: [
      'Maximum machine availability and predictable project execution',
      'Zero maintenance burden on your site engineering team',
      'Direct 24/7 hotline access to EIL Fleet Operations (+234 703 825 9142)',
    ],
  },
  {
    id: 'site-survey-project-logistics',
    number: '06',
    title: 'Pre-Mobilization Site Surveys & Project Fleet Planning',
    shortTitle: '06. Route Survey & Fleet Planning',
    tagline:
      'Complimentary Terrain Assessments, Heavy-Haul Route Reconnaissance & Custom Fleet Sizing.',
    image: '/assets/eil/pdf_img_031.jpg',
    secondaryImage: '/assets/eil/pdf_img_024.jpg',
    summary:
      'Selecting the right crane boom radius, forklift load center, lowbed axle configuration, or earthmoving fleet spread saves time and cost. EIL’s operations engineers provide complimentary pre-mobilization site and route assessments across Rivers State, Delta State, and nationwide project corridors.',
    highlights: [
      'On-site inspection of ground-bearing conditions, crane setup pads, and access road widths',
      'Highway route reconnaissance for oversized lowbed loads (bridge weight limits, overhead cables, turning radii)',
      'Earthmoving & haulage cycle-time calculation to size Excavator, Dozer, Tanker, Pneumatic & Dump Truck fleets',
      'Complete HSE pre-mobilization documentation package (Equipment Certificates, Operator Licenses, JMP)',
    ],
    subSections: [
      {
        heading: 'Consultative Fleet Matching',
        body: 'Share your project scope, cargo packing list, or Bill of Engineering Measurement and Evaluation (BEME), and our team will recommend the most efficient combination of equipment and haulage trucks.',
      },
      {
        heading: 'Seamless Coordination from Yard to Workfront',
        body: 'A single EIL logistics coordinator manages your mobilization from our Port Harcourt (Old Aba Road) or Warri (Etuwewe Road) yard through final site demobilization.',
      },
    ],
    benefits: [
      'Eliminates mobilization surprises, access bottlenecks, and under-sized plant',
      'Fast, transparent commercial quotations tailored to your project scope',
      'Full compliance with client Permit-to-Work (PTW) and audit standards',
    ],
  },
];

export const TRAINING_COURSES: TrainingCourse[] = [
  {
    code: 'EIL-OP-01',
    title: 'Forklift Operation & Load Center Stability (3T to 45T & Reach Stackers)',
    whoToAttend: 'Industrial Forklift & Reach Stacker Operators, Yard Supervisors, Logistics Crew',
    certification: 'EIL Competency & Statutory Lifting Verification',
    duration: 'On-Site & Yard Practical',
  },
  {
    code: 'EIL-OP-02',
    title: 'Tracked Hydraulic Excavator & Amphibious Swamp Buggy Safe Operations',
    whoToAttend: 'Excavator & Swamp Buggy Operators, Trenching Supervisors, RoW Field Crew',
    certification: 'EIL Heavy Plant & Swamp Operations Standard',
    duration: 'On-Site & Yard Practical',
  },
  {
    code: 'EIL-OP-03',
    title: 'Crawler Dozer (CAT D6–D8), Motor Grader & Vibratory Compactor Operations',
    whoToAttend: 'Bulldozer, Grader & Compactor Operators, Civil Earthworks Foremen',
    certification: 'EIL Earthmoving Competency Standard',
    duration: 'On-Site & Yard Practical',
  },
  {
    code: 'EIL-OP-04',
    title: '4x4 Backhoe Loader & Front-End Wheel Payloader (CAT 950/966) Operations',
    whoToAttend: 'Backhoe & Payloader Operators, Batching Plant & Stockpile Crew',
    certification: 'EIL Plant Operations Competency Standard',
    duration: 'On-Site & Yard Practical',
  },
  {
    code: 'EIL-LR-01',
    title: 'Mobile & Crawler Crane Lifting Operations, LMI Calibration & Load Charts',
    whoToAttend: 'All-Terrain, Rough-Terrain & Crawler Crane Operators, Lift Supervisors',
    certification: 'Third-Party Lifting & Crane Safety Compliance',
    duration: 'Continuous HSE Standard',
  },
  {
    code: 'EIL-LR-02',
    title: 'Industrial Rigging, Slinging, Hand Signals & Banksman Coordination',
    whoToAttend: 'Crane Riggers, Banksmen, Deck/Yard Hands & Lifting Safety Officers',
    certification: 'Certified Rigger & Banksman Competency Standard',
    duration: 'Continuous HSE Standard',
  },
  {
    code: 'EIL-LR-03',
    title: 'Truck-Mounted Hiab Self-Loader Outrigger Setup & Pick-and-Carry Safety',
    whoToAttend: 'Hiab Driver-Operators, Cargo Loading & Site Delivery Personnel',
    certification: 'EIL Hiab Lifting & Haulage Safety Standard',
    duration: 'On-Site & Yard Practical',
  },
  {
    code: 'EIL-HL-01',
    title: 'Lowbed Heavy Equipment Ramp Loading, CG Alignment & Grade-80 Chain Lashing',
    whoToAttend: 'Lowbed Heavy-Haulage Drivers, Escort Crew, Plant Mobilization Teams',
    certification: 'Mandatory Pre-Dispatch Heavy Haulage Protocol',
    duration: 'Mandatory Pre-Dispatch',
  },
  {
    code: 'EIL-HL-02',
    title: 'Flatbed Container Twist-Lock Securement & OCTG Pipe Stanchion Restraint',
    whoToAttend: '40ft/45ft Flatbed Trailer Drivers, Port Clearance & Pipe-Yard Loading Crew',
    certification: 'Mandatory Pre-Dispatch Cargo Securement Protocol',
    duration: 'Mandatory Pre-Dispatch',
  },
  {
    code: 'EIL-HL-03',
    title: 'Bulk Road Tanker (AGO/Water) Earthing, Surge Control & Safe Discharge',
    whoToAttend: 'Petroleum (AGO) & Water Bowser Tanker Drivers, Fuel Bunkering Attendants',
    certification: 'Bulk Liquid Haulage & Fire Safety Standard',
    duration: 'Continuous HSE Standard',
  },
  {
    code: 'EIL-HL-04',
    title: 'Pneumatic Silo Truck Pressure Vessel Safety & Vertical Silo Blowing (2.0 Bar)',
    whoToAttend: 'Pneumatic Bulk Cement, Barite & Bentonite Truck Operators, Silo Attendants',
    certification: 'Pressure-Discharge & Bulk Powder Safety Standard',
    duration: 'Continuous HSE Standard',
  },
  {
    code: 'EIL-HL-05',
    title: 'Dump Truck (6x4 & 8x4 Tipper) Site Tipping Stability & Haul-Road Defensive Driving',
    whoToAttend: 'Heavy Dump Truck Drivers, Earthworks Traffic Marshals & Spotters',
    certification: 'EIL Tipper Fleet & Quarry Safety Standard',
    duration: 'Continuous HSE Standard',
  },
  {
    code: 'EIL-FM-01',
    title: '150-Point Pre-Mobilization Mechanical, Hydraulic & Undercarriage QA/QC Audit',
    whoToAttend: 'EIL Workshop Engineers, Field Mechanics, Hydraulic Technicians & Plant Inspectors',
    certification: 'EIL Pre-Dispatch Engineering Fitness Certificate',
    duration: 'Every Equipment Dispatch',
  },
  {
    code: 'EIL-SM-01',
    title: 'Journey Management Plan (JMP), Route Reconnaissance & Client PTW Induction',
    whoToAttend: 'All EIL Operators, Heavy Truck Drivers, Convoy Leaders & Field Crew',
    certification: 'Full Client HSE & Journey Management Compliance',
    duration: 'Daily Operational Standard',
  },
];

export const EIL_POINT_CARD_RULES: string[] = [
  'Priority Fleet Allocation: Registered corporate and repeat project partners enjoy priority reservation on Forklifts, Excavators, Dozers, Cranes, Backhoes, and Haulage Trucks across our Port Harcourt and Warri yards.',
  'Open-Ended Lease Flexibility: Scale your leased equipment or haulage fleet up or down at any point during your project with zero fixed duration limits or countdown penalties.',
  'Complimentary Pre-Mobilization Surveys: Enjoy free engineering site inspections, crane lifting assessments, and heavy-haulage route surveys prior to mobilization.',
  'Volume Rebates & Multi-Unit Discounts: Earn cumulative commercial rebates when bundling equipment hire (e.g., Excavators + Dozers + Cranes) with EIL Lowbed, Flatbed, Tanker, Pneumatic, or Dump Truck haulage.',
  'Dedicated Field Engineering Support: Priority access to EIL mobile service vans, on-site preventive maintenance, and standby replacement machine guarantees.',
];

export const EIL_SAFETY_COMMITMENTS: string[] = [
  'It is the policy of Emmadios Industrial Limited (EIL) to conduct all heavy equipment hiring, crane lifting, earthmoving, and road haulage operations in a manner that protects the health and safety of all personnel, client facilities, and the public.',
  'Every Forklift, Mobile Crane, Crawler Crane, Hiab, Excavator, Dozer, Backhoe, and Pneumatic Silo Vessel in our fleet is maintained with current statutory third-party inspection and proof-load test certificates.',
  'All Lowbed, Flatbed, Tanker, Pneumatic, and Dump Truck dispatches operate under strict Journey Management Plans, certified load-restraint chaining/twist-locks, and defensive driving enforcement.',
  'Every EIL operator, rigger, and heavy-haulage driver holds Stop-Work Authority and completes daily pre-shift mechanical, hydraulic, and safety checklists before commencing site operations.',
];
