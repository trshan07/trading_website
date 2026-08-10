const assert = require('node:assert/strict');
const test = require('node:test');

// The protection decision is pure; replace the database module before loading
// the engine so this unit test does not require a running PostgreSQL service.
const databasePath = require.resolve('../src/config/database');
let databaseQuery = async () => ({ rows: [] });
require.cache[databasePath] = {
    id: databasePath,
    filename: databasePath,
    loaded: true,
    exports: {
        query: (...args) => databaseQuery(...args),
        pool: { end: async () => {} },
    },
};

const { shouldAutoClosePosition } = require('../src/services/tradingEngine');
const Position = require('../src/models/Position');

test('buy position triggers take profit at and above target', () => {
    const position = { side: 'buy', take_profit: '105', stop_loss: '95' };

    assert.deepEqual(
        shouldAutoClosePosition({ position, markPrice: 105 }),
        { reason: 'take_profit', exitPrice: 105 }
    );
    assert.deepEqual(
        shouldAutoClosePosition({ position, markPrice: 106 }),
        { reason: 'take_profit', exitPrice: 105 }
    );
});

test('buy position triggers stop loss at and below target', () => {
    const position = { side: 'buy', take_profit: '105', stop_loss: '95' };

    assert.deepEqual(
        shouldAutoClosePosition({ position, markPrice: 95 }),
        { reason: 'stop_loss', exitPrice: 95 }
    );
    assert.deepEqual(
        shouldAutoClosePosition({ position, markPrice: 94 }),
        { reason: 'stop_loss', exitPrice: 95 }
    );
});

test('sell position triggers take profit and stop loss in the opposite direction', () => {
    const position = { side: 'sell', takeProfit: 95, stopLoss: 105 };

    assert.deepEqual(
        shouldAutoClosePosition({ position, markPrice: 95 }),
        { reason: 'take_profit', exitPrice: 95 }
    );
    assert.deepEqual(
        shouldAutoClosePosition({ position, markPrice: 105 }),
        { reason: 'stop_loss', exitPrice: 105 }
    );
    assert.equal(shouldAutoClosePosition({ position, markPrice: 100 }), null);
});

test('missing or invalid protection values do not trigger a close', () => {
    assert.equal(
        shouldAutoClosePosition({
            position: { side: 'buy', take_profit: null, stop_loss: 'invalid' },
            markPrice: 100,
        }),
        null
    );
});

test('position compatibility insert preserves requested TP and SL', async () => {
    const calls = [];
    databaseQuery = async (query, values) => {
        calls.push({ query, values });
        if (calls.length === 1) {
            const error = new Error('column "gross_pnl" does not exist');
            error.code = '42703';
            throw error;
        }
        return { rows: [{ id: 42, take_profit: values[10], stop_loss: values[11] }] };
    };

    const position = await Position.create(7, {
        accountId: 9,
        symbol: 'XAUUSD',
        side: 'buy',
        amount: 4359,
        quantity: 1,
        entryPrice: 4359,
        margin: 217.95,
        leverage: 20,
        takeProfit: 4400,
        stopLoss: 4300,
    });

    assert.equal(calls.length, 2);
    assert.match(calls[1].query, /take_profit, stop_loss/);
    assert.equal(calls[1].values[10], 4400);
    assert.equal(calls[1].values[11], 4300);
    assert.equal(position.take_profit, 4400);
    assert.equal(position.stop_loss, 4300);
});
