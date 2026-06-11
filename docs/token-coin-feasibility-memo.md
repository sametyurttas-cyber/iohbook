# Token/Coin Phase Technical Feasibility Memo

Date: 2026-06-11

Status: technical memo only. No live token, coin, mint, payment, custody, exchange,
transfer, or accounting feature should be implemented from this document.

## Executive Summary

The repository should not implement a live token/coin phase at this stage.

For Turkey-facing operations, the technical risk is not only smart contract
execution. The larger risk is that a seemingly small product feature can be
interpreted as crypto-asset payment facilitation, crypto-asset service provider
activity, custody, transfer intermediation, exchange/listing activity, investment
promotion, or undocumented accounting/tax treatment.

The safe repo boundary is:

- Wallet identity: allowed as a non-transactional identity signal.
- NFT/token metadata drafts: allowed as offline preparation.
- Public gallery/education: allowed if it does not invite purchase, payment, or
  investment.
- Reservations/allowlist records: allowed only as internal, non-transferable,
  non-paid intent records.
- Anything involving payment, sale, mint, transfer, custody, redemption, staking,
  trading, listing, token pricing, token rewards, or accounting value recognition:
  do not build before legal, tax, accounting, and regulatory approval.

## Regulatory Context Checked

This is not legal advice. It is a technical risk memo for product scoping.

Relevant public sources reviewed:

- TCMB's 2021 regulation on non-use of crypto assets in payments says crypto
  assets cannot be used directly or indirectly in payments and services for such
  use cannot be provided. Source: TCMB, "Odemelerde Kripto Varliklarin
  Kullanilmamasina Dair Yonetmelik" (16 April 2021):
  https://www.tcmb.gov.tr/wps/wcm/connect/6937855a-7c29-4d08-a26e-51ef3273c022/%C3%96demelerde%2BKripto%2BVarl%C4%B1klar%C4%B1n%2BKullan%C4%B1lmamas%C4%B1na%2BDair%2BY%C3%B6netmelik.pdf?MOD=AJPERES
- SPK announced that Law No. 7518 entered into force on 2 July 2024 and brought
  crypto asset service providers under SPK regulatory and supervisory authority.
  Source: SPK announcement:
  https://spk.gov.tr/duyurular/basin-duyurulari/2024/kripto-varlik-hizmet-saglayicilara-iliskin-duyuru_02072024
- SPK later announced communiques for crypto asset service providers, confirming
  secondary regulation and supervision of this field. Source: SPK announcement:
  https://spk.gov.tr/duyurular/basin-duyurulari/2025/kripto-varlik-hizmet-saglayicilarina-iliskin-iki-teblig-yayimlandi
- The published text of Law No. 7518 includes authorization requirements for
  crypto asset service providers. Source: Lexpera mirror of the Official Gazette
  text:
  https://www.lexpera.com.tr/resmi-gazete/metin/7518-sermaye-piyasasi-kanununda-degisiklik-yapilmasina-dair-kanun-32590

## What We Should Not Build In This Repo

### 1. Do not accept token/coin as payment

Do not add:

- "Pay with crypto" checkout.
- Token-gated discount that requires transferring a token at checkout.
- On-chain payment detection that marks orders paid.
- Stablecoin payment routes.
- Wallet-to-wallet invoice settlement.
- Any adapter that treats a token transfer as order payment.

Reason:

Turkey's payment restriction is the highest immediate blocker. Even indirect
crypto payment facilitation can create regulatory exposure. The existing checkout
should remain fiat-hosted through approved payment providers such as iyzico.

### 2. Do not issue or sell a fungible IOH token

Do not add:

- ERC-20 deployment scripts.
- Token sale pages.
- Presale/ICO/IEO/IDO mechanics.
- Token allocation tables for buyers.
- Vesting, lockup, staking, farming, yield, or referral reward logic.
- "Buy IOH coin" UI.

Reason:

A fungible token can trigger securities, investment, service provider, marketing,
tax, consumer protection, and accounting analysis. This is far outside the current
book commerce scope.

