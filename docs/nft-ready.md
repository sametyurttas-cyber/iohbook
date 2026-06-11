# NFT-ready Phase

## Scope

This phase prepares identity, metadata, galleries, and future claim reservations.
It does not enable minting, token sales, crypto payments, paid claims, or any
on-chain transaction.

## Wallet Linking

Customers can connect MetaMask or WalletConnect from `/account/wallets`.

The flow:

1. Reads an EVM wallet address from the customer wallet.
2. Creates a server-side nonce and human-readable message.
3. The customer signs the message.
4. The backend verifies the signature with `viem`.
5. The verified wallet is linked to the customer profile.

The signature message explicitly states that it does not authorize payment,
minting, token transfer, or claim.

## Data Model

Tables:

- `web3_networks`: chain configuration and future capability flags
- `wallet_links`: one-time wallet verification messages and signature proofs
- `user_wallets`: durable wallet ownership records for customer profiles
- `nft_collections`: NFT-ready collection metadata and legal gate
- `nft_items`: gallery items and IPFS metadata references
- `claim_reservations`: allowlist/reservation model for a future claim flow

`nft_collections.mint_enabled` cannot be true unless `legal_approved_at` is set.
The application currently exposes no UI that enables minting.

## Pinata/IPFS

`src/features/nft/metadata.ts` builds NFT metadata JSON.
`src/features/nft/pinata.ts` can pin metadata to Pinata when `PINATA_JWT` is
provided in the server environment.

No Pinata JWT or gateway secret is committed to the repo.

## Galleries

Public pages:

- `/nft`
- `/nft/[slug]`

These pages show collection and item metadata, including draft IPFS references,
but do not contain mint, buy, pay, or claim buttons.

## Legal Gate

Before any future mint or claim flow:

- Legal/compliance approval must be recorded.
- Terms must be updated for wallet and NFT processing.
- Chain, contract, royalties, refundability, tax treatment, and consumer
  protection language must be reviewed.
- A separate implementation prompt should add on-chain write actions only after
  approval.
