🎟️ BlockTix

The Future of Decentralized Event Ticketing

📖 Overview

BlockTix is a cutting-edge Decentralized Application (DApp) that revolutionizes event ticketing. By leveraging the Ethereum blockchain, it eliminates scalpers and ensures ticket authenticity.

Organizers can deploy events as smart contracts, while users mint tickets as NFTs that are truly theirs—stored safely in their crypto wallets.

✨ Key Features

Feature

Description

🔗 Wallet Integration

Seamless connection with MetaMask. Real-time balance updates and transaction signing.

💸 Real Transactions

Buying a ticket triggers an actual ETH transfer from Buyer to Organizer.

🤖 AI Architect

Integrated Gemini AI helps organizers generate viral event descriptions instantly.

🔄 Secondary Market

Built-in resale platform. Sell your tickets securely without third-party brokers.

📅 Time Slotting

Support for complex events with multiple time slots (e.g., Cinema, Conferences).

💾 Smart Persistence

Local caching ensures your data stays safe even if you refresh the page.

🛠️ Tech Stack

Frontend Framework: React.js (Vite)

Styling: Tailwind CSS (Dark Mode optimized)

Icons: Lucide React

Artificial Intelligence: Google Gemini API

Blockchain Interaction: Web3 / window.ethereum API

🚀 Getting Started

Follow these steps to get your local blockchain ticketing system running in minutes.

1. Prerequisites

Node.js & npm installed.

MetaMask browser extension installed.

2. Installation

Clone the project or create a new one:

# Create the project structure
npm create vite@latest event-ticketing-dapp -- --template react
cd event-ticketing-dapp

# Install dependencies
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react


3. Configuration

Initialize Tailwind CSS:

npx tailwindcss init -p


Update tailwind.config.js:

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


Update src/index.css:

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #020617; /* Slate-950 */
  color: white;
}


4. Run the DApp

Copy the provided App.jsx code into your src folder and start the server:

npm run dev


🌐 Open your browser to http://localhost:5173

🎮 User Manual

🎭 For Organizers

Connect: Click the top-right wallet icon to link MetaMask.

Create: Go to the Organizer tab and hit "Create Event".

Draft: Fill in event details. Pro Tip: Use the "✨ AI" button to write your description.

Deploy: Click "Deploy Contract". Confirm the transaction in MetaMask (simulates a contract deployment).

🎫 For Buyers

Browse: Explore the Marketplace tab for live events.

Select: Choose a time slot for the event you love.

Mint: Click "Mint Ticket". MetaMask will ask you to send the ETH amount to the organizer.

Confirm: Once the transaction clears, the ticket is yours!

🔄 Reselling (P2P)

Navigate to My Tickets.

Click "Sell Ticket" on any ticket you own.

Set your price (ETH).

The ticket immediately appears in the Secondary Market section for other users to buy.

⚠️ Troubleshooting

"MetaMask not opening?"
Ensure you have the extension installed and are not in Incognito mode.

"Transactions failing?"
If you are on a Testnet (like Sepolia), ensure you have Test ETH. If testing locally, ensure MetaMask is set to a network that can handle the request, or use "Localhost 8545".

"Balance not updating?"
The app updates optimally, but blockchain confirmations take time. Wait 3-4 seconds after a transaction for the balance to refresh.
