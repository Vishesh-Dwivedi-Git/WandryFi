export interface ChainConfig {
  chainId: number;
  name: string;
  contractAddress: `0x${string}`;
  rpcUrl?: string;
  blockExplorer?: string;
}

export const CHAIN_CONFIGS: Record<number, ChainConfig> = {
  // Monad Testnet
  10143: {
    chainId: 10143,
    name: "Monad Testnet",
    contractAddress: "0x26c5FeC3C293D2b755ab5ce60BbE231671f1eeD0", // Deployed on Monad Testnet
    rpcUrl: "https://testnet-rpc.monad.xyz",
    blockExplorer: "https://testnet.monad.xyz",
  },
};

export const DEFAULT_CHAIN_ID = 10143; // Anvil for development

export function getChainConfig(chainId?: number): ChainConfig {
  const id = chainId || DEFAULT_CHAIN_ID;
  return CHAIN_CONFIGS[id] || CHAIN_CONFIGS[DEFAULT_CHAIN_ID];
}

export function getContractAddress(chainId?: number): `0x${string}` {
  // First check for environment variable
  const envAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (envAddress && envAddress.startsWith('0x')) {
    return envAddress as `0x${string}`;
  }

  // Fallback to chain-specific config
  return getChainConfig(chainId).contractAddress;
}

export function getSupportedChains(): ChainConfig[] {
  return Object.values(CHAIN_CONFIGS);
}

export function isSupportedChain(chainId: number): boolean {
  return chainId in CHAIN_CONFIGS;
}
