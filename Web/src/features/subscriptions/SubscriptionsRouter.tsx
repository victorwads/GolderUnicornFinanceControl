import { Routes, Route, Navigate } from 'react-router-dom';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';
import Subscriptions from '@layouts/subscriptions/Subscriptions';
import WhyCharge from '@layouts/subscriptions/WhyCharge';
import OurCosts from '@layouts/subscriptions/OurCosts';

const SubscriptionsRouter: React.FC = () => (
  <Routes>
    <Route path="plans" element={<Subscriptions />} />
    <Route path="why" element={<WhyCharge />} />
    <Route path="why/costs" element={<OurCosts />} />
    <Route path="checkout/:plan" element={<Checkout />} />
    <Route path="thankyou" element={<ThankYou />} />
    <Route path="*" element={<Navigate to="plans" replace />} />
  </Routes>
);

export default SubscriptionsRouter;
