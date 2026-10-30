import Seo from '../components/ui/Seo.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { formatPKR, splitParagraphs } from '../utils/format.js';

// Each policy can be fully replaced from the Settings sheet (keys: deliveryPolicy, returnPolicy,
// privacyPolicy, terms). Separate paragraphs with a blank line. The defaults below are plain
// starting points and contain no promises the business has not confirmed. Have the owner review them.
function defaults(kind, s) {
  const name = s.storeName;
  const fee = Number(s.deliveryFee) || 0;
  const free = Number(s.freeDeliveryThreshold) || 0;
  const min = Number(s.minOrderAmount) || 0;
  switch (kind) {
    case 'delivery':
      return {
        title: 'Delivery policy',
        paragraphs: [
          s.supportedCities.length ? `We deliver to: ${s.supportedCities.join(', ')}.` : 'The cities we deliver to are shown at checkout.',
          fee > 0 ? `The delivery fee is ${formatPKR(fee)}${free > 0 ? `, free on orders of ${formatPKR(free)} or more` : ''}.` : 'Any delivery fee is calculated and shown at checkout.',
          min > 0 ? `The minimum order amount is ${formatPKR(min)}.` : '',
          `Orders placed on this website are confirmed by ${name} through WhatsApp or phone. An order is not final until the store confirms it.`,
          'Delivery times depend on your area and the store’s workload. Contact the store for an estimate.',
        ].filter(Boolean),
      };
    case 'return':
      return {
        title: 'Return policy',
        paragraphs: [
          'Please check your order when it arrives. If an item is missing, damaged or not what you ordered, contact the store on WhatsApp or phone straight away and quote your order reference.',
          `Returns, replacements and refunds are handled by ${name} case by case. Perishable and opened items may not be eligible for return.`,
          'Contact the store for the return window and any other conditions that apply to your order.',
        ],
      };
    case 'privacy':
      return {
        title: 'Privacy policy',
        paragraphs: [
          `When you place an order, ${name} collects your name, phone number, optional email, delivery address and order notes. We use this information only to confirm, prepare and deliver your order and to contact you about it.`,
          'Your order is stored in the store’s private spreadsheet, which only the store team can open. Your cart is kept in your own browser until you place an order.',
          'This website does not take online payments and does not ask you to create an account.',
          'To ask for your details to be corrected or deleted, contact the store.',
        ],
      };
    default:
      return {
        title: 'Terms and conditions',
        paragraphs: [
          `By placing an order on this website you agree to these terms with ${name}.`,
          'Prices and availability can change. The total is calculated by the store when your order is saved and may differ from what you saw earlier if prices or stock changed.',
          'An order is only accepted once the store confirms it. The store may cancel or adjust an order if items are unavailable or details are incorrect.',
          'Payment is made on delivery unless the store tells you otherwise.',
        ],
      };
  }
}

const KEYS = { delivery: 'deliveryPolicy', return: 'returnPolicy', privacy: 'privacyPolicy', terms: 'terms' };

export default function PolicyPage({ kind }) {
  const { settings } = useStore();
  const d = defaults(kind, settings);
  const custom = splitParagraphs(settings[KEYS[kind]]);
  const paragraphs = custom.length ? custom : d.paragraphs;
  return (
    <div className="container-x max-w-3xl py-10">
      <Seo title={d.title} description={`${d.title} for ${settings.storeName}`} />
      <h1 className="text-3xl font-extrabold text-brand-900">{d.title}</h1>
      <div className="mt-5 space-y-4 text-lg text-ink/85">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  );
}
