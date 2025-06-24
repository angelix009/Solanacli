#!/bin/bash

# Script d'initialisation automatique du projet Solana Dashboard
echo "🚀 Initialisation du projet Solana Dashboard..."

# Créer la structure des dossiers
mkdir -p src/{components/{ui,wallet,token,dashboard},contexts,services,types,utils}
mkdir -p public

echo "📁 Structure des dossiers créée"

# Initialiser npm
npm init -y

echo "📦 package.json initialisé"

# Installer les dépendances
echo "📥 Installation des dépendances..."
npm install @solana/web3.js@^1.87.6 @solana/spl-token@^0.3.9 @solana/wallet-adapter-base@^0.9.23 @solana/wallet-adapter-react@^0.15.35 @solana/wallet-adapter-react-ui@^0.9.35 @solana/wallet-adapter-wallets@^0.19.26 react@^18.2.0 react-dom@^18.2.0 react-router-dom@^6.8.1 react-hot-toast@^2.4.1 lucide-react@^0.263.1 clsx@^2.0.0 tailwind-merge@^2.2.1

# Installer les dépendances de développement
npm install -D @types/react@^18.2.56 @types/react-dom@^18.2.19 typescript@^5.2.2 vite@^5.1.0 @vitejs/plugin-react@^4.2.1 tailwindcss@^3.4.1 autoprefixer@^10.4.17 postcss@^8.4.35 @types/node@^20.11.19

echo "✅ Dépendances installées"

# Initialiser Tailwind CSS
npx tailwindcss init -p

echo "🎨 Tailwind CSS configuré"

echo "✨ Projet initialisé avec succès!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Copiez tous les fichiers de code fournis"
echo "2. Lancez: npm run dev"
echo "3. Ouvrez: http://localhost:5173"