import React from 'react';
import { FaArrowDown, FaArrowUp, FaHistory } from 'react-icons/fa';
import { formatLots } from '../../utils/tradingUtils';

const formatMoney = (value, digits = 2) => `$${Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
})}`;

const formatUnits = (value) => Number(value || 0).toLocaleString(undefined, {
  maximumFractionDigits: 4,
});

const TradeHistory = ({ trades = [], compact = false }) => {
  if (!trades.length) {
    return (
      <div className="rounded-3xl border border-slate-700/60 bg-[#131925] px-6 py-14 text-center text-slate-400">
        <FaHistory className="mx-auto mb-4 text-slate-600" size={24} />
        <p className="font-display text-lg font-semibold text-white">No closed trades yet</p>
        <p className="mt-2 text-sm">Your completed trades will appear here with entry, exit, and return details.</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {trades.map((trade) => {
          const isProfit = Number(trade.pnl || 0) >= 0;
          const isBuy = trade.side === 'BUY';
          const formattedLots = formatLots(trade.lots, trade.category, trade.symbol, trade.instrument);
          const quantityLabel = trade.instrument?.quantityLabel || 'units';

          return (
            <div key={trade.id} className="rounded-3xl border border-slate-700/60 bg-[#131925] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                      isBuy ? 'bg-emerald-500/12 text-emerald-300' : 'bg-rose-500/12 text-rose-300'
                    }`}>
                      {isBuy ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                    </span>
                    <div>
                      <p className="font-display text-lg font-semibold uppercase tracking-tight text-white">{trade.symbol}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{trade.side} closed</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-base font-semibold tabular-nums ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfit ? '+' : ''}{formatMoney(trade.pnl)}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{trade.status || 'Closed'}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ['Size', `${formattedLots} lots`],
                  ['Units', `${formatUnits(trade.quantity)} ${quantityLabel}`],
                  ['Entry', formatMoney(trade.entryPrice)],
                  ['Exit', formatMoney(trade.exitPrice)],
                  ['Notional', formatMoney(trade.amount)],
                  ['Closed', trade.closedAt ? new Date(trade.closedAt).toLocaleString() : '--'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-800 bg-[#0e1420] px-3 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const totalPnl = trades.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
  const totalPnlPositive = totalPnl >= 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-700/60 bg-[#131925]">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-[1040px] w-full table-fixed">
          <thead className="bg-[#0f1521]">
            <tr className="border-b border-slate-700/60 text-left">
              {['Instrument', 'Side', 'Size', 'Entry', 'Exit', 'Notional', 'Opened', 'Closed', 'P/L', 'Status'].map((heading) => (
                <th key={heading} className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => {
              const isProfit = Number(trade.pnl || 0) >= 0;
              const isBuy = trade.side === 'BUY';
              const formattedLots = formatLots(trade.lots, trade.category, trade.symbol, trade.instrument);
              const quantityLabel = trade.instrument?.quantityLabel || 'units';

              return (
                <tr key={trade.id} className="border-b border-slate-800/80 align-top transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                        isBuy ? 'bg-emerald-500/12 text-emerald-300' : 'bg-rose-500/12 text-rose-300'
                      }`}>
                        {isBuy ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                      </span>
                      <div>
                        <p className="font-display text-base font-semibold uppercase tracking-tight text-white">{trade.symbol}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Closed trade</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      isBuy ? 'bg-emerald-500/12 text-emerald-300' : 'bg-rose-500/12 text-rose-300'
                    }`}>
                      {trade.side}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold tabular-nums text-slate-100">{formattedLots} lots</p>
                    <p className="mt-1 text-xs text-slate-500">{formatUnits(trade.quantity)} {quantityLabel}</p>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold tabular-nums text-slate-100">{formatMoney(trade.entryPrice)}</td>
                  <td className="px-4 py-4 text-sm font-semibold tabular-nums text-slate-100">{formatMoney(trade.exitPrice)}</td>
                  <td className="px-4 py-4 text-sm font-semibold tabular-nums text-slate-100">{formatMoney(trade.amount)}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-slate-100">
                      {trade.createdAt ? new Date(trade.createdAt).toLocaleTimeString() : '--'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {trade.createdAt ? new Date(trade.createdAt).toLocaleDateString() : '--'}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-slate-100">
                      {trade.closedAt ? new Date(trade.closedAt).toLocaleTimeString() : '--'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {trade.closedAt ? new Date(trade.closedAt).toLocaleDateString() : '--'}
                    </p>
                  </td>
                  <td className={`px-4 py-4 text-sm font-semibold tabular-nums ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfit ? '+' : ''}{formatMoney(trade.pnl)}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                      {trade.status || 'Closed'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 border-t border-slate-700/60 bg-[#0f1521] px-4 py-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/60 bg-[#111823] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Closed Trades</p>
          <p className="mt-2 text-lg font-semibold text-white">{trades.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-[#111823] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Total P/L</p>
          <p className={`mt-2 text-lg font-semibold tabular-nums ${totalPnlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnlPositive ? '+' : ''}{formatMoney(totalPnl)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-[#111823] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Win / Loss</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {trades.filter((trade) => Number(trade.pnl || 0) >= 0).length} / {trades.filter((trade) => Number(trade.pnl || 0) < 0).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TradeHistory;

