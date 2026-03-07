// Navigation Context & Constants

export const marketsData = {
    Forex: {
        description: "Trade the world's most liquid market with 24/5 access to currency fluctuations.",
        top5: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD"],
        path: "/markets/forex"
    },
    Commodities: {
        description: "Diversify your portfolio by trading hard assets like energy and precious metals.",
        top5: ["Gold (XAU)", "Silver (XAG)", "WTI Oil", "Brent Crude", "Natural Gas"],
        path: "/markets/commodities"
    },
    Indices: {
        description: "Speculate on the performance of entire economies or sectors in one trade.",
        top5: ["US30 (Dow)", "NAS100 (Nasdaq)", "GER40 (DAX)", "UK100 (FTSE)", "SPX500"],
        path: "/markets/indices"
    },
    Shares: {
        description: "Buy and sell CFDs on the world's most influential public companies.",
        top5: ["Apple (AAPL)", "Tesla (TSLA)", "Amazon (AMZN)", "NVIDIA (NVDA)", "Microsoft (MSFT)"],
        path: "/markets/shares"
    },
    Crypto: {
        description: "Trade the future of finance with 24/7 access to high-volatility digital assets.",
        top5: ["Bitcoin (BTC)", "Ethereum (ETH)", "Solana (SOL)", "Ripple (XRP)", "Litecoin (LTC)"],
        path: "/markets/crypto"
    }
};

export const resourcesData = [
    {
        category: 'Trading Platforms',
        items: [
            { 
                name: 'Web Trader', 
                description: 'No download required. Access the full power of the markets directly from your browser with one-click trading.', 
                path: '/resources/platforms' 
            }
        ]
    },
    {
        category: 'Integrated Tools',
        items: [
            { 
                name: 'Trading Central', 
                description: 'Get automated technical analysis, market sentiment data, and daily trade ideas delivered to your dashboard.', 
                path: '/resources/tools' 
            },
            { 
                name: 'Trading View', 
                description: 'Use the world’s most popular charting interface with hundreds of indicators and a massive social community.', 
                path: '/resources/tools' 
            }
        ]
    },
    {
        category: 'Analysis & News',
        items: [
            { 
                name: 'Market News', 
                description: 'Real-time updates on global events moving the needle.', 
                path: '/resources/analysis' 
            },
            { 
                name: 'Economic Calendar', 
                description: 'Never miss a central bank meeting or NFP report with our live-updating schedule.', 
                path: '/resources/analysis' 
            }
        ]
    }
];

export const navLinks = [
    { name: 'Home', path: '/', type: 'link' },
    {
        name: 'Trading',
        submenu: [
            { name: 'Account Types', path: '/trading/account-types' },
            { name: 'Conditions', path: '/trading/conditions' },
        ],
        type: 'standard'
    },
    {
        name: 'Markets',
        type: 'mega-market'
    },
    {
        name: 'Resources',
        type: 'mega-resource'
    },
    {
        name: 'Company',
        submenu: [
            { name: 'About', path: '/about' },
            { name: 'Contact', path: '/contact' },
        ],
        type: 'standard'
    },
    { name: 'Promotions', path: '/promotions', type: 'link' },
];
