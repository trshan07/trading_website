// backend/src/models/PlatformInfo.js
const db = require('../config/database');

class PlatformInfo {
    static async getBankingInfo() {
        // For now, return hardcoded platform bank details. 
        // In a real app, these would come from a 'global_settings' or 'platform_config' table.
        return {
            bank_name: 'Apex Global Trust',
            account_name: 'Tik Trades Liquidity Pool',
            account_number: '992833774401',
            iban: 'GB29APEX0000992833774401',
            swift_bic: 'TIKTR22',
            branch: 'London Main Branch',
            country: 'United Kingdom',
            reference_format: 'TT-[USER_ID]-[TIMESTAMP]',
            instructions: 'Please include your User ID in the transfer reference to ensure rapid processing.'
        };
    }
}

module.exports = PlatformInfo;
