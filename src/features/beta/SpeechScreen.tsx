import './SpeechScreen.css';
import { useEffect, useRef, useState } from 'react';

import { getCurrentLangInfo } from '@lang';

import Icon from '@components/Icons';
import { Container, ContainerFixedContent, ContainerScrollContent } from '@components/conteiners';

import { GroceryItemModel } from '@models';
import GroceryList from '../../features/groceries/GroceryList';
import { SpeechRecognitionManager } from './SpeechRecognitionManager';
import AIParserManager, { AIGroceryItem } from './AIParserManager';



const SpeechScreen = () => {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');
  const [marqueeText, setMarqueeText] = useState('');
  const [groceryItems, setGroceryItems] = useState<AIGroceryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const aiParserManager = useRef<AIParserManager>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const currentLangInfo = getCurrentLangInfo();

  const speechManager = useRef<SpeechRecognitionManager | null>(null);

  useEffect(() => {
    if (!aiParserManager.current) {
      aiParserManager.current = new AIParserManager();
      setGroceryItems(aiParserManager.current.list);
    }
    if(!speechManager.current) {
      speechManager.current = new SpeechRecognitionManager(
        currentLangInfo.short,
        (manager) => {
          setText(`\n  Current: ${manager.currentSegment}\n  Full: ${manager.finalFranscript}\n          `);
          setMarqueeText((manager.currentSegment));
        },
        async (request, finish) => {
          console.log('Request to send:', request);
          const parcer = aiParserManager.current;
          if (!parcer) return;
          setLoading(true);
          try {
            const aiItems = await parcer.parse(request.segment);
            setGroceryItems(aiItems);
            finish();
          } catch (err) {
            console.error('Erro ao processar AIParserManager:', err);
          } finally {
            setLoading(false);
          }
        },
        () => setListening(false)
      );
    }

    return () => {
      speechManager.current?.stop();
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
      <ContainerScrollContent>
        <div style={{ marginTop: 24 }}>
          <h2>Itens de Compras</h2>
          <GroceryList items={groceryItems as any} />
        </div>
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
            <div className="speech-marquee-lang">
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

