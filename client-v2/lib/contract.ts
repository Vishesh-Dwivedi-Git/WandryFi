import { useAccount, useReadContract } from "wagmi";
import { Address } from "viem";

import WanderifyABI from "@/contracts/Wanderify.json";

export const contractAddr =
  "0x5b73c5498c1e3b4dba84de0f1833c4a029d90519" as const;

export const WanderifyContract = {
  abi: WanderifyABI.abi,
  address: contractAddr,
};

export function useWanderifyBalance() {
  const { address } = useAccount();
  return useReadContract({
    ...WanderifyContract,
    functionName: "balanceOf",
    args: [address as Address],
  });
}
