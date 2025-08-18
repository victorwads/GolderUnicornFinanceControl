export default interface SubscriptionsTranslation {
  plans: {
    badge: string;
    select: string;
    basic: { title: string; price: string; description: string; };
    plus: { title: string; price: string; description: string; };
    premium: { title: string; price: string; description: string; };
    disclaimer: string;
  };
  checkout: {
    payNow: string;
  };
  thankyou: {
    title: string;
    message: string;
  };
}
