# 📈 Stonks - Institutional Financial Ecosystem Dashboard

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-000000.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-316192.svg)](https://www.postgresql.org/)

> A sophisticated, enterprise-grade financial strategy builder and backtesting platform powered by AI-driven analysis and institutional-quality visualizations.

## ✨ Features

### 🤖 AI-Powered Strategy Builder
- **Natural Language Processing**: Convert trading ideas into executable strategies using AI
- **Intelligent Parsing**: Automatic strategy logic generation from plain English descriptions
- **Multi-Asset Support**: Trade stocks, cryptocurrencies, and options with unified interface

### 📊 Advanced Analytics
- **Professional Backtesting Engine**: Historical performance analysis with industry-standard metrics
- **Real-Time Market Data**: Live market microstructure visualization and order book depth
- **Technical Indicators**: Comprehensive library including RSI, MACD, moving averages, and more
- **Performance Metrics**: Sharpe ratio, maximum drawdown, win rate, and equity curves

### 🔒 Enterprise Security & Compliance
- **AI Risk Monitoring**: Agentic AI for real-time risk assessment and scoring
- **Compliance Dashboard**: Track regulatory requirements (DORA, MiCA, GDPR)
- **Security Threat Detection**: Monitor and respond to security incidents
- **Zero-Trust Architecture**: Enterprise-grade security implementation

### 🎨 Modern User Interface
- **Dark Mode**: Carbon Design System-inspired professional interface
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-Time Updates**: Live data streaming with smooth animations
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - Modern UI library with hooks
- **TypeScript 5.6** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first styling
- **Wouter** - Lightweight routing
- **TanStack Query** - Powerful data fetching
- **Recharts** - Advanced data visualization
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives

### Backend
- **Node.js 20.x** - JavaScript runtime
- **Express 4.21** - Web application framework
- **TypeScript** - End-to-end type safety
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Robust relational database
- **Zod** - Schema validation

### AI & Data Processing
- **Perplexity API** - Natural language understanding
- **Gemini API** - Advanced AI capabilities
- **Technical Indicators Library** - Financial analysis toolkit
- **Axios** - HTTP client for external APIs

### Development Tools
- **Vite 7.3** - Next-generation build tool
- **tsx** - TypeScript execution
- **ESBuild** - Blazing fast bundler
- **Drizzle Kit** - Database migrations

## 🚀 Getting Started

### Prerequisites

- **Node.js 20.x or higher** - [Download](https://nodejs.org/)
- **PostgreSQL 14.x or higher** - [Download](https://www.postgresql.org/download/)
- **npm or yarn** - Package manager (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/blairmichaelg/Stonks.git
   cd Stonks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/stonks
   
   # AI Services (Optional - fallback strategies are used if not provided)
   PERPLEXITY_API_KEY=your_perplexity_key_here
   GEMINI_API_KEY=your_gemini_key_here
   
   # Server
   PORT=5000
   NODE_ENV=development
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5000`

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm run check` | Type-check TypeScript code |
| `npm run db:push` | Push database schema changes |

## 📖 Usage

### Creating a Trading Strategy

1. Navigate to the **Strategy Builder** page
2. Enter your trading idea in plain English:
   ```
   "Buy when RSI is below 30 and MACD is positive, 
    sell when profit reaches 10% or loss exceeds 5%"
   ```
3. Review the AI-parsed strategy logic
4. Configure parameters (asset type, symbol, timeframe)
5. Save and run backtest

### Viewing Results

1. Go to the **Dashboard** to see all your strategies
2. Click on a strategy to view detailed analytics:
   - Equity curve visualization
   - Performance metrics (returns, Sharpe ratio, max drawdown)
   - Individual trade history
   - Risk analysis

### Monitoring AI Agents

The dashboard displays real-time information about:
- **Risk Agents**: Portfolio risk assessment
- **Execution Agents**: Trade execution monitoring
- **Compliance Agents**: Regulatory requirement tracking

## 🏗️ Project Structure

```
Stonks/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and helpers
│   │   └── main.tsx       # Application entry point
│   └── index.html         # HTML template
├── server/                # Backend Express application
│   ├── services/          # Business logic
│   │   ├── ai.ts         # AI strategy parsing
│   │   ├── backtest.ts   # Backtesting engine
│   │   └── marketData.ts # Market data fetching
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── db.ts             # Database connection
│   └── storage.ts        # Data access layer
├── shared/               # Shared types and schemas
│   ├── schema.ts         # Database schema & Zod validators
│   └── routes.ts         # API route contracts
├── script/               # Build and deployment scripts
└── package.json          # Project dependencies
```

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Carbon Design System** by IBM for design inspiration
- **shadcn/ui** for component architecture patterns
- **Vercel** for hosting guidance
- Financial data providers and API services
- Open source community for the incredible tools and libraries

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/blairmichaelg/Stonks/issues)
- **Discussions**: [GitHub Discussions](https://github.com/blairmichaelg/Stonks/discussions)
- **Documentation**: [Wiki](https://github.com/blairmichaelg/Stonks/wiki)

## 🗺️ Roadmap

- [ ] Real-time WebSocket market data streaming
- [ ] Portfolio optimization algorithms
- [ ] Multi-strategy portfolio backtesting
- [ ] Options pricing models (Black-Scholes, Binomial)
- [ ] Machine learning signal generation
- [ ] Paper trading mode with live markets
- [ ] Mobile application (React Native)
- [ ] Advanced charting with TradingView integration

---

**Built with ❤️ by the Stonks Team**

*Disclaimer: This software is for educational and research purposes only. Always consult with a qualified financial advisor before making investment decisions.*
