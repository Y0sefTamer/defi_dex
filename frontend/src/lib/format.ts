import { formatUnits, parseUnits, type Address } from "viem";

export function shortenAddress(address?: Address | string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}

export function formatAmount(
  value: bigint | undefined,
  decimals = 18,
  maxFractionDigits = 4,
): string {
  if (value === undefined) return "0";
  if (value === 0n) return "0";

  const numeric = Number(formatUnits(value, decimals));

  if (!Number.isFinite(numeric)) return "0";
  if (numeric > 0 && numeric < 0.0001) return "<0.0001";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
  }).format(numeric);
}

export function formatCompact(value: bigint | undefined, decimals = 18): string {
  if (value === undefined || value === 0n) return "0";

  const numeric = Number(formatUnits(value, decimals));
  if (!Number.isFinite(numeric)) return "0";

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatPercent(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "0%";
  if (value > 0 && value < 0.01) return "<0.01%";
  return `${value.toFixed(digits)}%`;
}

export function parseAmount(value: string, decimals = 18): bigint | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed === ".") return null;

  try {
    return parseUnits(trimmed, decimals);
  } catch {
    return null;
  }
}

export function sanitizeAmount(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  return rest.length > 0 ? `${whole}.${rest.join("")}` : whole;
}

export function formatPrice(
  ethReserve: bigint,
  tokenReserve: bigint,
  tokenDecimals: number,
): string {
  if (ethReserve === 0n || tokenReserve === 0n) return "0";

  const eth = Number(formatUnits(ethReserve, 18));
  const tokens = Number(formatUnits(tokenReserve, tokenDecimals));

  if (tokens === 0 || !Number.isFinite(eth / tokens)) return "0";

  const price = eth / tokens;

  if (price < 0.000001) {
    return new Intl.NumberFormat("en-US", {
      notation: "scientific",
      maximumFractionDigits: 3,
    }).format(price);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: price < 0.01 ? 6 : 4,
  }).format(price);
}

export function formatRate(
  inputReserve: bigint,
  outputReserve: bigint,
  inputDecimals: number,
  outputDecimals: number,
): string {
  if (inputReserve === 0n) return "0";

  const input = Number(formatUnits(inputReserve, inputDecimals));
  const output = Number(formatUnits(outputReserve, outputDecimals));
  const rate = output / input;

  if (!Number.isFinite(rate)) return "0";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: rate < 1 ? 6 : 4,
  }).format(rate);
}

export function explorerAddress(address: Address): string {
  return `https://sepolia.etherscan.io/address/${address}`;
}

export function explorerTx(hash: string): string {
  return `https://sepolia.etherscan.io/tx/${hash}`;
}
