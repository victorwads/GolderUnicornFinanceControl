import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GroceryItemModel } from '@models';
import getRepositories from '@repositories';
import { Container, ContainerFixedContent, ContainerScrollContent } from '@components/conteiners';
import Icon from '@components/Icons';

const GroceriesMainScreen = () => {
  const [items, setItems] = useState<GroceryItemModel[]>([]);

  useEffect(() => {
    const { groceries } = getRepositories();
    setItems(groceries.getAllSorted());
  }, []);

  return <Container spaced full>
    <ContainerFixedContent>
      <div className="ScreenHeaderRow">
        <h1 className="ScreenTitle">{Lang.groceries.title}</h1>
        <div className="spacer"></div>
        <Link to="/groceries/create"><Icon icon={Icon.all.faPlus} size="2x" /></Link>
      </div>
    </ContainerFixedContent>
    <ContainerScrollContent>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(item => (
          <li key={item.id}>
            <Link to={`/groceries/${item.id}/edit`}>
              {item.name} - {item.quantity} {item.unit} {item.expirationDate ? ' - '+item.expirationDate.toLocaleDateString() : ''}
            </Link>
          </li>
        ))}
      </ul>
    </ContainerScrollContent>
  </Container>;
};

export default GroceriesMainScreen;
