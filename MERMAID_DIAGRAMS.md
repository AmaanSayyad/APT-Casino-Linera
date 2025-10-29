# Stacks Casino - Mermaid Architecture Diagrams

## 🏗️ System Architecture Overview

```mermaid
graph TB
    subgraph Frontend["Frontend Layer"]
        A[Next.js 14 App] --> B[React Components]
        B --> C[Game Components]
        B --> D[Material-UI]
        B --> E[Dual Wallet System]
        E --> E1[Stacks Wallet - Leather]
        E --> E2[Ethereum Wallet - Wagmi]
    end
    
    subgraph State["State Management"]
        F[Redux Store] --> G[React Query]
        G --> H[Stacks Context]
        H --> I[Balance Management]
        F --> J[Game State]
    end
    
    subgraph API["API Layer"]
        K[Next.js API Routes] --> L[Pyth Entropy API]
        K --> M[Withdrawal API]
        K --> N[Deposit Processing]
    end
    
    subgraph Blockchain["Dual Blockchain Layer"]
        O[Stacks Network] --> P[STX Transactions]
        P --> Q[Treasury Wallet]
        Q --> R[Deposit/Withdrawal]
        
        S[Arbitrum Sepolia] --> T[Pyth Entropy Contract]
        T --> U[Random Generation]
        U --> V[Entropy Proofs]
    end
    
    subgraph Storage["Data Storage"]
        W[LocalStorage] --> X[User Balance]
        W --> Y[Game History]
        W --> Z[Transaction Records]
    end
    
    A --> F
    B --> K
    K --> O
    K --> S
    E1 --> O
    E2 --> S
    L --> T
    M --> Q
```

## 🔄 Application Bootstrap Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant N as Next.js
    participant P as Providers
    participant SW as StacksWallet
    participant W as Wagmi
    
    U->>B: Access Application
    B->>N: Load App Router
    N->>P: Initialize Providers
    P->>W: Setup Wagmi (Arbitrum)
    P->>SW: Setup Stacks Context
    SW->>P: Stacks Ready
    W->>P: Wagmi Ready
    P->>N: All Providers Ready
    N->>B: Render Application
    B->>U: Display Casino UI
```

## 🔗 Dual Wallet Connection Flow

```mermaid
flowchart TD
    A[User Visits Casino] --> B{Stacks Wallet Connected?}
    B -->|No| C[Show Connect Button]
    B -->|Yes| D[Load User Balance]
    
    C --> E[User Clicks Connect]
    E --> F[Leather Wallet Popup]
    F --> G{User Approves?}
    G -->|Yes| H[Wallet Connected]
    G -->|No| I[Connection Failed]
    
    H --> J[Load STX Balance]
    J --> K[Load Casino Balance]
    K --> L[Enable Gaming]
    
    L --> M{Pyth Entropy Needed?}
    M -->|Yes| N[Connect Ethereum Wallet]
    M -->|No| O[Use Fallback Randomness]
    
    N --> P[MetaMask Connection]
    P --> Q[Arbitrum Sepolia]
    Q --> R[Enhanced Randomness]
    
    I --> S[Show Error Message]
    S --> C
```

## 💰 STX Deposit Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend
    participant L as Leather Wallet
    participant S as Stacks Network
    participant T as Treasury
    participant API as Backend API
    
    U->>UI: Click Deposit STX
    UI->>U: Show Deposit Modal
    U->>UI: Enter Amount
    UI->>L: Request STX Transfer
    L->>U: Show Transaction Details
    U->>L: Confirm Transaction
    L->>S: Broadcast Transaction
    S->>T: Transfer STX to Treasury
    S->>L: Transaction Confirmed
    L->>UI: Transaction Success
    UI->>API: Process Deposit
    API->>UI: Update Balance
    UI->>U: Show Success + New Balance
```

## 💸 STX Withdrawal Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend
    participant API as Withdrawal API
    participant T as Treasury Wallet
    participant S as Stacks Network
    participant UW as User Wallet
    
    U->>UI: Click Withdraw
    UI->>U: Show Withdrawal Modal
    U->>UI: Confirm Withdrawal
    UI->>API: Request Withdrawal
    API->>T: Create STX Transaction
    T->>S: Broadcast Transaction
    S->>UW: Transfer STX
    S->>API: Transaction Confirmed
    API->>UI: Withdrawal Success
    UI->>U: Update Balance to 0
```

## 🎲 Game Flow with Pyth Entropy

```mermaid
sequenceDiagram
    participant U as User
    participant G as Game Component
    participant API as Entropy API
    participant P as Pyth Contract
    participant A as Arbitrum
    participant UI as Game UI
    
    U->>G: Place Bet
    G->>API: Request Random Number
    API->>P: Call requestV2()
    P->>A: Create Transaction
    A->>P: Transaction Confirmed
    P->>API: Return Request ID
    API->>P: Get Random Value
    P->>API: Return Random + Proof
    API->>G: Send Result + Proof
    G->>UI: Calculate Game Outcome
    UI->>U: Show Result + Proof Link
```

## 🎮 Plinko Game Architecture

```mermaid
graph TB
    subgraph PlinkoGame["Plinko Game Component"]
        A[Game Controls] --> B[Ball Physics]
        B --> C[Peg Collision]
        C --> D[Path Calculation]
        D --> E[Multiplier Result]
    end
    
    subgraph Randomness["Randomness Generation"]
        F[Pyth Entropy] --> G[Ball Direction]
        G --> H[Bounce Physics]
        H --> I[Final Position]
    end
    
    subgraph Rendering["3D Rendering"]
        J[Three.js Scene] --> K[Ball Animation]
        K --> L[Peg Rendering]
        L --> M[Multiplier Display]
    end
    
    A --> F
    E --> J
    I --> E
