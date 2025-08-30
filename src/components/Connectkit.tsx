import { createConfig, WagmiProvider, http } from 'wagmi';
import { ConnectKitProvider, ConnectKitButton, getDefaultConfig } from 'connectkit';
import { base, baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Cliente para react-query
const queryClient = new QueryClient();

// Configuración recomendada de ConnectKit
const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    chains: [base, baseSepolia],
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http(),
    },

    // Required
    appName: "Capital Frens Pension",

    // Optional
    appDescription: "Your DeFi Pension Protocol",
    appUrl: "https://capitalfrens.com", // your app's url
    appIcon: "https://capitalfrens.com/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);

// Componente principal que envuelve tu aplicación
export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<ConnectKitProvider>{children}</ConnectKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
};

// Componente del botón de conexión que puedes usar en cualquier parte de tu app
export const ConnectWalletButton: React.FC = () => {
	return (
		<ConnectKitButton.Custom>
			{({ isConnected, isConnecting, show, address, ensName }) => {
				return (
					<button
						onClick={show}
						className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
					>
						{isConnected
							? `Connected: ${
									ensName || address?.substring(0, 6)
							  }...${address?.substring(38)}`
							: isConnecting
							? 'Connecting...'
							: 'connect Wallet'}
					</button>
				);
			}}
		</ConnectKitButton.Custom>
	);
};
