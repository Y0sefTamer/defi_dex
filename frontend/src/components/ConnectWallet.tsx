import { LogOut, Wallet } from "lucide-react";

import { useWallet } from "../hooks/useWallet";
import { formatAmount, shortenAddress } from "../lib/format";
import { Button } from "./ui";

export function ConnectWallet() {
  const {
    address,
    balance,
    isConnected,
    isWrongNetwork,
    isConnecting,
    isSwitching,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
  } = useWallet();

  if (!isConnected) {
    return (
      <Button onClick={connectWallet} loading={isConnecting} size="sm">
        <Wallet className="h-4 w-4" />
        Connect wallet
      </Button>
    );
  }

  if (isWrongNetwork) {
    return (
      <Button
        onClick={switchToSepolia}
        loading={isSwitching}
        variant="secondary"
        size="sm"
      >
        Switch to Sepolia
      </Button>
    );
  }

  const hue = address ? parseInt(address.slice(2, 8), 16) % 360 : 160;

  return (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 sm:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
        {formatAmount(balance, 18, 3)} ETH
      </div>

      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-1">
        <span
          className="h-7 w-7 rounded-full ring-1 ring-white/20"
          style={{
            background: `linear-gradient(135deg, hsl(${hue} 85% 60%), hsl(${(hue + 80) % 360} 85% 55%))`,
          }}
        />
        <span className="px-1.5 font-mono text-xs text-slate-200">
          {shortenAddress(address)}
        </span>
        <button
          type="button"
          onClick={disconnectWallet}
          title="Disconnect wallet"
          aria-label="Disconnect wallet"
          className="grid h-7 w-7 place-items-center rounded-full text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
