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
| SECONDARY MARKET | Resell and transfer ticket ownership securely |
| EVENT TIME SLOTS | Multiple selectable time options per event |
| DATA PERSISTENCE | Browser-side caching retains state after reload |

---

# TECH STACK
---

- React.js (Vite)
- Tailwind CSS
- Lucide React Icons
- `window.ethereum` / MetaMask API

---

# PREREQUISITES
---

```diff
+ Node.js and npm installed
+ MetaMask browser extension installed
```

---

# WORKFLOWS
---

### ORGANIZER

```diff
+ CONNECT WALLET
+ CREATE EVENT
+ ADD TIME SLOTS
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

