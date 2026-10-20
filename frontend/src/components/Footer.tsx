import { Code2, ExternalLink } from "lucide-react";

import { EXPLORER_URL, FACTORY_ADDRESS, TOKEN_ADDRESS } from "../config";
import { shortenAddress } from "../lib/format";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.06] py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-display text-sm font-semibold text-white">
            UNI<span className="text-emerald-300">/</span>V1 Practice DEX
          </div>
          <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
            Educational interface for a Uniswap V1-style constant-product AMM.
            Unaudited. Sepolia testnet only. Not financial advice.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <a
            href={`${EXPLORER_URL}/address/${FACTORY_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-slate-400 transition hover:border-white/15 hover:text-white"
          >
            Factory {shortenAddress(FACTORY_ADDRESS, 3)}
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={`${EXPLORER_URL}/address/${TOKEN_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-slate-400 transition hover:border-white/15 hover:text-white"
          >
            Token {shortenAddress(TOKEN_ADDRESS, 3)}
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://github.com/YosefTamer"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-slate-400 transition hover:border-white/15 hover:text-white"
          >
            <Code2 className="h-3 w-3" />
            Author
          </a>
        </div>
      </div>
    </footer>
  );
}
