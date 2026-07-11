const PlatformSettings = require('../models/PlatformSettings');

const requirePlatformSetting = (key, message, { allowWhenFalse = false } = {}) => async (req, res, next) => {
    try {
        const settings = await PlatformSettings.getAll();
        const enabled = settings[key] !== false;

        if ((allowWhenFalse ? !enabled : enabled)) {
            return next();
        }

        return res.status(503).json({
            success: false,
            code: 'PLATFORM_CONTROL_DISABLED',
            setting: key,
            message,
        });
    } catch (error) {
        console.error(`Platform control check failed (${key}):`, error);
        return res.status(500).json({ success: false, message: 'Unable to verify platform availability' });
    }
};

const blockDuringMaintenance = async (req, res, next) => {
    try {
        const settings = await PlatformSettings.getAll();
        if (settings.maintenance_mode !== true) return next();

        return res.status(503).json({
            success: false,
            code: 'MAINTENANCE_MODE',
            message: 'The platform is temporarily unavailable for maintenance.',
        });
    } catch (error) {
        console.error('Maintenance mode check failed:', error);
        return res.status(500).json({ success: false, message: 'Unable to verify platform availability' });
    }
};

module.exports = {
    blockDuringMaintenance,
    requireTradingEnabled: requirePlatformSetting('trading_enabled', 'Trading is currently disabled.'),
    requireDepositsEnabled: requirePlatformSetting('deposits_enabled', 'Deposits are currently disabled.'),
    requireWithdrawalsEnabled: requirePlatformSetting('withdrawals_enabled', 'Withdrawals are currently disabled.'),
};
