import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Container, ContainerFixedContent, ContainerScrollContent } from '@components/conteiners';
import Icon, { Icons } from '@components/Icons';
import getRepositories from '@repositories';
import { GroceryItemModel } from '@models';

import './GroceriesMainScreen.css';
import GroceryList from './GroceryList';

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

  return (
    <Container screen spaced>
      <ContainerFixedContent>
        <div className="GroceryHeader">
          <h2>Groceries Trash - {items.length}</h2>
          <Link to="/groceries" className="TrashButton">
            <Icon icon={Icons.faArrowLeft} />
          </Link>
        </div>
        {items.length > 0 && (
          <button className="FloatButton TrashDeleteButton" onClick={deleteSelected}>
            <Icon icon={Icons.faTrash} size="2x" />
          </button>
        )}
      </ContainerFixedContent>
      <ContainerScrollContent spaced autoScroll>
        <GroceryList items={items} selected={selected} onSelect={toggle} hideBadges />
      </ContainerScrollContent>
    </Container>
  );
};

export default GroceriesTrashScreen;

