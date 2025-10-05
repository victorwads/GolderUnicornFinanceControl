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
    startSpeechRecognition()
  , 50);
};

export const stopListening = () => {
  console.log('Stopping listening');
  clearTimeout(timeOut!);
  timeOut = setTimeout(() => 
    SpeechRecognition.stopListening()
  , 50);
};