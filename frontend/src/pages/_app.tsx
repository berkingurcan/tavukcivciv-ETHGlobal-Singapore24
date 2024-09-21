import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';

const TESTNET_CHAIN_ID = 8008135;
const TESTNET_RPC_URL = "https://api.helium.fhenix.zone";

const fhenix = {
  url: "https://api.helium.fhenix.zone",
  name: 'fhenix',
  nativeCurrency: { name: 'Fhenix', symbol: 'TFHE', decimals: 18 },
  rpcUrls: {default: { http: [TESTNET_RPC_URL] }},
  id: 8008135,
}

const fhenixLocal = {
  url: "http://localhost:42069",
  name: 'fhenixlocal',
  nativeCurrency: { name: 'Fhenix', symbol: 'TFHE', decimals: 18 },
  rpcUrls: {default: { http: ["http://localhost:42069"] }},
  id: 412346,
}

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [fhenix, fhenixLocal],
});

const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
