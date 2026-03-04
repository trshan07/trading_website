// create-structure.js
const fs = require('fs');
const path = require('path');

// Use the current directory (where you're running the script)
const projectDir = process.cwd();

console.log(`📂 Working in current directory: ${projectDir}`);

const structure = {
  // Frontend Components
  'frontend/src/components/common': ['Header', 'Footer', 'Navbar', 'Sidebar', 'Loader', 'Modal', 'Button', 'Input', 'Card', 'Table', 'Chart', 'Alert', 'Breadcrumb', 'Pagination', 'ProtectedRoute'],
  'frontend/src/components/trading': ['TradingViewWidget', 'OrderForm', 'OrderBook', 'MarketOverview', 'PriceTicker', 'TradingChart', 'PositionsTable', 'OpenOrders', 'TradeHistory', 'AccountSummary', 'BalanceDisplay'],
  'frontend/src/components/funding': ['DepositForm', 'WithdrawalForm', 'FundingHistory', 'RequestStatus', 'ProofUpload', 'TransactionList'],
  'frontend/src/components/admin': ['AdminSidebar', 'UserManagement', 'FundingRequests', 'BalanceAdjustment', 'TradeOversight', 'Reports', 'SystemSettings', 'AuditLogs'],
  'frontend/src/components/ui/charts': ['LineChart', 'BarChart', 'PieChart'],
  'frontend/src/components/ui/forms': ['LoginForm', 'RegisterForm', 'ProfileForm', 'PasswordChangeForm'],
  
  // Frontend Pages
  'frontend/src/pages/public': ['HomePage', 'AboutPage', 'MarketsPage', 'AccountTypesPage', 'ContactPage', 'RiskDisclaimerPage', 'TermsPage', 'PrivacyPage', 'LoginPage', 'RegisterPage'],
  'frontend/src/pages/client': ['DashboardPage', 'TradingPage', 'ChartsPage', 'FundingPage', 'DepositPage', 'WithdrawalPage', 'HistoryPage', 'ProfilePage', 'SettingsPage', 'StatementsPage'],
  'frontend/src/pages/admin': ['AdminDashboardPage', 'UsersPage', 'FundingRequestsPage', 'TradesPage', 'ReportsPage', 'SettingsPage', 'AuditPage'],
  
  // Frontend Layouts
  'frontend/src/layouts': ['PublicLayout', 'ClientLayout', 'AdminLayout'],
  
  // Frontend Hooks
  'frontend/src/hooks': ['useAuth', 'useTrading', 'useWebSocket', 'useFunding', 'useAdmin', 'usePagination', 'useForm'],
  
  // Frontend Services
  'frontend/src/services': ['api', 'authService', 'userService', 'tradingService', 'fundingService', 'adminService', 'marketService', 'websocketService', 'chartService'],
  
  // Frontend Context
  'frontend/src/context': ['AuthContext', 'TradingContext', 'NotificationContext', 'ThemeContext', 'WebSocketContext'],
  
  // Frontend Utils
  'frontend/src/utils': ['constants', 'helpers', 'validators', 'formatters', 'calculators', 'errorHandler'],
  
  // Frontend Routes
  'frontend/src/routes': ['index', 'publicRoutes', 'clientRoutes', 'adminRoutes'],
  
  // Frontend Config
  'frontend/src/config': ['constants', 'chartConfig', 'websocketConfig'],
  
  // Frontend Public Assets
  'frontend/public/assets/images': [],
  'frontend/public/assets/icons': [],
  'frontend/public/assets/fonts': [],
  
  // Backend Controllers
  'backend/src/controllers': ['authController', 'userController', 'tradingController', 'fundingController', 'adminController', 'marketController', 'reportController', 'websocketController'],
  
  // Backend Models
  'backend/src/models': ['User', 'Account', 'Trade', 'Position', 'Order', 'DepositRequest', 'WithdrawalRequest', 'Transaction', 'MarketData', 'AdminLog', 'Settings'],
  
  // Backend Routes
  'backend/src/routes': ['authRoutes', 'userRoutes', 'tradingRoutes', 'fundingRoutes', 'adminRoutes', 'marketRoutes', 'reportRoutes'],
  
  // Backend Middleware
  'backend/src/middleware': ['auth', 'adminAuth', 'validation', 'errorHandler', 'rateLimiter', 'logger', 'upload'],
  
  // Backend Services
  'backend/src/services': ['authService', 'userService', 'tradingEngine', 'marketDataService', 'fundingService', 'reportService', 'websocketService', 'emailService'],
  
  // Backend Utils
  'backend/src/utils': ['constants', 'helpers', 'validators', 'calculators', 'logger', 'seedData'],
  
  // Backend Config
  'backend/src/config': ['database', 'auth', 'websocket', 'cors', 'environment'],
  
  // Backend Jobs
  'backend/src/jobs': ['marketSimulator', 'cleanupJobs', 'reportGenerator'],
  
  // Backend Database
  'backend/database/migrations': ['001_initial_schema', '002_add_trading_tables', '003_add_funding_tables'],
  'backend/database/seeds': ['default_users', 'market_data', 'account_types'],
  
  // Backend Tests
  'backend/tests/unit/controllers': [],
  'backend/tests/unit/services': [],
  'backend/tests/unit/utils': [],
  'backend/tests/integration': [],
  'backend/tests/fixtures': [],
  
  // Backend Public Uploads
  'backend/public/uploads/proofs': [],
  'backend/public/uploads/profiles': [],
  
  // Database
  'database': [],
  'database/backups': [],
  
  // Documentation
  'docs/api': ['auth', 'trading', 'funding', 'admin'],
  'docs/deployment': ['setup', 'environment', 'troubleshooting'],
  'docs/architecture': ['overview', 'data-flow'],
  
  // Scripts
  'scripts': ['deploy', 'backup', 'seed', 'migrate'],
  
  // Logs
  'backend/logs': []
};

