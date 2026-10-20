import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowDownUp,
  ArrowLeftRight,
  Droplets,
  Info,
  Plus,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";

import { erc20Abi } from "../abis/erc20";
import { exchangeAbi } from "../abis/exchange";
import { TOKEN_ADDRESS } from "../config";
import type { DexData } from "../hooks/useDexData";
import { useContractTx } from "../hooks/useContractTx";
import { useWallet } from "../hooks/useWallet";
import {
  formatAmount,
  formatPercent,
  formatRate,
  parseAmount,
  sanitizeAmount,
} from "../lib/format";
import { cn } from "../lib/utils";
import { Button, Card, InfoRow, Skeleton, TokenBadge } from "./ui";

type TradeTab = "swap" | "liquidity";
type SwapDirection = "ethToToken" | "tokenToEth";
type LiquidityMode = "add" | "remove";

export function TradeCard({ dex }: { dex: DexData }) {
  const [tab, setTab] = useState<TradeTab>("swap");

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === "#liquidity") setTab("liquidity");
      if (window.location.hash === "#trade") setTab("swap");
    };

    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <Card id="trade" className="overflow-hidden">
      <div className="border-b border-white/[0.06] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-2xl border border-white/[0.07] bg-white/[0.03] p-1">
              <TabButton
                active={tab === "swap"}
                onClick={() => setTab("swap")}
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                Swap
              </TabButton>
              <TabButton
                active={tab === "liquidity"}
                onClick={() => setTab("liquidity")}
              >
                <Droplets className="h-3.5 w-3.5" />
                Liquidity
              </TabButton>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1">
                <Zap className="h-3 w-3 text-amber-300" />
                0.30% fee
              </span>
              <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                On-chain
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait" initial={false}>
            {tab === "swap" ? (
              <motion.div
                key="swap"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <SwapPanel dex={dex} onAddLiquidity={() => setTab("liquidity")} />
              </motion.div>
            ) : (
              <motion.div
                key="liquidity"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <LiquidityPanel dex={dex} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition",
        active
          ? "text-slate-950"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
      )}
    >
      {active && (
        <motion.span
          layoutId="trade-tab"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-300 to-cyan-300"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-1.5">
        {children}
      </span>
    </button>
  );
}

