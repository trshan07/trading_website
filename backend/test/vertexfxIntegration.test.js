const test = require('node:test');
const assert = require('node:assert/strict');
const { unwrapWcfResponse } = require('../src/integrations/vertexfx/httpClient');
const { mapTrades } = require('../src/integrations/vertexfx/mapper');
const { extractId, formatVertexFxDate } = require('../src/integrations/vertexfx/provisioning');

test('unwraps the double-encoded JSON returned by WCF Post methods', () => {
    assert.deepEqual(unwrapWcfResponse({ d: '{"UserId":42,"sessionid":"abc"}' }), {
        UserId: 42,
        sessionid: 'abc',
    });
});

test('maps VertexFX trade fields to the existing frontend contract', () => {
    const result = mapTrades({ Items: [{ TicketID: 77, SymbolName: 'EURUSD', BuySell: 1, Lots: 0.2, OpenPrice: 1.1 }] }, { id: 'local-account' });
    assert.equal(result[0].id, '77');
    assert.equal(result[0].account_id, 'local-account');
    assert.equal(result[0].side, 'sell');
    assert.equal(result[0].symbol, 'EURUSD');
});

test('extracts common Backoffice identifier response shapes', () => {
    assert.equal(extractId({ AccountID: 1234 }, ['AccountID', 'ID']), '1234');
    assert.equal(extractId(5678, ['AccountID', 'ID']), '5678');
});

test('formats account creation dates for the VertexFX Backoffice contract', () => {
    assert.equal(formatVertexFxDate(new Date(2026, 8, 27, 14, 5, 9)), '27/09/2026 14:05:09');
});
