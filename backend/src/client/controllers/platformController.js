// backend/src/client/controllers/platformController.js
const PlatformInfo = require('../../models/PlatformInfo');

const getPlatformBankingInfo = async (req, res) => {
    try {
        const info = await PlatformInfo.getBankingInfo();
        res.json({
            success: true,
            data: info
        });
    } catch (error) {
        console.error('Fetch Platform Info Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch platform information' });
    }
};

module.exports = {
    getPlatformBankingInfo
};
