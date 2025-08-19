import { Routes, Route, Navigate } from 'react-router-dom';
import Plans from './pages/Plans';
import WhyWeCharge from './pages/WhyWeCharge';
import CostsExplained from './pages/CostsExplained';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';

const SubscriptionsRouter: React.FC = () => (
  <Routes>
    <Route path="plans" element={<Plans />} />
    <Route path="why" element={<WhyWeCharge />} />
    <Route path="why/cots" element={<CostsExplained />} />
    <Route path="checkout/:plan" element={<Checkout />} />
    <Route path="thankyou" element={<ThankYou />} />
    <Route path="*" element={<Navigate to="plans" replace />} />
  </Routes>
);

export default SubscriptionsRouter;
