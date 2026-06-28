export type CharacterPower = {
  name: string;
  description: string;
};

export type CharacterStat = {
  label: string;
  value: number;
};

export type CharacterProfile = {
  id: string;
  name: string;
  accent: string;
  image: string;
  role: string;
  expertise: string;
  organization: string;
  tagline: string;
  bio: string;
  powers: CharacterPower[];
  weaknesses: string[];
  tags: string[];
  stats: CharacterStat[];
  posterImage?: string;
};

export const characters: CharacterProfile[] = [
  {
    id: "algus",
    name: "Algus",
    accent: "#e7c574",
    image: "/media/characters/algus-portrait.jpg",
    posterImage: "/media/characters/algus-poster.jpg",
    role: "Strategic Architect / Hacker",
    expertise: "Cyber Security, Strategy, Leadership",
    organization: "Agrom Technology / Rebellion",
    tagline: "Not forgotten within the System; he is a suppressed threat.",
    bio: "Wakes up in a new body after being frozen for twenty years. His past is fragmented, his memory is incomplete, but his hacking reflexes remain alive. His story is not that of a hero, but of loss, accusation, and a consciousness marching to the heart of the System. Algus is the team's chief strategist, leader, and most dangerous hacker. He doesn't just write code; he disrupts the System's logic from within.",
    powers: [
      {
        name: "High-Level Hacking",
        description: "Cyber penetration capabilities capable of infiltrating banks, corporations, voting systems, and high-security architectures."
      },
      {
        name: "Ego Control",
        description: "Controlling identity, body codes, memory logs, and energy resources through Ego (the internal operating system of the System)."
      },
      {
        name: "KOWN Command",
        description: "Commanding KOWN units for algorithmic attacks, diversions, shield cracking, and systemic pressure."
      },
      {
        name: "Forbidden Portal Access",
        description: "Ability to construct connection gateways into hidden deepweb nodes. Portals are regarded as forbidden urban legends within the System."
      }
    ],
    weaknesses: [
      "Memory voids and psychological triggers.",
      "Clouded judgment regarding Shila, Elia, Agrom City, and Matt.",
      "Excessive KOWN casualties and operational costs when locked onto targets."
    ],
    tags: ["System Breaker", "Forbidden Portal User", "KOWN Commander", "Core Hacker", "The Survivor of Agrom City"],
    stats: [
      { label: "Hacking", value: 10 },
      { label: "Strategy", value: 10 },
      { label: "KOWN Command", value: 9 },
      { label: "Combat", value: 8 },
      { label: "Leadership", value: 9 },
      { label: "Emotional Coherence", value: 5 }
    ]
  },
  {
    id: "mina",
    name: "Mina",
    accent: "#ff5b7f",
    image: "/media/characters/mina-portrait.jpg",
    posterImage: "/media/characters/mina-poster.jpg",
    role: "Visual Tech / Tactical Defense",
    expertise: "Visual Technology, Tactical Defense, Espionage",
    organization: "Independent / IOH Network",
    tagline: "The intellect that strikes from where the System cannot see.",
    bio: "Her strength is not brute force, but her capacity to reshape perception, visual arrays, and the battlefield environment. Mina is far more than a fighter: she is a visual tech specialist, tactical analyst, and the moral compass of the team. She acts as both protector and inquisitor to Algus.",
    powers: [
      {
        name: "Mirror Dimension",
        description: "Projecting visual reflections of the battlefield to mask real coordinates and redirect incoming enemy attacks."
      },
      {
        name: "Optic Camouflage",
        description: "Deploying advanced optic cloaks, decoy holograms, and environmental sensor scanning systems."
      },
      {
        name: "Defensive Shield",
        description: "Erecting high-energy data firewalls to protect the team from algorithmic attacks."
      },
      {
        name: "Frequency Covert",
        description: "Masking team signature signals completely from System scanners."
      }
    ],
    weaknesses: [
      "Wide-area shield barriers consume high energy loads.",
      "Deep guilt over failed defenses or civilian casualties.",
      "Vulnerable when her defensive capabilities or loyalty are questioned."
    ],
    tags: ["Mirror Dimension User", "Visual Architect", "Battlefield Controller", "EagleEye Tracker", "Moral Compass"],
    stats: [
      { label: "Visual Tech", value: 10 },
      { label: "Defense", value: 9 },
      { label: "Tactical Intel", value: 9 },
      { label: "KOWN Mastery", value: 8 },
      { label: "Combat", value: 8 },
      { label: "Energy Reserve", value: 7 }
    ]
  },
  {
    id: "kevin",
    name: "Kevin",
    accent: "#78c7ff",
    image: "/media/characters/kevin-portrait.jpg",
    posterImage: "/media/characters/kevin-poster.jpg",
    role: "Military Cyber Soldier / Field Commander",
    expertise: "Code & Combat, Network Security, Cyber Tactics",
    organization: "Core Systems / Swos Veteran",
    tagline: "The commander carrying old-world military discipline into the System's code wars.",
    bio: "Knows the code, knows the fight, knows the orders. But his greatest battle is not outside; it is between the old order he once served and the realities crumbling before him. Kevin is the team's military commander, field leader, and network soldier. His Swos background makes him unstoppable in siber combat.",
    powers: [
      {
        name: "Hybrid Combat Style",
        description: "Fusing cyber security software tools with physical military tactics."
      },
      {
        name: "Network Blackout",
        description: "Instantly blocking regional networks and communication channels in tactical operations."
      },
      {
        name: "Antivirus Hijack",
        description: "Reverse-engineering System defense mechanisms into defensive shields for the team."
      },
      {
        name: "Dual Blade & Frost Tools",
        description: "Engaging with code-integrated close combat blades and programs that freeze enemy ego units."
      }
    ],
    weaknesses: [
      "Blind spots due to loyalty to Matt and old system structures.",
      "Lacks Algus's wide architectural vision; overly dependent on chain of command.",
      "Limited tactical flexibility; over-focuses on pragmatism."
    ],
    tags: ["Cyber Soldier", "Network Breaker", "Antivirus Hijacker", "Dual Blade Fighter", "Swos Veteran"],
    stats: [
      { label: "Close Combat", value: 9 },
      { label: "Network Warfare", value: 9 },
      { label: "Leadership", value: 8 },
      { label: "Hacking", value: 8 },
      { label: "KOWN Command", value: 7 },
      { label: "Flexibility", value: 6 }
    ]
  },
  {
    id: "mike",
    name: "Mike",
    accent: "#6f9bff",
    image: "/media/characters/mike-portrait.jpg",
    posterImage: "/media/characters/mike-poster.jpg",
    role: "Software Engineer / Telecom Specialist",
    expertise: "Software Engineering, Telecom, Modification Combat",
    organization: "Helloway / Rebels",
    tagline: "The engineer who doesn't believe in the impossible, but learned to fight inside it.",
    bio: "At first, he seems like a young software executive from Helloway. Yet, time proves him to be a calculating mind, executing strategic modifications and directing KOWN units on the field. He is the operational engineering brain of the rebellion.",
    powers: [
      {
        name: "IoT & 5G Dominance",
        description: "Instantly hacking and redirecting IoT devices, mobile towers, and wide telecommunication networks."
      },
      {
        name: "Molecular Solvent",
        description: "Algorithmic dissolving commands that break down physical or digital barriers at the molecular level."
      },
      {
        name: "Pixel Fragmentation",
        description: "Deconstructing regional feed lines to create blind spots in enemy tracking sensors."
      },
      {
        name: "EMP Augmentation",
        description: "Deploying electromagnetic waves that paralyze siber signals across entire blocks."
      }
    ],
    weaknesses: [
      "Severe skepticism towards anomalies or events that defy scientific explanation.",
      "Integration and trust issues due to joining the team later.",
      "Excessive search for safety parameters due to doubt and intellectual pride."
    ],
    tags: ["Software Director", "5G / IoT Specialist", "KOWN Operator", "Molecular Solvent User", "Pixel Fragmentation Fighter"],
    stats: [
      { label: "Software & Telecom", value: 10 },
      { label: "KOWN Command", value: 9 },
      { label: "Modifications", value: 9 },
      { label: "Strategy", value: 8 },
      { label: "Adaptability", value: 8 },
      { label: "Intuition", value: 5 }
    ]
  },
  {
    id: "elia",
    name: "Elia",
    accent: "#65e6df",
    image: "/media/characters/elia-portrait.jpg",
    posterImage: "/media/characters/elia-poster.jpg",
    role: "Cyber Forensic / System Analyst",
    expertise: "Forensic Inquest, Cyber Security, Data Tracking",
    organization: "MIT / CISA Connection",
    tagline: "The silent intellect of the System wars.",
    bio: "She may not be the most visible fighter on the front line, but she is the one tracking attacks, separating truth from deception, and keeping Algus's humanity alive. Her MIT research on election system breaches makes her a legend in the archives.",
    powers: [
      {
        name: "Cyber Forensic Inquiry",
        description: "Recovering and analyzing deleted files, encrypted databases, and historical log trails."
      },
      {
        name: "Digital Fingerprint Tracking",
        description: "Identifying identities and coordinates by tracing siber attackers' digital footprints."
      },
      {
        name: "Intrusion Detection",
        description: "Spotting the smallest security loopholes, backdoors, and leaks in network architectures."
      },
      {
        name: "Emotional Anchor",
        description: "Maintaining human bonds, moral conscience, objective evidence, and Algus's mental stability."
      }
    ],
    weaknesses: [
      "No physical combat training; direct combat power is weak.",
      "Overly bound to truth and evidence; struggles with strategic deceptions.",
      "Vulnerable to stress and emotional friction within the team."
    ],
    tags: ["Cyber Forensic Analyst", "Digital Fingerprint Tracker", "Truth Seeker", "Moral Anchor", "Heart of Algus"],
    stats: [
      { label: "Data Analytics", value: 9 },
      { label: "Cyber Security", value: 8 },
      { label: "Intuition", value: 8 },
      { label: "Emotional Intel", value: 10 },
      { label: "Combat Power", value: 4 },
      { label: "Moral Strength", value: 9 }
    ]
  }
];
