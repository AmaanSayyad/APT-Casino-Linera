import { http, createConfig } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'

// Arbitrum Sepolia chain for Pyth Entropy
export const config = createConfig({
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC),
  },
})