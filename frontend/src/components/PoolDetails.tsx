import {
  Activity,
  ArrowLeftRight,
  Coins,
  Droplets,
  Factory,
  Info,
  Layers,
  LockKeyhole,
  Waves,
} from "lucide-react";
import type { ReactNode } from "react";

import { FACTORY_ADDRESS, TOKEN_ADDRESS } from "../config";
import type { DexData } from "../hooks/useDexData";
import {
  formatAmount,
  formatCompact,
  formatPrice,
  shortenAddress,
} from "../lib/format";
import { AddressLink, Card, CopyButton, Stat, TokenBadge } from "./ui";

export function PoolDetails({ dex }: { dex: DexData }) {
  return (
    <Card id="pool" className="overflow-hidden">
      <div className="border-b border-white/[0.06] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Pool details
            </div>
            <div className="mt-2 flex items-center gap-2">
              <TokenBadge symbol="ETH" kind="eth" size="sm" />
              <span className="text-sm text-slate-500">/</span>
              <TokenBadge symbol={dex.tokenSymbol} size="sm" />
              <span className="font-display text-lg font-semibold text-white">
                ETH / {dex.tokenSymbol}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-right">
            <div className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
              Spot
            </div>
            <div className="font-mono text-xs text-slate-200">
              {formatPrice(dex.ethReserve, dex.tokenReserve, dex.tokenDecimals)}{" "}
              ETH
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5 sm:p-6">
        <Stat
          label="Your ETH"
          value={
            <span className="inline-flex items-center gap-2">
              <TokenBadge symbol="ETH" kind="eth" size="sm" />
              {formatAmount(dex.userEthBalance, 18, 4)}
            </span>
          }
          hint="Wallet balance"
        />
        <Stat
          label={`Your ${dex.tokenSymbol}`}
          value={
            <span className="inline-flex items-center gap-2">
              <TokenBadge symbol={dex.tokenSymbol} size="sm" />
              {formatAmount(dex.tokenBalance, dex.tokenDecimals, 4)}
            </span>
          }
          hint="Wallet balance"
        />
        <Stat
          label="Your LP"
          value={`${formatAmount(dex.lpBalance, 18, 4)} UNI-V1`}
          hint="Liquidity shares"
          icon={<Droplets className="h-3.5 w-3.5" />}
        />
        <Stat
          label="Token supply"
          value={formatCompact(dex.tokenTotalSupply, dex.tokenDecimals)}
          hint={dex.tokenSymbol}
          icon={<Coins className="h-3.5 w-3.5" />}
        />
      </div>

      <div className="space-y-3 border-t border-white/[0.06] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">Factory</span>
          <div className="flex items-center gap-1">
            <AddressLink address={FACTORY_ADDRESS} />
            <CopyButton value={FACTORY_ADDRESS} className="h-7 w-7" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">Token</span>
          <div className="flex items-center gap-1">
            <AddressLink address={TOKEN_ADDRESS} />
            <CopyButton value={TOKEN_ADDRESS} className="h-7 w-7" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">Exchange</span>
          {dex.exchangeAddress ? (
            <div className="flex items-center gap-1">
              <AddressLink address={dex.exchangeAddress} />
              <CopyButton value={dex.exchangeAddress} className="h-7 w-7" />
            </div>
          ) : (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-wider text-slate-500">
              Not created
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">Token owner</span>
          <span className="font-mono text-xs text-slate-300">
            {dex.tokenOwner ? shortenAddress(dex.tokenOwner) : "—"}
          </span>
        </div>
      </div>
    </Card>
  );
}

export function MechanicsCard() {
  return (
    <Card id="contracts" className="overflow-hidden p-5 sm:p-6">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
        <Waves className="h-3.5 w-3.5 text-cyan-300" />
        Under the hood
      </div>
      <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-white">
        A small, readable AMM
      </h3>

      <div className="mt-5 space-y-3">
        <Mechanic
          icon={<Activity className="h-4 w-4" />}
          title="Constant product"
          description="Reserves follow x · y = k. Every trade moves along the curve."
        />
        <Mechanic
          icon={<ArrowLeftRight className="h-4 w-4" />}
          title="0.30% fee"
          description="997 / 1000 of the input is used for pricing. Fees stay in the pool for LPs."
        />
        <Mechanic
          icon={<Factory className="h-4 w-4" />}
          title="Factory registry"
          description="The factory deploys one exchange per token and indexes it in both directions."
        />
        <Mechanic
          icon={<Layers className="h-4 w-4" />}
          title="ERC20 LP shares"
          description="Each exchange is itself an ERC20 named UNI-V1. LP balances are redeemable pro rata."
        />
      </div>

      <div className="mt-5 rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] p-4">
        <div className="flex items-start gap-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <div className="text-xs leading-5 text-amber-100/80">
            This is an unaudited practice project. The first LP sets the price,
            the contract does not enforce deposit ratios, and quote helpers are
            designed for swap-internal use. Use test funds only.
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-600">
        <LockKeyhole className="h-3.5 w-3.5" />
        Immutable exchange contracts. No upgrade path.
      </div>
    </Card>
  );
}

function Mechanic({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-emerald-300/80">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-slate-100">{title}</div>
        <div className="mt-0.5 text-xs leading-5 text-slate-500">
          {description}
        </div>
      </div>
    </div>
  );
}