### 3. Do not custody user crypto assets

Do not add:

- Hosted wallets.
- Private key storage.
- MPC custody.
- Hot wallet withdrawal systems.
- User balances denominated in crypto.
- Internal ledgers that represent customer-owned crypto.
- Gas sponsorship tied to customer-owned assets.

Reason:

Custody introduces asset segregation, operational security, incident response,
AML/KYC, and potential crypto asset service provider obligations. This repo should
not become a wallet or custody platform.

### 4. Do not list, trade, swap, or route tokens

Do not add:

- Token marketplace listings.
- Buy/sell order books.
- AMM/swap widgets.
- DEX routing.
- Price charts that promote trade.
- Liquidity pool management.
- External exchange deep links framed as recommended purchase paths.

Reason:

Listing/trading activity can look like platform activity. Even if technically
handled by third-party contracts, the UI/UX can be interpreted as intermediation
or solicitation.

### 5. Do not enable on-chain transfer from the product UI

Do not add:

- Transfer buttons for NFTs or tokens.
- Claim/mint execution buttons.
- Burn/redeem flows that transfer assets.
- Royalty enforcement or secondary-sale hooks.
- Batch airdrop execution from admin.

Reason:

The current approved scope is identity and metadata readiness only. Transfer
execution creates wallet, network, fee, tax, audit, sanction screening, and user
loss risks.

### 6. Do not represent tokens as store credit or monetary value

Do not add:

- Token balances convertible into discounts, TRY, store credit, or products.
- Loyalty points implemented as transferable crypto.
- "Redeem coin for book" flows.
- Accounting screens that treat token balance as cash equivalent.

Reason:

This can become indirect crypto payment, e-money-like value, loyalty liability,
or taxable consideration. Keep rewards off-chain and non-transferable unless
reviewed.

### 7. Do not market expected profit, floor price, rarity investment, or yield

Do not add:

- "Investment" language.
- Floor price widgets.
- ROI projections.
- Token appreciation copy.
- Rarity-driven sale pressure.
- Public leaderboards of token value.

Reason:

Marketing language can change legal classification and consumer risk profile even
when the technical feature is simple.

## Possible Technical Options And Risk Review

### Option A: Wallet-linked membership only

Description:

- Keep current wallet link model.
- Verify signed messages.
- Store verified wallet addresses.
- Show wallet-linked account status.
- No token ownership check required.

Technical feasibility: high.

Main risks:

- Privacy and KVKK: wallet address can be personal data when tied to a profile.
- User support: users lose wallet access or connect wrong chain.
- Security: signature replay must be prevented through nonce and message scope.

Recommendation:

- Keep.
- Continue to avoid transfers, payment, mint, and token balance.
- Add privacy notice before production.

### Option B: Read-only token/NFT ownership display

Description:

- Query public chain or trusted indexer for wallet-owned NFTs/tokens.
- Display "connected wallet holds X" without enabling transfer or purchase.

Technical feasibility: medium.

Main risks:

- Indexer reliability and stale ownership.
- Privacy concerns from correlating wallet history with customer account.
- If used to unlock paid benefits, it can resemble token-gated payment or
  consideration.
- Support complexity across chains.

Recommendation:

- Possible only after legal review.
- If implemented, keep read-only and avoid checkout impact.
- Do not rely on ownership display for monetary discounts without review.

### Option C: Non-transferable off-chain reservation/allowlist

Description:

- Keep internal `claim_reservations`.
- No on-chain claim.
- No payment.
- No transferable asset.

Technical feasibility: high.

Main risks:

- Misleading user expectations if copy implies guaranteed future value.
- Operational fairness and cancellation handling.
- Need clear expiry and revocation rules.

Recommendation:

- Safe as preparation.
- Keep copy conservative: "reservation", not "right to profit" or "guaranteed
  token".

### Option D: NFT metadata preparation on IPFS

Description:

- Prepare ERC-721 style metadata JSON.
- Pin files to Pinata/IPFS.
- Display metadata preview in gallery.

