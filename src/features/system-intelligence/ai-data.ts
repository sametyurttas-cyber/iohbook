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
    description: "KAI, System’in merkezi quantum zekâ katmanıdır. İnsanların System içinde yaptığı eylemleri hesaplar, işler, yeniden kurar ve kaydeder. Organik bedenin yerini kod aldığı için, insanın varlığı artık yalnızca bedene değil, sürekli çalışan bir hesaplama düzenine bağlıdır.\n\nKAI bu düzenin merkezinde durur. Hareket, hafıza, beden kodu, şehir içi varoluş ve sistemsel kayıtlar onun hesaplama alanına girer.\n\nBu yüzden KAI sıradan bir yapay zekâ değildir. System’de yaşamın devamlılığını mümkün kılan akıldır.",
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
    description: "CoreWit’ler, KAI’nin komutlarını uygulayan alt yapay zekâ birimleridir. İnşa eder, işler, siler, düzenler ve yeniden kurarlar.\n\nİnsanlar System’de şehirleri, bedenleri ve eylemleri deneyimler; fakat bu deneyimlerin arkasında sürekli çalışan görünmez bir işlem katmanı vardır. CoreWit’ler bu katmandır.\n\nOnlar merkezi karar verici değildir. Fakat kararların uygulanmasını sağlarlar. Bu yüzden System’in sessiz işçileri gibilerdir.",
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
    description: "Antivirüs birimleri, System’in savunma refleksleridir. Core’ları, shield sistemlerini, firewall’ları ve yüksek güvenlikli bölgeleri korurlar.\n\nKOWN’lardan daha büyük, daha hızlı, daha akıllı ve daha dayanıklıdırlar. Savaş alanında sessiz hareket ederler; gözleri yoktur ama hedefi kaçırmazlar.\n\nOnları tehlikeli yapan yalnızca güçleri değildir. Devamlılıklarıdır. Bir kez saldırı başladığında baskıyı sürdürür, çoğalır, alanı kapatır ve saldıran tarafı sistematik şekilde tüketirler.",
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
    description: "KOWN’lar, System içinde kullanılan askerî yapay zekâ birimleridir. İnsan boyutunda, silahlı, emir kodlu ve toplu hareket edebilen yapılar olarak tasarlanmışlardır.\n\nYalnızca savaşta kullanılmazlar. Firewall baskısı, shield kırma, maden işçiliği, dikkat dağıtma ve büyük ölçekli sistem operasyonlarında da görev alabilirler.\n\nKOWN’ların asıl gücü tekil kapasiteleri değil, toplu hareket edebilmeleridir. Doğru komut altında binlercesi aynı hedefe yönelir, aynı noktayı tekrar tekrar zorlar ve kendi yok oluşlarını bile operasyonun parçası haline getirebilir.",
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
    mainRole: "Varoluşu hesaplamak",
    strength: "Quantum hesaplama",
    weakness: "Bozulursa System çöker",
    color: "#d8f3ff"
  },
  {
    aiClass: "CoreWit",
    mainRole: "KAI komutlarını uygulamak",
    strength: "Görünmez işlem gücü",
    weakness: "KAI’ye bağımlı",
    color: "#9be7ff"
  },
  {
    aiClass: "Antivirüs",
    mainRole: "Savunma ve imha",
    strength: "Dayanıklılık, takip",
    weakness: "Friendly signal, eski protokoller",
    color: "#ff4d4d"
  },
  {
    aiClass: "KOWN",
    mainRole: "Savaş ve operasyon",
    strength: "Toplu itaat, sayı gücü",
    weakness: "Antivirüse göre zayıf, komuta bağımlı",
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
    desc: "Tehlike seviyesi: Orta / toplu kullanımda yüksek",
    color: "#b8bcc8"
  },
  {
    classId: "antivirus",
    name: "ANTIVIRUS",
    level: "High",
    desc: "Tehlike seviyesi: Yüksek",
    color: "#ff4d4d"
  },
  {
    classId: "corewit",
    name: "COREWIT",
    level: "Critical if accessed",
    desc: "Tehlike seviyesi: Erişim sağlanırsa kritik",
    color: "#9be7ff"
  },
  {
    classId: "kai",
    name: "KAI",
    level: "Existential",
    desc: "Tehlike seviyesi: Varoluşsal",
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
    question: "KOWN sahada nasıl davranır?",
    behavior: "Komut alır, formasyon kurar, hedefe yürür. Gerekirse binlercesi aynı savunma noktasına çarparak kendini harcar. Bireysel hayatta kalma refleksi zayıftır; operasyon başarısı önceliklidir.",
    color: "#b8bcc8"
  },
  {
    name: "Antivirüs",
    question: "Antivirüs sahada nasıl davranır?",
    behavior: "Tespit eder, kilitlenir, takip eder ve baskıyı artırır. Savunma alanına giren tehdidi yalnızca durdurmaya değil, tamamen silmeye çalışır.",
    color: "#ff4d4d"
  },
  {
    name: "CoreWit",
    question: "CoreWit sahada nasıl görünür?",
    behavior: "Genellikle görünmezdir. Doğrudan savaşmaz. Fakat ortamın, beden kodlarının ve sistemsel süreçlerin arka planında çalışır. Onun etkisi sonuçlarda görülür.",
    color: "#9be7ff"
  },
  {
    name: "KAI",
    question: "KAI sahada nasıl görünür?",
    behavior: "KAI bir asker gibi sahaya çıkmaz. Fakat her şeyin hesaplandığı üst katmanda yer alır. Savaş alanındaki varoluş, kayıt, beden devamlılığı ve sistem tepkileri onun hesaplama düzenine bağlıdır.",
    color: "#d8f3ff"
  }
];
