const crypto = require('crypto');
const db = require('../../config/database');
const { config } = require('./config');
const { backofficeService } = require('./services');
const { valueOf } = require('./mapper');

const formatVertexFxDate = (date = new Date()) => {
    const pad = (value) => String(value).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const extractId = (response, names) => {
    const direct = valueOf(response, names);
    if (direct !== null && direct !== undefined && direct !== '') return String(direct);
    if (typeof response === 'number' || /^\d+$/.test(String(response || ''))) return String(response);
    return null;
};

const provisionUser = async ({ user, password, accounts }) => {
    if (!config.enabled) return accounts;
    const clientResponse = await backofficeService.createClient({
        ParentID: Number(config.parentId), FirstName: user.first_name || '', SecondName: '', ThirdName: '',
        LastName: user.last_name || '', Username: user.email, Password: password,
        InvestorPassword: crypto.randomBytes(12).toString('base64url'), Phone: user.phone || '', Fax: '',
        Mobile: user.phone || '', TelPWD: '', POB: '', Country: user.country || '', Email: user.email,
        Address: '', isReadOnly: false, ForceChangePassword: false, Leverage: '1:100',
    });
    const clientId = extractId(clientResponse, ['ClientID', 'ClientId', 'UserId', 'UserID', 'ID']);
    if (!clientId) throw new Error('VertexFX CreateClient did not return a client ID');
    await db.query('UPDATE users SET vertexfx_client_id = $1 WHERE id = $2', [clientId, user.id]);

    for (const account of accounts) {
        const isDemo = account.account_type === 'demo';
        const response = await backofficeService.createAccount({
            ParentID: Number(clientId), AccountID: 0,
            AccountType: Number(isDemo ? config.demoAccountType : config.realAccountType), IsDemo: isDemo,
            IsLocked: false, DontLiquidate: false, IsMargin: true, UserDefinedDate: formatVertexFxDate(),
        });
        const externalId = extractId(response, ['AccountID', 'AccountId', 'ID']);
        if (!externalId) throw new Error(`VertexFX did not return an account ID for ${account.account_type}`);
        await db.query(
            'UPDATE accounts SET vertexfx_account_id = $1, vertexfx_sync_status = $2, vertexfx_synced_at = CURRENT_TIMESTAMP WHERE id = $3',
            [externalId, 'synced', account.id]
        );
        account.vertexfx_account_id = externalId;
    }
    return accounts;
};

module.exports = { provisionUser, extractId, formatVertexFxDate };
