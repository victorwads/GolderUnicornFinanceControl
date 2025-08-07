import './SpeechScreen.css';
import { useEffect, useRef, useState } from 'react';

import { getCurrentLangInfo } from '@lang';

import Icon from '@components/Icons';
import { Container, ContainerFixedContent, ContainerScrollContent } from '@components/conteiners';

import { GroceryItemModel } from '@models';
import GroceryList from '../../features/groceries/GroceryList';
import { SpeechRecognitionManager } from './SpeechRecognitionManager';
import AIActionsParser from './AIParserManager';
import { useNavigate } from 'react-router-dom';

const SpeechScreen = () => {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');
  const [marqueeText, setMarqueeText] = useState('');
  const [groceryItems, setGroceryItems] = useState<GroceryItemModel[]>([]);
  const [loading, setLoading] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const speechManager = useRef<SpeechRecognitionManager | null>(null);
  const navigate = useNavigate();
  const currentLangInfo = getCurrentLangInfo();

  useEffect(() => {
    const aiParser = new AIActionsParser<GroceryItemModel>(
      currentLangInfo.short,
      "grocery and household items",
      `
name (pretty product description, eg: "Ground Beef 500g")
state ( packed | frozen | opened )
quantity (number of units purchased)
location (where the item is stored)
expirationDate
paidPrice
`,
      (item) => ({
        ...item,
        expirationDate: item.expirationDate ? new Date(item.expirationDate) || undefined : undefined,
      })
    );

    setGroceryItems(aiParser.items as GroceryItemModel[]);
    aiParser.language = currentLangInfo.short;

    speechManager.current = new SpeechRecognitionManager(
      currentLangInfo.short,
      (manager) => {
        setText(`\n  Current: ${manager.currentSegment}\n  Full: ${manager.finalFranscript}\n          `);
        setMarqueeText((manager.currentSegment));
      },
      async (request, finish) => {
        console.log('Request to send:', request);
        setLoading(true);
        try {
          await aiParser.parse(request.segment);
          setGroceryItems(aiParser.items as GroceryItemModel[]);
          finish();
        } catch (err) {
          console.error('Erro ao processar AIActionsParser:', err);
        } finally {
          setLoading(false);
        }
      },
      () => setListening(false)
    );

    return () => {
      speechManager.current?.stop();
      speechManager.current = null;
    };
  }, [currentLangInfo.short]);

  const startListening = () => {
    if (speechManager.current && !listening) {
      speechManager.current.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (speechManager.current && listening) {
      speechManager.current.stop();
      setListening(false);
    }
  };

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  return (
    <Container screen spaced className="SpeechScreen">
      <ContainerFixedContent>
        <h2 style={{ marginBottom: 24 }}>Itens de Compras</h2>
      </ContainerFixedContent>
      <ContainerScrollContent spaced>
        <GroceryList items={groceryItems as any} />
        <div style={{ height: 120 }}></div>
        <div className="speech-marquee speech-marquee--with-controls">
          <button
            className={`microphone-toggle${listening ? ' listening' : ''}`}
            onClick={listening ? stopListening : startListening}
            aria-label={listening ? 'Parar escuta' : 'Iniciar escuta'}
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner" />
            ) : (
              <Icon icon={listening ? Icon.all.faMicrophoneSlash : Icon.all.faMicrophone} />
            )}
          </button>
          <div className="speech-marquee-content">
            <span className="speech-marquee-text">
              {loading ? 'Processando itens...' : (
                marqueeText || (
                  listening ? 'Fale para adicionar itens...' : 'Pressione o botão para falar'
                )
              )}
            </span>
            <div className="speech-marquee-lang" onClick={() => navigate('/main/settings')}>
              <span className="speech-marquee-lang-short">{currentLangInfo.short}</span>
              <span className="speech-marquee-lang-name">{currentLangInfo.name}</span>
            </div>
          </div>
        </div>
      </ContainerScrollContent>
    </Container>
  );
};

export default SpeechScreen;
