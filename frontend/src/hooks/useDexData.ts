import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useBalance, useReadContract } from "wagmi";

import { erc20Abi } from "../abis/erc20";
import { exchangeAbi } from "../abis/exchange";
import { factoryAbi } from "../abis/factory";
import { FACTORY_ADDRESS, TOKEN_ADDRESS, ZERO_ADDRESS } from "../config";

export function useDexData() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const exchangeQuery = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "getExchange",
    args: [TOKEN_ADDRESS],
    query: { refetchInterval: 12_000 },
  });

  const exchangeAddress =
    exchangeQuery.data && exchangeQuery.data !== ZERO_ADDRESS
      ? exchangeQuery.data
      : undefined;

  const poolCreated = Boolean(exchangeAddress);

  const exchangeEthBalance = useBalance({
    address: exchangeAddress,
    query: { enabled: poolCreated, refetchInterval: 12_000 },
  });

  const tokenReserve = useReadContract({
    address: exchangeAddress,
    abi: exchangeAbi,
    functionName: "getTokenReserves",
    query: { enabled: poolCreated, refetchInterval: 12_000 },
  });

  const lpTotalSupply = useReadContract({
    address: exchangeAddress,
    abi: exchangeAbi,
    functionName: "totalSupply",
    query: { enabled: poolCreated, refetchInterval: 12_000 },
  });

  const lpBalance = useReadContract({
    address: exchangeAddress,
    abi: exchangeAbi,
    functionName: "balanceOf",
    args: [address ?? ZERO_ADDRESS],
    query: {
      enabled: Boolean(poolCreated && address),
      refetchInterval: 12_000,
    },
  });

  const tokenName = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "name",
    query: { staleTime: Infinity },
  });

  const tokenSymbol = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "symbol",
    query: { staleTime: Infinity },
  });

  const tokenDecimals = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "decimals",
    query: { staleTime: Infinity },
  });

  const tokenTotalSupply = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "totalSupply",
    query: { refetchInterval: 12_000 },
  });

  const tokenOwner = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "owner",
    query: { staleTime: Infinity },
  });

  const tokenBalance = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address ?? ZERO_ADDRESS],
    query: {
      enabled: Boolean(address),
      refetchInterval: 12_000,
    },
  });

  const tokenAllowance = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address ?? ZERO_ADDRESS, exchangeAddress ?? ZERO_ADDRESS],
    query: {
      enabled: Boolean(address && exchangeAddress),
      refetchInterval: 12_000,
    },
  });

  const factoryTokenCount = useReadContract({
    address: FACTORY_ADDRESS,
    abi: factoryAbi,
    functionName: "tokenCount",
    query: { refetchInterval: 12_000 },
  });

  const userEthBalance = useBalance({
    address,
    query: { enabled: Boolean(address), refetchInterval: 12_000 },
  });

  const refetchAll = useCallback(() => {
    void queryClient.invalidateQueries();
  }, [queryClient]);

  const isLoading =
    exchangeQuery.isLoading ||
    tokenName.isLoading ||
    tokenSymbol.isLoading ||
    tokenDecimals.isLoading;

  return {
    exchangeAddress,
    poolCreated,
    ethReserve: exchangeEthBalance.data?.value ?? 0n,
    tokenReserve: tokenReserve.data ?? 0n,
    lpTotalSupply: lpTotalSupply.data ?? 0n,
    lpBalance: lpBalance.data ?? 0n,
    tokenName: tokenName.data ?? "MyToken",
    tokenSymbol: tokenSymbol.data ?? "MTK",
    tokenDecimals: tokenDecimals.data ?? 18,
    tokenBalance: tokenBalance.data ?? 0n,
    tokenTotalSupply: tokenTotalSupply.data ?? 0n,
    tokenAllowance: tokenAllowance.data ?? 0n,
    tokenOwner: tokenOwner.data,
    userEthBalance: userEthBalance.data?.value ?? 0n,
    factoryTokenCount: factoryTokenCount.data ?? 0n,
    isLoading,
    isFactoryLoading: exchangeQuery.isLoading,
    refetchAll,
  };
}

export type DexData = ReturnType<typeof useDexData>;
