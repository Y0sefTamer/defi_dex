import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import {
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import type { Address } from "viem";

import { explorerAddress, shortenAddress } from "../lib/format";
import { cn } from "../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-slate-950 shadow-[0_16px_45px_-16px_rgba(45,212,191,0.8)] hover:brightness-110 active:brightness-95",
  secondary:
    "border border-white/10 bg-white/[0.06] text-white hover:border-white/20 hover:bg-white/[0.1]",
  ghost: "text-slate-300 hover:bg-white/[0.06] hover:text-white",
  danger:
    "border border-rose-400/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 rounded-xl px-3.5 text-sm",
  md: "h-11 rounded-2xl px-5 text-sm",
  lg: "h-14 rounded-2xl px-6 text-base",
  icon: "h-10 w-10 rounded-xl",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-40",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/10 bg-white/[0.035] shadow-[0_30px_90px_-45px_rgba(0,0,0,0.9)] backdrop-blur-2xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TokenBadge({
  symbol,
  kind = "token",
  size = "md",
}: {
  symbol: string;
  kind?: "eth" | "token";
  size?: "sm" | "md" | "lg";
}) {
  const dimensions = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-11 w-11 text-sm",
  };

  if (kind === "eth") {
    return (
      <span
        className={cn(
          "grid place-items-center rounded-full border border-white/10 bg-gradient-to-br from-slate-500 via-slate-700 to-slate-900 shadow-inner",
          dimensions[size],
        )}
      >
        <svg viewBox="0 0 24 24" className="h-[55%] w-[55%] fill-white/90">
          <path d="M12 2 5.4 12.2 12 16l6.6-3.8L12 2Zm0 15.5-6.6-3.8L12 22l6.6-8.3-6.6 3.8Z" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "grid place-items-center rounded-full border border-white/10 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 font-bold text-slate-950 shadow-inner",
        dimensions[size],
      )}
    >
      {symbol.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function CopyButton({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy address"
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/[0.08] hover:text-white",
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-300" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

export function AddressLink({
  address,
  label,
  className,
}: {
  address: Address;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={explorerAddress(address)}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-xs text-slate-300 transition hover:text-emerald-300",
        className,
      )}
    >
      {label ?? shortenAddress(address)}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
          {label}
        </span>
        {icon && <span className="text-emerald-300/80">{icon}</span>}
      </div>
      <div className="font-display text-xl font-semibold tracking-tight text-white">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export function InfoRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-100">
        {value}
        {hint && <span className="block text-[11px] font-normal text-slate-500">{hint}</span>}
      </span>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-white/[0.05] via-white/[0.09] to-white/[0.05]",
        className,
      )}
    />
  );
}
