# BLOCKTIX  
### DECENTRALIZED EVENT TICKETING DAPP

BlockTix is a decentralized event ticketing platform that supports wallet-based ownership, event time slots, secondary resale, and AI-assisted event description generation.  
Organizers deploy events, and users mint uniquely owned tickets stored in their connected Ethereum wallet.

---

# FEATURES
---

| FEATURE | DESCRIPTION |
|---------|-------------|
| WALLET INTEGRATION | Connect with MetaMask and fetch real-time wallet state |
| REAL TRANSACTIONS | ETH payment on ticket purchase and resale |
| AI-ASSISTED DESCRIPTIONS | Gemini AI for instant event text generation |
| SECONDARY MARKET | Resell and transfer ticket ownership securely |
| EVENT TIME SLOTS | Multiple selectable time options per event |
| DATA PERSISTENCE | Browser-side caching retains state after reload |

---

# TECH STACK
---

- React.js (Vite)
- Tailwind CSS
- Lucide React Icons
- Google Gemini API
- `window.ethereum` / MetaMask API

---

# PREREQUISITES
---

```diff
+ Node.js and npm installed
+ MetaMask browser extension installed
```

---

# PROJECT SETUP
---

```bash
npm create vite@latest event-ticketing-dapp -- --template react
cd event-ticketing-dapp
```

---

# DEPENDENCIES
---

```bash
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react

npx tailwindcss init -p
```

---

# TAILWIND CONFIGURATION
---

```yaml
# FILE: tailwind.config.js
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
```

---

# GLOBAL STYLES
---

```css
/* FILE: src/index.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #020617; /* dark mode background */
  color: white;
}
```

---

# RUNNING THE APPLICATION
---

```bash
npm run dev
```

Open in browser:

```bash
http://localhost:5173
```

---

# WORKFLOWS
---

### ORGANIZER

```diff
+ CONNECT WALLET
+ CREATE EVENT
+ ADD TIME SLOTS
+ GENERATE DESCRIPTION (OPTIONAL)
+ DEPLOY CONTRACT
```

### CUSTOMER

```diff
+ BROWSE EVENTS
+ SELECT TIME SLOT
+ MINT TICKET
+ PAYMENT PROCESSED VIA METAMASK
```

### RESALE

```diff
+ OPEN MY TICKETS
+ SELECT TICKET → SELL
+ SET RESALE PRICE
+ LISTED IN SECONDARY MARKET
```

---

# TROUBLESHOOTING
---

```diff
! METAMASK NOT OPENING → ensure extension allowed in browser
! TRANSACTIONS STUCK   → verify test ETH or correct network
! BALANCE DELAYED      → wait for confirmation and refresh
```

---

# LICENSE
---

Open for learning, experimentation, and academic demonstration.

