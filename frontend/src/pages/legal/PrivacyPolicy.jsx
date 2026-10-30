import LegalDocument from '../../components/legal/LegalDocument.jsx';
import { PRIVACY_SECTIONS } from '../../content/legal/privacy.js';

export default function PrivacyPolicy() {
  return <LegalDocument title="Privacy Policy" sections={PRIVACY_SECTIONS} other={{ to: '/terms', label: 'Terms of Use' }}
    intro="This policy explains what personal data EcoCycle collects, why, and the choices you have." />;
}
