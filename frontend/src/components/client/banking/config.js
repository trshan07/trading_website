import {
  FaUniversity,
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

const COUNTRY_CODES = [
  'AF', 'AL', 'DZ', 'AD', 'AO', 'AG', 'AR', 'AM', 'AU', 'AT', 'AZ',
  'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BT', 'BO', 'BA',
  'BW', 'BR', 'BN', 'BG', 'BF', 'BI', 'CV', 'KH', 'CM', 'CA', 'CF',
  'TD', 'CL', 'CN', 'CO', 'KM', 'CG', 'CR', 'CI', 'HR', 'CU', 'CY',
  'CZ', 'CD', 'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER',
  'EE', 'SZ', 'ET', 'FJ', 'FI', 'FR', 'GA', 'GM', 'GE', 'DE', 'GH',
  'GR', 'GD', 'GT', 'GN', 'GW', 'GY', 'HT', 'HN', 'HU', 'IS', 'IN',
  'ID', 'IR', 'IQ', 'IE', 'IL', 'IT', 'JM', 'JP', 'JO', 'KZ', 'KE',
  'KI', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT',
  'LU', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MR', 'MU', 'MX',
  'FM', 'MD', 'MC', 'MN', 'ME', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP',
  'NL', 'NZ', 'NI', 'NE', 'NG', 'KP', 'MK', 'NO', 'OM', 'PK', 'PW',
  'PA', 'PG', 'PY', 'PE', 'PH', 'PL', 'PT', 'QA', 'RO', 'RU', 'RW',
  'KN', 'LC', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL',
  'SG', 'SK', 'SI', 'SB', 'SO', 'ZA', 'KR', 'SS', 'ES', 'SD', 'SR',
  'SE', 'CH', 'SY', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TO', 'TT', 'TN',
  'TR', 'TM', 'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UY', 'UZ', 'VU',
  'VA', 'VE', 'VN', 'YE', 'ZM', 'ZW',
];

const regionNames = typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function'
  ? new Intl.DisplayNames(['en'], { type: 'region' })
  : null;

export const SUPPORTED_COUNTRIES = COUNTRY_CODES
  .filter((code) => code !== 'LK')
  .map((code) => regionNames?.of(code) || code)
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b));

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD', 'CHF', 'JPY', 'NZD'];

export const BANKING_TABS = [
  { id: 'overview', label: 'Overview', icon: FaUniversity },
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
  country: '',
  accountHolderName: '',
  accountNumber: '',
  accountType: 'savings',
  currency: 'USD',
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
