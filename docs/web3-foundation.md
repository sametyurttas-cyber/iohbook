# Web3 Foundation

## Scope

This module only verifies wallet ownership and stores account-to-wallet links.
It does not enable crypto payments, NFT minting, NFT sales, token transfers, or
token distribution.

## Data Model

- `web3_networks`: Chain configuration and future capability flags.
- `wallet_links`: One-time signature requests with nonce, message, expiry, and
  verification proof.
- `user_wallets`: Verified wallet ownership records attached to customer
  profiles.
- `claim_reservations`: Future allowlist/claim preparation records. No claim
  action is exposed.

`user_wallets.normalized_address` is globally unique while active. This prevents
the same wallet from being actively claimed by multiple accounts.

## Verification Flow

1. Customer connects MetaMask or WalletConnect.
2. Server creates a nonce, expiry, domain-aware message, and pending
   `wallet_links` row.
3. Customer signs the exact message with the connected wallet.
4. Server verifies the signature with `viem.verifyMessage`.
5. Server creates or refreshes a `user_wallets` ownership record.
6. Audit log records the verification or revocation event.

The signed message explicitly says it does not authorize payment, mint, transfer,
sale, token distribution, or claim.

## Network And Provider Config

Code config lives in `src/features/web3/config.ts`.

Initial networks:

- Ethereum Mainnet: configured for future review, not a live commerce feature.
- Ethereum Sepolia: enabled for testnet wallet verification.
- Polygon Mainnet: configured for future NFT review, not a live commerce
  feature.

Initial providers:

- MetaMask
- WalletConnect

`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is required for WalletConnect.
`WEB3_SIGNATURE_TTL_MINUTES` controls wallet signature request expiry and
defaults to 10 minutes.

## Feature Gates

The foundation keeps these switches false:

- `nftClaim`
- `nftSales`
- `tokenDistribution`
- `tokenTransfer`

Do not add on-chain write calls, payment collection, mint buttons, token
transfer buttons, or claim execution until legal/compliance approval is recorded
and a separate implementation task opens those features.

## Definition Of Done

- Wallet address is normalized and validated before persistence.
- Signature message includes domain, nonce, chain id, issued time, and expiry.
- Expired signature requests cannot complete.
- Verified ownership writes to `user_wallets`, not only `wallet_links`.
- RLS lets customers read/manage their own wallet ownership records and staff
  manage operationally.
- No live sale, mint, transfer, distribution, or claim path exists.
