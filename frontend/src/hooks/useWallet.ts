import { toast } from "sonner";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";

import { CHAIN_ID } from "../config";
import { getErrorMessage } from "../lib/errors";

export function useWallet() {
  const account = useAccount();
  const connectState = useConnect();
  const switchState = useSwitchChain();
  const disconnectState = useDisconnect();
  const balance = useBalance({
    address: account.address,
    query: { enabled: Boolean(account.address) },
  });

  const injectedConnector =
    connectState.connectors.find(
      (connector) =>
        connector.id === "injected" || connector.type === "injected",
    ) ?? connectState.connectors[0];

  const connectWallet = async () => {
    if (!injectedConnector) {
      toast.error("No browser wallet found", {
        description: "Install MetaMask or another injected wallet to continue.",
      });
      return;
    }

    try {
      await connectState.connectAsync({ connector: injectedConnector });
    } catch (error) {
      toast.error("Could not connect wallet", {
        description: getErrorMessage(error),
      });
    }
  };

  const disconnectWallet = () => {
    disconnectState.disconnect();
  };

  const switchToSepolia = async () => {
    try {
      await switchState.switchChainAsync({ chainId: CHAIN_ID });
    } catch (error) {
      toast.error("Could not switch network", {
        description: getErrorMessage(error),
      });
    }
  };

  return {
    address: account.address,
    isConnected: account.isConnected,
    chainId: account.chainId,
    isWrongNetwork: account.isConnected && account.chainId !== CHAIN_ID,
    balance: balance.data?.value ?? 0n,
    isConnecting: connectState.isPending,
    isSwitching: switchState.isPending,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
  };
}