console.log('🚀 Creating project structure...\n');

// Create directories and files
Object.entries(structure).forEach(([dirPath, files]) => {
  const fullPath = path.join(projectDir, dirPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  } else {
    console.log(`📁 Directory already exists: ${dirPath}`);
  }
  
  // Create files if they don't exist
  files.forEach(file => {
    // Determine file extension
    const isJSX = file.includes('Page') || 
                  file.includes('Layout') || 
                  file.includes('Form') || 
                  file.includes('Widget') || 
                  file.includes('Table') || 
                  file.includes('Display') ||
                  file.includes('Card') ||
                  file.includes('Modal') ||
                  file.includes('Sidebar') ||
                  file.includes('Header') ||
                  file.includes('Footer') ||
                  file.includes('Navbar') ||
                  file.includes('Button') ||
                  file.includes('Input') ||
                  file.includes('Alert') ||
                  file.includes('Chart');
    
    const ext = isJSX ? '.jsx' : '.js';
    const filePath = path.join(fullPath, `${file}${ext}`);
    
    if (!fs.existsSync(filePath)) {
      // Create file with basic template
      let content = '';
      if (ext === '.jsx') {
        content = `// ${file}${ext}\nimport React from 'react';\n\nconst ${file} = () => {\n  return (\n    <div>\n      <h1>${file} Component</h1>\n    </div>\n  );\n};\n\nexport default ${file};\n`;
      } else {
        content = `// ${file}${ext}\n\n`;
      }
      
      fs.writeFileSync(filePath, content);
      console.log(`  📄 Created file: ${file}${ext}`);
    } else {
      console.log(`  📄 File already exists: ${file}${ext}`);
    }
  });
});

