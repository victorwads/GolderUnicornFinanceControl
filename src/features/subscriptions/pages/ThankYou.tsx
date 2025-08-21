const ThankYou: React.FC = () => (
  <div style={{ padding: 16, textAlign: 'center', lineHeight: 1.6 }}>
    <h2>{Lang.subscriptions?.thankyou.title || 'Thank you!'}</h2>
    <p>{Lang.subscriptions?.thankyou.message || 'Thank you for supporting financial education! Your contribution helps us maintain and expand this project so more people can achieve financial freedom.'}</p>
    <p>Aproveite os recursos premium!</p>
  </div>
);

export default ThankYou;
