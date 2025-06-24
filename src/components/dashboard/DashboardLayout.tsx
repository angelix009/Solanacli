import React, { useState } from 'react';
import { WalletConnector } from '../wallet/WalletConnector';
import { NetworkSelector } from '../wallet/NetworkSelector';
import { TokenCreator } from '../token/TokenCreator';
import { TokenManager } from '../token/TokenManager';
import { WalletExplorer } from '../wallet/WalletExplorer';
import { 
  LayoutDashboard, 
  Plus, 
  Settings, 
  Wallet, 
  Menu, 
  X,
  Github,
  Twitter 
} from 'lucide-react';
import { Button } from '../ui';

type TabType = 'overview' | 'create' | 'manage' | 'explorer';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs: Tab[] = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      component: <DashboardOverview />
    },
    {
      id: 'create',
      label: 'Create Token',
      icon: <Plus className="h-5 w-5" />,
      component: <TokenCreator />
    },
    {
      id: 'manage',
      label: 'Manage Tokens',
      icon: <Settings className="h-5 w-5" />,
      component: <TokenManager />
    },
    {
      id: 'explorer',
      label: 'Wallet Explorer',
      icon: <Wallet className="h-5 w-5" />,
      component: <WalletExplorer />
    }
  ];

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                Solana Dashboard
              </h1>
            </div>
          </div>
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-4">
            <NetworkSelector />
            <WalletConnector />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}>
          <div className="flex flex-col h-full pt-16 md:pt-0">
            <nav className="flex-1 p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${activeTab === tab.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
            
            <div className="p-4 border-t">
              <div className="flex items-center justify-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {activeTabContent}
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome to Solana Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Professional token management interface for Solana blockchain
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6 rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Plus className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold">Create Tokens</h3>
              <p className="text-sm text-muted-foreground">
                Launch new SPL tokens with custom metadata
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Settings className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">Manage Tokens</h3>
              <p className="text-sm text-muted-foreground">
                Freeze, thaw, and control token accounts
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Wallet className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Explore Wallets</h3>
              <p className="text-sm text-muted-foreground">
                View wallet balances and token holdings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Features</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Create SPL tokens with metadata</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Upload token images to IPFS</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Configure freeze and mint authorities</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Freeze/thaw token accounts</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Explore wallet holdings</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Multi-network support</span>
            </li>
          </ul>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Getting Started</h3>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span>Connect your Solana wallet using the button in the top right</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>Select your preferred network (Devnet recommended for testing)</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>Navigate to "Create Token" to launch your first SPL token</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                4
              </span>
              <span>Use "Manage Tokens" to control existing tokens and accounts</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}