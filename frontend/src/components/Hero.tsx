import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Coins,
  Droplets,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";

import type { DexData } from "../hooks/useDexData";
import {
  formatAmount,
  formatCompact,
  formatPrice,
} from "../lib/format";
import { Button, Card, Stat, TokenBadge } from "./ui";

export function Hero({ dex }: { dex: DexData }) {
  const hasLiquidity = dex.ethReserve > 0n && dex.tokenReserve > 0n;
  const poolValue = dex.ethReserve * 2n;
  const primaryLabel = !dex.poolCreated
    ? "Create the pool"
    : hasLiquidity
      ? "Start trading"
      : "Add liquidity";
  const primaryTarget = dex.poolCreated && !hasLiquidity ? "liquidity" : "trade";

  return (
    <section id="top" className="relative pt-14 sm:pt-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" />
            A hands-on Uniswap V1 practice build
          </div>

          <h1 className="max-w-2xl font-display text-5xl font-semibold leading-[1.03] tracking-[-0.045em] text-white sm:text-6xl xl:text-[72px]">
            Trade the curve.
            <br />
            <span className="text-gradient">Own the pool.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            A minimal constant-product exchange on Sepolia. Swap ETH and MTK,
            provide liquidity, and watch the{" "}
            <span className="font-mono text-emerald-300/90">x · y = k</span>{" "}
            invariant do its work on-chain.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => scrollToId(primaryTarget)}>
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => scrollToId("contracts")}
            >
              View contracts
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300/70" />
              Educational, unaudited
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-cyan-300/70" />
              0.30% LP fee
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Waves className="h-3.5 w-3.5 text-violet-300/70" />
              Sepolia testnet
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Card className="relative overflow-hidden p-5 sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  <Droplets className="h-3.5 w-3.5 text-emerald-300" />
                  Pool snapshot
                </div>
                <div className="mt-2 font-display text-2xl font-semibold tracking-tight text-white">
                  ETH / {dex.tokenSymbol}
                </div>
              </div>
              <span
                className={
                  dex.poolCreated
                    ? "rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200"
                    : "rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                }
              >
                {dex.poolCreated ? "Live" : "Not created"}
              </span>
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-3">
              <Stat
                label="ETH reserve"
                value={
                  <span className="inline-flex items-center gap-2">
                    <TokenBadge symbol="ETH" kind="eth" size="sm" />
                    {formatAmount(dex.ethReserve, 18, 3)}
                  </span>
                }
                hint="Pool ETH"
              />
              <Stat
                label={`${dex.tokenSymbol} reserve`}
                value={
                  <span className="inline-flex items-center gap-2">
                    <TokenBadge symbol={dex.tokenSymbol} size="sm" />
                    {formatCompact(dex.tokenReserve, dex.tokenDecimals)}
                  </span>
                }
                hint="Pool tokens"
              />
              <Stat
                label="Price"
                value={
                  <span className="inline-flex items-baseline gap-1.5">
                    {formatPrice(
                      dex.ethReserve,
                      dex.tokenReserve,
                      dex.tokenDecimals,
                    )}
                    <span className="text-xs font-medium text-slate-500">
                      ETH / {dex.tokenSymbol}
                    </span>
                  </span>
                }
                hint="Spot price"
                icon={<Activity className="h-3.5 w-3.5" />}
              />
              <Stat
                label="Pool value"
                value={
                  <span className="inline-flex items-baseline gap-1.5">
                    {formatAmount(poolValue, 18, 3)}
                    <span className="text-xs font-medium text-slate-500">
                      ETH
                    </span>
                  </span>
                }
                hint="2 × ETH reserve"
                icon={<Coins className="h-3.5 w-3.5" />}
              />
            </div>

            <div className="relative mt-5 rounded-2xl border border-white/[0.07] bg-[#070b14]/60 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Liquidity composition</span>
                <span className="text-slate-500">by value</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                {hasLiquidity ? (
                  <div className="flex h-full w-full">
                    <div className="h-full w-1/2 bg-gradient-to-r from-emerald-400 to-teal-300" />
                    <div className="h-full w-1/2 bg-gradient-to-r from-violet-400 to-fuchsia-400" />
                  </div>
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04]" />
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                {hasLiquidity ? (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      ETH 50%
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
                      {dex.tokenSymbol} 50%
                    </span>
                  </>
                ) : (
                  <span>Add the first deposit to initialize the pool</span>
                )}
              </div>
            </div>

            <div className="relative mt-4 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-xs text-slate-400">
              <span>LP token supply</span>
              <span className="font-mono text-slate-200">
                {formatCompact(dex.lpTotalSupply, 18)} UNI-V1
              </span>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