function SwapPanel({
  dex,
  onAddLiquidity,
}: {
  dex: DexData;
  onAddLiquidity: () => void;
}) {
  const [direction, setDirection] = useState<SwapDirection>("ethToToken");
  const [amount, setAmount] = useState("");
  const [slippageBps, setSlippageBps] = useState(50);

  const {
    address,
    isConnected,
    isWrongNetwork,
    connectWallet,
    switchToSepolia,
  } = useWallet();
  const { execute, isPending } = useContractTx();

  const isEthIn = direction === "ethToToken";
  const inputDecimals = isEthIn ? 18 : dex.tokenDecimals;
  const outputDecimals = isEthIn ? dex.tokenDecimals : 18;
  const inputSymbol = isEthIn ? "ETH" : dex.tokenSymbol;
  const outputSymbol = isEthIn ? dex.tokenSymbol : "ETH";
  const inputBalance = isEthIn ? dex.userEthBalance : dex.tokenBalance;
  const inputReserve = isEthIn ? dex.ethReserve : dex.tokenReserve;
  const outputReserve = isEthIn ? dex.tokenReserve : dex.ethReserve;
  const poolReady = dex.ethReserve > 0n && dex.tokenReserve > 0n;

  const inputAmount = parseAmount(amount, inputDecimals) ?? 0n;
  const insufficient = inputAmount > 0n && inputAmount > inputBalance;
  const needsApproval =
    !isEthIn &&
    inputAmount > 0n &&
    dex.tokenAllowance < inputAmount;

  const quoteQuery = useReadContract({
    address: dex.exchangeAddress,
    abi: exchangeAbi,
    functionName: "getAmount",
    args: [inputAmount, inputReserve, outputReserve],
    query: {
      enabled:
        Boolean(dex.exchangeAddress) &&
        poolReady &&
        inputAmount > 0n &&
        inputReserve > 0n &&
        outputReserve > 0n,
    },
  });

  const quote = quoteQuery.data ?? 0n;
  const isQuoteLoading = quoteQuery.isFetching && inputAmount > 0n;
  const minOut = (quote * BigInt(10_000 - slippageBps)) / 10_000n;

  const spotOut =
    inputReserve > 0n ? (inputAmount * outputReserve) / inputReserve : 0n;
  const noFeeOut =
    inputReserve + inputAmount > 0n
      ? (inputAmount * outputReserve) / (inputReserve + inputAmount)
      : 0n;
  const priceImpact =
    spotOut > 0n
      ? Number(((spotOut - noFeeOut) * 10_000n) / spotOut) / 100
      : 0;

  const rate = formatRate(
    inputReserve,
    outputReserve,
    inputDecimals,
    outputDecimals,
  );

  const maxSpendable = isEthIn
    ? inputBalance > 10n ** 15n
      ? inputBalance - 10n ** 15n
      : 0n
    : inputBalance;

  const setMax = () => {
    if (maxSpendable > 0n) {
      setAmount(formatUnits(maxSpendable, inputDecimals));
    }
  };

  const toggleDirection = () => {
    setDirection((current) =>
      current === "ethToToken" ? "tokenToEth" : "ethToToken",
    );
    setAmount("");
  };

  const handleAction = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (isWrongNetwork) {
      await switchToSepolia();
      return;
    }

    if (
      !dex.exchangeAddress ||
      !address ||
      !poolReady ||
      inputAmount === 0n ||
      insufficient
    ) {
      return;
    }

    try {
      if (needsApproval) {
        await execute(
          {
            address: TOKEN_ADDRESS,
            abi: erc20Abi,
            functionName: "approve",
            args: [dex.exchangeAddress, inputAmount],
          },
          {
            pending: `Approving ${dex.tokenSymbol}...`,
            success: `${dex.tokenSymbol} approved`,
          },
        );
        return;
      }

      if (isEthIn) {
        await execute(
          {
            address: dex.exchangeAddress,
            abi: exchangeAbi,
            functionName: "swapEthForTokens",
            args: [minOut, address],
            value: inputAmount,
          },
          {
            pending: `Swapping ETH for ${dex.tokenSymbol}...`,
            success: `Swap complete: ${formatAmount(
              quote,
              dex.tokenDecimals,
              4,
            )} ${dex.tokenSymbol}`,
          },
        );
      } else {
        await execute(
          {
            address: dex.exchangeAddress,
            abi: exchangeAbi,
            functionName: "tokenForEthSwap",
            args: [inputAmount, minOut],
          },
          {
            pending: `Swapping ${dex.tokenSymbol} for ETH...`,
            success: `Swap complete: ${formatAmount(quote, 18, 6)} ETH`,
          },
        );
      }

      setAmount("");
    } catch {
      // Errors are surfaced by the transaction hook.
    }
  };

  if (!poolReady) {
    return <EmptyPool symbol={dex.tokenSymbol} onAddLiquidity={onAddLiquidity} />;
  }

  const disabled =
    isPending ||
    (isConnected &&
      !isWrongNetwork &&
      (inputAmount === 0n ||
        insufficient ||
        isQuoteLoading ||
        inputReserve === 0n ||
        outputReserve === 0n));

  const actionLabel = !isConnected
    ? "Connect wallet"
    : isWrongNetwork
      ? "Switch to Sepolia"
      : inputAmount === 0n
        ? "Enter an amount"
        : insufficient
          ? `Insufficient ${inputSymbol}`
          : isQuoteLoading
            ? "Fetching quote..."
            : needsApproval
              ? `Approve ${dex.tokenSymbol}`
              : isPending
                ? "Confirming..."
                : isEthIn
                  ? `Swap ETH for ${dex.tokenSymbol}`
                  : `Swap ${dex.tokenSymbol} for ETH`;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-white">
            Swap
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Trade against the pool with minimum-output protection.
          </p>
        </div>

        <div className="flex rounded-xl border border-white/[0.07] bg-white/[0.03] p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setDirection("ethToToken");
              setAmount("");
            }}
            className={cn(
              "rounded-lg px-2.5 py-1.5 font-medium transition",
              isEthIn
                ? "bg-white/[0.09] text-white"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            ETH → {dex.tokenSymbol}
          </button>
          <button
            type="button"
            onClick={() => {
              setDirection("tokenToEth");
              setAmount("");
            }}
            className={cn(
              "rounded-lg px-2.5 py-1.5 font-medium transition",
              !isEthIn
                ? "bg-white/[0.09] text-white"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            {dex.tokenSymbol} → ETH
          </button>
        </div>
      </div>

      <TokenAmountField
        label="You pay"
        symbol={inputSymbol}
        kind={isEthIn ? "eth" : "token"}
        value={amount}
        onChange={(value) => setAmount(sanitizeAmount(value))}
        balance={inputBalance}
        decimals={inputDecimals}
        onMax={setMax}
      />

      <div className="relative z-10 -my-2.5 flex justify-center">
        <button
          type="button"
          onClick={toggleDirection}
          aria-label="Switch swap direction"
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-[#0b101d] text-slate-300 shadow-lg transition hover:border-emerald-300/30 hover:text-emerald-200"
        >
          <ArrowDownUp className="h-4 w-4" />
        </button>
      </div>

      <TokenAmountField
        label="You receive"
        symbol={outputSymbol}
        kind={isEthIn ? "token" : "eth"}
        value={
          isQuoteLoading
            ? ""
            : quote > 0n
              ? formatAmount(quote, outputDecimals, 6)
              : ""
        }
        onChange={() => undefined}
        balance={undefined}
        decimals={outputDecimals}
        readOnly
        loading={isQuoteLoading}
        placeholder="0.0"
      />

      {quoteQuery.isError && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-400/15 bg-rose-400/[0.06] p-3 text-xs text-rose-200">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Could not fetch a quote for this amount. Try a smaller value.
        </div>
      )}

      <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs">
        <span className="text-slate-500">Slippage tolerance</span>
        <div className="flex gap-1">
          {[10, 50, 100].map((bps) => (
            <button
              key={bps}
              type="button"
              onClick={() => setSlippageBps(bps)}
              className={cn(
                "rounded-lg border px-2 py-1 font-medium transition",
                slippageBps === bps
                  ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-200"
                  : "border-transparent text-slate-500 hover:bg-white/[0.05] hover:text-slate-300",
              )}
            >
              {(bps / 100).toFixed(1)}%
            </button>
          ))}
        </div>
      </div>

      {quote > 0n && (
        <div className="mt-3 space-y-2.5 rounded-2xl border border-white/[0.07] bg-[#070b14]/60 p-4">
          <InfoRow
            label="Rate"
            value={`1 ${inputSymbol} = ${rate} ${outputSymbol}`}
          />
          <InfoRow
            label="Price impact"
            value={
              <span
                className={
                  priceImpact > 5
                    ? "text-rose-300"
                    : priceImpact > 1
                      ? "text-amber-300"
                      : "text-emerald-300"
                }
              >
                {formatPercent(priceImpact)}
              </span>
            }
          />
          <InfoRow label="LP fee" value="0.30%" />
          <InfoRow
            label="Minimum received"
            value={`${formatAmount(minOut, outputDecimals, 6)} ${outputSymbol}`}
          />
        </div>
      )}

      <Button
        size="lg"
        className="mt-4 w-full"
        onClick={handleAction}
        disabled={disabled}
        loading={isPending}
      >
        {!isConnected ? (
          <Sparkles className="h-4 w-4" />
        ) : isWrongNetwork ? (
          <RefreshCw className="h-4 w-4" />
        ) : needsApproval ? (
          <Plus className="h-4 w-4" />
        ) : (
          <ArrowLeftRight className="h-4 w-4" />
        )}
        {actionLabel}
      </Button>

      <p className="mt-3 text-center text-[11px] leading-5 text-slate-600">
        Quotes come from the on-chain <span className="font-mono">getAmount</span>{" "}
        helper. The minimum received includes your slippage tolerance.
      </p>
    </div>
  );
}

function EmptyPool({
  symbol,
  onAddLiquidity,
}: {
  symbol: string;
  onAddLiquidity: () => void;
}) {
  return (
    <div className="py-2">
      <div className="rounded-2xl border border-dashed border-emerald-300/20 bg-emerald-400/[0.03] p-5 text-center sm:p-7">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300">
          <Droplets className="h-5 w-5" />
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold text-white">
          This pool is waiting for liquidity
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
          The ETH / {symbol} exchange exists, but it has no reserves yet. Add the
          first liquidity to set the price and enable swaps.
        </p>
        <Button className="mt-5" onClick={onAddLiquidity}>
          <Plus className="h-4 w-4" />
          Add initial liquidity
        </Button>
      </div>
    </div>
  );
}

function LiquidityPanel({ dex }: { dex: DexData }) {
  const [mode, setMode] = useState<LiquidityMode>("add");

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-white">
            Liquidity
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Provide ETH and {dex.tokenSymbol} to mint UNI-V1 shares.
          </p>
        </div>

        <div className="flex rounded-xl border border-white/[0.07] bg-white/[0.03] p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("add")}
            className={cn(
              "rounded-lg px-3 py-1.5 font-medium transition",
              mode === "add"
                ? "bg-white/[0.09] text-white"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setMode("remove")}
            className={cn(
              "rounded-lg px-3 py-1.5 font-medium transition",
              mode === "remove"
                ? "bg-white/[0.09] text-white"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            Remove
          </button>
        </div>
      </div>

      {mode === "add" ? (
        <AddLiquidityPanel dex={dex} />
      ) : (
        <RemoveLiquidityPanel dex={dex} />
      )}
    </div>
  );
}

function AddLiquidityPanel({ dex }: { dex: DexData }) {
  const [ethInput, setEthInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");

  const {
    isConnected,
    isWrongNetwork,
    connectWallet,
    switchToSepolia,
  } = useWallet();
  const { execute, isPending } = useContractTx();

  const ethAmount = parseAmount(ethInput, 18) ?? 0n;
  const tokenAmount = parseAmount(tokenInput, dex.tokenDecimals) ?? 0n;

  const hasRatio = dex.ethReserve > 0n && dex.tokenReserve > 0n;
  const requiredTokens =
    hasRatio && ethAmount > 0n
      ? (ethAmount * dex.tokenReserve) / dex.ethReserve
      : 0n;

  const ratioDiffBps =
    hasRatio && requiredTokens > 0n && tokenAmount > 0n
      ? Number(
          ((tokenAmount > requiredTokens
            ? tokenAmount - requiredTokens
            : requiredTokens - tokenAmount) *
            10_000n) /
            requiredTokens,
        )
      : 0;
  const offRatio = hasRatio && tokenAmount > 0n && ratioDiffBps > 100;

  const lpEstimate =
    ethAmount === 0n
      ? 0n
      : dex.lpTotalSupply === 0n
        ? ethAmount
        : dex.ethReserve > 0n
          ? (ethAmount * dex.lpTotalSupply) / dex.ethReserve
          : 0n;

  const sharePercent =
    lpEstimate > 0n && dex.lpTotalSupply + lpEstimate > 0n
      ? Number((lpEstimate * 10_000n) / (dex.lpTotalSupply + lpEstimate)) / 100
      : 0;

  const needsApproval =
    tokenAmount > 0n && dex.tokenAllowance < tokenAmount;
  const insufficientEth = ethAmount > dex.userEthBalance;
  const insufficientToken = tokenAmount > dex.tokenBalance;

  const maxEth =
    dex.userEthBalance > 10n ** 15n
      ? dex.userEthBalance - 10n ** 15n
      : 0n;

  const fillRatio = () => {
    if (requiredTokens > 0n) {
      setTokenInput(formatUnits(requiredTokens, dex.tokenDecimals));
    }
  };

  const handleAction = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (isWrongNetwork) {
      await switchToSepolia();
      return;
    }

    if (
      !dex.exchangeAddress ||
      ethAmount === 0n ||
      tokenAmount === 0n ||
      insufficientEth ||
      insufficientToken
    ) {
      return;
    }

    try {
      if (needsApproval) {
        await execute(
          {
            address: TOKEN_ADDRESS,
            abi: erc20Abi,
            functionName: "approve",
            args: [dex.exchangeAddress, tokenAmount],
          },
          {
            pending: `Approving ${dex.tokenSymbol}...`,
            success: `${dex.tokenSymbol} approved`,
          },
        );
        return;
      }

      await execute(
        {
          address: dex.exchangeAddress,
          abi: exchangeAbi,
          functionName: "addLiquidity",
          args: [tokenAmount],
          value: ethAmount,
        },
        {
          pending: "Adding liquidity...",
          success: "Liquidity added",
        },
      );

      setEthInput("");
      setTokenInput("");
    } catch {
      // Errors are surfaced by the transaction hook.
    }
  };

  const disabled =
    isPending ||
    (isConnected &&
      !isWrongNetwork &&
      (ethAmount === 0n ||
        tokenAmount === 0n ||
        insufficientEth ||
        insufficientToken));

  const actionLabel = !isConnected
    ? "Connect wallet"
    : isWrongNetwork
      ? "Switch to Sepolia"
      : ethAmount === 0n || tokenAmount === 0n
        ? "Enter amounts"
        : insufficientEth
          ? "Insufficient ETH"
          : insufficientToken
            ? `Insufficient ${dex.tokenSymbol}`
            : needsApproval
              ? `Approve ${dex.tokenSymbol}`
              : isPending
                ? "Confirming..."
                : hasRatio
                  ? "Add liquidity"
                  : "Set initial price & add";

  return (
    <div>
      {!hasRatio && (
        <div className="mb-4 rounded-2xl border border-violet-300/15 bg-violet-400/[0.06] p-3.5 text-xs leading-5 text-violet-100/80">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" />
            This is the first deposit. The ETH / {dex.tokenSymbol} ratio you
            choose sets the initial price. Make it deliberate.
          </div>
        </div>
      )}

      <div className="space-y-3">
        <TokenAmountField
          label="ETH deposit"
          symbol="ETH"
          kind="eth"
          value={ethInput}
          onChange={(value) => setEthInput(sanitizeAmount(value))}
          balance={dex.userEthBalance}
          decimals={18}
          onMax={() =>
            maxEth > 0n ? setEthInput(formatUnits(maxEth, 18)) : undefined
          }
        />

        <div className="flex justify-center">
          <div className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-[#0b101d] text-slate-500">
            <Plus className="h-3.5 w-3.5" />
          </div>
        </div>

        <TokenAmountField
          label={`${dex.tokenSymbol} deposit`}
          symbol={dex.tokenSymbol}
          kind="token"
          value={tokenInput}
          onChange={(value) => setTokenInput(sanitizeAmount(value))}
          balance={dex.tokenBalance}
          decimals={dex.tokenDecimals}
          onMax={() =>
            dex.tokenBalance > 0n
              ? setTokenInput(formatUnits(dex.tokenBalance, dex.tokenDecimals))
              : undefined
          }
        />
      </div>

      {hasRatio && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs">
          <span className="text-slate-500">
            Pool ratio requires{" "}
            <span className="text-slate-200">
              {formatAmount(requiredTokens, dex.tokenDecimals, 4)}{" "}
              {dex.tokenSymbol}
            </span>
          </span>
          <button
            type="button"
            onClick={fillRatio}
            className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 font-medium text-emerald-200 transition hover:bg-emerald-400/15"
          >
            Use ratio
          </button>
        </div>
      )}

      {offRatio && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-3 text-xs leading-5 text-amber-100/85">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
          This deposit is {formatPercent(ratioDiffBps / 100)} off the current
          pool ratio. It will move the price and can shift value between LPs.
        </div>
      )}

      <div className="mt-3 space-y-2.5 rounded-2xl border border-white/[0.07] bg-[#070b14]/60 p-4">
        <InfoRow
          label="LP tokens to mint"
          value={`${formatAmount(lpEstimate, 18, 6)} UNI-V1`}
        />
        <InfoRow
          label="Pool share after deposit"
          value={formatPercent(sharePercent)}
        />
        <InfoRow
          label="Your LP balance"
          value={`${formatAmount(dex.lpBalance, 18, 4)} UNI-V1`}
        />
      </div>

      <Button
        size="lg"
        className="mt-4 w-full"
        onClick={handleAction}
        disabled={disabled}
        loading={isPending}
      >
        {!isConnected ? (
          <Sparkles className="h-4 w-4" />
        ) : isWrongNetwork ? (
          <RefreshCw className="h-4 w-4" />
        ) : needsApproval ? (
          <Plus className="h-4 w-4" />
        ) : (
          <Droplets className="h-4 w-4" />
        )}
        {actionLabel}
      </Button>

      <p className="mt-3 text-center text-[11px] leading-5 text-slate-600">
        The contract mints LP shares from the ETH side only. Depositing off-ratio
        can dilute existing LPs.
      </p>
    </div>
  );
}

function RemoveLiquidityPanel({ dex }: { dex: DexData }) {
  const [lpInput, setLpInput] = useState("");

  const {
    isConnected,
    isWrongNetwork,
    connectWallet,
    switchToSepolia,
  } = useWallet();
  const { execute, isPending } = useContractTx();

  const lpAmount = parseAmount(lpInput, 18) ?? 0n;
  const insufficientLp = lpAmount > dex.lpBalance;

  const ethOut =
    dex.lpTotalSupply > 0n
      ? (lpAmount * dex.ethReserve) / dex.lpTotalSupply
      : 0n;
  const tokenOut =
    dex.lpTotalSupply > 0n
      ? (lpAmount * dex.tokenReserve) / dex.lpTotalSupply
      : 0n;

  const setPercent = (percent: number) => {
    const value = (dex.lpBalance * BigInt(percent)) / 100n;
    setLpInput(value > 0n ? formatUnits(value, 18) : "");
  };

  const handleAction = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (isWrongNetwork) {
      await switchToSepolia();
      return;
    }

    if (
      !dex.exchangeAddress ||
      lpAmount === 0n ||
      insufficientLp ||
      dex.lpTotalSupply === 0n
    ) {
      return;
    }

    try {
      await execute(
        {
          address: dex.exchangeAddress,
          abi: exchangeAbi,
          functionName: "removeLiquidity",
          args: [lpAmount],
        },
        {
          pending: "Removing liquidity...",
          success: "Liquidity removed",
        },
      );

      setLpInput("");
    } catch {
      // Errors are surfaced by the transaction hook.
    }
  };

  if (dex.lpBalance === 0n) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400">
          <Droplets className="h-5 w-5" />
        </div>
        <div className="mt-3 font-display text-lg font-semibold text-white">
          No LP shares yet
        </div>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">
          Add liquidity first. Your UNI-V1 shares will appear here and can be
          redeemed for a pro-rata slice of the pool.
        </p>
      </div>
    );
  }

  const disabled =
    isPending ||
    (isConnected &&
      !isWrongNetwork &&
      (lpAmount === 0n || insufficientLp || dex.lpTotalSupply === 0n));

  const actionLabel = !isConnected
    ? "Connect wallet"
    : isWrongNetwork
      ? "Switch to Sepolia"
      : lpAmount === 0n
        ? "Enter LP amount"
        : insufficientLp
          ? "Insufficient LP shares"
          : isPending
            ? "Confirming..."
            : "Remove liquidity";

  return (
    <div>
      <TokenAmountField
        label="LP shares to burn"
        symbol="UNI-V1"
        kind="token"
        value={lpInput}
        onChange={(value) => setLpInput(sanitizeAmount(value))}
        balance={dex.lpBalance}
        decimals={18}
        onMax={() =>
          dex.lpBalance > 0n
            ? setLpInput(formatUnits(dex.lpBalance, 18))
            : undefined
        }
      />

      <div className="mt-3 grid grid-cols-4 gap-2">
        {[25, 50, 75, 100].map((percent) => (
          <button
            key={percent}
            type="button"
            onClick={() => setPercent(percent)}
            className="rounded-xl border border-white/[0.07] bg-white/[0.025] py-2 text-xs font-medium text-slate-400 transition hover:border-emerald-300/20 hover:bg-emerald-400/[0.06] hover:text-emerald-200"
          >
            {percent}%
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2.5 rounded-2xl border border-white/[0.07] bg-[#070b14]/60 p-4">
        <InfoRow
          label="ETH received"
          value={`${formatAmount(ethOut, 18, 6)} ETH`}
        />
        <InfoRow
          label={`${dex.tokenSymbol} received`}
          value={`${formatAmount(tokenOut, dex.tokenDecimals, 6)} ${dex.tokenSymbol}`}
        />
        <InfoRow
          label="Remaining LP"
          value={`${formatAmount(
            dex.lpBalance > lpAmount ? dex.lpBalance - lpAmount : 0n,
            18,
            4,
          )} UNI-V1`}
        />
      </div>

      <Button
        size="lg"
        className="mt-4 w-full"
        onClick={handleAction}
        disabled={disabled}
        loading={isPending}
      >
        {!isConnected ? (
          <Sparkles className="h-4 w-4" />
        ) : isWrongNetwork ? (
          <RefreshCw className="h-4 w-4" />
        ) : (
          <Droplets className="h-4 w-4" />
        )}
        {actionLabel}
      </Button>

      <p className="mt-3 text-center text-[11px] leading-5 text-slate-600">
        Removal is pro-rata. The contract's integer-ratio check can occasionally
        revert on rounding; try a slightly smaller amount if that happens.
      </p>
    </div>
  );
}

function TokenAmountField({
  label,
  symbol,
  kind,
  value,
  onChange,
  balance,
  decimals,
  readOnly = false,
  loading = false,
  placeholder = "0.0",
  onMax,
}: {
  label: string;
  symbol: string;
  kind: "eth" | "token";
  value: string;
  onChange: (value: string) => void;
  balance?: bigint;
  decimals: number;
  readOnly?: boolean;
  loading?: boolean;
  placeholder?: string;
  onMax?: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 transition focus-within:border-emerald-300/25 focus-within:bg-white/[0.035]",
        readOnly && "bg-white/[0.02]",
      )}
    >
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-500">{label}</span>
        {balance !== undefined ? (
          <button
            type="button"
            onClick={onMax}
            className="inline-flex items-center gap-1.5 text-slate-500 transition hover:text-slate-300"
          >
            Balance: {formatAmount(balance, decimals, 4)}
            {onMax && (
              <span className="rounded-md border border-emerald-300/20 bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                Max
              </span>
            )}
          </button>
        ) : (
          <span className="text-slate-600">Estimated</span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-2.5 py-2">
          <TokenBadge symbol={symbol} kind={kind} />
          <span className="text-sm font-semibold text-slate-100">{symbol}</span>
        </div>

        {loading ? (
          <div className="flex-1">
            <Skeleton className="ml-auto h-9 w-32" />
          </div>
        ) : (
          <input
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            readOnly={readOnly}
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent text-right font-display text-3xl font-semibold tracking-tight text-white placeholder:text-slate-700 focus:outline-none"
          />
        )}
      </div>
    </div>
  );
}
