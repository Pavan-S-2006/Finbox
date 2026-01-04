# FinanceVault - Personal Finance Manager

A proactive financial "Control Center" for the average household, focusing on ease of entry, predictive simulation, and secure family legacy.

## Features

### 🔐 Authentication & Security
- Secure login with email/password
- MFA support (biometric + OTP ready)
- Role-based family profiles (Primary, Editor, Viewer)
- 256-bit encryption ready

### 📊 Dashboard
- Real-time Net Worth tracking
- Assets vs Liabilities visualization with interactive charts
- Financial Health Score (0-100)
- Recent transactions list
- Budget alerts and warnings

### 🎙️ Smart Entry
- Voice-powered expense tracking (simulated)
- Natural language processing for transactions
- Document upload (PDF, Images, CSV)
- Quick-add buttons for common expenses
- OCR-ready for bank statements

### 🏗️ Sandbox Simulator
- "What-If" purchase simulations
- Impact analysis on net worth
- Investment growth calculator
- Blueprint mode for risk-free experimentation
- Quick scenario templates (iPhone, Laptop, etc.)

### 📂 Legacy & Vault
- Insurance recommendations based on profile
- Nominee management
- Secure document vault with PIN protection
- Emergency access for nominees
- Policy and asset tracking

### 🎓 Financial Literacy
- Micro-lessons (30-60 seconds)
- Daily finance tips
- Featured articles
- Progress tracking
- Contextual learning

## Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS with custom theme
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: Custom Context API (Zustand-ready)
- **Fonts**: Inter

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:5174
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### Login
- Enter any email and password to log in (demo mode)
- The app uses local storage to persist sessions

### Dashboard
- View your net worth, assets, and liabilities
- Check your financial health score
- Review recent transactions

### Smart Entry
- Tap the microphone to record expenses (simulated voice recognition)
- Upload financial documents for automatic parsing
- Use quick-add buttons for common expenses

### Sandbox
- Simulate purchases before making them
- Calculate investment growth projections
- Toggle Blueprint mode for a different visual theme

### Legacy
- Add nominees for your assets
- Unlock the secure vault with PIN: `1234`
- View insurance recommendations

### Learn
- Complete micro-lessons to improve financial literacy
- Read featured articles
- Get daily finance tips

## Customization

### Colors
The app uses a dark theme with these accent colors:
- **Emerald Green**: Success states
- **Amber Yellow**: Warnings
- **Ruby Red**: Danger/errors
- **Cyber Blue**: Primary actions
- **Deep Purple**: Secondary accents

### Components
- All components are modular and reusable
- Glassmorphism design system
- Responsive (mobile-first)

## Project Structure

```
fin/
├── src/
│   ├── components/
│   │   ├── Auth.jsx          # Login/Register screens
│   │   ├── Dashboard.jsx     # Main financial overview
│   │   ├── SmartEntry.jsx    # Voice & file upload
│   │   ├── Sandbox.jsx       # Simulator
│   │   ├── Learn.jsx         # Financial literacy
│   │   ├── Legacy.jsx        # Nominee & vault
│   │   └── Navigation.jsx    # Bottom/top navigation
│   ├── context/
│   │   └── FinanceContext.jsx # Global state management
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Tailwind directives
├── public/                   # Static assets
├── tailwind.config.js        # Tailwind configuration
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
```

## Future Enhancements

- [ ] Firebase integration for real-time sync
- [ ] Google Cloud STT for actual voice recognition
- [ ] OCR for document parsing
- [ ] Multi-currency support
- [ ] Advanced analytics and reports
- [ ] Family sharing features
- [ ] Push notifications
- [ ] PWA support

## License

This project is a demonstration of modern fintech UI/UX patterns.

## Acknowledgments

Built with:
- React & Vite
- Tailwind CSS
- Recharts
- Lucide Icons
