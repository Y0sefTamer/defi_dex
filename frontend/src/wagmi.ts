import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

import { CHAIN, SEPOLIA_RPC_URL } from "./config";

export const wagmiConfig = createConfig({
  chains: [CHAIN],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [CHAIN.id]: http(SEPOLIA_RPC_URL, {
      batch: { wait: 24 },
    }),
  },
  ssr: false,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
