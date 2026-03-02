# TruMarket Buyer & Supplier Platform

The TruMarket Buyer & Supplier Platform is the operational application used by buyers and suppliers to create, manage, and execute trade finance deals on TruMarket.

This platform is where export deals are initiated, structured, and tracked. Buyers create deals and define commercial terms, while suppliers participate in and execute shipments. Financing, investor participation, and capital allocation are handled separately through the investor platform.

Live application: https://app.trumarket.tech  
Demo video: https://www.loom.com/share/6ee3cfc7a0ea476695bdf6c6a70dc383

---

## How it works

1. **Account access**  
   Buyers and suppliers create an account or log in to an existing one.

2. **Deal creation (Buyer)**  
   Buyers create a new deal by defining:
   - Product and shipment details  
   - Origin and destination  
   - Quantity and pricing  
   - Timeline and milestones  

3. **Milestones and supplier payouts**  
   During deal creation, milestones are defined as part of the contract terms.  
   These milestones determine when funds are released to the supplier.

   - Milestones represent key shipment or delivery checkpoints  
   - Supplier payouts are released progressively as milestones are completed  
   - This structure gives suppliers predictable cash flow while keeping buyers protected  

4. **Supplier participation**  
   Suppliers are linked to deals and confirm their participation. They execute the shipment and update progress as milestones are reached.

5. **Deal execution and tracking**  
   Once a deal is active:
   - Shipment progress is tracked against defined milestones  
   - Deal status is updated as milestones are completed  
   - Payouts to suppliers are triggered according to milestone completion  

6. **Completion**  
   After all milestones are completed and the shipment is finalized, the deal is marked as completed and settlements are finalized.

---

## Platform preview

The images below show the main buyer and supplier workflows. Replace with updated screenshots if needed.

![Create account](screenshots/create-account.png)
![My deals dashboard](screenshots/my-deals.png)  
![Create deal flow](screenshots/create-deal.png)  
![Deal details](screenshots/shipment-details.png)  

---

## How this fits into TruMarket

TruMarket connects three parties:
- Buyers who create and structure export deals  
- Suppliers who execute shipments and receive milestone-based payouts  
- Investors who provide financing through a separate platform  

This application focuses on deal creation, milestone definition, and operational transparency.  
Financing logic, vault management, and investor interactions are handled by TruMarket's backend and contract infrastructure.

---

## Smart contracts

Deal financing and fund custody are implemented separately from this application.

For details on the on-chain architecture, vaults, and deal contracts, refer to the contracts repository:

https://github.com/trumarket/contracts  
(update this link if needed)

---

## Tech stack

- React with TypeScript  
- TruMarket internal APIs  
- Authentication and role-based access (buyer and supplier)  
- Vercel for deployment  

---

## Local development

### Requirements

- Node.js 18 or later  
- npm or yarn  

### Setup

```bash
git clone https://github.com/AgroSmart-Contracts/trumarket.git
cd trumarket
```

#### API Setup

```bash
cd api
npm install
npm run dev
```

The API will be available at:

```
http://localhost:4000
```

#### Web Setup

```bash
cd web
npm install
npm run dev
```

The web application will be available at:

```
http://localhost:3000
```

### Environment variables

This repository includes sample environment files for both API and web.

**API Environment Variables:**

```bash
cp .env.api.sample api/.env
```

**Web Environment Variables:**

```bash
cp .env.web.example web/.env.local
```

Update the values in each `.env` file as needed for your environment.

---

## Demo

A short walkthrough covering deal creation, milestone definition, supplier execution, and milestone-based payouts is available here:

https://www.loom.com/share/6ee3cfc7a0ea476695bdf6c6a70dc383

---

## Status

This platform is live in production and actively used by buyers and suppliers. Features evolve as new deal workflows and financing structures are introduced.

---

## Contact

team@trumarket.tech  
https://www.trumarket.tech
