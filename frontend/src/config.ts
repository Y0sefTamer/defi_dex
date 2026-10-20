import { isAddress, type Address } from "viem";
import { sepolia } from "wagmi/chains";

const DEFAULT_FACTORY: Address = "0x5D8D192e38c7Cc4B704Ea55e717eCf80190040f1";
const DEFAULT_TOKEN: Address = "0xad76cde5768295663d8c4e7b98b5c151b7dc1378";

function addressFromEnv(value: string | undefined, fallback: Address): Address {
  return value && isAddress(value) ? value : fallback;
}

export const FACTORY_ADDRESS = addressFromEnv(
  import.meta.env.VITE_FACTORY_ADDRESS,
  DEFAULT_FACTORY,
);

export const TOKEN_ADDRESS = addressFromEnv(
  import.meta.env.VITE_TOKEN_ADDRESS,
  DEFAULT_TOKEN,
);

export const SEPOLIA_RPC_URL =
  import.meta.env.VITE_SEPOLIA_RPC_URL ||
  "https://ethereum-sepolia-rpc.publicnode.com";

export const EXPLORER_URL = "https://sepolia.etherscan.io";
export const CHAIN = sepolia;
export const CHAIN_ID = sepolia.id;

export const ZERO_ADDRESS: Address =
  "0x0000000000000000000000000000000000000000";
