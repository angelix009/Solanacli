import React from 'react';
import { SolanaProvider } from './contexts/SolanaContext';
import { WalletContextProvider } from './components/wallet/WalletContextProvider';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { Toaster } from 'react-hot-toast';
import './index.css';

function App() {
  return (
    <SolanaProvider>
      <WalletContextProvider>
        <div className="App">
          <DashboardLayout />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(var(--primary))',
                  secondary: 'hsl(var(--primary-foreground))',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'hsl(var(--destructive-foreground))',
                },
              },
            }}
          />
        </div>
      </WalletContextProvider>
    </SolanaProvider>
  );
}

export default App;