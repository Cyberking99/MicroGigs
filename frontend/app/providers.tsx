"use client";

import { type ReactNode } from "react";
import { http, createConfig, WagmiProvider } from 'wagmi'
import { baseSepolia } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { Toaster } from "react-hot-toast";
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector'

export function Providers(props: { children: ReactNode }) {
  return (
    <MiniKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={baseSepolia}
      config={{
        appearance: {
          mode: "auto",
          theme: "mini-app-theme",
          name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
          logo: process.env.NEXT_PUBLIC_ICON_URL,
        },
        wallet: { 
          display: 'modal',
        },
      }}
    >
      <WagmiProvider config={config}>
      {props.children}
      <Toaster position="top-right" />
      </WagmiProvider>
    </MiniKitProvider>
  );
}

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  connectors: [
    miniAppConnector()
  ]
})
