export type Web3ProviderId = "metamask" | "walletconnect";

export type Web3NetworkConfig = {
  blockExplorerUrl?: string;
  chainId: number;
  enabled: boolean;
  name: string;
  nativeCurrency: string;
  rpcUrlEnvKey?: string;
  slug: string;
};

export const WEB3_LIVE_FEATURES = {
  nftClaim: false,
  nftSales: false,
  tokenDistribution: false,
  tokenTransfer: false
} as const;

export const WEB3_NETWORKS: Web3NetworkConfig[] = [
  {
    blockExplorerUrl: "https://etherscan.io",
    chainId: 1,
    enabled: false,
    name: "Ethereum Mainnet",
    nativeCurrency: "ETH",
    slug: "ethereum-mainnet"
  },
  {
    blockExplorerUrl: "https://sepolia.etherscan.io",
    chainId: 11155111,
    enabled: true,
    name: "Ethereum Sepolia",
    nativeCurrency: "ETH",
    slug: "ethereum-sepolia"
  },
  {
    blockExplorerUrl: "https://polygonscan.com",
    chainId: 137,
    enabled: false,
    name: "Polygon Mainnet",
    nativeCurrency: "MATIC",
    slug: "polygon-mainnet"
  }
];

export const WEB3_PROVIDERS: Record<
  Web3ProviderId,
  {
    displayName: string;
    requiresProjectId: boolean;
  }
> = {
  metamask: {
    displayName: "MetaMask",
    requiresProjectId: false
  },
  walletconnect: {
    displayName: "WalletConnect",
    requiresProjectId: true
  }
};

export function getEnabledChainIds() {
  return WEB3_NETWORKS.filter((network) => network.enabled).map((network) => network.chainId);
}

export function isSupportedWalletChain(chainId: number | null) {
  if (!chainId) return true;

  return WEB3_NETWORKS.some((network) => network.chainId === chainId);
}

export function getWalletSignatureTtlMinutes() {
  const rawValue = process.env.WEB3_SIGNATURE_TTL_MINUTES;
  const parsed = rawValue ? Number.parseInt(rawValue, 10) : 10;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
}
