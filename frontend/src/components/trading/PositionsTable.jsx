import React from 'react';
import { FaArrowDown, FaArrowUp, FaChartLine, FaTimes } from 'react-icons/fa';
import { formatLots } from '../../utils/tradingUtils';

const formatMoney = (value, digits = 2) => `$${Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
})}`;

const formatUnits = (value) => Number(value || 0).toLocaleString(undefined, {
  maximumFractionDigits: 4,
});

const PositionsTable = ({ positions = [], onClose, onModify = () => {}, compact = false }) => {
  const getLotText = (position) => formatLots(
    position.lots,
    position.category,
    position.symbol,
    position.instrument
  );
  const getQuantityLabel = (position) => position.instrument?.quantityLabel || 'units';

  const handleProtectionEdit = async (position) => {
    const nextTp = window.prompt('Update Take Profit price (leave blank to remove):', position.takeProfit ?? '');
    if (nextTp === null) return;
    const nextSl = window.prompt('Update Stop Loss price (leave blank to remove):', position.stopLoss ?? '');
    if (nextSl === null) return;

    await onModify(position.id, {
      takeProfit: nextTp.trim() === '' ? null : Number(nextTp),
      stopLoss: nextSl.trim() === '' ? null : Number(nextSl),
    });
  };

  const handlePartialClose = async (position) => {
    const suggested = Math.max(0.0001, Number(position.quantity || 0) / 2);
    const nextQuantity = window.prompt(
      `Enter quantity to partially close from ${Number(position.quantity || 0).toFixed(4)}:`,
      suggested.toFixed(4)
    );
    if (nextQuantity === null) return;

    const parsedQuantity = Number(nextQuantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return;
    }

    await onClose(position.id, parsedQuantity);
  };

  if (!positions.length) {
    return (
      <div className="rounded-3xl border border-slate-700/60 bg-[#131925] px-6 py-14 text-center text-slate-400">
        <FaChartLine className="mx-auto mb-4 text-slate-600" size={24} />
        <p className="font-display text-lg font-semibold text-white">No open positions</p>
        <p className="mt-2 text-sm">Your active positions will appear here with their live market data.</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {positions.map((position) => {
          const isProfit = Number(position.pnl || 0) >= 0;
          const isBuy = position.type === 'BUY';

          return (
            <div key={position.id} className="rounded-3xl border border-slate-700/60 bg-[#131925] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                      isBuy ? 'bg-emerald-500/12 text-emerald-300' : 'bg-rose-500/12 text-rose-300'
                    }`}>
                      {isBuy ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                    </span>
                    <div>
                      <p className="font-display text-lg font-semibold uppercase tracking-tight text-white">{position.symbol}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{position.type}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-base font-semibold tabular-nums ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfit ? '+' : ''}{formatMoney(position.pnl)}
                  </p>
                  <p className={`mt-1 text-xs font-semibold tabular-nums ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfit ? '+' : ''}{Number(position.pnlPercent || 0).toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ['Size', `${getLotText(position)} lots`],
                  ['Units', `${formatUnits(position.quantity)} ${getQuantityLabel(position)}`],
                  ['Entry', formatMoney(position.entryPrice)],
                  ['Market', formatMoney(position.currentPrice)],
                  ['TP', position.takeProfit ? formatMoney(position.takeProfit) : 'Off'],
                  ['SL', position.stopLoss ? formatMoney(position.stopLoss) : 'Off'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-800 bg-[#0e1420] px-3 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleProtectionEdit(position)}
                  className="flex-1 rounded-2xl border border-slate-700 bg-[#0e1420] px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition-colors hover:border-slate-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handlePartialClose(position)}
                  className="flex-1 rounded-2xl border border-slate-700 bg-[#0e1420] px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition-colors hover:border-slate-500"
                >
                  Partial
                </button>
                <button
                  onClick={() => onClose(position.id)}
                  className="flex-1 rounded-2xl bg-rose-500/14 px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-300 transition-colors hover:bg-rose-500/24"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const totalPnl = positions.reduce((sum, position) => sum + Number(position.pnl || 0), 0);
  const totalPnlPositive = totalPnl >= 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-700/60 bg-[#131925]">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-[1120px] w-full table-fixed">
          <thead className="bg-[#0f1521]">
            <tr className="border-b border-slate-700/60 text-left">
              {['Instrument', 'Side', 'Size', 'Entry', 'Market', 'Leverage', 'TP', 'SL', 'Swap', 'Commission', 'P/L', 'Return', 'Actions'].map((heading) => (
                <th key={heading} className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => {
              const isProfit = Number(position.pnl || 0) >= 0;
              const isBuy = position.type === 'BUY';

              return (
                <tr key={position.id} className="border-b border-slate-800/80 align-top transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                        isBuy ? 'bg-emerald-500/12 text-emerald-300' : 'bg-rose-500/12 text-rose-300'
                      }`}>
                        {isBuy ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                      </span>
                      <div className="min-w-0">
                        <p className="font-display text-base font-semibold uppercase tracking-tight text-white">{position.symbol}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Live market position</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      isBuy ? 'bg-emerald-500/12 text-emerald-300' : 'bg-rose-500/12 text-rose-300'
                    }`}>
                      {position.type}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold tabular-nums text-slate-100">{getLotText(position)} lots</p>
                    <p className="mt-1 text-xs text-slate-500">{formatUnits(position.quantity)} {getQuantityLabel(position)}</p>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold tabular-nums text-slate-100">{formatMoney(position.entryPrice)}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold tabular-nums text-slate-100">{formatMoney(position.currentPrice)}</p>
                    <p className="mt-1 text-xs text-slate-500">Live</p>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-100">1:{position.leverage || 1}</td>
                  <td className="px-4 py-4 text-sm font-semibold tabular-nums text-slate-100">{position.takeProfit ? formatMoney(position.takeProfit) : 'Off'}</td>
                  <td className="px-4 py-4 text-sm font-semibold tabular-nums text-slate-100">{position.stopLoss ? formatMoney(position.stopLoss) : 'Off'}</td>
                  <td className="px-4 py-4 text-sm font-semibold tabular-nums text-slate-100">{formatMoney(position.swap)}</td>
                  <td className="px-4 py-4 text-sm font-semibold tabular-nums text-slate-100">{formatMoney(position.commission)}</td>
                  <td className={`px-4 py-4 text-sm font-semibold tabular-nums ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfit ? '+' : ''}{formatMoney(position.pnl)}
                  </td>
                  <td className={`px-4 py-4 text-sm font-semibold tabular-nums ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfit ? '+' : ''}{Number(position.pnlPercent || 0).toFixed(2)}%
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleProtectionEdit(position)}
                        className="rounded-xl border border-slate-700 bg-[#0e1420] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors hover:border-slate-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handlePartialClose(position)}
                        className="rounded-xl border border-slate-700 bg-[#0e1420] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors hover:border-slate-500"
                      >
                        Partial
                      </button>
                      <button
                        onClick={() => onClose(position.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-500/14 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-300 transition-colors hover:bg-rose-500/24"
                      >
                        <FaTimes size={10} />
                        Close
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 border-t border-slate-700/60 bg-[#0f1521] px-4 py-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/60 bg-[#111823] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Total Positions</p>
          <p className="mt-2 text-lg font-semibold text-white">{positions.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-[#111823] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Total P/L</p>
          <p className={`mt-2 text-lg font-semibold tabular-nums ${totalPnlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnlPositive ? '+' : ''}{formatMoney(totalPnl)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-[#111823] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Long / Short</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {positions.filter((position) => position.type === 'BUY').length} / {positions.filter((position) => position.type === 'SELL').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PositionsTable;