Technical feasibility: high.

Main risks:

- Copyright and image ownership.
- Metadata permanence if pinned publicly.
- Incorrect or misleading attributes.
- Pinata account/security and API key handling.

Recommendation:

- Safe as preparation.
- Keep `PINATA_JWT` server-only.
- Add content approval workflow before pinning final metadata.

### Option E: Future claim page without execution

Description:

- A page that explains claim eligibility and status but does not call a contract.

Technical feasibility: high.

Main risks:

- If it promises a future token, it may create consumer/investment expectations.
- Support burden if eligibility changes.

Recommendation:

- Possible after legal review of wording.
- Use "planned", "subject to approval", and "no current mint/claim available".

### Option F: Live mint or token sale

Description:

- Deploy contract.
- Let users mint/buy/claim token or coin.

Technical feasibility: medium.

Main risks:

- Regulatory classification.
- SPK licensing/approval questions.
- TCMB payment restrictions if tied to purchase/checkout.
- Custody/transfer/accounting/tax obligations.
- Smart contract exploit risk.
- Consumer cancellation/refund disputes.

Recommendation:

- Do not build in this repo now.
- Requires separate legal, tax, accounting, security, and compliance project.

## Risk Matrix

| Area | Risk | Severity | Repo Decision |
| --- | --- | --- | --- |
| Payment | Crypto used directly/indirectly for checkout | Critical | Do not build |
| Issuance | Fungible token sale or presale | Critical | Do not build |
| Custody | Holding private keys or user balances | Critical | Do not build |
| Transfer | UI executes token/NFT transfers | High | Do not build |
| Listing | Marketplace/order book/swap | Critical | Do not build |
| Accounting | Token balances as monetary liability | High | Do not build |
| Metadata | IPFS metadata draft | Medium | Allowed as preparation |
| Wallet identity | Signed wallet link | Medium | Allowed with privacy notice |
| Allowlist | Off-chain, non-paid reservation | Medium | Allowed with careful wording |

## Recommended Repo Guardrails

1. Keep crypto code under `features/wallets` and `features/nft`; do not connect it
   to checkout, orders, payment providers, discounts, or fulfillment.
2. Do not add `payment_provider = crypto`, `token`, `stablecoin`, or similar
   checkout providers.
3. Do not add smart contract write calls from client or server.
4. Do not store private keys, seed phrases, API keys, or signer credentials.
5. Keep Pinata JWT and WalletConnect project id in environment variables only.
6. Keep token/NFT copy educational and non-investment-focused.
7. Add a legal approval flag before any future claim/mint UI can appear.
8. Require explicit review before adding any dependency that signs or broadcasts
   transactions.
9. Never mark an order paid based on an on-chain token transfer.
10. Do not use crypto ownership as a discount/payment mechanism without a fresh
    legal memo.

## Accounting And Tax Questions To Resolve Before Any Live Token

- Is the token a product, loyalty point, financial instrument, digital good, or
  promotional item?
- How will revenue be recognized if a token is sold before utility exists?
- Is there a refund/cancellation right?
- How are gas fees, royalties, and secondary-sale proceeds treated?
- Is VAT applicable, and on what taxable base?
- Are token liabilities carried on balance sheet?
- How will customer identity, transaction records, and audit logs be retained?
- Are cross-border wallet users allowed?
- Are sanctions/AML checks required for wallet addresses?

## Technical Feasibility Conclusion

The technically feasible and relatively bounded work is:

- Wallet linking by signed message.
- NFT-ready metadata generation.
- IPFS/Pinata preparation.
- Read-only gallery.
- Off-chain allowlist/reservation records.

The technically possible but currently unsafe work is:

- Token/coin issuance.
- Token sale.
- Crypto checkout.
- Custody.
- Marketplace/listing.
- Transfer/claim/mint execution.
- Token-based accounting or reward liabilities.

Recommendation: keep the current repo in NFT-ready preparation mode only. Treat
any token/coin launch as a separate regulated product initiative, not as a normal
feature extension of the book commerce platform.
