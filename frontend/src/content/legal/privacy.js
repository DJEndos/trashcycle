import { LEGAL } from '../../config/legal.js';

const { appName: app, operatorName: op, contactEmail, contactAddress } = LEGAL;

export const PRIVACY_SECTIONS = [
  { title: 'Who we are', blocks: [
    `${op} operates ${app} and is the controller of the personal data described in this policy. We handle your data in line with the Nigeria Data Protection Act 2023 (NDPA) and other applicable Nigerian law.`,
    `Contact: ${contactEmail}, ${contactAddress}.`,
  ] },
  { title: 'The data we collect', blocks: [
    { list: [
      'Account details: your full name, email address, optional phone number, password (stored only as a one-way hash, never in readable form), optional profile picture link, and your notification preferences.',
      'Addresses: the addresses you save (label, street, city, state, country). If you choose "use my location" when adding an address, we also save the map coordinates of your device at that moment.',
      'Collection requests: the waste categories, estimated quantity, date and time slot, notes, address, status history, collected weight, and any cancellation reason.',
      'Rewards and notifications: your Green Points transactions and the notifications we send you.',
      'Consent record: which version of the Terms of Use and Privacy Policy you accepted, and when.',
      'Technical data: your IP address and standard request information, which our servers and security tools process to keep the Service running and protected from abuse.',
      'Activity logs: a record of actions taken by administrators on the system (for example confirming a request), kept for accountability and security.',
      'If you work as a driver: your name, email, phone number, vehicle plate, and the live location your device reports while you are working.',
    ] },
    'We do not ask for payment card details, and we do not collect your location in the background. Your device only shares its location when you choose a feature that needs it and give your browser permission.',
  ] },
  { title: 'How and why we use it', blocks: [
    { list: [
      'To provide the Service you asked for: creating your account, scheduling, confirming, assigning and tracking collections, and awarding Green Points (performance of our agreement with you).',
      'To send service notifications about your requests (performance of our agreement with you).',
      'To send optional reminders and tips, only if you switch them on (your consent, which you can withdraw in Profile).',
      'To find nearby drop-off locations using your device location, when you tap the locate button (your consent through the browser permission). This location is used to work out distances and is not saved to your account.',
      'To keep the Service secure, prevent fraud and abuse, and fix problems (our legitimate interests).',
      'To meet legal obligations and respond to lawful requests.',
    ] },
    'We do not sell your personal data, we do not show advertising, and we do not make decisions about you solely by automated means that significantly affect you.',
  ] },
  { title: 'Who we share it with', blocks: [
    { list: [
      'Collection staff: the driver assigned to your request sees your name, address, phone number and request details so they can reach you. You can see the assigned driver\'s name and photo on your request, and their phone number and live location only while they are working on it.',
      `${app} administrators, who manage requests, users and drivers.`,
      'Hosting and database providers that run the Service on our behalf (currently Vercel, Render and MongoDB Atlas). They process data only on our instructions.',
      'OpenStreetMap: when a map is shown, your browser requests map images directly from OpenStreetMap servers, which receive your IP address and the area you are viewing.',
      'Google Fonts: the app loads its typeface from Google Fonts, which receives your IP address when the page loads.',
      'Authorities, courts or regulators, where the law requires or to protect rights and safety.',
    ] },
  ] },
  { title: 'Transfers outside Nigeria', blocks: [
    'Our hosting and database providers may store or process data in other countries. Where that happens we take steps required by the NDPA to make sure your data stays protected.',
  ] },
  { title: 'Cookies and similar technologies', blocks: [
    'We use one strictly necessary cookie, set securely and not readable by scripts, that keeps you signed in for up to 7 days. Your short-lived access token is held only in memory while the app is open. We do not use advertising or tracking cookies.',
  ] },
  { title: 'How long we keep it', blocks: [
    'We keep your data while your account is active. If you ask us to delete your account we will delete or anonymise your personal data within a reasonable time, except for records we must or are entitled to keep for legal, security, accounting or dispute purposes (for example completed collection records and activity logs).',
  ] },
  { title: 'Security', blocks: [
    'We protect your data with measures including password hashing, encrypted connections (HTTPS), role-based access controls, limits on repeated login attempts, and verified sessions. No system is completely secure, but if a breach affects your data we will act and notify you and the regulator as the law requires.',
  ] },
  { title: 'Your rights', blocks: [
    'Under the NDPA you have the right to:',
    { list: [
      'be informed about, and ask for a copy of, the personal data we hold about you;',
      'have inaccurate data corrected;',
      'ask us to delete your data, or restrict or object to how we use it;',
      'receive your data in a commonly used format (data portability);',
      'withdraw consent at any time, without affecting what was done before.',
    ] },
    `In the app you can change your notification preferences and remove saved addresses. For anything else, email ${contactEmail} and we will respond within a reasonable time. You also have the right to complain to the Nigeria Data Protection Commission.`,
  ] },
  { title: 'Children', blocks: [
    `${app} is for people aged 18 and over. We do not knowingly collect data from children. If you believe a child has registered, contact us and we will delete the account.`,
  ] },
  { title: 'Changes to this policy', blocks: [
    'We may update this policy. The latest version, with its date, is always on this page, and for important changes we will tell you in the app or by email.',
  ] },
  { title: 'Contact us', blocks: [
    `Questions or requests about your data? Email ${contactEmail}.`,
  ] },
];
