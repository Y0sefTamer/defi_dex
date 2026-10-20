import { ArrowRight, Layers, Plus, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { factoryAbi } from "../abis/factory";
import { FACTORY_ADDRESS, TOKEN_ADDRESS } from "../config";
import type { DexData } from "../hooks/useDexData";
import { useContractTx } from "../hooks/useContractTx";
import { useWallet } from "../hooks/useWallet";
import { shortenAddress } from "../lib/format";
import { Button, Card } from "./ui";

export function CreateExchangeCard({ dex }: { dex: DexData }) {
  const { execute, isPending } = useContractTx();
  const {
    isConnected,
    isWrongNetwork,
    connectWallet,
    switchToSepolia,
  } = useWallet();

  const handleCreate = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (isWrongNetwork) {
      await switchToSepolia();
      return;
    }

    try {
      await execute(
        {
          address: FACTORY_ADDRESS,
          abi: factoryAbi,
          functionName: "createNewExchange",
          args: [TOKEN_ADDRESS],
        },
        {
          pending: `Creating the ${dex.tokenSymbol} exchange...`,
          success: `${dex.tokenSymbol} exchange created`,
        },
      );
      dex.refetchAll();
    } catch {
      // The transaction hook surfaces the error toast.
    }
  };

  return (
    <Card
      id="trade"
      className="relative overflow-hidden border-dashed border-emerald-300/20 p-6 sm:p-8"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300/80">
              Factory step required
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-white">
              Create the ETH / {dex.tokenSymbol} pool
            </h2>
          </div>
        </div>

        <p className="mt-5 max-w-xl text-sm leading-6 text-slate-400">
          The factory has not deployed an exchange for{" "}
          <span className="font-medium text-slate-200">{dex.tokenName}</span>{" "}
          yet. Creating the exchange is permissionless and only needs one
          transaction. After that, you can add the first liquidity and start
          swapping.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Step
            number="01"
            title="Create exchange"
            description="The factory deploys a dedicated ETH / token pool."
            icon={<Plus className="h-4 w-4" />}
          />
          <Step
            number="02"
            title="Add liquidity"
            description="Deposit ETH and tokens to mint UNI-V1 LP shares."
            icon={<Layers className="h-4 w-4" />}
          />
          <Step
            number="03"
            title="Start swapping"
            description="Trade against the constant-product curve."
            icon={<ArrowRight className="h-4 w-4" />}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-[#070b14]/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            Factory{" "}
            <span className="font-mono text-slate-300">
              {shortenAddress(FACTORY_ADDRESS)}
            </span>
            <span className="mx-2 text-slate-700">/</span>
            Pools created:{" "}
            <span className="text-slate-300">{dex.factoryTokenCount.toString()}</span>
          </div>
          <Button onClick={handleCreate} loading={isPending} className="shrink-0">
            <Plus className="h-4 w-4" />
            {isConnected
              ? isWrongNetwork
                ? "Switch to Sepolia"
                : "Create exchange"
              : "Connect to create"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Step({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.16em] text-slate-600">
          {number}
        </span>
        <span className="text-emerald-300/80">{icon}</span>
      </div>
      <div className="mt-3 text-sm font-semibold text-slate-100">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{description}</div>
    </div>
  );
}
