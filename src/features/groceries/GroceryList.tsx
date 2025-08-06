import { Link } from 'react-router-dom';
import { GroceryItemModel } from '@models';
import Icon from '@components/Icons';
import { getExpirationLabel } from './expirationUtils';
import './GroceriesMainScreen.css';

interface GroceryListProps {
  items: GroceryItemModel[];
}

const GroceryList: React.FC<GroceryListProps> = ({ items }) => (
  <ul className="GroceryList">
    {items.map(item => {
      const badge = getExpirationLabel(item);
      return (
        <li key={item.id}>
          <Link to={`/groceries/${item.id}/edit`} className="GroceryItemLink">
            <div className="GroceryItemRow">
              <span>{item.name}</span>
              {badge && (
                <span className="Badge" style={{ backgroundColor: badge.color }}>
                  {badge.label}
                </span>
              )}
            </div>
            <div className="GroceryItemDetails">
              {item.quantity} {item.unit}
              {item.paidPrice && ` - R$ ${item.paidPrice.toFixed(2)}`}
              {item.expirationDate && ' - ' + item.expirationDate.toLocaleDateString()}
              {item.location && ` - ${item.location}`}
            </div>
          </Link>
        </li>
      );
    })}
  </ul>
);

export default GroceryList;
