"use client";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { createConfig, WagmiProvider } from "wagmi";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { http } from "wagmi";
import { defineChain } from "viem";
import { Mantle } from "@thirdweb-dev/chains";

const mantleChain = defineChain({
  id: Mantle.chainId,
  name: "Mantle",
  network: "mantle",
  nativeCurrency: {
    name: "Mantle",
    symbol: "MNT",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.mantle.xyz"] },
    public: { http: ["https://rpc.mantle.xyz"] },
  },
  blockExplorers: {
    default: { name: "Mantle Explorer", url: "https://explorer.mantle.xyz" },
  },
});

const wagmiConfig = createConfig({
  chains: [mantleChain],
  transports: {
    [mantleChain.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: false,
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <ThirdwebProvider
          activeChain={Mantle}
          clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
          supportedWallets={[]}
        >
          <NuqsAdapter>{children}</NuqsAdapter>
        </ThirdwebProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
