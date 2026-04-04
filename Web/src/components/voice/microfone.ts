import SpeechRecognition from 'react-speech-recognition';
import { StartListeningOptions } from './AIMicrophoneOnboarding.types';

let timeOut: NodeJS.Timeout | null = null;

const startSpeechRecognition = () => SpeechRecognition.startListening({
  continuous: true,
  language: CurrentLangInfo.short,
});

export const startListening = (options?: StartListeningOptions) => {
  clearTimeout(timeOut!);
  timeOut = setTimeout(() => 
    startSpeechRecognition().catch(console.error)
  , 50);
  console.log('Starting listening with options', options);
};

export const stopListening = () => {
  clearTimeout(timeOut!);
  timeOut = setTimeout(() => 
    SpeechRecognition.stopListening().catch(console.error)
  , 50);
  console.log('Stopping listening');
};