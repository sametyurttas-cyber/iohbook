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
    summary: "SWOS, Great Collapse sonrası eski ulusların kalıntılarından doğan federal yönetim mekanizmasıdır. System’i, quantum şehirlerini ve hâlâ eski dünyaya bağlı ekonomik damarları tek merkezden yönetir.",
    publicPromise: "Sürekli düzen, kaos ve anarşiye karşı mutlak koruma, tüm vatandaşlar için istikrarlı bir süreklilik.",
    hiddenCost: "Seçim mekanizmalarının olmadığı, mutlak gözetim, sınırlandırılmış bireysel özgürlük ve ölümden sonra bile zorunlu kayıt altyapısı."
  },
  
  institutions: [
    {
      name: "Executive Office of the President",
      description: "President Matt liderliğinde System'in en yüksek karar mercii. Acil durum protokollerini yürütür.",
      leakedInfo: "Seçim mekanizması barındırmaz. Devlet, üç yüz yıllık sürekliliğe sahip bürokratik bir makine olarak çalışır."
    },
    {
      name: "Council of Ministers",
      description: "Ekonomi, savunma ve teknoloji politikalarını koordine eden federal meclis.",
      leakedInfo: "Şirketler Birliği temsilcileriyle arka kapıda yapılan gizli anlaşmaların ve tavizlerin asıl onay merciidir."
    },
    {
      name: "Federal Security Directorate",
      description: "System genelinde kamu düzenini ve veri kalkanlarını yöneten emniyet birimi.",
      leakedInfo: "Sivil isyanları bastırmak ve System'e izinsiz portal açan tehdit aktörlerini ortadan kaldırmak için kurulan askeri polis teşkilatı."
    }
  ],
  
  infrastructure: [
    {
      name: "World-Currency Core",
      type: "currency",
      description: "Eski dünyada yaşayan insanların para kayıtları ve siber aktarımları.",
      leakedInfo: "Quantum entanglement kullanarak her satın alma ve finansal hareketi gecikmesiz olarak takip eder ve loglar."
    },
    {
      name: "Iohcoin Core",
      type: "currency",
      description: "System içi para damarı ve kuantum veri tabanı.",
      leakedInfo: "SWOS'un ekonomiyi köleleştirmek ve vatandaşları sürekli borç döngüsünde tutmak için kullandığı ana enstrüman."
    },
    {
      name: "Tax Cores",
      type: "currency",
      description: "Tüm bağlı dünyalardan vergi ve kaynak kesintisi yapan veri çekirdeği.",
      leakedInfo: "Bağımsız madencilerin kazandığı tokenların %34'üne otomatik olarak el koyan gizli kod parçacıkları barındırır."
    },
    {
      name: "Military Command Grids",
      type: "military",
      description: "Yörünge uyduları, savunma kalkanları ve drone orduları komuta şebekesi.",
      leakedInfo: "Citadel isyanlarında şehirleri yok etmek üzere programlanmış acil durum lazer protokollerini yönetir."
    }
  ],
  
  crisisArchive: [
    {
      id: "ARCHIVE 001",
      title: "Great Collapse",
      publicVersion: "Eski ulusların ekonomik ve sivil yetersizlikleri nedeniyle kaçınılmaz dağılışı.",
      classifiedVersion: "States Union kurucuları ve dev holding ortaklarının kaynakları kontrol etmek için planladığı yapay kriz dalgası.",
      severity: "critical"
    },
    {
      id: "ARCHIVE 002",
      title: "Founding of the System",
      publicVersion: "İnsan bilincini ölümün ötesinde korumak için tasarlanan siber-cennet.",
      classifiedVersion: "Enerji kimliklerini quantum bilgisayarlara aktararak insanlığı ebedi ve kaçışı olmayan bir iş gücüne dönüştürme projesi.",
      severity: "high"
    },
    {
      id: "ARCHIVE 003",
      title: "Agrom City Incident",
      publicVersion: "Dış halka reaktörlerindeki ufak bir teknik arızanın kontrol altına alınması.",
      classifiedVersion: "Steve Agrom ile SWOS arasındaki yetki paylaşım kavgası sonucu sızdırılan virüsün sebep olduğu binlerce veri silinmesi.",
      severity: "critical"
    },
    {
      id: "ARCHIVE 004",
      title: "Centrium Breach",
      publicVersion: "Bozucu unsurlar tarafından yapılan lokal bir bina sabotajı.",
      classifiedVersion: "Başkent Centrium'un merkez sunucularına yapılan sızma sonucu bağlı dünyaların ekonomilerini çökerten büyük siber yıkım.",
      severity: "critical"
    }
  ]
};
