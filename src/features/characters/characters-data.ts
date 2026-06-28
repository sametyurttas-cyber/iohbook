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
    expertise: "Hacking, Strateji, Liderlik",
    organization: "Agrom Technology / Rebellion",
    tagline: "System'in içinde unutulmuş değil; bastırılmış bir tehdittir.",
    bio: "Yirmi yıl donmuş halde kaldıktan sonra yeni bir bedende uyanır. Geçmişi parçalanmıştır, hafızası eksiktir, fakat içindeki hacker refleksi hâlâ canlıdır. Onun hikâyesi bir kahramanın değil, kaybın, suçlamanın ve sistemin kalbine yürüyen bir bilincin hikâyesidir. Algus takımın ana stratejisti, lideri ve en tehlikeli hackerı. Sadece kod yazan biri değil; System'in mantığını içeriden bozabilen bir liderdir.",
    powers: [
      {
        name: "Üst seviye hacking",
        description: "Bankalara, şirketlere, seçim sistemlerine ve yüksek güvenlikli yapılara sızabilecek seviyede siber sızma kabiliyeti."
      },
      {
        name: "Ego kullanımı",
        description: "Ego (System'deki iç işletim sistemi) üzerinden kimlik, beden kodları, hafıza dosyaları ve enerji yönetimini kontrol etme."
      },
      {
        name: "KOWN komutası",
        description: "KOWN birliklerini algoritmik saldırı, dikkat dağıtma, kalkan kırma ve sistem zayıflatma aracı olarak yönetme."
      },
      {
        name: "Portal / yasak teknoloji",
        description: "Deepweb sahnelerinde portal açabilme yeteneği. Portal, System içinde yasak veya kayıp bir şehir efsanesi olarak kabul edilir."
      }
    ],
    weaknesses: [
      "Hafıza boşlukları ve duygusal tetiklenme.",
      "Shila, Elia, Agrom City ve Matt konusunun kararlarını bulanıklaştırması.",
      "Hedefe kilitlendiğinde KOWN kayıplarını ve operasyon maliyetini aşırı seviyelere taşıması."
    ],
    tags: ["System Breaker", "Forbidden Portal User", "KOWN Commander", "Core Hacker", "The Survivor of Agrom City"],
    stats: [
      { label: "Hacking", value: 10 },
      { label: "Strateji", value: 10 },
      { label: "KOWN Kontrolü", value: 9 },
      { label: "Savaş", value: 8 },
      { label: "Liderlik", value: 9 },
      { label: "Duygusal Denge", value: 5 }
    ]
  },
  {
    id: "mina",
    name: "Mina",
    accent: "#ff5b7f",
    image: "/media/characters/mina-portrait.jpg",
    posterImage: "/media/characters/mina-poster.jpg",
    role: "Visual Tech / Tactical Defense",
    expertise: "Görsel Teknoloji, Taktik Analiz, Savunma",
    organization: "Independent / IOH Network",
    tagline: "System'in görmediği yerden saldıran zekâdır.",
    bio: "Onun gücü kaba kuvvet değil; algıyı, görüntüyü ve savaş alanının şeklini değiştirebilmesidir. Mina bir savaşçıdan çok daha fazlası: görsel teknoloji uzmanı, taktik analist ve takımın ahlaki frenlerinden biri. Algus'un yanında hem koruyucu hem de sorgulayıcı bir rol üstlenir.",
    powers: [
      {
        name: "Mirror Dimension",
        description: "Savaş alanının yansımasını oluşturarak gerçek koordinatları maskeleme ve düşman atışlarını saptırma."
      },
      {
        name: "Görsel teknoloji ustalığı",
        description: "Gelişmiş optik kamuflaj, yanıltıcı hologramlar ve çevre tarama sistemleri yönetimi."
      },
      {
        name: "KOWN savunma duvarı",
        description: "Gelen algoritmik saldırılara karşı takımı koruyan yüksek enerjili veri kalkanı."
      },
      {
        name: "Friendly signal kamuflajı",
        description: "Takım sinyallerini System tarayıcılarından tamamen gizleyen frekans örtüsü."
      }
    ],
    weaknesses: [
      "Geniş alan duvarları ve optik illüzyonlar aşırı enerji tüketir.",
      "Ağır sorumluluk duygusu; başarısız savunmalarda ve sivil kayıplarında derin suçluluk hissi.",
      "Gurur ve koruyucu rolünün sorgulanması durumunda kırılganlaşma."
    ],
    tags: ["Mirror Dimension User", "Visual Architect", "Battlefield Controller", "EagleEye Tracker", "Moral Compass"],
    stats: [
      { label: "Görsel Teknoloji", value: 10 },
      { label: "Savunma", value: 9 },
      { label: "Taktik Zekâ", value: 9 },
      { label: "KOWN Kullanımı", value: 8 },
      { label: "Savaş", value: 8 },
      { label: "Enerji", value: 7 }
    ]
  },
  {
    id: "kevin",
    name: "Kevin",
    accent: "#78c7ff",
    image: "/media/characters/kevin-portrait.jpg",
    posterImage: "/media/characters/kevin-poster.jpg",
    role: "Military Cyber Soldier / Field Commander",
    expertise: "Code & Combat, Network Güvenliği, Siber Taktik",
    organization: "Core Systems / Swos Veteran",
    tagline: "Eski dünyanın asker disiplinini System’in kod savaşlarına taşıyan adamdır.",
    bio: "Kod bilir, savaş bilir, emir bilir. Ama en büyük çatışması dışarıda değil; sadakat duyduğu eski düzen ile gözünün önünde yıkılan gerçekler arasındadır. Kevin takımın askeri lideri, saha komutanı ve network savaşçısıdır. CISA geçmişi ve Swos bağlantıları onu siber sahada yıkılmaz kılar.",
    powers: [
      {
        name: "Code + combat uzmanlığı",
        description: "Hem yazılımsal siber güvenlik hem de fiziksel askeri taktikleri birleştiren hibrit dövüş tarzı."
      },
      {
        name: "Network kesme",
        description: "Saha operasyonlarında düşman iletişim kanallarını ve bölgesel ağ hatlarını anında bloke etme."
      },
      {
        name: "Antivirüs ele geçirme",
        description: "Sistem savunma mekanizmalarını tersine mühendislikle takımın koruma kalkanına dönüştürme."
      },
      {
        name: "Çift kılıç ve frost tools",
        description: "Kod entegreli yakın dövüş silahları ve düşman ego birimlerini donduran yazılımlar."
      }
    ],
    weaknesses: [
      "Eski otoritelere ve Matt'e duyduğu aşırı güven nedeniyle bazı gerçeklere kör kalabilme.",
      "Algus kadar geniş bir vizyona sahip olmama; emir-komuta zincirine fazla bağlılık.",
      "Taktiksel esneklik noksanlığı ve pratik çözümlere aşırı odaklanma."
    ],
    tags: ["Cyber Soldier", "Network Breaker", "Antivirus Hijacker", "Dual Blade Fighter", "Swos Veteran"],
    stats: [
      { label: "Yakın Dövüş", value: 9 },
      { label: "Network Savaşı", value: 9 },
      { label: "Liderlik", value: 8 },
      { label: "Hacking", value: 8 },
      { label: "KOWN Kontrolü", value: 7 },
      { label: "Esneklik", value: 6 }
    ]
  },
  {
    id: "mike",
    name: "Mike",
    accent: "#6f9bff",
    image: "/media/characters/mike.jpg",
    role: "Software Engineer / Telecom Specialist",
    expertise: "Yazılım, Telekom, Modifikasyon Savaşı",
    organization: "Helloway / Rebels",
    tagline: "İmkânsıza inanmayan ama imkânsızın ortasında savaşmayı öğrenen mühendistir.",
    bio: "Başta sadece Helloway'in genç yazılım yöneticisi gibi görünür. Fakat zamanla onun yalnızca iyi bir yazılımcı değil, savaş alanında hesap yapan, modifikasyonları stratejik kullanan ve KOWN yönetebilen özel bir zihin olduğu anlaşılır. Takımın operasyonel mühendislik beynidir.",
    powers: [
      {
        name: "Software & 5G uzmanlığı",
        description: "IoT cihazlarını, mobil kuleleri ve geniş veri ağlarını anlık hackleme ve yönlendirme yetisi."
      },
      {
        name: "Molecular Solvent",
        description: "Fiziksel veya dijital engelleri moleküler düzeyde çözen algoritmik eritici komutlar."
      },
      {
        name: "Pixel Fragmentation",
        description: "Bölgesel görüntü akışını parçalayarak düşman sensörlerinde kör noktalar oluşturma."
      },
      {
        name: "EMP Augmentation",
        description: "Taşınabilir donanımlarla bölgesel siber sinyalleri felç eden elektromanyetik dalga üretimi."
      }
    ],
    weaknesses: [
      "Mühendis mantığıyla açıklayamadığı bilim dışı veya anomali olaylara karşı aşırı direnç gösterme.",
      "Takıma sonradan katıldığı için zaman zaman baş gösteren entegrasyon ve güven problemleri.",
      "Kibir ve şüpheci yapısı nedeniyle planlarda aşırı güvenlik arayışı."
    ],
    tags: ["Software Director", "5G / IoT Specialist", "KOWN Operator", "Molecular Solvent User", "Pixel Fragmentation Fighter"],
    stats: [
      { label: "Yazılım/Telekom", value: 10 },
      { label: "KOWN Kontrolü", value: 9 },
      { label: "Modifikasyon", value: 9 },
      { label: "Strateji", value: 8 },
      { label: "Uyum Sağlama", value: 8 },
      { label: "Sezgi", value: 5 }
    ]
  },
  {
    id: "elia",
    name: "Elia",
    accent: "#65e6df",
    image: "/media/characters/elia.jpg",
    role: "Cyber Forensic / System Analyst",
    expertise: "Adli Analiz, Siber Güvenlik, Veri İzleme",
    organization: "MIT / CISA Connection",
    tagline: "System savaşlarının sessiz zekâsıdır.",
    bio: "O cephede en çok görünen savaşçı olmayabilir; ama saldırıların izini süren, yalanla gerçeği ayıran ve Algus'un insan tarafını canlı tutan en önemli figürlerden biridir. MIT geçmişi ve seçim hack'i araştırması onu veri tabanlarında bir efsane yapmıştır.",
    powers: [
      {
        name: "Cyber forensic analiz",
        description: "Silinmiş verileri, şifreli arşivleri ve log dosyalarını geriye dönük kurtarıp analiz etme."
      },
      {
        name: "Hacker fingerprint takibi",
        description: "Siber saldırganların dijital ayak izlerini takip ederek kimlik ve lokasyon tespiti yapma."
      },
      {
        name: "Sistem güvenliği zekâsı",
        description: "Ağ mimarilerindeki en küçük sızıntı ve arka kapıları saniyeler içinde saptama."
      },
      {
        name: "Duygusal dengeleyici",
        description: "Takım içindeki insani bağları, vicdanı, kanıt tarafını ve Algus'un duygusal dengesini koruma."
      }
    ],
    weaknesses: [
      "Fiziksel savaş eğitimi bulunmaması; doğrudan çatışma gücünün diğer karakterlere kıyasla zayıf olması.",
      "Doğrulara ve kanıtlara aşırı sadakat; stratejik yalanlar karşısında bocalama.",
      "Duygusal kırılganlık ve takımdaki gerilimlerden yüksek derecede etkilenme."
    ],
    tags: ["Cyber Forensic Analyst", "Digital Fingerprint Tracker", "Truth Seeker", "Moral Anchor", "Algus'un Kalbi"],
    stats: [
      { label: "Veri Analizi", value: 9 },
      { label: "Siber Güvenlik", value: 8 },
      { label: "Sezgi", value: 8 },
      { label: "Duygusal Zekâ", value: 10 },
      { label: "Savaş Gücü", value: 4 },
      { label: "Ahlaki Güç", value: 9 }
    ]
  }
];