```

## 🏦 Treasury Management System

```mermaid
graph TB
    subgraph Treasury["Treasury Wallet System"]
        A[Stacks Treasury] --> B[STZ2YCW72SDSCVYQKEPC3PNQ7J69EFTFERHEPC9]
        B --> C[Deposit Processing]
        B --> D[Withdrawal Processing]
        
        E[Ethereum Treasury] --> F[0xb424d2369F07b925D1218B08e56700AF5928287b]
        F --> G[Pyth Entropy Fees]
        F --> H[Gas Management]
    end
    
    subgraph Security["Security Measures"]
        I[Private Key Management] --> J[Environment Variables]
        J --> K[Server-side Only]
        K --> L[No Client Exposure]
    end
    
    subgraph Monitoring["Balance Monitoring"]
        M[STX Balance Check] --> N[Auto-refill Alerts]
        O[ETH Balance Check] --> P[Gas Fee Monitoring]
    end
    
    C --> I
    D --> I
    G --> I
```

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph ClientSide["Client-Side Security"]
        A[Wallet Connection] --> B[User Signature Required]
        B --> C[Transaction Approval]
        C --> D[No Private Key Storage]
    end
    
    subgraph ServerSide["Server-Side Security"]
        E[Environment Variables] --> F[Private Key Protection]
        F --> G[API Rate Limiting]
        G --> H[Input Validation]
    end
    
    subgraph Blockchain["Blockchain Security"]
        I[Stacks Network] --> J[Transaction Immutability]
        K[Pyth Entropy] --> L[Cryptographic Randomness]
        L --> M[Verifiable Proofs]
    end
    
    subgraph Verification["Proof Verification"]
        N[Entropy Proof] --> O[Request ID]
        O --> P[Sequence Number]
        P --> Q[Transaction Hash]
        Q --> R[Arbiscan Verification]
    end
    
    A --> E
    E --> I
    I --> N
```

## 📊 Data Flow Architecture

```mermaid
graph LR
    subgraph Input["User Input"]
        A[Wallet Connection] --> B[Deposit STX]
        B --> C[Place Bet]
        C --> D[Game Interaction]
    end
    
    subgraph Processing["Data Processing"]
        E[Balance Update] --> F[Random Generation]
        F --> G[Game Logic]
        G --> H[Result Calculation]
    end
    
    subgraph Storage["Data Storage"]
        I[LocalStorage] --> J[Redux Store]
        J --> K[Component State]
        K --> L[UI Updates]
    end
    
    subgraph Output["User Output"]
        M[Balance Display] --> N[Game Results]
        N --> O[Transaction History]
        O --> P[Proof Links]
    end
    
    A --> E
    B --> E
    C --> F
    D --> G
    E --> I
    F --> I
    G --> I
    H --> M
```

## 🌐 Network Integration

```mermaid
graph TB
    subgraph StacksNetwork["Stacks Network Integration"]
        A[Stacks Testnet] --> B[STX Transactions]
        B --> C[Wallet Integration]
        C --> D[Balance Management]
        
        E[Stacks Mainnet] --> F[Production Ready]
        F --> G[Real STX Value]
    end
    
    subgraph ArbitrumNetwork["Arbitrum Integration"]
        H[Arbitrum Sepolia] --> I[Pyth Entropy Contract]
        I --> J[Random Generation]
        J --> K[Proof Generation]
        
        L[Arbitrum One] --> M[Production Entropy]
        M --> N[Lower Gas Costs]
    end
    
    subgraph CrossChain["Cross-Chain Communication"]
        O[Frontend Coordination] --> P[Dual Provider Management]
        P --> Q[Network Switching]
        Q --> R[Seamless UX]
    end
    
    A --> O
    H --> O
    E --> O
    L --> O
```

## 🎯 Game State Management

```mermaid
stateDiagram-v2
    [*] --> WalletDisconnected
    WalletDisconnected --> WalletConnecting : Connect Wallet
    WalletConnecting --> WalletConnected : Success
    WalletConnecting --> WalletDisconnected : Failed
    
    WalletConnected --> BalanceLoading : Load Balance
    BalanceLoading --> BalanceLoaded : Success
    BalanceLoading --> BalanceError : Failed
    
    BalanceLoaded --> GameReady : Sufficient Balance
    BalanceLoaded --> InsufficientFunds : Low Balance
    
    GameReady --> BettingPhase : Start Game
    BettingPhase --> RandomnessRequested : Place Bet
    RandomnessRequested --> RandomnessReceived : Entropy Generated
    RandomnessReceived --> GameResult : Calculate Outcome
    GameResult --> BalanceUpdated : Update Balance
    BalanceUpdated --> GameReady : Continue Playing
    
    InsufficientFunds --> DepositModal : Deposit STX
    DepositModal --> BalanceLoading : Deposit Success
    
    BalanceUpdated --> WithdrawalModal : Withdraw Request
    WithdrawalModal --> WalletDisconnected : Withdrawal Success
```

---

## 📝 Diagram Usage Notes

### Viewing Diagrams
- Copy any mermaid code block
- Paste into [Mermaid Live Editor](https://mermaid.live/)
- Or use VS Code with Mermaid extension

### Updating Diagrams
- Modify mermaid syntax as needed
- Test in Mermaid Live Editor
- Update this file with changes

### Integration
- These diagrams document the current architecture
- Update when making significant system changes
- Use for onboarding new developers

---

**Built with ❤️ for Stacks Network** 🚀