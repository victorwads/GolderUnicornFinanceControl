import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { GroceryItemModel } from '@models';
import { Container, ContainerFixedContent, ContainerScrollContent } from '@componentsDeprecated/conteiners';
import AIMicrophone from '@componentsDeprecated/voice/AIMicrophone';
import getRepositories from '@repositories';
import Icon, { Icons } from '@componentsDeprecated/Icons';

import GroceryList from './GroceryList';
import AIActionsParser, { AIActionHandler } from '../speech/AIParserManager';
import { AIGroceryListConfig, normalizer } from './GroceryListAiInfo';

const SpeechScreen = () => {
  const aiParser = useMemo(
    () =>
      new AIActionsParser<GroceryItemModel>(
        AIGroceryListConfig, normalizer,
        ({id, name, toBuy, quantity, opened}) => 
          ({id, name, toBuy, quantity, opened })
      ),
    []
  );

  const [groceryItems, setGroceryItems] = useState<typeof aiParser.items>([]);
  const [removedCount, setRemovedCount] = useState(0);

  useEffect(() => {
    const { groceries } = getRepositories();

    const cache = groceries.getCache();
    aiParser.items = cache.filter((item) => !item.removed);
    setGroceryItems(aiParser.items);
    setRemovedCount(cache.filter(item => item.removed && item.name).length);
  }, [aiParser]);

  const handleAiAction: AIActionHandler<GroceryItemModel> = useCallback(async (action, changes) => {
    const items = [...aiParser.items];
    setGroceryItems(items);

    let removed = 0;
    const { groceries } = getRepositories();
    for (const item of (changes || [])) {
      if (action.action === 'remove') {
        item.removed = true;
        removed++;
      }
      groceries.set(GroceryItemModel.fromObject(item));
    }
    setRemovedCount(removedCount + removed);
  }, [removedCount]);

  const toBuyItems = groceryItems.filter((item) => item.toBuy);
  const onStorage = groceryItems.filter((item) => !item.toBuy);
  const noItems = toBuyItems.length === 0 && onStorage.length === 0;

  return (
    <Container screen spaced className="SpeechScreen">
      <ContainerFixedContent>
        <div className="GroceryHeader">
          <h2>{Lang.groceries.title} (Beta)</h2>
          <Link to="/groceries/removed" className="TrashButton">
            <Icon icon={Icons.faTrash} />
            {removedCount > 0 && <span className="TrashCount">{removedCount}</span>}
          </Link>
        </div>
        {/* <h3>{Lang.speech.howToUseTitle}</h3> */}
        <p>{Lang.speech.intro1}</p>
        <p>{Lang.speech.intro2}</p>
        {/* <p>{Lang.speech.examplesTitle}</p>
        <ul>
          {Lang.speech.examples.map((ex, i) => (
            <li key={i}>{ex}</li>
          ))}
        </ul> */}
      </ContainerFixedContent>
      <ContainerScrollContent spaced autoScroll>
        <div className="GroceryLists">
          {(onStorage.length || noItems) && <div className="GroceryColumn">
            <h3>{Lang.speech.haveListTitle} - ({onStorage.length && onStorage.length})</h3>
            <GroceryList items={onStorage} />
          </div>}
          {(toBuyItems.length || noItems) && <div className="GroceryColumn">
            <h3>{Lang.speech.toBuyListTitle} - ({toBuyItems.length && toBuyItems.length})</h3>
            <GroceryList items={toBuyItems} hideBadges />
          </div>}
        </div>
        <div style={{ height: 120 }}></div>
        {/* <AIMicrophone parser={aiParser} onAction={handleAiAction} /> */}
      </ContainerScrollContent>
    </Container>
  );
};

export default SpeechScreen;
