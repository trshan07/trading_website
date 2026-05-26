// backend/src/models/PlatformInfo.js
const PlatformSettings = require('./PlatformSettings');

class PlatformInfo {
    static async getBankingInfo() {
        const settings = await PlatformSettings.getAll();

        return {
            bank_name: settings.deposit_bank_name || 'Apex Global Trust',
            account_name: settings.deposit_account_name || 'Tik Trades Liquidity Pool',
            account_number: settings.deposit_account_number || '992833774401',
            iban: settings.deposit_iban || 'GB29APEX0000992833774401',
            swift_bic: settings.deposit_swift_bic || 'TIKTR22',
            branch: settings.deposit_branch || 'London Main Branch',
            country: settings.deposit_country || 'United Kingdom',
            reference_format: settings.deposit_reference_format || 'TT-[USER_ID]-[TIMESTAMP]',
            instructions: settings.deposit_instructions || 'Please include your User ID in the transfer reference to ensure rapid processing.'
        };
    }
}

module.exports = PlatformInfo;
