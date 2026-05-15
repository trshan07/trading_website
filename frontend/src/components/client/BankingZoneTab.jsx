import React, { useMemo, useState } from 'react';

const formatMoney = (value) => `$${Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const tabs = [
  { id: 'withdrawal', label: 'Withdrawal' },
  { id: 'bank', label: 'My Bank Account' },
  { id: 'wallet', label: 'Your Wallet' },
];

const initialBankForm = {
  country: '',
  bankName: '',
  beneficiaryName: '',
  iban: '',
  swiftCode: '',
  statement: null,
};

const BankingZoneTab = ({
  walletData = {},
  bankAccounts = [],
  onWithdraw = () => {},
  onAddBankAccount = () => {},
}) => {
  const [activeTab, setActiveTab] = useState('withdrawal');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletId, setWalletId] = useState('');
  const [bankForm, setBankForm] = useState(initialBankForm);

  const availableBalance = Number(walletData.mainWallet ?? walletData.totalBalance ?? 0);
  const primaryBank = useMemo(() => bankAccounts[0] || null, [bankAccounts]);

  const handleBankSubmit = async (event) => {
    event.preventDefault();
    await onAddBankAccount({
      bankName: bankForm.bankName,
      branchName: bankForm.bankName,
      country: bankForm.country,
      accountHolderName: bankForm.beneficiaryName,
      accountNumber: bankForm.iban.replace(/\s/g, ''),
      accountType: 'Checking',
      currency: 'USD',
      swiftCode: bankForm.swiftCode,
      iban: bankForm.iban,
      beneficiaryName: bankForm.beneficiaryName,
      relationship: 'self',
      proofOfBankAccount: bankForm.statement,
      proofOfBankAccountName: bankForm.statement?.name || '',
      confirmOwnership: true,
      acceptTerms: true,
      authorizeTransactions: true,
      isDefault: true,
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Banking Zone</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">Funding and payout controls</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          A simpler banking workspace for withdrawals, linked bank accounts, and wallet details.
        </p>
      </section>

      <div className="flex gap-2 overflow-x-auto rounded-3xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'withdrawal' && (
        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Available balance</p>
            <p className="mt-2 break-words text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-white">{formatMoney(availableBalance)}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Withdrawals are submitted in USD.</p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Withdrawal amount (USD)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              className="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              placeholder="Enter amount"
            />
            <button
              onClick={() => onWithdraw(withdrawAmount, 'Bank Transfer')}
              disabled={!Number(withdrawAmount)}
              className={`mt-5 w-full rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                Number(withdrawAmount)
                  ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white'
                  : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
              }`}
            >
              Submit withdrawal request
            </button>
          </div>
        </section>
      )}

      {activeTab === 'bank' && (
        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleBankSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Country"
                value={bankForm.country}
                onChange={(event) => setBankForm((current) => ({ ...current, country: event.target.value }))}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                placeholder="Bank Name"
                value={bankForm.bankName}
                onChange={(event) => setBankForm((current) => ({ ...current, bankName: event.target.value }))}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                placeholder="Beneficiary Name"
                value={bankForm.beneficiaryName}
                onChange={(event) => setBankForm((current) => ({ ...current, beneficiaryName: event.target.value }))}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                placeholder="IBAN Number"
                value={bankForm.iban}
                onChange={(event) => setBankForm((current) => ({ ...current, iban: event.target.value }))}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                placeholder="SWIFT Code"
                value={bankForm.swiftCode}
                onChange={(event) => setBankForm((current) => ({ ...current, swiftCode: event.target.value }))}
                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <label className="flex h-12 cursor-pointer items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(event) => setBankForm((current) => ({ ...current, statement: event.target.files?.[0] || null }))}
                />
                {bankForm.statement?.name || 'Upload bank statement (PDF)'}
              </label>
            </div>
            <button className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white">
              Save bank account
            </button>
          </form>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Verification status</h3>
            {primaryBank ? (
              <div className="mt-5 space-y-3">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Bank</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{primaryBank.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Beneficiary</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{primaryBank.beneficiaryName || primaryBank.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                  <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    primaryBank.isVerified
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                  }`}>
                    {primaryBank.isVerified ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">No bank account linked yet.</p>
            )}
          </div>
        </section>
      )}

      {activeTab === 'wallet' && (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Crypto wallet ID</label>
          <input
            type="text"
            value={walletId}
            onChange={(event) => setWalletId(event.target.value)}
            placeholder="Paste your wallet address"
            className="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none focus:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="button"
            className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
          >
            Save wallet ID
          </button>
        </section>
      )}
    </div>
  );
};

export default BankingZoneTab;
