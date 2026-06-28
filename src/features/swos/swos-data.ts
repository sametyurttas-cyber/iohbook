export interface SwosProfile {
  officialName: string;
  commonName: string;
  motto: string;
  capital: string;
  headquarters: string;
  leader: string;
  governmentType: string;
  establishedAfter: string;
  
  identity: {
    summary: string;
    publicPromise: string;
    hiddenCost: string;
  };
  
  institutions: {
    name: string;
    description: string;
    leakedInfo: string;
  }[];
  
  infrastructure: {
    name: string;
    type: "currency" | "military" | "ministry" | "technology" | "security";
    description: string;
    leakedInfo: string;
  }[];
  
  crisisArchive: {
    id: string;
    title: string;
    publicVersion: string;
    classifiedVersion: string;
    severity: "low" | "medium" | "high" | "critical";
  }[];
}

export const swosData: SwosProfile = {
  officialName: "System World States Union",
  commonName: "SWOS",
  motto: "ORDER BEYOND DEATH",
  capital: "Centrium",
  headquarters: "Swos Headquarters",
  leader: "President Matt",
  governmentType: "Federal Governing Mechanism",
  establishedAfter: "Great Collapse",
  
  identity: {
    summary: "SWOS is the federal governing mechanism born from the ruins of old nations following the Great Collapse. It centrally manages the System, quantum cities, and the economic pipelines still connected to the old world.",
    publicPromise: "Continuous order, absolute protection against chaos and anarchy, and stable continuity for all citizens.",
    hiddenCost: "Absence of electoral mechanisms, absolute surveillance, restricted individual liberties, and a mandatory registration infrastructure even after death."
  },
  
  institutions: [
    {
      name: "Executive Office of the President",
      description: "The highest decision-making authority of the System led by President Matt. Executes emergency protocols.",
      leakedInfo: "Contains no electoral mechanism. The state functions as a bureaucratic machine with three hundred years of continuity."
    },
    {
      name: "Council of Ministers",
      description: "The federal assembly coordinating economic, defense, and technological policies.",
      leakedInfo: "The actual approval authority for secret back-door agreements and concessions made with Corporate Union representatives."
    },
    {
      name: "Federal Security Directorate",
      description: "The law enforcement agency managing public order and data shields throughout the System.",
      leakedInfo: "A military police force established to suppress civil rebellions and eliminate threat actors opening unauthorized portals into the System."
    }
  ],
  
  infrastructure: [
    {
      name: "World-Currency Core",
      type: "currency",
      description: "Financial registries and siber transfers of citizens residing in the old world.",
      leakedInfo: "Traces and logs every purchase and financial movement without delay using quantum entanglement."
    },
    {
      name: "Iohcoin Core",
      type: "currency",
      description: "The financial pipeline and quantum database within the System.",
      leakedInfo: "The main instrument utilized by SWOS to enslave the economy and lock citizens in a continuous debt cycle."
    },
    {
      name: "Tax Cores",
      type: "currency",
      description: "The data core executing tax and resource deductions from all connected worlds.",
      leakedInfo: "Contains hidden code snippets that automatically seize 34% of tokens earned by independent miners."
    },
    {
      name: "Military Command Grids",
      type: "military",
      description: "Command network for orbital satellites, defensive shields, and drone armies.",
      leakedInfo: "Manages emergency laser protocols programmed to eliminate cities in the event of Citadel uprisings."
    }
  ],
  
  crisisArchive: [
    {
      id: "ARCHIVE 001",
      title: "Great Collapse",
      publicVersion: "The inevitable dissolution of old nations due to economic and civil failures.",
      classifiedVersion: "An artificial wave of crises planned by the States Union founders and major corporate partners to consolidate resource control.",
      severity: "critical"
    },
    {
      id: "ARCHIVE 002",
      title: "Founding of the System",
      publicVersion: "A siber-paradise engineered to protect human consciousness beyond the boundaries of death.",
      classifiedVersion: "A project designed to transfer energy identities into quantum computing grids, turning humanity into an eternal and inescapable labor force.",
      severity: "high"
    },
    {
      id: "ARCHIVE 003",
      title: "Agrom City Incident",
      publicVersion: "The containment of a minor technical failure in the outer ring reactors.",
      classifiedVersion: "Massive data deletions caused by a virus leaked during a power sharing conflict between Steve Agrom and SWOS.",
      severity: "critical"
    },
    {
      id: "ARCHIVE 004",
      title: "Centrium Breach",
      publicVersion: "A localized building sabotage executed by disruptive elements.",
      classifiedVersion: "A major siber disruption that collapsed connected world economies, triggered by an infiltration into the capital Centrium's central servers.",
      severity: "critical"
    }
  ]
};
