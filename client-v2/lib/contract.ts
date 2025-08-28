import { useAccount, useReadContract } from "wagmi";
import { Address } from "viem";
import WanderifyABI from "@/contracts/Wanderify.json";
import { getContractAddress, getChainConfig } from "./chain-config";

// Legacy export for backward compatibility
export const contractAddr =
  "0x610178da211fef7d417bc0e6fed39f05609ad788" as const;

// Dynamic contract configuration based on current chain
export function getWanderifyContract(chainId?: number) {
  const contractAddress = getContractAddress(chainId);
  return {
    abi: WanderifyABI.abi,
    address: contractAddress,
  };
}

// Hook to get contract config for current chain
export function useWanderifyContract() {
  const { chainId } = useAccount();
  return getWanderifyContract(chainId);
}

// Legacy export for backward compatibility (uses default chain)
export const WanderifyContract = getWanderifyContract();

export function useWanderifyBalance() {
  const { address } = useAccount();
  const contract = useWanderifyContract();

  return useReadContract({
    ...contract,
    functionName: "balanceOf",
    args: [address as Address],
  });
}
