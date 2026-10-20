import { Menu, X } from "lucide-react";
import { useState } from "react";

import { useWallet } from "../hooks/useWallet";
import { cn } from "../lib/utils";
import { ConnectWallet } from "./ConnectWallet";

const links = [
  { href: "#trade", label: "Trade" },
  { href: "#liquidity", label: "Liquidity" },
  { href: "#pool", label: "Pool" },
  { href: "#contracts", label: "Contracts" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { isConnected, isWrongNetwork } = useWallet();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#060912]/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-300 via-cyan-400 to-violet-500 shadow-[0_0_32px_-8px_rgba(45,212,191,0.7)]">
            <span className="font-display text-sm font-bold tracking-tight text-slate-950">
              V1
            </span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-[15px] font-semibold tracking-tight text-white">
              UNI<span className="text-emerald-300">/</span>V1
            </div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
              Practice DEX
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.025] p-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:flex",
              isConnected && isWrongNetwork
                ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
                : "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-200",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isConnected && isWrongNetwork
                  ? "bg-amber-300"
                  : "bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]",
              )}
            />
            {isConnected && isWrongNetwork ? "Wrong network" : "Sepolia"}
          </div>

          <ConnectWallet />

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] bg-[#060912]/95 px-5 py-3 md:hidden">
          <nav className="grid gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
