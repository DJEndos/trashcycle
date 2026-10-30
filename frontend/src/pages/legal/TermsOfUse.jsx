import LegalDocument from '../../components/legal/LegalDocument.jsx';
import { TERMS_SECTIONS } from '../../content/legal/terms.js';

export default function TermsOfUse() {
  return <LegalDocument title="Terms of Use" sections={TERMS_SECTIONS} other={{ to: '/privacy', label: 'Privacy Policy' }}
    intro="Please read these Terms carefully. They explain the rules for using EcoCycle." />;
}
