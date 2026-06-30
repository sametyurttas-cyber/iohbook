export type EncyclopediaCharacter = {
  accent: string;
  id: string;
  image: string;
  name: string;
  organization: string;
  role: string;
  summary: string;
};

export type EncyclopediaCity = {
  accent: string;
  id: string;
  image: string;
  name: string;
  organization: string;
  population: string;
  status: string;
  summary: string;
};

export const characters: EncyclopediaCharacter[] = [
  {
    accent: "#e7c574",
    id: "algus",
    image: "/media/encyclopedia/characters/algus.webp",
    name: "Algus",
    organization: "Agrom Technology",
    role: "Strategic Architect",
    summary:
      "The mind behind Agrom's deepest systems; a quiet architect whose decisions shape the balance between cities, cores and power."
  },
  {
    accent: "#ff5b7f",
    id: "mina",
    image: "/media/encyclopedia/characters/mina.webp",
    name: "Mina",
    organization: "Independent / IOH Network",
    role: "Field Operative",
    summary:
      "A precision operative moving between physical conflict and digital consciousness, carrying fragments of a past the system cannot erase."
  },
  {
    accent: "#78c7ff",
    id: "kevin",
    image: "/media/encyclopedia/characters/kevin.webp",
    name: "Kevin",
    organization: "Core Systems",
    role: "Systems Interface",
    summary:
      "A rare interface between human intuition and machine logic, able to read the invisible architecture beneath every connected city."
  },
  {
    accent: "#6f9bff",
    id: "mike",
    image: "/media/encyclopedia/characters/mike.webp",
    name: "Mike",
    organization: "States Union",
    role: "Tactical Commander",
    summary:
      "A frontline commander trained for battles where territory, memory and identity are all contested at the same time."
  },
  {
    accent: "#65e6df",
    id: "elia",
    image: "/media/encyclopedia/characters/elia.webp",
    name: "Elia",
    organization: "Unknown Cell",
    role: "Signal Hunter",
    summary:
      "A signal hunter operating beyond official networks, tracing the human stories hidden inside corrupted archives and forbidden cores."
  }
];

export const cities: EncyclopediaCity[] = [
  {
    accent: "#e7c574",
    id: "agrom-prime",
    image: "/media/encyclopedia/cities/agrom-prime.webp",
    name: "Agrom Prime",
    organization: "Agrom Technology",
    population: "12.8M registered minds",
    status: "Core active",
    summary:
      "A gold-lit industrial capital built around extraction, computation and the first architecture of the IOH economy."
  },
  {
    accent: "#ff5b7f",
    id: "orion-city",
    image: "/media/encyclopedia/cities/orion-city.webp",
    name: "Orion City",
    organization: "Corporate Union",
    population: "8.4M registered minds",
    status: "Attention grid online",
    summary:
      "A sleepless commercial capital where attention is measured, traded and engineered into the most valuable resource of the age."
  },
  {
    accent: "#ff5b5b",
    id: "tencon-city",
    image: "/media/encyclopedia/cities/tencon-city.webp",
    name: "Tencon City",
    organization: "Tencon",
    population: "6.9M registered minds",
    status: "Restricted sectors",
    summary:
      "A fortified red network city whose towers protect an oligarchy of industrial intelligence, defense systems and private data routes."
  },
  {
    accent: "#a9b7d6",
    id: "solaris-nexus",
    image: "/media/encyclopedia/cities/solaris-nexus.webp",
    name: "Solaris Nexus",
    organization: "States Union",
    population: "10.1M registered minds",
    status: "Administrative control",
    summary:
      "The administrative spine of the States Union, designed to project stability while monitoring every route through the global system."
  },
  {
    accent: "#78c7ff",
    id: "nexus",
    image: "/media/encyclopedia/cities/nexus.webp",
    name: "Nexus",
    organization: "Ubless / Nets",
    population: "15.2M registered minds",
    status: "Fully connected",
    summary:
      "The most connected city on Earth: a vertical civilization where transport, identity and consciousness share a single infrastructure."
  }
];

export const factions = [
  {
    accent: "#a9b7d6",
    domain: "Governance / Security",
    mark: "SU",
    name: "States Union",
    summary: "A global authority built around stability, order and centralized continuity."
  },
  {
    accent: "#ff5b7f",
    domain: "Markets / Influence",
    mark: "CU",
    name: "Corporate Union",
    summary: "The alliance controlling attention, capital and the infrastructure of desire."
  },
  {
    accent: "#e7c574",
    domain: "Research / Systems",
    mark: "AT",
    name: "Agrom Technology",
    summary: "Architects of core technology, resource systems and synthetic civilization."
  },
  {
    accent: "#a064ff",
    domain: "Networks / Data",
    mark: "N",
    name: "Nets",
    summary: "A distributed network organization operating between official and hidden layers."
  },
  {
    accent: "#ff5b5b",
    domain: "Industry / Defense",
    mark: "T",
    name: "Tencon",
    summary: "A private industrial power whose security systems govern entire urban sectors."
  },
  {
    accent: "#e3b75e",
    domain: "Energy / Mining",
    mark: "QE",
    name: "Quality Energy",
    summary: "The energy network that turns planetary resources into system-scale power."
  },
  {
    accent: "#78c7ff",
    domain: "Infrastructure / Transit",
    mark: "U",
    name: "Ubless",
    summary: "The invisible infrastructure connecting cities, cores and consciousness routes."
  }
] as const;

export const technologies = [
  {
    accent: "#e7c574",
    category: "Consciousness Infrastructure",
    code: "01",
    name: "IOH",
    summary: "The architecture that allows identity to continue beyond the physical body."
  },
  {
    accent: "#78c7ff",
    category: "System Architecture",
    code: "02",
    name: "Core Systems",
    summary: "City-scale computational hearts coordinating memory, transport and control."
  },
  {
    accent: "#a064ff",
    category: "Cognitive Protocol",
    code: "03",
    name: "KOWN",
    summary: "A protocol for mapping knowledge, intent and identity across connected minds."
  },
  {
    accent: "#65e6df",
    category: "Quantum Infrastructure",
    code: "04",
    name: "Quantum Servers",
    summary: "Entangled processing arrays preserving consciousness at planetary scale."
  },
  {
    accent: "#ff5b5b",
    category: "Identity Sanction",
    code: "05",
    name: "Deletion",
    summary: "The irreversible removal of a consciousness signature from the active system."
  },
  {
    accent: "#a9b7d6",
    category: "Preservation State",
    code: "06",
    name: "Frozen",
    summary: "A suspended state where memory remains intact but agency is denied."
  }
] as const;

export const timeline = [
  {
    event: "The first conceptual notes of IOH are recorded.",
    title: "The Question",
    year: "2007"
  },
  {
    event: "Early consciousness transfer research moves from theory into restricted labs.",
    title: "The Threshold",
    year: "2011"
  },
  {
    event: "The first system architecture linking memory, identity and remote presence appears.",
    title: "The Prototype",
    year: "2012"
  },
  {
    event: "Humanity now lives in cities and inside the systems that govern them.",
    title: "The IOH Era",
    year: "2303"
  }
] as const;
