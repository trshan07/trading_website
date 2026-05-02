import React from 'react';
import { FaArrowDown, FaArrowUp, FaChartBar, FaExchangeAlt, FaHourglass, FaTimes } from 'react-icons/fa';
import { formatLots } from '../../utils/tradingUtils';

const formatMoney = (value, digits = 2) => `$${Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
})}`;

const formatUnits = (value) => Number(value || 0).toLocaleString(undefined, {
  maximumFractionDigits: 4,
});

const OpenOrders = ({ orders = [], onCancel, onModify = () => {}, compact = false }) => {
  const getLotText = (order) => formatLots(
    order.lots,
    order.category,
    order.symbol,
    order.instrument
  );
  const getQuantityLabel = (order) => order.instrument?.quantityLabel || 'units';

  const handleProtectionEdit = async (order) => {
    const nextEntry = window.prompt('Update trigger price:', order.entryPrice ?? '');
    if (nextEntry === null) return;
    const nextTp = window.prompt('Update Take Profit price (leave blank to remove):', order.takeProfit ?? '');
    if (nextTp === null) return;
    const nextSl = window.prompt('Update Stop Loss price (leave blank to remove):', order.stopLoss ?? '');
    if (nextSl === null) return;

    await onModify(order.id, {
      entryPrice: Number(nextEntry),
      takeProfit: nextTp.trim() === '' ? null : Number(nextTp),
      stopLoss: nextSl.trim() === '' ? null : Number(nextSl),
    });
  };

  if (!orders.length) {
    return (
      <div className="rounded-3xl border border-slate-700/60 bg-[#131925] px-6 py-14 text-center text-slate-400">
        <FaChartBar className="mx-auto mb-4 text-slate-600" size={24} />
        <p className="font-display text-lg font-semibold text-white">No pending orders</p>
        <p className="mt-2 text-sm">Limit and stop orders will appear here after you place them.</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {orders.map((order) => {
          const isBuy = order.side === 'BUY';

          return (
            <div key={order.id} className="rounded-3xl border border-slate-700/60 bg-[#131925] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-400/10 text-sky-200">
                      <FaExchangeAlt size={12} />
                    </span>
                    <div>
                      <p className="font-display text-lg font-semibold uppercase tracking-tight text-white">{order.symbol}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{order.type}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-full bg-amber-400/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  ['Side', order.side],
                  ['Size', `${getLotText(order)} lots`],
                  ['Units', `${formatUnits(order.quantity)} ${getQuantityLabel(order)}`],
                  ['Trigger', formatMoney(order.entryPrice || order.price)],
                  ['TP', order.takeProfit ? formatMoney(order.takeProfit) : 'Off'],
                  ['SL', order.stopLoss ? formatMoney(order.stopLoss) : 'Off'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-800 bg-[#0e1420] px-3 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleProtectionEdit(order)}
                  className="flex-1 rounded-2xl border border-slate-700 bg-[#0e1420] px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition-colors hover:border-slate-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => onCancel(order.id)}
                  className="flex-1 rounded-2xl bg-rose-500/14 px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-300 transition-colors hover:bg-rose-500/24"
                >
                  Cancel
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-700/60 bg-[#131925]">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-[1020px] w-full table-fixed">
          <thead className="bg-[#0f1521]">
            <tr className="border-b border-slate-700/60 text-left">
              {['Instrument', 'Type', 'Side', 'Size', 'Trigger', 'Leverage', 'TP', 'SL', 'Placed', 'Status', 'Actions'].map((heading) => (
                <th key={heading} className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const isBuy = order.side === 'BUY';

              return (
                <tr key={order.id} className="border-b border-slate-800/80 align-top transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-400/10 text-sky-200">
                        <FaExchangeAlt size={12} />
                      </span>
                      <div>
                        <p className="font-display text-base font-semibold uppercase tracking-tight text-white">{order.symbol}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Pending order</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-sky-400/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100">
                      {order.type}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      isBuy ? 'bg-emerald-500/12 text-emerald-300' : 'bg-rose-500/12 text-rose-300'
                    }`}>
                      {isBuy ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                      {order.side}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold tabular-nums text-slate-100">{getLotText(order)} lots</p>
                    <p className="mt-1 text-xs text-slate-500">{formatUnits(order.quantity)} {getQuantityLabel(order)}</p>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold tabular-nums text-slate-100">{formatMoney(order.entryPrice || order.price)}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-100">1:{order.leverage || 1}</td>
                  <td className="px-4 py-4 text-sm font-semibold tabular-nums text-slate-100">{order.takeProfit ? formatMoney(order.takeProfit) : 'Off'}</td>
                  <td className="px-4 py-4 text-sm font-semibold tabular-nums text-slate-100">{order.stopLoss ? formatMoney(order.stopLoss) : 'Off'}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-slate-100">
                      {new Date(order.createdAt || order.created).toLocaleTimeString()}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(order.createdAt || order.created).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                      <FaHourglass size={10} />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleProtectionEdit(order)}
                        className="rounded-xl border border-slate-700 bg-[#0e1420] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors hover:border-slate-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onCancel(order.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-rose-500/14 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-300 transition-colors hover:bg-rose-500/24"
                      >
                        <FaTimes size={10} />
                        Cancel
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
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Pending Orders</p>
          <p className="mt-2 text-lg font-semibold text-white">{orders.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-[#111823] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Buy Orders</p>
          <p className="mt-2 text-lg font-semibold text-white">{orders.filter((order) => order.side === 'BUY').length}</p>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-[#111823] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Sell Orders</p>
          <p className="mt-2 text-lg font-semibold text-white">{orders.filter((order) => order.side === 'SELL').length}</p>
        </div>
      </div>
    </div>
  );
};

export default OpenOrders;
