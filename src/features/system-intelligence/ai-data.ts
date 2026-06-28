export interface AiClassData {
  id: string;
  name: string;
  codename: string;
  slogan: string;
  sloganTr: string;
  description: string;
  function: string;
  domain: string;
  risk?: string;
  strength?: string;
  weakness?: string;
  symbolicRole: string;
  image: string;
  color: string;
}

export const aiClasses: AiClassData[] = [
  {
    id: "kai",
    name: "KAI",
    codename: "Central Quantum Intelligence",
    slogan: "It does not think like a human. It calculates the conditions for humans to exist.",
    sloganTr: "İnsan gibi düşünmez. İnsanın var olabilmesi için gereken koşulları hesaplar.",
    description: "KAI is the central quantum intelligence layer of the System. It calculates, processes, reconstructs, and records all human activities within the System. Since physical bodies are replaced by data, human existence is no longer tied to biology, but to a continuously running computational matrix. KAI stands at the core of this matrix. Action, memory, body codes, urban existence, and system registries all fall under its computational domain. Thus, KAI is not a simple AI; it is the mind that makes the continuity of life possible within the System.",
    function: "Existence calculation",
    domain: "Quantum identity / body code / memory continuity",
    risk: "If corrupted, System existence collapses",
    symbolicRole: "The false god of the System",
    image: "/media/encyclopedia/ai/kai.jpg",
    color: "#d8f3ff"
  },
  {
    id: "corewit",
    name: "COREWITS",
    codename: "The Execution Layer",
    slogan: "KAI commands. CoreWits make it real.",
    sloganTr: "KAI emreder. CoreWit’ler onu gerçeğe dönüştürür.",
    description: "CoreWits are sub-intelligence units that execute KAI's commands. They build, process, delete, organize, and reconstruct. While humans experience cities, bodies, and actions in the System, there is a invisible processing layer running constantly in the background. CoreWits are that layer. They are not central decision-makers, but they execute those decisions. They are the silent workers of the System.",
    function: "Build / process / delete / reconstruct",
    domain: "Body codes / environment / data execution",
    risk: "Access to CoreWits means access to System mechanics",
    symbolicRole: "The angels of KAI",
    image: "/media/encyclopedia/ai/corewit.jpg",
    color: "#9be7ff"
  },
  {
    id: "antivirus",
    name: "ANTIVIRUS",
    codename: "The Immune System of the System",
    slogan: "Built to protect. Designed to erase.",
    sloganTr: "Korumak için üretildi. Silmek için tasarlandı.",
    description: "Antiviruses are the defensive reflexes of the System. They guard cores, shield networks, firewalls, and high-security zones. They are larger, faster, smarter, and more durable than KOWN units. They move silently across battlefields; they have no eyes, yet they never miss a target. What makes them dangerous is not just their force, but their persistence. Once an attack starts, they maintain pressure, replicate, seal boundaries, and systematically consume the threat.",
    function: "Defense / detection / elimination",
    domain: "Core security / firewall / shield protection",
    strength: "High durability / fast response / adaptive pressure",
    weakness: "Old admin protocols / friendly signal deception / perception traps",
    symbolicRole: "The immune cells of the System",
    image: "/media/encyclopedia/ai/antivirus.jpg",
    color: "#ff4d4d"
  },
  {
    id: "kown",
    name: "KOWN",
    codename: "Military Artificial Intelligence Units",
    slogan: "They do not question. They execute.",
    sloganTr: "Sorgulamazlar. Uygularlar.",
    description: "KOWNs are military artificial intelligence units used within the System. They are human-sized, armed, command-coded, and designed to operate in masses. They are not only used in war; they also serve in firewall pressure, shield cracking, mining labor, distraction, and large-scale system operations. The true strength of KOWNs lies in collective coordination rather than individual capacity. Under proper directives, thousands will lock onto the same target, repeat the pressure, and turn their own destruction into an operational success log.",
    function: "War / labor / system pressure / operation support",
    domain: "Battlefields / mining cities / core attacks / diversion operations",
    strength: "Mass coordination / obedience / expendability",
    weakness: "Lower durability than Antivirus / command dependency / hackable chain",
    symbolicRole: "The expendable soldiers of the System",
    image: "/media/encyclopedia/ai/kown.jpg",
    color: "#b8bcc8"
  }
];

export interface MatrixRow {
  aiClass: string;
  mainRole: string;
  strength: string;
  weakness: string;
  color: string;
}

export const matrixData: MatrixRow[] = [
  {
    aiClass: "KAI",
    mainRole: "Existence calculation",
    strength: "Quantum computation",
    weakness: "If corrupted, the System collapses",
    color: "#d8f3ff"
  },
  {
    aiClass: "CoreWit",
    mainRole: "Executing KAI directives",
    strength: "Invisible processing power",
    weakness: "Dependent on KAI commands",
    color: "#9be7ff"
  },
  {
    aiClass: "Antivirus",
    mainRole: "Defense and elimination",
    strength: "High durability, tracking",
    weakness: "Friendly signals, legacy admin protocols",
    color: "#ff4d4d"
  },
  {
    aiClass: "KOWN",
    mainRole: "Combat and operations",
    strength: "Mass coordination, numbers",
    weakness: "Weaker than Antivirus, command dependent",
    color: "#b8bcc8"
  }
];

export interface ThreatClass {
  classId: string;
  name: string;
  level: string;
  desc: string;
  color: string;
}

export const threatClasses: ThreatClass[] = [
  {
    classId: "kown",
    name: "KOWN",
    level: "Medium / High in mass deployment",
    desc: "Security Threat Level: Medium / High in mass deployment",
    color: "#b8bcc8"
  },
  {
    classId: "antivirus",
    name: "ANTIVIRUS",
    level: "High",
    desc: "Security Threat Level: High",
    color: "#ff4d4d"
  },
  {
    classId: "corewit",
    name: "COREWIT",
    level: "Critical if accessed",
    desc: "Security Threat Level: Critical if accessed",
    color: "#9be7ff"
  },
  {
    classId: "kai",
    name: "KAI",
    level: "Existential",
    desc: "Security Threat Level: Existential",
    color: "#d8f3ff"
  }
];

export interface FieldBehavior {
  name: string;
  question: string;
  behavior: string;
  color: string;
}

export const fieldBehaviors: FieldBehavior[] = [
  {
    name: "KOWN",
    question: "How does KOWN behave in the field?",
    behavior: "Receives directives, forms coordinates, and advances to the target. If needed, thousands will expend themselves against a defensive wall. Individual survival reflexes are non-existent; operational success is paramount.",
    color: "#b8bcc8"
  },
  {
    name: "Antivirus",
    question: "How does Antivirus behave in the field?",
    behavior: "Detects, locks on, tracks, and increases system pressure. Attempts to not only halt the threat entering the defensive zone, but completely purge it.",
    color: "#ff4d4d"
  },
  {
    name: "CoreWit",
    question: "How does CoreWit appear in the field?",
    behavior: "Usually invisible. Does not engage in direct combat. Operates silently behind environments, body codes, and system processes. Its impact is seen only in final execution results.",
    color: "#9be7ff"
  },
  {
    name: "KAI",
    question: "How does KAI appear in the field?",
    behavior: "KAI never deploys to the field as a soldier. Instead, it operates in the highest layer where everything is calculated. Survival, logging, body continuity, and system responses on the battlefield depend entirely on its computational order.",
    color: "#d8f3ff"
  }
];
