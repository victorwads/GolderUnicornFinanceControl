import './SpeechScreen.css';
import { useEffect, useMemo, useState } from 'react';

import { GroceryItemModel } from '@models';
import { Container, ContainerFixedContent, ContainerScrollContent } from '@components/conteiners';
import AIMicrophone from '@components/voice/AIMicrophone';

import GroceryList from '../../features/groceries/GroceryList';
import AIActionsParser from './AIParserManager';
import { AIGroceryListConfig } from './GroceryListAiInfo';

const SpeechScreen = () => {
  const aiParser = useMemo(
    () =>
      new AIActionsParser<GroceryItemModel>(AIGroceryListConfig, (item) => {
        if (item.opened !== undefined) item.opened.toString() === 'true';
        if (item.expirationDate !== undefined)
          item.expirationDate = new Date(item.expirationDate);
        return item;
      }),
    []
  );

  const [groceryItems, setGroceryItems] = useState<GroceryItemModel[]>([]);

  useEffect(() => {
    setGroceryItems(aiParser.items as GroceryItemModel[]);
  }, [aiParser]);

  const handleAiAction = () => {
    setGroceryItems([...aiParser.items] as GroceryItemModel[]);
  };

  return (
    <Container screen spaced className="SpeechScreen">
      <ContainerFixedContent>
        <h2 style={{ marginBottom: 24 }}>{Lang.speech.title}</h2>
        <h3>{Lang.speech.howToUseTitle}</h3>
        <p>{Lang.speech.intro1}</p>
        <p>{Lang.speech.intro2}</p>
        <p>{Lang.speech.examplesTitle}</p>
        <ul>
          {Lang.speech.examples.map((ex, i) => (
            <li key={i}>{ex}</li>
          ))}
        </ul>
      </ContainerFixedContent>
      <ContainerScrollContent spaced autoScroll>
        <GroceryList items={groceryItems} />
        <div style={{ height: 120 }}></div>
        <AIMicrophone parser={aiParser} onAction={handleAiAction} />
      </ContainerScrollContent>
    </Container>
  );
};

export default SpeechScreen;
