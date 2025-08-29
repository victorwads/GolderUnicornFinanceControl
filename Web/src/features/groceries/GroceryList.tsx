import './GroceriesMainScreen.css';
import { Link } from 'react-router-dom';

import { getExpirationLabel } from './expirationUtils';
import { WithChanged } from '@features/speech/AIParserManager';

import { GroceryItemModel } from '@models';

interface GroceryListProps {
  items: WithChanged<GroceryItemModel>[];
  selected?: Set<string>;
  onSelect?: (id: string) => void;
  hideBadges?: boolean;
}

const GroceryList: React.FC<GroceryListProps> = ({ items, selected, onSelect, hideBadges }) => (
  <ul className={"GroceryList" + (selected && onSelect ? " grid" : "")}>
    {items.map(item => {
      return (
        <li key={item.id}>
          {selected && onSelect ? <label>
            <input type="checkbox" checked={selected?.has(item.id)} onChange={() => onSelect?.(item.id)} />
            <div className='GroceryItemLink'>
              <GroceryListItem item={item} hideBadges={hideBadges} />
            </div>
          </label> : <Link to={`/groceries/${item.id}/edit`} className={item.changed ? "GroceryItemLink grocery-highlight" :   "GroceryItemLink"}>
            <GroceryListItem item={item} hideBadges={hideBadges} />
          </Link>}
        </li>
      );
    })}
  </ul>
);

interface GroceryListItemProps {
  item: WithChanged<GroceryItemModel>;
  hideBadges?: boolean;
}

const GroceryListItem: React.FC<GroceryListItemProps> = ({ item, hideBadges }) => {
  const badge = getExpirationLabel(item);
  const validLabel = !badge ? Lang.groceries.valid : undefined;
  const isOpened = item.opened ? 'em uso / aberto' : validLabel;

  const isOpenedColor = item.opened ? '#f0ad4e' : '#5cb85c';

return <>
    <div className="GroceryItemRow">
      <span>{item.name}</span>
      <div style={{flex: 1}}></div>
      {!hideBadges && <div className='badge-container'>
        {isOpened && (<span className="Badge" style={{ backgroundColor: isOpenedColor }}>
          {isOpened}
        </span>)}
        {badge && (
          <span className="Badge" style={{ backgroundColor: badge.color }}>
            {badge.label}
          </span>
        )}
      </div>}
    </div>
    <div className="GroceryItemDetails">
      {item.quantity || 1} un
      {item.paidPrice && ` - R$ ${item.paidPrice.toFixed(2)}`}
      {item.expirationDate && ' - ' + new Date(item.expirationDate).toLocaleDateString()}
      {item.location && ` - ${item.location}`}
    </div>
  </>
}

export default GroceryList;
