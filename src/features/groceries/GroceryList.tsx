import './GroceriesMainScreen.css';
import { Link } from 'react-router-dom';

import { getExpirationLabel } from './expirationUtils';
import { WithChanged } from '@features/speech/AIParserManager';

import { GroceryItemModel } from '@models';

interface GroceryListProps {
  items: WithChanged<GroceryItemModel>[];
}

const GroceryList: React.FC<GroceryListProps> = ({ items }) => (
  <ul className="GroceryList">
    {items.map(item => {
      const badge = getExpirationLabel(item);
      const validLabel = !badge ? Lang.groceries.valid : undefined;
      const isOpened = item.opened ? 'em uso / aberto' : validLabel;

      const isOpenedColor = item.opened ? '#f0ad4e' : '#5cb85c';
      return (
        <li key={item.id}>
          <Link to={`/groceries/${item.id}/edit`} className={item.changed ? "GroceryItemLink grocery-highlight" :   "GroceryItemLink"}>
            <div className="GroceryItemRow">
              <span>{item.name}</span>
              <div style={{flex: 1}}></div>
              {isOpened && (<span className="Badge" style={{ backgroundColor: isOpenedColor }}>
                {isOpened}
              </span>)}
              {badge && (
                <span className="Badge" style={{ backgroundColor: badge.color }}>
                  {badge.label}
                </span>
              )}
            </div>
            <div className="GroceryItemDetails">
              {item.quantity || 1} un
              {item.paidPrice && ` - R$ ${item.paidPrice.toFixed(2)}`}
              {item.expirationDate && ' - ' + new Date(item.expirationDate).toLocaleDateString()}
              {item.location && ` - ${item.location}`}
            </div>
          </Link>
        </li>
      );
    })}
  </ul>
);

export default GroceryList;
