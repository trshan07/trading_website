import React, { useEffect, useMemo, useState } from 'react';
import userService from '../../services/userService';

const formatMoney = (value) => `$${Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const OverviewCard = ({ label, value, tone = '' }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
    <p className={`mt-2 text-2xl font-semibold ${tone || 'text-slate-900 dark:text-white'}`}>{value}</p>
  </div>
);

const EmptyState = ({ label }) => (
  <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
    {label}
  </div>
);

const TransactionTable = ({ title, rows = [] }) => (
  <section className="rounded-[2rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
    </div>
    {rows.length === 0 ? (
      <div className="px-5 py-16 text-center text-sm text-slate-500 dark:text-slate-400">No records available.</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Reference</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.source_type || 'row'}-${row.id || index}`} className="border-b border-slate-100 last:border-b-0 dark:border-slate-800">
                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                  {row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-5 py-4 text-sm text-slate-900 dark:text-white">
                  {row.reference || row.bank_reference || row.reference_id || '-'}
                </td>
                <td className="px-5 py-4 text-sm capitalize text-slate-500 dark:text-slate-400">
                  {row.status || 'completed'}
                </td>
                <td className="px-5 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                  {formatMoney(Math.abs(Number(row.amount || 0)))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

const LoadingBlock = () => (
  <div className="space-y-6">
    <div className="h-36 animate-pulse rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
      ))}
    </div>
  </div>
);

const MyAccountTab = ({ accountId }) => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadOverview = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await userService.getAccountOverview(accountId);
        if (!active) {
          return;
        }
        setOverview(response.data || null);
      } catch (requestError) {
        if (!active) {
          return;
        }
        setError(requestError.response?.data?.message || 'Failed to load account overview');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOverview();
    return () => {
      active = false;
    };
  }, [accountId]);

  const metrics = overview?.metrics || {};
  const totals = overview?.totals || {};
  const recentTransactions = overview?.recentTransactions || [];
  const deposits = overview?.deposits || [];
  const withdrawals = overview?.withdrawals || [];
  const totalPnl = Number(metrics.totalPnl || 0);

  const cards = useMemo(() => ([
    { label: 'Total Balance', value: formatMoney(metrics.totalBalance) },
    { label: 'Equity', value: formatMoney(metrics.equity) },
    { label: 'Free Margin', value: formatMoney(metrics.freeMargin) },
    {
      label: 'Total P&L',
      value: formatMoney(totalPnl),
      tone: totalPnl >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300',
    },
  ]), [metrics.equity, metrics.freeMargin, metrics.totalBalance, totalPnl]);

  if (loading) {
    return <LoadingBlock />;
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">My Account</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Trading account overview</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          This panel is now sourced from a dedicated backend account overview endpoint for the selected trading account.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <OverviewCard key={card.label} label={card.label} value={card.value} tone={card.tone} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <TransactionTable title="Transactions" rows={recentTransactions} />
        <div className="grid gap-4">
          <OverviewCard label="Deposits" value={`${totals.depositsCount || 0} requests`} />
          <OverviewCard label="Withdrawals" value={`${totals.withdrawalsCount || 0} requests`} />
          <OverviewCard label="Open Positions" value={`${totals.openPositionsCount || 0}`} />
          <OverviewCard label="Closed Trades" value={`${totals.closedTradesCount || 0}`} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {deposits.length ? (
          <TransactionTable title="Deposits" rows={deposits} />
        ) : (
          <EmptyState label="No deposit history yet." />
        )}
        {withdrawals.length ? (
          <TransactionTable title="Withdrawals" rows={withdrawals} />
        ) : (
          <EmptyState label="No withdrawal history yet." />
        )}
      </section>
    </div>
  );
};

export default MyAccountTab;
