BlockTix - Decentralized Event Ticketing DApp

BlockTix is a modern, decentralized application (DApp) for event ticketing built with React and Tailwind CSS. It simulates a blockchain environment where organizers can deploy events and users can mint unique digital tickets (NFTs) using their Ethereum wallets.

🌟 Features

🔗 Blockchain & Wallet Integration

MetaMask Support: Connects directly to your browser's MetaMask wallet.

Real Transactions: Buying a ticket triggers a real Ethereum transaction, transferring ETH from the buyer to the organizer.

Gas Simulation: Simulates contract deployment costs when creating events.

Balance Updates: Automatically updates and displays your wallet balance after transactions.

📅 Event Management (Organizer)

Create Events: Deploy new events with details like name, date, location, and price.

Time Slots: Add multiple time slots for a single event.

AI Assistance: Use the integrated Gemini AI to generate catchy event descriptions instantly.

Manage: Edit event details or delete events from the platform.

🎟️ Ticketing & Marketplace (User)

Mint Tickets: Purchase tickets directly from the organizer (Primary Market).

My Tickets: View your owned tickets with a unique digital stub style.

Secondary Market: List your tickets for resale at your own price. Other users can buy them, transferring ownership and funds instantly.

🤖 AI Concierge

Smart Chat: A floating chatbot powered by Gemini AI that knows the live event data and can answer questions like "What events are under 0.1 ETH?" or "Find me music festivals."

💾 Persistence

Local Storage: Events and tickets are saved locally in your browser, so data persists even if you refresh the page.

🛠️ Tech Stack

Frontend: React.js (Vite)

Styling: Tailwind CSS

Icons: Lucide React

AI: Google Gemini API

Web3: window.ethereum (MetaMask API)

🚀 Installation & Setup

Prerequisites

Node.js installed on your computer.

MetaMask Extension installed in your browser.

VS Code (recommended editor).

Step 1: Create the Project

Open your terminal and run the following commands to create a standard Vite React project:

npm create vite@latest event-ticketing-dapp -- --template react
cd event-ticketing-dapp


Step 2: Install Dependencies

Install the required packages for styling and icons:

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react


Step 3: Configure Tailwind

Open tailwind.config.js and update the content array:

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


Open src/index.css and replace everything with:

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #020617; /* Dark Mode Background */
  color: white;
}


Step 4: Add the Code

Copy the provided App.jsx code into your src/App.jsx file.

Step 5: Run the App

npm run dev


Open the local URL (usually http://localhost:5173) in your browser.

📖 User Manual

1. Connecting Your Wallet

Click the "Connect Wallet" button in the top right corner.

MetaMask will open. Select an account and approve the connection.

Note: To test different roles (Organizer vs Customer), use the "Create Account" feature in MetaMask to switch between different wallet addresses.

2. For Organizers: Creating an Event

Navigate to the "Organizer" tab.

Click "Create Event".

Fill in the details (Name, Date, Price in ETH, Total Seats).

AI Feature: Type the event name and click "Generate with AI" to get a creative description.

Add at least one Time Slot (e.g., "18:00").

Click "Deploy Contract".

MetaMask will pop up asking to confirm a 0 ETH transaction (simulating deployment). Confirm it.

Your event is now live on the Market!

3. For Customers: Buying a Ticket

Go to the "Marketplace" tab.

Browse available events.

Select a Time Slot for the event you want.

Click "Mint Ticket".

MetaMask will pop up showing the transaction amount (Ticket Price). Confirm the payment.

Once confirmed, the ticket will appear in your "My Tickets" tab.

4. Reselling a Ticket

Go to "My Tickets".

Click "Sell Ticket".

Enter a resale price (e.g., slightly higher or lower than original).

Confirm. The ticket is now listed in the "Secondary Market" section of the Marketplace tab.

To buy a resale ticket, switch to a different wallet account and browse the Secondary Market section.

⚠️ Troubleshooting

"MetaMask not found": Ensure you have the browser extension installed and you are not in Incognito mode (unless extensions are allowed).

Transaction Stuck: If using a Testnet (like Sepolia), ensure you have enough Test ETH for gas fees. If testing locally without a blockchain network, standard transactions might hang if MetaMask expects a real network response.

Input Focus Loss: If typing in a field makes it lose focus, ensure you are using the provided refactored code where components are defined outside the main App function.
