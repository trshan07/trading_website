import React, { useMemo } from 'react';

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
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-b-0 dark:border-slate-800">
                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{row.date || '-'}</td>
                <td className="px-5 py-4 text-sm text-slate-900 dark:text-white">{row.reference || '-'}</td>
                <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{row.status}</td>
                <td className="px-5 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                  {formatMoney(row.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

const MyAccountTab = ({ portfolio = {}, positions = [], closedTrades = [], transactions = [] }) => {
  const { deposits, withdrawals, totalPnl, recentTransactions } = useMemo(() => {
    const depositsList = transactions.filter((item) => item.type === 'Deposit');
    const withdrawalsList = transactions.filter((item) => item.type === 'Withdrawal');
    const pnlFromClosed = closedTrades.reduce((sum, trade) => sum + Number(trade.pnl || 0), 0);
    const pnlFromOpen = positions.reduce((sum, position) => sum + Number(position.pnl || 0), 0);

    return {
      deposits: depositsList,
      withdrawals: withdrawalsList,
      totalPnl: pnlFromClosed + pnlFromOpen,
      recentTransactions: transactions.slice(0, 8),
    };
  }, [closedTrades, positions, transactions]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">My Account</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Trading account overview</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Review balances, transaction flow, and performance without the extra dashboard clutter.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewCard label="Total Balance" value={formatMoney(portfolio.totalBalance)} />
        <OverviewCard label="Equity" value={formatMoney(portfolio.equity)} />
        <OverviewCard label="Free Margin" value={formatMoney(portfolio.freeMargin)} />
        <OverviewCard
          label="Total P&L"
          value={formatMoney(totalPnl)}
          tone={totalPnl >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <TransactionTable title="Transactions" rows={recentTransactions} />
        <div className="grid gap-4">
          <OverviewCard label="Deposits" value={`${deposits.length} requests`} />
          <OverviewCard label="Withdrawals" value={`${withdrawals.length} requests`} />
          <OverviewCard label="Open Positions" value={`${positions.length}`} />
          <OverviewCard label="Closed Trades" value={`${closedTrades.length}`} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {deposits.length ? (
          <TransactionTable title="Deposits" rows={deposits.slice(0, 6)} />
        ) : (
          <EmptyState label="No deposit history yet." />
        )}
        {withdrawals.length ? (
          <TransactionTable title="Withdrawals" rows={withdrawals.slice(0, 6)} />
        ) : (
          <EmptyState label="No withdrawal history yet." />
        )}
      </section>
    </div>
  );
};

export default MyAccountTab;
