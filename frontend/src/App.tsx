import { AlertTriangle } from "lucide-react";

import { CreateExchangeCard } from "./components/CreateExchangeCard";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { MechanicsCard, PoolDetails } from "./components/PoolDetails";
import { TradeCard } from "./components/TradeCard";
import { Button, Card, Skeleton } from "./components/ui";
import { useDexData } from "./hooks/useDexData";
import { useWallet } from "./hooks/useWallet";

export default function App() {
  const dex = useDexData();
  const { isConnected, isWrongNetwork, switchToSepolia, isSwitching } =
    useWallet();

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Background />

      <Header />

      <main className="relative mx-auto max-w-7xl px-5 pb-10 sm:px-8">
        {isConnected && isWrongNetwork && (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-3 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <span>
                Your wallet is on a different network. This interface reads and
                writes to Sepolia only.
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={switchToSepolia}
              loading={isSwitching}
              className="shrink-0"
            >
              Switch to Sepolia
            </Button>
          </div>
        )}

        <Hero dex={dex} />

        <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
          <div>
            <span id="liquidity" className="block scroll-mt-28" />
            {dex.isFactoryLoading ? (
              <TradeSkeleton />
            ) : dex.poolCreated ? (
              <TradeCard dex={dex} />
            ) : (
              <CreateExchangeCard dex={dex} />
            )}
          </div>

          <div className="space-y-6">
            <PoolDetails dex={dex} />
            <MechanicsCard />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05080f]">
      <div className="absolute -top-52 left-1/2 h-[620px] w-[860px] -translate-x-1/2 rounded-full bg-emerald-500/[0.13] blur-[150px]" />
      <div className="animate-drift absolute right-[-12rem] top-[18%] h-[460px] w-[460px] rounded-full bg-violet-500/[0.12] blur-[130px]" />
      <div className="animate-drift absolute bottom-[-10rem] left-[-8rem] h-[420px] w-[420px] rounded-full bg-cyan-500/[0.09] blur-[120px] [animation-delay:-6s]" />
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />
    </div>
  );
}

function TradeSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-7 w-28" />
      </div>
      <Skeleton className="mt-6 h-28 w-full" />
      <Skeleton className="mx-auto -my-2 h-10 w-10 rounded-xl" />
      <Skeleton className="mt-3 h-28 w-full" />
      <Skeleton className="mt-4 h-14 w-full" />
    </Card>
  );
}
