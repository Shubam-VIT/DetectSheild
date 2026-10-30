import { PresetApp } from '../types/threat';

export const SAMPLE_URLS = [
  {
    label: 'Bank Phishing Spoof',
    url: 'http://secure-chase-verification-update.com/login.php',
    desc: 'Simulated financial credential harvesting domain with multiple deceptive subdomains',
    expected: 'Dangerous',
  },
  {
    label: 'Defaced / Malware Payload',
    url: 'http://fake-bank.com/login',
    desc: 'Known test defacement domain registered on untrusted server',
    expected: 'Dangerous',
  },
  {
    label: 'Suspicious Free Gift TLD',
    url: 'http://win-apple-iphone15-free.buzz/claim',
    desc: 'Disposable high-risk TLD with social engineering lure',
    expected: 'Dangerous',
  },
  {
    label: 'Shortened Link with Query Parameter',
    url: 'https://tinyurl.com/account-verify-portal-99',
    desc: 'Obfuscated redirection link masking true endpoint',
    expected: 'Caution',
  },
  {
    label: 'Legitimate Official Domain',
    url: 'https://github.com/explore',
    desc: 'Authentic high-reputation open platform',
    expected: 'Safe',
  },
  {
    label: 'Google Official Search',
    url: 'https://www.google.com',
    desc: 'Verified trusted major search engine',
    expected: 'Safe',
  },
];

export const SAMPLE_MESSAGES = [
  {
    title: 'Urgent Bank Freeze (Smishing)',
    text: 'URGENT: Your Chase Bank card has been suspended due to 3 suspicious transactions. Visit http://chase-security-verify.com to unlock immediately or card will be closed.',
    type: 'Dangerous',
  },
  {
    title: 'Package Delivery Fee Bait',
    text: 'USPS Notice: Your package could not be delivered due to missing house number. Please update your address and pay $1.99 redelivery fee at https://usps-parcel-redelivery.top within 12 hours.',
    type: 'Dangerous',
  },
  {
    title: 'Lottery Cash Reward Scam',
    text: 'Congratulations! You won $250,000 in the International Mobile Lottery Promo. Call +18005550199 or text CLAIM to confirm your winning payout today.',
    type: 'Dangerous',
  },
  {
    title: 'Legitimate 2FA Code',
    text: 'Your GitHub authentication code is 849201. It will expire in 10 minutes. If you did not request this, you can safely ignore this SMS.',
    type: 'Safe',
  },
  {
    title: 'Friendly Casual Message',
    text: 'Hey Alex, are we still meeting at the coffee shop around 3pm for our quarterly project review? Let me know!',
    type: 'Safe',
  },
];

export const PRESET_APPS: PresetApp[] = [
  {
    id: 'clean_master',
    name: 'Clean Master Ultra Booster',
    developer: 'MegaSpeed Tooling Inc.',
    category: 'System Utility',
    icon: '⚡',
    expectedVerdict: 'Dangerous',
    description: 'Disguised optimizer requesting excessive boot persistence, background SMS dispatch, and contact extraction.',
    permissions: [
      'android.permission.INTERNET',
      'android.permission.SEND_SMS',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.READ_CONTACTS',
      'android.permission.SYSTEM_ALERT_WINDOW',
    ],
  },
  {
    id: 'battery_saver',
    name: 'Super Battery 2026 Pro',
    developer: 'QuickPower Labs',
    category: 'Power Management',
    icon: '🔋',
    expectedVerdict: 'Dangerous',
    description: 'Requests Accessibility Services and SMS inspection—classic Android Banking Trojan privilege pattern.',
    permissions: [
      'android.permission.INTERNET',
      'android.permission.BIND_ACCESSIBILITY_SERVICE',
      'android.permission.RECEIVE_SMS',
      'android.permission.READ_SMS',
      'android.permission.REQUEST_INSTALL_PACKAGES',
    ],
  },
  {
    id: 'flash_player',
    name: 'Adobe Flash Update HD',
    developer: 'Global Media Tools',
    category: 'Media Player',
    icon: '🎥',
    expectedVerdict: 'Dangerous',
    description: 'Fake legacy player installer that requests stealth package installation and device administration.',
    permissions: [
      'android.permission.INTERNET',
      'android.permission.REQUEST_INSTALL_PACKAGES',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.RECEIVE_BOOT_COMPLETED',
    ],
  },
  {
    id: 'crypto_tracker',
    name: 'Crypto Live Ticker & Portfolio',
    developer: 'CoinMetrics Community',
    category: 'Finance',
    icon: '📈',
    expectedVerdict: 'Caution',
    description: 'Legitimate ticker that asks for background location telemetry which is unnecessary for asset tracking.',
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
  },
  {
    id: 'simple_notes',
    name: 'Minimalist Markdown Notes',
    developer: 'OpenDesk Studio',
    category: 'Productivity',
    icon: '📝',
    expectedVerdict: 'Safe',
    description: 'Verified privacy-respecting offline notepad with zero dangerous permissions.',
    permissions: [
      'android.permission.VIBRATE',
      'android.permission.WAKE_LOCK',
    ],
  },
];
