export type CompanyAsset = {
  name: string;
  description: string;
};

export type CompanyInfluence = {
  economy: number;
  military: number;
  media: number;
  technology: number;
  logistics: number;
  energy: number;
  publicTrust: number;
};

export type CompanyRelation = {
  target: string;
  type: "ally" | "rival" | "dependent" | "complex" | "hostile";
  description: string;
};

export type CompanyProfile = {
  id: string;
  name: string;
  displayName: string;
  leader: string;
  leaderTitle: string;
  accent: string;
  cityName: string;
  tagline: string;
  overview: string;
  coreBusiness: string;
  systemRole: string;
  assets: CompanyAsset[];
  influence: CompanyInfluence;
  relations: CompanyRelation[];
  tags: string[];
  visualIdentity: {
    colors: string[];
    architecture: string;
  };
  classifiedNote?: string;
  images: {
    portrait: string;
    logo?: string;
    magazine?: string;
    cityDay?: string;
    cityCenter?: string;
    cityBrochure?: string;
    citySunset?: string;
    cityExtra?: string;
    cityExtra2?: string;
    cityExtra3?: string;
    destruction?: string[];
  };
};

export const corporations: CompanyProfile[] = [
  {
    id: "agrom",
    name: "Agrom Technology / Agrom Corporation",
    displayName: "Agrom Technology",
    leader: "Steve Agrom",
    leaderTitle: "Founding Father & System Architect",
    accent: "#e7c574",
    cityName: "Agrom City",
    tagline: "The company that did not sell technology. It sold the future.",
    overview: "The founding force and technological backbone of the Corporate Union. A massive holding company holding an absolute monopoly over quantum city architectures and data transfer protocols.",
    coreBusiness: "Quantum Infrastructure, Body/Identity Transfer, IOHcoin Core System",
    systemRole: "Commercializes human immortality by controlling consciousness transfer servers and the System's core architecture.",
    assets: [
      { name: "Quantum City Servers", description: "Massive cold data spires hosting city minds and human memory records." },
      { name: "IOHcoin Core Infrastructure", description: "The quantum database and distribution network of the official currency used throughout the System." },
      { name: "Body Transfer Laboratories", description: "Patented transfer capsules that facilitate the migration of consciousness into new biological or synthetic bodies." },
      { name: "Corporate Union Authority", description: "Ultimate veto and direction rights originating from being a founding member of the Corporate Union." }
    ],
    influence: {
      economy: 10,
      technology: 10,
      media: 6,
      military: 7,
      logistics: 8,
      energy: 7,
      publicTrust: 4
    },
    relations: [
      { target: "nets", type: "complex", description: "While receiving media and public relations support, they are engaged in patent battles over the visual technologies developed by Mina." },
      { target: "miner-henry", type: "ally", description: "Miner Henry is an old friend of Steve Agrom, providing secret bypass channels in the IOHcoin mining lines." }
    ],
    tags: ["System Architect", "IOHcoin Founder Network", "Quantum Infrastructure", "Agrom City"],
    visualIdentity: {
      colors: ["#e7c574", "#ffffff", "#0c0e14"],
      architecture: "Towering server architectures, sterile glass laboratories, consciousness capsules, and gold-plated logo engravings."
    },
    classifiedNote: "The fall of Agrom City and Steve Agrom's loss of reputation occurred as a result of Matt's manipulations. Agrom City is the epicentre of minds and artificial immortality.",
    images: {
      portrait: "/media/corporations/agrom/steve-portrait.jpg",
      magazine: "/media/corporations/agrom/magazine-cover.jpg",
      cityDay: "/media/corporations/agrom/city-day.jpg",
      cityCenter: "/media/corporations/agrom/city-center.jpg",
      cityBrochure: "/media/corporations/agrom/city-brochure-v2.jpg",
      destruction: [
        "/media/corporations/agrom/destruction/destroy-street-01.jpg",
        "/media/corporations/agrom/destruction/destroy-aerial.jpg",
        "/media/corporations/agrom/destruction/destroy-center-code.jpg",
        "/media/corporations/agrom/destruction/destroy-street-02.jpg"
      ]
    }
  },
  {
    id: "nets",
    name: "Nets Media Oligarchy",
    displayName: "Nets",
    leader: "Madam Anne",
    leaderTitle: "Perception Empress",
    accent: "#a200ff",
    cityName: "Orion City",
    tagline: "They do not control what people see. They control what people want to see.",
    overview: "The perception empire managing media, advertising, and virtual reality markets. The dream-producing and entertainment face of the System.",
    coreBusiness: "Entertainment Industry, Virtual Festivals, Holographic Broadcasting",
    systemRole: "Prevents potential rebellions against the System by manipulating human emotions and desires.",
    assets: [
      { name: "Orion Broadcast Network", description: "Massive holographic advertisement and broadcast satellites covering every megacity skyscraper and sky grid." },
      { name: "Perception Mapping Systems", description: "AI algorithms scanning the public's real-time emotional state to personalize propaganda feeds." },
      { name: "Interactive Cinema Blocks", description: "Limitless virtual dream productions entered by viewers via real-time neural connections." }
    ],
    influence: {
      economy: 8,
      technology: 7,
      media: 10,
      military: 4,
      logistics: 7,
      energy: 5,
      publicTrust: 7
    },
    relations: [
      { target: "agrom", type: "complex", description: "Dependent on Agrom's quantum infrastructure but maintains bargaining leverage through its broadcast monopoly." },
      { target: "social-media", type: "rival", description: "Engaged in constant friction with Brett Perkins over the control of information flow and ad revenues." }
    ],
    tags: ["Media Empire", "Perception Control", "Orion City", "Visual Reality"],
    visualIdentity: {
      colors: ["#a200ff", "#6b00b3", "#08040d"],
      architecture: "Palaces with horizontal architecture, neon pink and purple light rivers, endless street parties, and sky holograms."
    },
    classifiedNote: "Mina's revolutionary visual filter and time-locking application was forced into the Nets marketplace and subsequently assimilated by them.",
    images: {
      portrait: "/media/corporations/nets/anne-portrait.jpg",
      magazine: "/media/corporations/nets/magazine-cover.jpg",
      cityDay: "/media/corporations/nets/city-day-canal.jpg",
      cityCenter: "/media/corporations/nets/city-night-canal.jpg",
      cityBrochure: "/media/corporations/nets/city-day-palace.jpg",
      citySunset: "/media/corporations/nets/city-sunset-palace.jpg",
      destruction: [
        "/media/corporations/nets/destruction/destroy-stage-01.jpg",
        "/media/corporations/nets/destruction/destroy-stage-02.jpg",
        "/media/corporations/nets/destruction/destroy-stage-03.jpg",
        "/media/corporations/nets/destruction/destroy-collage.jpg"
      ]
    }
  },
  {
    id: "tencon",
    name: "Tencon Games & Defense",
    displayName: "Tencon",
    leader: "Xying",
    leaderTitle: "KOWN King & AI Forger",
    accent: "#ff1e27",
    cityName: "Tencon City",
    tagline: "Where war became a game, and games learned how to kill.",
    overview: "A military-technology oligarchy producing war simulations, gaming engines, antivirus software, and KOWN guard robotic units.",
    coreBusiness: "Cyber Warfare, Artificial Intelligence Development, KOWN Manufacturing Facilities",
    systemRole: "Wards off hacker attacks threatening the System while keeping the public occupied with cyber sports and virtual arenas.",
    assets: [
      { name: "KOWN Defense Assembly Line", description: "AI-controlled, heavily armed cyber guard robotic assembly lines." },
      { name: "Hack Wars Arenas", description: "Digital gladiator sports where hackers legally battle one another in massive public virtual arenas." },
      { name: "Tencon Shield Antivirus", description: "AI-based dynamic cyber shields protecting the System from external intrusions." }
    ],
    influence: {
      economy: 9,
      technology: 9,
      media: 7,
      military: 9,
      logistics: 6,
      energy: 6,
      publicTrust: 5
    },
    relations: [
      { target: "agrom", type: "dependent", description: "Dependent on Agrom's database security to protect its own KOWN firmware logs." }
    ],
    tags: ["KOWN Manufacturer", "Antivirus Producer", "Hack Wars", "AI Forge"],
    visualIdentity: {
      colors: ["#ff1e27", "#0c0e14", "#1a080a"],
      architecture: "Massive dome arenas and AI casting forges designed with chrome metallic surfaces, neon red, and matte black lines."
    },
    classifiedNote: "Tencon is the true military power of the System in defense and army sectors. Talented hackers discovered in the Hack Wars arenas are forcibly drafted into the forces.",
    images: {
      portrait: "/media/corporations/tencon/xying-portrait.jpg",
      magazine: "/media/corporations/tencon/magazine-cover.jpg",
      cityDay: "/media/corporations/tencon/city-aerial.jpg",
      cityCenter: "/media/corporations/tencon/city-arena.jpg",
      cityBrochure: "/media/corporations/tencon/city-street-node.jpg",
      citySunset: "/media/corporations/tencon/city-bangkok.jpg",
      cityExtra: "/media/corporations/tencon/city-hongkong.jpg",
      cityExtra2: "/media/corporations/tencon/city-arena-gate.jpg",
      cityExtra3: "/media/corporations/tencon/city-arena-inside.jpg"
    }
  },
  {
    id: "qualty",
    name: "Qualty Prime / Quality Energy",
    displayName: "Qualty Energy",
    leader: "James",
    leaderTitle: "Reactor General",
    accent: "#d4af37",
    cityName: "Solaris A & Solaris B",
    tagline: "Every city needs light. James decides who receives it.",
    overview: "The energy backbone managing reactor networks and space mining operations that keep the System and megacities alive.",
    coreBusiness: "Space Mining, Nuclear/Plasma Reactors, Power Grid Distribution",
    systemRole: "Holds direct political leverage over civil administrations and other corporations by threatening to cut energy feeds.",
    assets: [
      { name: "Orbital Collector Arrays", description: "Massive satellite arrays collecting solar energy and transmitting it to megacity reactors via microwave beams." },
      { name: "Asteroid Mining Fleet", description: "Orbital space mining vessels transporting heavy plasma reactor raw materials." },
      { name: "Plasma Reactor Towers", description: "Massive power centers feeding entire cities, where shutdowns would trigger existential catastrophes." }
    ],
    influence: {
      economy: 8,
      technology: 8,
      media: 4,
      military: 6,
      logistics: 7,
      energy: 10,
      publicTrust: 5
    },
    relations: [
      { target: "ubless", type: "dependent", description: "Completely dependent on Ubless logistics networks to transport space minerals and reactor raw materials." }
    ],
    tags: ["Energy Conglomerate", "Space Mining", "Reactor Grid", "System Power"],
    visualIdentity: {
      colors: ["#d4af37", "#0c0e14", "#1a1508"],
      architecture: "Industrial megatowers featuring golden energy conduits, matte black reactor spires, launchpads, and spaceports."
    },
    classifiedNote: "James is a political figure ruthless enough to drop his polished mask in times of crisis and issue directives for siber dictatorship.",
    images: {
      portrait: "/media/corporations/qualty/james-portrait.jpg",
      magazine: "/media/corporations/qualty/magazine-cover.jpg",
      cityDay: "/media/corporations/qualty/city-capital.jpg",
      cityCenter: "/media/corporations/qualty/city-space-mining.jpg",
      cityBrochure: "/media/corporations/qualty/city-mining-telemetry.jpg",
      citySunset: "/media/corporations/qualty/city-day-street.jpg",
      cityExtra: "/media/corporations/qualty/city-night-street.jpg"
    }
  },
  {
    id: "ubless",
    name: "Ubless Transport & Data",
    displayName: "Ubless",
    leader: "John",
    leaderTitle: "Grid Director",
    accent: "#00f5d4",
    cityName: "Nexum City",
    tagline: "The world moves because Ubless allows it to move.",
    overview: "The movement monopolist controlling both physical logistics and siber data highways. Manages inter-city vacuum tubes and sub-oceanic fiber cables.",
    coreBusiness: "Physical Logistics, Data Highways, Global Fiber Infrastructure",
    systemRole: "Capable of sabotaging tactical situations by cutting or throttling communications, cargo flows, and troop transfers.",
    assets: [
      { name: "Trans-City Vacuum Tubes", description: "Ultra-fast magnetic capsule train networks transporting passengers and cargo between cities." },
      { name: "Global Undersea Cables", description: "Armored fiber optic oceanic backbones carrying data transfers between System continents." },
      { name: "Orbital Cargo Ring", description: "Orbital logistics station networks delivering raw materials mined in space to the surface." }
    ],
    influence: {
      economy: 9,
      technology: 7,
      media: 5,
      military: 5,
      logistics: 10,
      energy: 7,
      publicTrust: 6
    },
    relations: [
      { target: "qualty", type: "ally", description: "Maintains a strategic partnership with James due to energy transit and space mining integration." }
    ],
    tags: ["Global Logistics", "Data Routes", "System Engines", "Cable Authority"],
    visualIdentity: {
      colors: ["#00f5d4", "#008f7a", "#070c0f"],
      architecture: "Massive cable conduits lined with turquoise lights, cargo docks, tunnels, and constantly moving magnetic container terminals."
    },
    classifiedNote: "John holds the logistical power to completely shift balances inside the System during war periods by altering transit priority protocols.",
    images: {
      portrait: "/media/corporations/ubless/john-portrait.jpg",
      magazine: "/media/corporations/ubless/magazine-cover.jpg",
      cityDay: "/media/corporations/ubless/city-nexus-center.jpg",
      cityCenter: "/media/corporations/ubless/city-nexus-aerial.jpg",
      cityBrochure: "/media/corporations/ubless/city-quantum-transport.jpg",
      citySunset: "/media/corporations/ubless/city-day-street.jpg",
      cityExtra: "/media/corporations/ubless/city-night-street.jpg"
    }
  },
  {
    id: "social-media",
    name: "Social Media Oligarchy",
    displayName: "Social Media",
    leader: "Brett Perkins",
    leaderTitle: "Trend Sovereign",
    accent: "#ff4d6d",
    cityName: "Aulam",
    tagline: "They do not own truth. They own the speed of belief.",
    overview: "A temporary oligarchy member hosting social media platforms, public relations algorithms, and core data backup servers.",
    coreBusiness: "Social Media, Perception Management, Viral Propaganda",
    systemRole: "Obscures realities by manipulating public opinion and designs viral campaigns in favor of the System.",
    assets: [
      { name: "Aulam Main & Backup Cores", description: "Twin core servers storing social data, trend history, and cognitive maps of billions of users." },
      { name: "Perception Core Shield", description: "An AI shield scanning user belief speeds and ideological inclinations in real-time." },
      { name: "Viral Broadcast Syndicate", description: "Automated bot armies converting fake news on the net into absolute reality within seconds." }
    ],
    influence: {
      economy: 6,
      technology: 7,
      media: 9,
      military: 3,
      logistics: 6,
      energy: 4,
      publicTrust: 4
    },
    relations: [
      { target: "nets", type: "rival", description: "Attempts to provoke alternative communication channels to break Madam Anne's media hegemony." }
    ],
    tags: ["Perception Core", "Aulam", "Trend Authority", "Weakest Link"],
    visualIdentity: {
      colors: ["#ff4d6d", "#1e90ff", "#050508"],
      architecture: "Glitchy megascreens, constantly shifting holographic billboards, and red neon grids surrounding the besieged data servers."
    },
    classifiedNote: "The Social Media Oligarchy was identified by Swos forces as the 'weakest link,' resulting in the seizure of the two main data hubs (Main and Backup Core) in Aulam.",
    images: {
      portrait: "/media/corporations/social-media/brett-portrait.png",
      magazine: "/media/corporations/social-media/magazine-cover.jpg",
      cityDay: "/media/corporations/social-media/city-courtyard.jpg",
      cityCenter: "/media/corporations/social-media/city-corporate-tower.jpg",
      cityBrochure: "/media/corporations/social-media/city-canal-walk.jpg",
      destruction: [
        "/media/corporations/social-media/destruction/destruction-outside.jpg",
        "/media/corporations/social-media/destruction/destruction-hud.jpg",
        "/media/corporations/social-media/destruction/destruction-stages.jpg"
      ]
    }
  },
  {
    id: "miner-henry",
    name: "Miner Henry Empire",
    displayName: "Miner Henry Empire",
    leader: "Miner Henry",
    leaderTitle: "Altcoin Overlord",
    accent: "#d6a84f",
    cityName: "Hexcity",
    tagline: "Gold above. Screams beneath.",
    overview: "The heart of IOHcoin and Altcoin mining. The absolute ruler of the massive mining city consisting of hundreds of thousands of hexagonal combs.",
    coreBusiness: "Currency Mining, Secret Passage Networks, KOWN Labor Management",
    systemRole: "Coordinates the cryptocurrency mining that sustains the System's financial cycles through underground slave labor forces.",
    assets: [
      { name: "Hexagonal Mining Cells", description: "Hundreds of thousands of hexagonal hives where workers mine IOHcoin for weeks without leaving." },
      { name: "Tula AI Guardian", description: "A massive AI guardian system programmed to suppress mining riots and prevent unauthorized escapes." },
      { name: "Secret Access Portals", description: "Hidden tunnels stretching from underground mines to the System's core, bypassing Corporate Union supervision." }
    ],
    influence: {
      economy: 10,
      technology: 8,
      media: 3,
      military: 7,
      logistics: 6,
      energy: 9,
      publicTrust: 2
    },
    relations: [
      { target: "agrom", type: "ally", description: "Maintains secret agreements to provide backdoor access to the IOHcoin core based on an old partnership with Steve Agrom." }
    ],
    tags: ["Iohcoin Mining", "Hexcity", "Altcoin Market", "Hidden Entry"],
    visualIdentity: {
      colors: ["#d6a84f", "#18140f", "#080605"],
      architecture: "Industrial contrast featuring warm golden sparkles, massive hexagonal cylinder structures, desert dust, and dark coal/metal textures."
    },
    classifiedNote: "The extreme exploitation and inhumane conditions beneath Hexcity are the birthing grounds for the largest labor rebellions inside the System.",
    images: {
      portrait: "/media/corporations/henry/henry-portrait.jpg",
      magazine: "/media/corporations/henry/magazine-cover.jpg",
      cityDay: "/media/corporations/henry/city-deep-street.jpg",
      cityCenter: "/media/corporations/henry/city-hexagonal-layout.jpg",
      destruction: [
        "/media/corporations/henry/destruction/olympus-dimension.jpg"
      ]
    }
  }
];
