import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Container, ContainerFixedContent, ContainerScrollContent } from '@components/conteiners';
import Icon from '@components/Icons';
import getRepositories from '@repositories';
import { GroceryItemModel } from '@models';

import './GroceriesMainScreen.css';

const GroceriesTrashScreen = () => {
  const [items, setItems] = useState<GroceryItemModel[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const { groceries } = getRepositories();
    const removed = groceries.getCache().filter(item => item.removed && item.name);
    setItems(removed);
  }, []);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (!window.confirm('Delete selected items permanently?')) return;
    const { groceries } = getRepositories();
    for (const id of Array.from(selected)) {
      const item = new GroceryItemModel(id, '', 0, false, undefined, undefined, undefined, undefined, undefined, false, true);
      await groceries.set(item);
    }
    setItems(items.filter(item => !selected.has(item.id)));
    setSelected(new Set());
  };

  const toBuy = items.filter(i => i.toBuy);
  const onStorage = items.filter(i => !i.toBuy);
  const noItems = items.length === 0;

  return (
    <Container screen spaced>
      <ContainerFixedContent>
        <div className="GroceryHeader">
          <h2>Trash</h2>
          <Link to="/main/groceries" className="TrashButton">
            <Icon icon={Icon.all.faArrowLeft} />
          </Link>
        </div>
      </ContainerFixedContent>
      <ContainerScrollContent spaced autoScroll>
        <div className="GroceryLists">
          {(onStorage.length || noItems) && <div className="GroceryColumn">
            <h3>{Lang.speech.haveListTitle} - ({onStorage.length})</h3>
            <ul className="GroceryList">
              {onStorage.map(item => (
                <li key={item.id} className="GroceryTrashItem">
                  <label>
                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggle(item.id)} />
                    <span>{item.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>}
          {(toBuy.length || noItems) && <div className="GroceryColumn">
            <h3>{Lang.speech.toBuyListTitle} - ({toBuy.length})</h3>
            <ul className="GroceryList">
              {toBuy.map(item => (
                <li key={item.id} className="GroceryTrashItem">
                  <label>
                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggle(item.id)} />
                    <span>{item.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>}
        </div>
      </ContainerScrollContent>
      {items.length > 0 && (
        <button className="FloatButton TrashDeleteButton" onClick={deleteSelected}>
          <Icon icon={Icon.all.faTrash} size="2x" />
        </button>
      )}
    </Container>
  );
};

export default GroceriesTrashScreen;

