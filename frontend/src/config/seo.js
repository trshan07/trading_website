const SITE_URL = "https://tiktrades.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.jpg`;
const ORGANIZATION_NAME = "TikTrades";

const createSeo = ({
  path,
  title,
  description,
  ogTitle = title,
  ogDescription = description,
  robots = "index, follow",
  ogImage = DEFAULT_OG_IMAGE,
  twitterImage = DEFAULT_OG_IMAGE,
}) => ({
  title,
  description,
  canonicalUrl: `${SITE_URL}${path}`,
  ogTitle,
  ogDescription,
  ogUrl: `${SITE_URL}${path}`,
  ogImage,
  twitterTitle: ogTitle,
  twitterDescription: ogDescription,
  twitterImage,
  robots,
});

export const seoConfig = {
  home: createSeo({
    path: "/real-time-trading-platform",
    title: "TikTrades - Real-Time Forex, Crypto & Stock Trading Platform",
    description:
      "Experience smart online trading with TikTrades. Access live charts, market analysis, forex, crypto, commodities, and stock trading tools in one powerful platform.",
    ogTitle: "TikTrades | Advanced Online Trading Platform",
    ogDescription:
      "Trade Forex, crypto, stocks, and commodities with real-time charts and advanced trading tools on TikTrades.",
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: ORGANIZATION_NAME,
          url: SITE_URL,
          logo: DEFAULT_OG_IMAGE,
          sameAs: [],
        },
        {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          url: SITE_URL,
          name: ORGANIZATION_NAME,
          publisher: {
            "@id": `${SITE_URL}/#organization`,
          },
        },
        {
          "@type": "WebPage",
          "@id": `${SITE_URL}/real-time-trading-platform#webpage`,
          url: `${SITE_URL}/real-time-trading-platform`,
          name: "TikTrades - Real-Time Forex, Crypto & Stock Trading Platform",
          description:
            "Experience smart online trading with TikTrades. Access live charts, market analysis, forex, crypto, commodities, and stock trading tools in one powerful platform.",
          isPartOf: {
            "@id": `${SITE_URL}/#website`,
          },
          about: {
            "@id": `${SITE_URL}/#organization`,
          },
        },
      ],
    },
  }),
  about: createSeo({
    path: "/about",
    title: "About TikTrades | Trading Technology Built for Modern Markets",
    description:
      "Learn about TikTrades, our trading-first approach, platform vision, and the technology behind our forex, crypto, commodities, and stock trading experience.",
  }),
  contact: createSeo({
    path: "/contact",
    title: "Contact TikTrades | Reach Our Trading Support Team",
    description:
      "Contact TikTrades for account help, platform support, and trading-related questions. Reach our team for assistance with markets, onboarding, and services.",
  }),
  markets: createSeo({
    path: "/markets",
    title: "Markets | Forex, Crypto, Stocks, Commodities & Indices | TikTrades",
    description:
      "Explore tradable markets on TikTrades including forex pairs, cryptocurrencies, commodities, indices, and shares with real-time market access.",
  }),
  marketExplorer: createSeo({
    path: "/markets",
    title: "Market Explorer | Live Market Categories & Instruments | TikTrades",
    description:
      "Browse TikTrades market categories and discover forex, commodities, indices, shares, and crypto instruments from one trading platform.",
  }),
  resourceExplorer: createSeo({
    path: "/resources",
    title: "Trading Resources | Market Insights & Learning Tools | TikTrades",
    description:
      "Access trading resources, platform education, and market-focused content from TikTrades to support smarter decisions across global markets.",
  }),
  promotions: createSeo({
    path: "/promotions",
    title: "Promotions | Trading Bonuses and Offers | TikTrades",
    description:
      "View the latest TikTrades promotions, account offers, and trading incentives designed to help active traders grow their market participation.",
  }),
  accountTypes: createSeo({
    path: "/account-types",
    title: "Account Types | Choose the Right Trading Account | TikTrades",
    description:
      "Compare TikTrades account types and find the trading setup that fits your goals across forex, crypto, commodities, and stock markets.",
  }),
  conditions: createSeo({
    path: "/trading/conditions",
    title: "Trading Conditions | Spreads, Execution and Market Access | TikTrades",
    description:
      "Review TikTrades trading conditions including execution quality, spreads, supported instruments, and platform access for modern traders.",
  }),
  terms: createSeo({
    path: "/terms",
    title: "Terms and Conditions | TikTrades",
    description:
      "Read the TikTrades terms and conditions governing account usage, trading access, and platform responsibilities.",
  }),
  privacy: createSeo({
    path: "/privacy",
    title: "Privacy Policy | TikTrades",
    description:
      "Review the TikTrades privacy policy to understand how we collect, use, and protect your personal information.",
  }),
  riskDisclaimer: createSeo({
    path: "/risk-disclaimer",
    title: "Risk Disclaimer | TikTrades",
    description:
      "Understand the trading risks associated with leveraged products, market volatility, and online trading services offered by TikTrades.",
  }),
  kycPolicy: createSeo({
    path: "/kyc-policy",
    title: "KYC Policy | TikTrades",
    description:
      "Learn about the TikTrades KYC policy, identity verification requirements, and account compliance procedures.",
  }),
  amlPolicy: createSeo({
    path: "/aml-policy",
    title: "AML Policy | TikTrades",
    description:
      "Read the TikTrades anti-money laundering policy and our commitment to account security, monitoring, and regulatory compliance.",
  }),
  depositsWithdrawals: createSeo({
    path: "/deposits-withdrawals",
    title: "Deposits and Withdrawals | Funding Options | TikTrades",
    description:
      "Explore TikTrades deposit and withdrawal information, account funding methods, and transaction support for online traders.",
  }),
  login: createSeo({
    path: "/login",
    title: "Client Login | TikTrades",
    description:
      "Access your TikTrades trading account securely through the client login portal.",
    robots: "noindex, nofollow",
  }),
  register: createSeo({
    path: "/register",
    title: "Open an Account | Register with TikTrades",
    description:
      "Create your TikTrades account to access forex, crypto, commodities, and stock trading tools in one platform.",
    robots: "noindex, nofollow",
  }),
  forgotPassword: createSeo({
    path: "/forgot-password",
    title: "Forgot Password | TikTrades",
    description:
      "Reset access to your TikTrades account securely using the password recovery process.",
    robots: "noindex, nofollow",
  }),
  resetPassword: createSeo({
    path: "/reset-password",
    title: "Reset Password | TikTrades",
    description:
      "Set a new password for your TikTrades account through the secure password reset page.",
    robots: "noindex, nofollow",
  }),
};

export { DEFAULT_OG_IMAGE, SITE_URL };
