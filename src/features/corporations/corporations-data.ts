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
    accent: "#e7c574", // Gold
    cityName: "Agrom City",
    tagline: "The company that did not sell technology. It sold the future.",
    overview: "Corporate Union'ın kurucu gücü ve teknolojik omurgası. Quantum şehir mimarileri ve veri aktarım teknolojilerinde mutlak tekel sahibi dev holding.",
    coreBusiness: "Quantum Altyapı, Beden/Kimlik Aktarımı, IOHcoin Çekirdek Sistemi",
    systemRole: "Bilinç aktarım sunucularını ve System mimarisini kontrol ederek insan ölümsüzlüğünü ticarileştirir.",
    assets: [
      { name: "Quantum City Servers", description: "Şehir zihinlerini ve insan hafızalarını barındıran devasa soğuk veri kuleleri." },
      { name: "IOHcoin Core Infrastructure", description: "System genelinde kullanılan resmi para biriminin quantum veri tabanı ve dağıtım ağı." },
      { name: "Body Transfer Laboratories", description: "Bilinçlerin yeni biyolojik veya sentetik bedenlere göçünü sağlayan patentli aktarım kapsülleri." },
      { name: "Corporate Union Authority", description: "Şirketler Birliği üzerinde kurucu olmaktan gelen nihai veto ve yönlendirme hakkı." }
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
      { target: "nets", type: "complex", description: "Medya ve halkla ilişkiler desteği alırken, Mina'nın geliştirdiği görsel teknolojiler üzerinde patent savaşı yürütüyor." },
      { target: "miner-henry", type: "ally", description: "Miner Henry, Steve Agrom'un eski dostu olup IOHcoin madencilik hatlarında gizli geçiş yolları sağlamaktadır." }
    ],
    tags: ["System Architect", "IOHcoin Founder Network", "Quantum Infrastructure", "Agrom City"],
    visualIdentity: {
      colors: ["#e7c574", "#ffffff", "#0c0e14"],
      architecture: "Kule şeklinde dev sunucu mimarileri, steril cam laboratuvarlar, bilinç kapsülleri ve altın kaplama logo işlemeleri."
    },
    classifiedNote: "Agrom City'nin yıkılışı ve Steve Agrom'un itibar kaybı, Matt'in manipülasyonları sonucu gerçekleşmiştir. Agrom City, zihinlerin ve yapay ölümsüzlüğün merkezidir.",
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
    accent: "#a200ff", // Cyber Purple
    cityName: "Orion City",
    tagline: "They do not control what people see. They control what people want to see.",
    overview: "Medya, reklam ve görsel gerçeklik pazarlarını yöneten algı imparatorluğu. System'in rüyalar ve eğlence üreten yüzü.",
    coreBusiness: "Eğlence Endüstrisi, Sanal Festivaller, Holografik Yayıncılık",
    systemRole: "İnsanların duygu durumlarını ve arzularını manipüle ederek System'e karşı oluşabilecek isyanları engeller.",
    assets: [
      { name: "Orion Broadcast Network", description: "Bütün megacity gökdelenlerini ve gökyüzünü kaplayan devasa holografik reklam ve yayın uyduları." },
      { name: "Perception Mapping Systems", description: "Toplumun anlık duygu durumunu tarayarak propaganda içeriklerini kişiselleştiren AI algoritmaları." },
      { name: "Interactive Cinema Blocks", description: "Gerçek zamanlı sinirsel bağlantıyla izleyicinin içine girdiği sınırsız sanal rüya yapımları." }
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
      { target: "agrom", type: "complex", description: "Agrom'un quantum altyapısına bağımlıdır fakat yayın tekelini kullanarak pazarlık gücünü korur." },
      { target: "social-media", type: "rival", description: "Bilgi akışının ve reklam gelirlerinin kontrolü konusunda Brett Perkins ile sürekli bir çekişme halindedir." }
    ],
    tags: ["Media Empire", "Perception Control", "Orion City", "Visual Reality"],
    visualIdentity: {
      colors: ["#a200ff", "#6b00b3", "#08040d"],
      architecture: "Yatay mimariye sahip saraylar, neon pembe ve mor ışık selleriyle kaplı sonsuz sokak partileri ve gökyüzü hologramları."
    },
    classifiedNote: "Mina'nın geliştirdiği devrimsel görsel filtre ve zaman kilitleme uygulaması, Nets marketine girmek zorunda bırakılmış ve Nets tarafından asimile edilmiştir.",
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
    accent: "#ff1e27", // Cyber Red
    cityName: "Tencon City",
    tagline: "Where war became a game, and games learned how to kill.",
    overview: "Savaş simülasyonları, gaming, antivirüs yazılımları ve KOWN koruyucu robot ünitelerini üreten askeri-teknoloji oligarşisi.",
    coreBusiness: "Siber Savaş, Yapay Zekâ Geliştirme, KOWN Üretim Fabrikaları",
    systemRole: "System'i tehdit eden hacker saldırılarını savuştururken, halkı siber sporlar ve sanal arenalarla meşgul tutar.",
    assets: [
      { name: "KOWN Defense Assembly Line", description: "Yapay zeka kontrollü, ağır silahlarla donatılmış siber muhafız robot üretim hatları." },
      { name: "Hack Wars Arenas", description: "Hacker'ların halka açık dev sanal arenalarda yasal olarak birbiriyle savaştığı dijital gladyatör sporları." },
      { name: "Tencon Shield Antivirus", description: "System'i dış sızmalardan koruyan, yapay zeka tabanlı dinamik siber kalkan." }
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
      { target: "agrom", type: "dependent", description: "Kendi ürettiği KOWN yazılımlarını korumak için Agrom'un veri tabanı güvenliğine bağımlıdır." }
    ],
    tags: ["KOWN Manufacturer", "Antivirus Producer", "Hack Wars", "AI Forge"],
    visualIdentity: {
      colors: ["#ff1e27", "#0c0e14", "#1a080a"],
      architecture: "Krom metal yüzeyler, neon kırmızı ve mat siyah çizgilerle tasarlanmış devasa kubbe arenalar ve yapay zeka dökümhaneleri."
    },
    classifiedNote: "Tencon, ordu ve güvenlik alanında System'in asıl askeri gücüdür. Hack Wars arenalarında keşfedilen yetenekli hackerlar zorla orduya dahil edilir.",
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
    accent: "#d4af37", // Gold
    cityName: "Solaris A & Solaris B",
    tagline: "Every city needs light. James decides who receives it.",
    overview: "System'in ve megacity'lerin hayatta kalmasını sağlayan reaktör zinciri ve space mining operasyonlarını yöneten enerji omurgası.",
    coreBusiness: "Uzay Madenciliği, Nükleer/Plazma Reaktörleri, Güç Dağıtımı",
    systemRole: "Enerji akışını kesmekle tehdit ederek sivil yönetim ve diğer şirketler üzerinde doğrudan siyasi şantaj gücüne sahiptir.",
    assets: [
      { name: "Orbital Collector Arrays", description: "Güneş enerjisini toplayıp mikrodalga ışınlarıyla megacity reaktörlerine aktaran dev uydu halkaları." },
      { name: "Asteroid Mining Fleet", description: "Ağır plazma reaktör hammaddelerini taşımak üzere yörüngede görev yapan uzay maden gemileri." },
      { name: "Plasma Reactor Towers", description: "Bütün şehirleri besleyen, durdurulması felakete yol açacak devasa enerji merkezleri." }
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
      { target: "ubless", type: "dependent", description: "Uzay madenlerinin ve reaktör hammaddelerinin taşınması için tamamen Ubless lojistik hatlarına bağımlıdır." }
    ],
    tags: ["Energy Conglomerate", "Space Mining", "Reactor Grid", "System Power"],
    visualIdentity: {
      colors: ["#d4af37", "#0c0e14", "#1a1508"],
      architecture: "Altın sarısı enerji hatları ve mat siyah kaplama reaktör kuleleri, roket rampaları ve uzay limanları ile kaplı endüstriyel dev kuleler."
    },
    classifiedNote: "James, kriz anlarında gösterişli maskesini düşürüp siber diktatörlük çağrıları yapabilecek kadar acımasız bir politik figürdür.",
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
    accent: "#00f5d4", // Cyber Turquoise
    cityName: "Nexum City",
    tagline: "The world moves because Ubless allows it to move.",
    overview: "Hem fiziksel lojistiği hem de siber veri yollarını elinde tutan hareket tekelcisi. Şehirler arası tünelleri ve okyanus altı kabloları yönetir.",
    coreBusiness: "Fiziksel Lojistik, Veri Otoyolları, Global Fiber Ağ Altyapısı",
    systemRole: "İletişimi, mal akışını ve ordu transferlerini keserek veya yavaşlatarak savaş durumlarını sabote edebilir.",
    assets: [
      { name: "Trans-City Vacuum Tubes", description: "Şehirler arası insan ve Kargo taşımacılığı yapan ultra hızlı manyetik kapsül tren ağları." },
      { name: "Global Undersea Cables", description: "System kıtaları arasındaki veri transferini sağlayan zırhlı fiber optik okyanus omurgası." },
      { name: "Orbital Cargo Ring", description: "Uzaydan gelen madenleri şehirlere ulaştıran yörüngesel lojistik istasyon zinciri." }
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
      { target: "qualty", type: "ally", description: "Enerji taşımacılığı ve space mining entegrasyonu sebebiyle James ile stratejik bir ortaklığa sahiptir." }
    ],
    tags: ["Global Logistics", "Data Routes", "System Engines", "Cable Authority"],
    visualIdentity: {
      colors: ["#00f5d4", "#008f7a", "#070c0f"],
      architecture: "Turkuaz ışıklı hatlarla örülmüş dev kablo kanalları, yük limanları, tüneller ve sürekli hareket eden manyetik konteyner terminalleri."
    },
    classifiedNote: "John, savaş zamanlarında lojistik öncelik kurallarını değiştirerek System içindeki dengeleri tamamen değiştirebilecek lojistik güce sahiptir.",
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
    accent: "#ff4d6d", // Glitch Red
    cityName: "Aulam",
    tagline: "They do not own truth. They own the speed of belief.",
    overview: "Sosyal medya platformları, halkla ilişkiler algoritmaları ve veri yedekleme sunucularını barındıran geçici oligarşi üyesi.",
    coreBusiness: "Sosyal Medya, Algı Yönetimi, Viral Propaganda",
    systemRole: "Kamuoyunu manipüle ederek gerçekleri perdeler ve System lehine viral kampanyalar tasarlar.",
    assets: [
      { name: "Aulam Main & Backup Cores", description: "Milyarlarca insanın sosyal verisini, trend geçmişini ve zihinsel haritasını saklayan devasa iki çekirdek sunucu." },
      { name: "Perception Core Shield", description: "Kullanıcıların inanç hızlarını ve fikir eğilimlerini anlık tarayan yapay zeka zırhı." },
      { name: "Viral Broadcast Syndicate", description: "İnternet üzerindeki yalan haberleri saniyeler içinde gerçeğe dönüştüren otomatik bot orduları." }
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
      { target: "nets", type: "rival", description: "Madam Anne'in medya hegemonyasını kırmak için alternatif iletişim kanallarını provoke etmeye çalışıyor." }
    ],
    tags: ["Perception Core", "Aulam", "Trend Authority", "Weakest Link"],
    visualIdentity: {
      colors: ["#ff4d6d", "#1e90ff", "#050508"],
      architecture: "Glitchli dev ekranlar, sürekli değişen holografik panolar ve kuşatma altındaki veri sunucularını çevreleyen kırmızı neon ışıklar."
    },
    classifiedNote: "Social Media Oligarchy, Swos kuvvetleri tarafından 'en zayıf halka' olarak tespit edilmiş ve Aulam'daki iki büyük veri çekirdeği (Main ve Backup Core) ele geçirilmiştir.",
    images: {
      portrait: "/media/corporations/social-media/brett-portrait.jpg",
      magazine: "/media/corporations/social-media/magazine-cover.png"
    }
  },
  {
    id: "miner-henry",
    name: "Miner Henry Empire",
    displayName: "Miner Henry Empire",
    leader: "Miner Henry",
    leaderTitle: "Altcoin Overlord",
    accent: "#d6a84f", // Warm Honey Gold
    cityName: "Hexcity",
    tagline: "Gold above. Screams beneath.",
    overview: "IOHcoin ve Altcoin madenciliğinin kalbi. Yüz binlerce hexagon petekten oluşan devasa maden şehrinin mutlak sahibi.",
    coreBusiness: "Para Madenciliği, Gizli Geçit Ağları, KOWN İş Gücü Yönetimi",
    systemRole: "System'in finansal döngüsünü ayakta tutan kripto para madenciliğini yeraltı köle iş gücüyle yönetir.",
    assets: [
      { name: "Hexagonal Mining Cells", description: "İşçilerin haftalarca çıkmadan IOHcoin kazdığı yüz binlerce altıgen petek hücresi." },
      { name: "Tula AI Guardian", description: "Maden isyanlarını ve kaçak geçişleri engellemek üzere programlanmış devasa yapay zeka muhafız sistemi." },
      { name: "Secret Access Portals", description: "Şirketler Birliği denetiminden uzak, yeraltı madenlerinden System merkez çekirdeğine uzanan gizli tüneller." }
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
      { target: "agrom", type: "ally", description: "Steve Agrom ile eski ortaklığa dayanarak IOHcoin core sistemine arka kapı geçişleri sağlamak üzere gizli anlaşmaları bulunur." }
    ],
    tags: ["Iohcoin Mining", "Hexcity", "Altcoin Market", "Hidden Entry"],
    visualIdentity: {
      colors: ["#d6a84f", "#18140f", "#080605"],
      architecture: "Sarı sıcak altın parıltıları, devasa altıgen silindir yapılar, çöl tozu ve yeraltı kömür/metal rengi kontrastı."
    },
    classifiedNote: "Hexcity hücrelerinin altında yatan aşırı sömürü ve insanlık dışı çalışma koşulları, System içindeki en büyük işçi isyanlarının doğuş noktasıdır.",
    images: {
      portrait: "/media/characters/algus-portrait.jpg" // Fallback portrait
    }
  }
];
