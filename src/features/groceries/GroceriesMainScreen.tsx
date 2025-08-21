import { useEffect, useMemo, useState } from 'react';

import { GroceryItemModel } from '@models';
import { Container, ContainerFixedContent, ContainerScrollContent } from '@components/conteiners';
import AIMicrophone from '@components/voice/AIMicrophone';
import getRepositories from '@repositories';

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

  useEffect(() => {
    const { groceries } = getRepositories();

    aiParser.items = groceries.getCache().filter((item) => !item.removed);
    setGroceryItems(aiParser.items);
  }, [aiParser]);

  const handleAiAction: AIActionHandler<GroceryItemModel> = async (action, changes) => {
    const items = [...aiParser.items];
    setGroceryItems(items);

    const { groceries } = getRepositories();
    for (const item of (changes || [])) {
      if (action.action === 'remove') {
        item.removed = true;
      }
      groceries.set(GroceryItemModel.fromObject(item));
    }
  };

  const toBuyItems = groceryItems.filter((item) => item.toBuy);
  const onStorage = groceryItems.filter((item) => !item.toBuy);
  const noItems = toBuyItems.length === 0 && onStorage.length === 0;

  return (
    <Container screen spaced className="SpeechScreen">
      <ContainerFixedContent>
        <h2 style={{ marginBottom: 24 }}>{Lang.groceries.title}</h2>
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
            <h3>{Lang.speech.haveListTitle} - ({onStorage.length && 'fdg'})</h3>
            <GroceryList items={onStorage} />
          </div>}
          {(toBuyItems.length || noItems) && <div className="GroceryColumn">
            <h3>{Lang.speech.toBuyListTitle} - ({toBuyItems.length && toBuyItems.length})</h3>
            <GroceryList items={toBuyItems} hideBadges />
          </div>}
        </div>
        <div style={{ height: 120 }}></div>
        <AIMicrophone parser={aiParser} onAction={handleAiAction} />
      </ContainerScrollContent>
    </Container>
  );
};

export default SpeechScreen;
