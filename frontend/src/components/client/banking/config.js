import {
  FaUniversity,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaLandmark,
  FaCreditCard,
  FaMobileAlt,
  FaHistory,
  FaBitcoin,
} from 'react-icons/fa';

export const BANK_WIZARD_STEPS = [
  { id: 1, key: 'bankInfo', label: 'Bank Info' },
  { id: 2, key: 'accountDetails', label: 'Account Details' },
  { id: 3, key: 'verification', label: 'Verification' },
  { id: 4, key: 'confirm', label: 'Confirm' },
];

export const BANK_ACCOUNT_TYPES = [
  { value: 'savings', label: 'Savings' },
  { value: 'current', label: 'Current (Checking)' },
  { value: 'business', label: 'Business' },
];

export const BENEFICIARY_RELATIONSHIPS = [
  { value: 'self', label: 'Self' },
  { value: 'company', label: 'Company' },
  { value: 'third-party', label: 'Third Party' },
];

export const SUPPORTED_COUNTRIES = [
  'Sri Lanka',
  'United States',
  'United Kingdom',
  'Singapore',
  'United Arab Emirates',
  'Australia',
  'Canada',
  'Germany',
];

export const SUPPORTED_CURRENCIES = ['LKR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'];

export const BANKING_TABS = [
  { id: 'overview', label: 'Overview', icon: FaUniversity },
  { id: 'transfer', label: 'Transfer', icon: FaExchangeAlt },
  { id: 'withdraw', label: 'Withdraw', icon: FaMoneyBillWave },
  { id: 'accounts', label: 'Accounts', icon: FaLandmark },
  { id: 'cards', label: 'Cards', icon: FaCreditCard },
  { id: 'payment', label: 'Payment', icon: FaMobileAlt },
  { id: 'history', label: 'History', icon: FaHistory },
];

export const DEPOSIT_METHODS = [
  { id: 'bank', name: 'Bank Transfer', icon: FaUniversity, processing: '1-3 days', fee: 'Free' },
  { id: 'card', name: 'Credit/Debit Card', icon: FaCreditCard, processing: 'Instant', fee: '2.5%' },
  { id: 'crypto', name: 'Cryptocurrency', icon: FaBitcoin, processing: '30 min', fee: '0.1%' },
];

export const WITHDRAWAL_METHODS = [
  { id: 'bank', name: 'Bank Transfer', icon: FaUniversity, processing: '1-3 days', fee: 'Free', min: 50, max: 50000 },
  { id: 'card', name: 'Credit/Debit Card', icon: FaCreditCard, processing: '3-5 days', fee: '1%', min: 20, max: 10000 },
  { id: 'crypto', name: 'Cryptocurrency', icon: FaBitcoin, processing: '1 hour', fee: '0.0005 BTC', min: 50, max: 50000 },
];

export const INITIAL_BANK_FORM = {
  bankName: '',
  branchName: '',
  branchCode: '',
  country: 'Sri Lanka',
  accountHolderName: '',
  accountNumber: '',
  accountType: 'savings',
  currency: 'LKR',
  swiftCode: '',
  iban: '',
  beneficiaryName: '',
  relationship: 'self',
  proofOfBankAccount: null,
  proofOfBankAccountName: '',
  withdrawalPin: '',
  otpCode: '',
  confirmOwnership: false,
  acceptTerms: false,
  authorizeTransactions: false,
  isDefault: false,
};
