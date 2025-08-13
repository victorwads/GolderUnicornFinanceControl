import './SpeechScreen.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCurrentLangInfo } from '@lang';
import { GroceryItemModel } from '@models';

import Icon from '@components/Icons';
import { Container, ContainerFixedContent, ContainerScrollContent } from '@components/conteiners';

import GroceryList from '../../features/groceries/GroceryList';
import AIActionsParser, { AITokens } from './AIParserManager';
import { AIGroceryListConfig } from './GroceryListAiInfo';
import UserRepository, { User } from '../../data/repositories/UserRepository';
import getRepositories from '@repositories';

const DOLAR_PRICE = 5.5;
const tokenPrice = {
  dolarPerInput: 0.050 / 1000000,
  dolarPerOutput: 0.400 / 1000000
};

const aiParser = new AIActionsParser<GroceryItemModel>(
  AIGroceryListConfig,
  (item) => {
    if (item.opened !== undefined) item.opened.toString() === "true"
    if (item.expirationDate !== undefined) item.expirationDate = new Date(item.expirationDate);

    return item;
  }
);

const SpeechScreen = () => {
  const navigate = useNavigate();
  const currentLangInfo = getCurrentLangInfo();
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const sendTimeOut = useRef<NodeJS.Timeout | null>(null);
  const [groceryItems, setGroceryItems] = useState<GroceryItemModel[]>([]);
  const [processingQueue, setProcessingQueue] = useState<ProcessingTask[]>([]);
  const taskIdRef = useRef(0);
  const [, setUser] = useState<User>();

  useEffect(() => {
    if (sendTimeOut.current) clearTimeout(sendTimeOut.current);
    if (!transcript) return;

    sendTimeOut.current = setTimeout(async () => {
      const textToProcess = transcript.trim();
      if (!textToProcess) return;

      // cria tarefa
      const id = ++taskIdRef.current;
      const newTask: ProcessingTask = { id, text: textToProcess, startedAt: Date.now() };
      setProcessingQueue(q => [...q, newTask]);

      resetTranscript(); // limpa para capturar próximas falas
      try {
        const result = await aiParser.parse(textToProcess);
      } finally {
        setProcessingQueue(q => q.filter(t => t.id !== id));
      }
    }, 1500);

  }, [transcript]);

  useEffect(() => {
    setGroceryItems(aiParser.items as GroceryItemModel[]);
    aiParser.onAction = (action) => {
      setGroceryItems([...aiParser.items] as GroceryItemModel[]);
    }

    getRepositories().user.getUserData().then((user) => {
      setUser(user)
    });

    return () => {
      SpeechRecognition.stopListening();
    };
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return <span>{Lang.speech.browserNotSupported}</span>;
  }

  const startListening = () => SpeechRecognition.startListening({
    continuous: true,
    language: currentLangInfo.short
  });

  const usedTokens = UserRepository.userTotalCache?.openai?.tokens || { input: 0, output: 0 };

  return (
    <Container screen spaced className="SpeechScreen">
      <ContainerFixedContent>
        <h2 style={{ marginBottom: 24 }}>{Lang.speech.title}</h2>
        <h3>{Lang.speech.howToUseTitle}</h3>
        <p>{Lang.speech.intro1}</p>
        <p>{Lang.speech.intro2}</p>
        <p>{Lang.speech.examplesTitle}</p>
        <ul>
          {Lang.speech.examples.map((ex, i) => <li key={i}>{ex}</li>)}
        </ul>
      </ContainerFixedContent>
      <ContainerScrollContent spaced autoScroll>
        <GroceryList items={groceryItems} />
        <div style={{ height: 120 }}></div>
        <div className="speech-marquee glass-container speech-marquee--with-controls">
          <div className="glass-filter"></div>
          <div className="glass-overlay"></div>
          <div className="glass-specular"></div>
          <div className="glass-content glass-content--inline">
            <div className="speech-processing-list">
              {processingQueue.map(task => (
                <div key={task.id} className="speech-processing-item" title={task.text}>
                  <span className="loading-spinner loading-spinner--sm" />
                  <span className="speech-processing-text">{task.text}</span>
                </div>
              ))}
            </div>
            <button
              className={`microphone-toggle${listening ? ' listening' : ''}`}
              onClick={listening ? SpeechRecognition.stopListening : startListening}
              aria-label={listening ? Lang.speech.micStop : Lang.speech.micStart}
            >
              <Icon icon={listening ? Icon.all.faMicrophoneSlash : Icon.all.faMicrophone} />
            </button>
            {/* <div className="container"> */}
            <div className="speech-marquee-content">
              <span className="speech-marquee-text">
                {
                // {loading ? 'Processando itens...' : (
                  transcript || ( 
                    listening ? (groceryItems.length > 0 ? Lang.speech.placeholderListeningHasItems : Lang.speech.placeholderListeningNoItems) : 
                    Lang.speech.placeholderNotListening
                   )
                }
              </span>
              <div className="speech-marquee-lang" title={Lang.speech.changeLangTooltip} onClick={() => navigate('/main/settings')}>
                <span className="speech-marquee-lang-short">{currentLangInfo.short}</span>
                <span className="">
                  {Lang.speech.tokensUsed(usedTokens.input + usedTokens.output)}
                  R$ {(DOLAR_PRICE * (
                    (usedTokens.input * tokenPrice.dolarPerInput) + 
                    (usedTokens.output * tokenPrice.dolarPerOutput)
                  )).toFixed(4).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ContainerScrollContent>
    </Container>
  );
};

export default SpeechScreen;

interface ProcessingTask { id: number; text: string; startedAt: number; }