// Create root files
const rootFiles = [
  'frontend/public/index.html',
  'frontend/public/favicon.ico',
  'frontend/public/manifest.json',
  'frontend/public/robots.txt',
  'frontend/src/index.js',
  'frontend/src/App.js',
  'frontend/src/App.css',
  'frontend/src/index.css',
  'frontend/src/setupTests.js',
  'frontend/src/reportWebVitals.js',
  'frontend/src/assets/styles/tailwind.css',
  'backend/server.js',
  'backend/app.js',
  'backend/src/index.js',
  'database/schema.sql',
  'database/relationships.sql',
  'database/indexes.sql',
  'database/triggers.sql',
  'database/functions.sql',
  'database/views.sql',
  '.env',
  '.env.example',
  '.gitignore',
  '.eslintrc.js',
  '.prettierrc',
  'package.json',
  'README.md',
  'docker-compose.yml',
  'Dockerfile.frontend',
  'Dockerfile.backend',
  'nginx.conf',
  'ecosystem.config.js'
];

// Create root files with proper templates
console.log('\n📄 Creating root files...\n');
rootFiles.forEach(filePath => {
  const fullPath = path.join(projectDir, filePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(fullPath)) {
    let content = '';
    
    if (filePath.endsWith('.html')) {
      content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trading Website</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
    } else if (filePath.endsWith('.gitignore')) {
      content = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Uploads
uploads/

# Database
*.sqlite
*.db`;
    } else if (filePath.endsWith('.env.example')) {
      content = `# Frontend
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WEBSOCKET_URL=ws://localhost:5000
REACT_APP_ENVIRONMENT=development

# Backend
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=trading_db
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/`;
    } else if (filePath.endsWith('package.json')) {
      content = `{
  "name": "trading-website",
  "version": "1.0.0",
  "description": "Trading Platform MVP",
  "scripts": {
    "dev": "concurrently \\"npm run dev --prefix backend\\" \\"npm start --prefix frontend\\"",
    "install-all": "npm install --prefix frontend && npm install --prefix backend",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": ["trading", "platform", "mvp"],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}`;
    } else if (filePath.endsWith('README.md')) {
      content = `# Trading Website

## 🚀 Trading Platform MVP

A modern, secure, and scalable web-based trading environment with simulated trading capabilities.

## 📋 Features

- Public Website with marketing pages
- Client Trading Dashboard
- Admin Management Panel
- Simulated Trading Engine
- Manual Deposit/Withdrawal Workflow
- Real-time Chart Visualization
- Role-based Authentication

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Real-time**: WebSocket
- **Security**: JWT, bcrypt, rate-limiting

## 🚦 Getting Started

1. Run \`npm run install-all\` to install dependencies
2. Set up PostgreSQL database
3. Configure environment variables
4. Run \`npm run dev\` to start development
`;
    } else if (filePath.endsWith('.css')) {
      content = `/* ${filePath} */\n\n`;
    } else if (filePath.endsWith('.sql')) {
      content = `-- ${filePath}\n\n`;
    } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      content = `// ${filePath}\n\n`;
    } else if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
      content = `# ${filePath}\n\n`;
    } else if (filePath.endsWith('.conf')) {
      content = `# ${filePath}\n\n`;
    } else if (filePath.endsWith('.ico')) {
      // Skip binary files
      return;
    }
    
    if (content) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Created: ${filePath}`);
    }
  } else {
    console.log(`📁 Already exists: ${filePath}`);
  }
});

// Add .gitkeep files to empty directories
const emptyDirs = [
  'backend/logs',
  'backend/public/uploads/proofs',
  'backend/public/uploads/profiles',
  'frontend/public/assets/images',
  'frontend/public/assets/icons',
  'frontend/public/assets/fonts',
  'database/backups'
];

emptyDirs.forEach(dir => {
  const fullPath = path.join(projectDir, dir);
  const gitkeepPath = path.join(fullPath, '.gitkeep');
  
  if (fs.existsSync(fullPath) && !fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
    console.log(`✅ Added .gitkeep to: ${dir}`);
  }
});

console.log('\n🎉 Project structure creation completed!');
console.log(`📂 Location: ${projectDir}`);
console.log('\n📋 Next steps:');
console.log('1. Install dependencies:');
console.log('   npm install concurrently --save-dev');
console.log('   cd frontend && npm install');
console.log('   cd ../backend && npm install');
console.log('2. Copy .env.example to .env and update values');
console.log('3. Set up PostgreSQL database');
console.log('4. Run: npm run dev');