import { LEGAL } from '../../config/legal.js';

const { appName: app, operatorName: op, contactEmail } = LEGAL;

export const TERMS_SECTIONS = [
  { title: 'About these Terms', blocks: [
    `These Terms of Use ("Terms") are an agreement between you and ${op} ("we", "us") about your use of the ${app} website and app (the "Service"). By ticking the box and creating an account, or by using the Service, you confirm that you have read and accepted these Terms and our Privacy Policy.`,
    'If you do not agree, please do not create an account or use the Service.',
  ] },
  { title: 'Who can use EcoCycle', blocks: [
    'You must be at least 18 years old, or otherwise legally able to enter into this agreement, to create an account. You must give accurate information when you register and keep it up to date.',
    'The Service is offered in the cities and areas we make available in the app. We may decline requests from areas we do not serve.',
  ] },
  { title: 'Your account', blocks: [
    { list: [
      'You are responsible for keeping your password confidential and for all activity under your account.',
      'Tell us promptly if you think someone else has accessed your account.',
      'Do not share your account or create accounts for other people without their permission.',
    ] },
  ] },
  { title: 'What the Service does', blocks: [
    `${app} lets you request household waste collection, browse accepted waste categories, find drop-off locations, follow the progress of your requests and earn Green Points. We coordinate collections; a time slot is only reserved for you once we confirm your request.`,
  ] },
  { title: 'Booking, changes and cancellation', blocks: [
    { list: [
      'A new request starts as "pending". We may confirm it or reject it, for example because a slot is full, the address is outside our service area, or the waste is not accepted.',
      'Collection days, time slots and how far ahead you can book are set by us, are shown in the app, and may change.',
      'You can cancel a request while it is still pending or confirmed. After a driver is assigned, only we can cancel it.',
      'We may reschedule or cancel a request where needed (for example for safety or capacity reasons) and will notify you in the app.',
      'Please give an accurate address and make sure the waste is accessible during your chosen time slot.',
    ] },
  ] },
  { title: 'What you may put out for collection', blocks: [
    'You may only submit waste in the categories listed in the app, described honestly and packed safely.',
    'Do not include hazardous, explosive, flammable, radioactive, clinical or medical waste, or anything that is illegal to dispose of. We may refuse to collect waste that does not match your request or is unsafe, and may report unlawful items to the authorities.',
  ] },
  { title: 'Green Points', blocks: [
    'Green Points are awarded after your waste has been collected, weighed and the request is completed, at a rate we set. Points are a loyalty feature only: they have no cash value, cannot be transferred, and cannot be exchanged for money unless we say otherwise in the app.',
    'We may correct mistakes, remove points obtained through false or abusive requests, and change or end the points programme.',
  ] },
  { title: 'Driver details and live location', blocks: [
    'While a driver is assigned to your request, you can see their name and photo, may see their contact number, and may see their live position on the map. This is shown only so you can follow your own collection. Do not use or share this information for any other purpose.',
  ] },
  { title: 'Acceptable use', blocks: [
    'You agree not to:',
    { list: [
      'give false information or make fake or repeated requests that you do not intend to use;',
      'abuse, threaten or harass drivers, staff or other users;',
      'try to gain unauthorised access to the Service or other people\'s accounts or data;',
      'interfere with or overload the Service, or scrape, copy or reverse engineer it;',
      'use the Service for anything unlawful.',
    ] },
  ] },
  { title: 'Notifications', blocks: [
    'We send you service messages about your requests (for example when a driver is assigned). Optional reminders and tips can be switched on or off in your Profile.',
  ] },
  { title: 'Our content and intellectual property', blocks: [
    `The ${app} name, design, software and content belong to us or our licensors. We give you a limited, personal, non-transferable right to use the Service in line with these Terms.`,
  ] },
  { title: 'Availability and changes to the Service', blocks: [
    'We work to keep the Service available but cannot promise it will be uninterrupted or error-free. We may update, suspend or discontinue features, for example for maintenance.',
  ] },
  { title: 'Suspension and ending your account', blocks: [
    `We may suspend or close an account that breaks these Terms or puts others at risk. You may stop using the Service at any time and can ask us to delete your account by contacting ${contactEmail}.`,
  ] },
  { title: 'Our responsibility', blocks: [
    'To the extent the law allows, the Service is provided "as is", and we are not liable for indirect or consequential losses, or for loss of items you mistakenly include in waste for collection.',
    'Nothing in these Terms excludes or limits liability that cannot be excluded or limited under Nigerian law, including liability for fraud or for death or personal injury caused by negligence.',
  ] },
  { title: 'Privacy', blocks: [
    'How we collect and use your personal data is explained in our Privacy Policy, which forms part of these Terms.',
  ] },
  { title: 'Changes to these Terms', blocks: [
    'We may update these Terms. We will publish the new version here with its date, and for important changes we will tell you in the app or by email. If you keep using the Service after a change takes effect, you accept the updated Terms. If you do not agree, you can stop using the Service and ask us to delete your account.',
  ] },
  { title: 'Governing law', blocks: [
    'These Terms are governed by the laws of the Federal Republic of Nigeria. We encourage you to contact us first so we can try to resolve any complaint informally; if that is not possible, the courts of Nigeria will have jurisdiction.',
  ] },
  { title: 'Contact us', blocks: [
    `Questions about these Terms? Email ${contactEmail}.`,
  ] },
];
