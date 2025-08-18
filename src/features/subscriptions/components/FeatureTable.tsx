import './FeatureTable.css';

interface Feature {
  feature: string;
  basic: boolean;
  plus: boolean;
  premium: boolean;
}

const features: Feature[] = [
  { feature: 'Advanced insights', basic: false, plus: true, premium: true },
  { feature: 'Cloud sync', basic: false, plus: true, premium: true },
  { feature: 'Full export', basic: false, plus: false, premium: true },
  { feature: 'Priority support', basic: false, plus: false, premium: true },
];

const FeatureTable: React.FC = () => (
  <table className="FeatureTable">
    <thead>
      <tr>
        <th>Feature</th>
        <th>Basic</th>
        <th>Plus</th>
        <th>Premium</th>
      </tr>
    </thead>
    <tbody>
      {features.map((f) => (
        <tr key={f.feature}>
          <td>{f.feature}</td>
          <td>{f.basic ? '✓' : '✗'}</td>
          <td>{f.plus ? '✓' : '✗'}</td>
          <td>{f.premium ? '✓' : '✗'}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default FeatureTable;
