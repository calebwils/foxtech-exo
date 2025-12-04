# Izitobuy - Multi-Vendor E-commerce Platform

A high-performance, professional e-commerce solution featuring a public storefront, multi-vendor management, logistics/courier network, and AI-powered product sourcing.

## 🚀 Features

### 🛒 Customer Storefront
- **Modern UI/UX**: Responsive design with a sliding hero banner and 4-column product grid.
- **Advanced Filtering**: Filter by price, category, brand, condition, and color with a sticky sidebar.
- **Infinite Scroll**: Seamless browsing experience with auto-loading products.
- **Secure Checkout**: Integrated **FedaPay** (Mobile Money & Cards) and Cash on Delivery.
- **Customer Dashboard**: Track orders, manage wishlist, wallet, and live delivery tracking with GPS maps.

### 🏪 Seller Dashboard
- **Dedicated Portal**: Sellers manage their specific inventory and view their public store.
- **Financials**: Track revenue, payout balance, and transaction history.
- **Store Profile**: Manage store name, logo, and contact details.

### 🚚 Courier Logistics (IzitoGo)
- **Job Board**: Real-time feed of available delivery jobs.
- **Route Optimization**: Smart logic allowing job stacking based on location.
- **Secure Handshake**: PIN verification system for both Pickup (Vendor) and Delivery (Customer).
- **Live Tracking**: Real-time status updates and availability toggles.

### 🛡️ Admin & Tools
- **Global Overview**: Manage all users, sellers, and inventory.
- **AI Sourcing Agent**: Powered by **Google Gemini**, automatically finds products online, extracts images/specs, and imports them to the catalog.
- **CRM**: Manage customer requests for out-of-stock items.
- **Analytics**: Visual charts for revenue, sales distribution, and system health.

## 🛠 Tech Stack
- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Google GenAI SDK (Gemini 2.5 Flash)
- **Payment**: FedaPay Widget integration
- **State Management**: React Context API

## 🔑 Access Credentials (Simulation)

Use the following credentials to test the specific roles. The password for all accounts is generic (e.g., `123456`) or use the "Admin Lock" password `admin` for the dashboard entry.

| Role | Email | Features |
|------|-------|----------|
| **Super Admin** | `admin@izitobuy.com` | Full access to Analytics, Sellers, AI Agent, Global Inventory. |
| **Seller** | `seller@habas.store.com` | Access to "Habas Store" inventory and financial stats. |
| **Courier** | `courier@izitobuy.com` | Access to Courier Dashboard, Job Feed, and Active Tasks. |
| **Customer** | `customer@gmail.com` | Standard shopping experience and Customer Dashboard. |

> **Note**: To access the dashboard from the storefront, click the **Dashboard** button in the header. If prompted for a secure password, enter `admin`.

## 📦 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment**:
   Ensure you have a `.env` file with your Gemini API Key if you want the AI features to work:
   ```env
   API_KEY=your_google_genai_api_key
   ```

3. **Run the project**:
   ```bash
   npm run dev
   ```

## 🌍 Localization
The platform is fully bilingual (**English** / **French**) and supports multiple currencies (**FCFA**, **USD**, **EUR**, **NGN**, **GHS**). Toggle these settings in the top header.

## 🤖 AI Agent Usage
1. Log in as **Admin** or **Seller**.
2. Navigate to **AI Sourcing** (Sourcing IA).
3. Type a product name (e.g., "Sony WH-1000XM5") and click **Find**.
4. The agent will scrape data, generate a description, and allow you to import it directly to the store.
