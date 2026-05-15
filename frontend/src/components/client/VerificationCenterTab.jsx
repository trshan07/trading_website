import React, { useMemo, useState } from 'react';

const statusTone = {
  Verified: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  Pending: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  Rejected: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
};

const VerificationCenterTab = ({ documents = [], onUpload }) => {
  const [proofOfIdentity, setProofOfIdentity] = useState(null);
  const [proofOfResidence, setProofOfResidence] = useState(null);

  const documentSummary = useMemo(() => {
    const byCategory = (matcher) => documents.find((document) => matcher(String(document.category || '').toLowerCase()));

    return {
      identity: byCategory((category) => category.includes('identity')),
      residence: byCategory((category) => category.includes('address') || category.includes('residence')),
    };
  }, [documents]);

  const submitUpload = (category, file) => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('category', category);
    formData.append('name', file.name);
    onUpload(formData);
  };

  const UploadCard = ({ title, hint, file, setFile, existingDocument }) => (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone[existingDocument?.status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
          {existingDocument?.status || 'Not uploaded'}
        </span>
      </div>

      <label className="mt-6 flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center transition-colors hover:border-slate-400 hover:bg-white dark:border-slate-700 dark:bg-slate-950/50 dark:hover:border-slate-600 dark:hover:bg-slate-950">
        <input
          type="file"
          className="hidden"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {file ? file.name : 'Drag or choose a file to upload'}
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">PDF, JPG, or PNG</p>
      </label>

      <button
        onClick={() => submitUpload(title, file)}
        disabled={!file}
        className={`mt-5 w-full rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
          file
            ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white'
            : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
        }`}
      >
        Upload {title}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Verification Center</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">Upload your KYC documents</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Keep the process simple: one upload for identity, one upload for proof of residence, with status shown clearly.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <UploadCard
          title="Proof of Identity"
          hint="Passport, national ID, or driving licence."
          file={proofOfIdentity}
          setFile={setProofOfIdentity}
          existingDocument={documentSummary.identity}
        />
        <UploadCard
          title="Proof of Residence"
          hint="Utility bill, bank statement, or government address document."
          file={proofOfResidence}
          setFile={setProofOfResidence}
          existingDocument={documentSummary.residence}
        />
      </section>
    </div>
  );
};

export default VerificationCenterTab;
