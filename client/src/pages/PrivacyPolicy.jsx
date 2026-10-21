import LegalLayout from '../components/layout/LegalLayout'
import { siteConfig } from '../config/site'

const sections = [
  {
    heading: 'Information we collect',
    text: 'When you submit a callback or contact form, we collect your name, phone number, optional email address and the message you write. If you contact us on WhatsApp or by phone, we receive the details you share in that conversation.',
  },
  {
    heading: 'How we use it',
    text: 'We use your details only to respond to your enquiry, share product information and pricing, and follow up on your requirement.',
  },
  {
    heading: 'Sharing of information',
    text: 'We do not sell your personal information. We share it only with service providers who help us run this website and respond to enquiries, or when required by law.',
  },
  {
    heading: 'Data retention and security',
    text: 'We keep enquiry details for as long as needed to handle your request and for business records. We take reasonable steps to protect your information, but no online system can be guaranteed to be completely secure.',
  },
  {
    heading: 'Your choices',
    text: 'You can ask us to update or delete your enquiry details at any time by contacting us using the details on our Contact page.',
  },
  {
    heading: 'Third-party links',
    text: 'Links to WhatsApp, maps or other websites are governed by the privacy policies of those services.',
  },
  {
    heading: 'Changes to this policy',
    text: 'We may update this policy from time to time. The latest version will always be available on this page.',
  },
]

function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="October 2026"
      intro={`This policy explains how ${siteConfig.name} handles the information you share with us through this website.`}
      sections={sections}
    />
  )
}

export default PrivacyPolicy