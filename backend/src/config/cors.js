const DEFAULT_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://tiktrades.com',
    'https://www.tiktrades.com',
    'https://api.tiktrades.com',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
];

const DEFAULT_ALLOWED_ORIGIN_PATTERNS = [
    /^https:\/\/([a-z0-9-]+\.)?tiktrades\.com$/i,
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i,
];

const normalizeOrigin = (origin = '') => String(origin).trim().replace(/\/+$/, '');

const splitOrigins = (value = '') =>
    String(value)
        .split(',')
        .map((origin) => normalizeOrigin(origin))
        .filter(Boolean);

const buildAllowedOrigins = () => {
    const configuredOrigins = [
        ...splitOrigins(process.env.CORS_ORIGINS),
        ...splitOrigins(process.env.CLIENT_URL),
        ...splitOrigins(process.env.FRONTEND_URL),
    ];

    return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins]));
};

const allowedOrigins = buildAllowedOrigins();

const isOriginAllowed = (origin) => {
    if (!origin) {
        return true;
    }

    const normalizedOrigin = normalizeOrigin(origin);

    return allowedOrigins.includes(normalizedOrigin)
        || DEFAULT_ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(normalizedOrigin));
};

const corsOptions = {
    origin(origin, callback) {
        if (isOriginAllowed(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    optionsSuccessStatus: 204,
    maxAge: 86400,
};

module.exports = {
    corsOptions,
    allowedOrigins,
    isOriginAllowed,
    normalizeOrigin,
};
