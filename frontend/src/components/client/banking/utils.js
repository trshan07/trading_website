export const maskAccountNumber = (accountNumber = '') => {
  const cleaned = String(accountNumber).replace(/\s/g, '');
  if (!cleaned) return '';
  if (cleaned.length <= 4) return cleaned;
  return `${'X'.repeat(Math.max(cleaned.length - 4, 6))}${cleaned.slice(-4)}`;
};
