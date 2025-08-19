import { plans, comparisonTable } from '../planData';
import './FeatureTable.css';

const FeatureTable: React.FC = () => (
  <table className="FeatureTable">
    <thead>
      <tr>
        <th>Recurso</th>
        {plans.map((p) => (
          <th key={p.id}>{p.title}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {comparisonTable.map((row) => (
        <tr key={row.feature}>
          <td>{row.feature}</td>
          {row.values.map((v, i) => (
            <td key={i}>{v}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export default FeatureTable;
