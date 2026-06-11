"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { completeWalletLink, prepareWalletLink } from "@/features/wallets/actions";
import type { WalletLink, WalletProvider } from "@/types/database";

type EthereumProvider = {
  request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

type WalletConnectPanelProps = {
  pendingLinks: WalletLink[];
  projectId?: string;
};

function getPendingLinkForAddress(links: WalletLink[], address: string) {
  return links.find(
    (link) => link.status === "pending" && link.normalized_address === address.toLowerCase()
  );
}

function parseChainId(chainId: string) {
  return chainId.startsWith("0x") ? Number.parseInt(chainId, 16) : Number.parseInt(chainId, 10);
}

export function WalletConnectPanel({ pendingLinks, projectId }: WalletConnectPanelProps) {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("");
  const [provider, setProvider] = useState<WalletProvider>("metamask");
  const [signature, setSignature] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<EthereumProvider | null>(null);
  const [isPending, startTransition] = useTransition();
  const pendingLink = useMemo(
    () => getPendingLinkForAddress(pendingLinks, address),
    [address, pendingLinks]
  );

  async function connectMetaMask() {
    setStatus(null);

    if (!window.ethereum) {
      setStatus("MetaMask tarayici eklentisi bulunamadi.");
      return;
    }

    const accounts = await window.ethereum.request<string[]>({
      method: "eth_requestAccounts"
    });
    const currentChain = await window.ethereum.request<string>({
      method: "eth_chainId"
    });

    setProvider("metamask");
    setActiveProvider(window.ethereum);
    setAddress(accounts[0] ?? "");
    setChainId(String(parseChainId(currentChain)));
  }

  async function connectWalletConnect() {
    setStatus(null);

    if (!projectId) {
      setStatus("WalletConnect project id henuz tanimli degil.");
      return;
    }

    const { default: EthereumProvider } = await import("@walletconnect/ethereum-provider");
    const walletConnectProvider = await EthereumProvider.init({
      chains: [1],
      optionalChains: [137, 11155111],
      projectId,
      showQrModal: true
    });

    const accounts = await walletConnectProvider.request<string[]>({
      method: "eth_requestAccounts"
    });
    const currentChain = await walletConnectProvider.request<string>({
      method: "eth_chainId"
    });

    setProvider("walletconnect");
    setActiveProvider(walletConnectProvider);
    setAddress(accounts[0] ?? "");
    setChainId(String(parseChainId(currentChain)));
  }

  async function signPendingMessage() {
    setStatus(null);

    if (!pendingLink) {
      setStatus("Once cuzdan baglanti istegi olusturun.");
      return;
    }

    if (!activeProvider) {
      setStatus("Imza icin aktif EVM provider bulunamadi.");
      return;
    }

    const signed = await activeProvider.request<string>({
      method: "personal_sign",
      params: [pendingLink.message, pendingLink.wallet_address]
    });
    setSignature(signed);
  }

  return (
    <div className="grid gap-5 rounded-lg border border-border bg-card p-6 shadow-panel">
      <div>
        <h3 className="font-display text-title-md text-paper">Cuzdan bagla</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Bu akis yalnizca cuzdan sahipliginizi hesabiniza baglar. Odeme, mint,
          token transferi, NFT satisi veya claim islemi baslatmaz.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={connectMetaMask} type="button">
          MetaMask Connect
        </Button>
        <Button onClick={connectWalletConnect} type="button" variant="outline">
          WalletConnect
        </Button>
      </div>

      <form action={prepareWalletLink} className="grid gap-3">
        <input name="provider" type="hidden" value={provider} />
        <input name="chain_id" type="hidden" value={chainId} />
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Wallet address</span>
          <Input
            name="wallet_address"
            onChange={(event) => setAddress(event.target.value)}
            placeholder="0x..."
            value={address}
          />
        </label>
        <Button disabled={!address || isPending} type="submit" variant="secondary">
          Imza mesaji hazirla
        </Button>
      </form>

      {pendingLink ? (
        <div className="grid gap-3 rounded-md border border-border bg-ink-soft p-4">
          <p className="text-sm font-medium text-paper">Bekleyen imza mesaji</p>
          <pre className="whitespace-pre-wrap rounded-md bg-ink p-3 text-xs leading-5 text-muted-foreground">
            {pendingLink.message}
          </pre>
          <div className="flex flex-wrap gap-3">
            <Button onClick={signPendingMessage} type="button" variant="outline">
              Mesaji imzala
            </Button>
          </div>
          <form
            action={(formData) =>
              startTransition(() => {
                void completeWalletLink(formData);
              })
            }
            className="grid gap-3"
          >
            <input name="wallet_link_id" type="hidden" value={pendingLink.id} />
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-paper">Signature</span>
              <Input
                name="signature"
                onChange={(event) => setSignature(event.target.value)}
                placeholder="0x..."
                value={signature}
              />
            </label>
            <Button disabled={!signature || isPending} type="submit">
              Cuzdani dogrula
            </Button>
          </form>
        </div>
      ) : null}

      {status ? (
        <p className="rounded-md border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
          {status}
        </p>
      ) : null}
    </div>
  );
}
