const SPEECH_SPLITS_TIME = 6000;

export type UpdateListener = (manager: SpeechRecognitionManager, shouldSend: boolean) => void;
export type RequestListener = (request: Request, finish: () => void) => void;
export type EndListener = () => void;
export type Request = {
  sent: boolean;
  segment: string;
};

export class SpeechRecognitionManager {
  private finalText = '';
  private tempText = '';
  private lastSentIndex = 0;
  private requests: Request[] = [];

  private recognition: SpeechRecognition;
  private timer: NodeJS.Timeout | null = null;
  public onUpdate: UpdateListener;
  public onRequest: RequestListener;
  public onEnd: EndListener;

  constructor(
    private language: string,
    onUpdate?: UpdateListener,
    onRequest?: RequestListener,
    onEnd?: EndListener
  ) {
    this.onUpdate = onUpdate || (() => {});
    this.onRequest = onRequest || (() => {});
    this.onEnd = onEnd || (() => {});

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) throw new Error('Seu navegador não suporta reconhecimento de voz.');

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = language;

    this.recognition.onresult = this.handleResult.bind(this);
    this.recognition.onend = this.handleEnd.bind(this);
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error', event);
      this.onEnd();
    }
  }

  private handleResult(event: SpeechRecognitionEvent) {
    const results = Array(...event.results);

    let final = results
      .filter(r => r.isFinal)
      .map(r => r[0].transcript)
      .join('');
    
    let temp = results
      .filter(r => !r.isFinal)
      .map(r => r[0].transcript)
      .join('');

    console.log('Final:', final, 'Temp:', temp);

    if (final) {
      this.finalText = final;
    }
    this.tempText = temp;

    this.onUpdate(this, false);
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const request: Request = {
        sent: false,
        segment: this.finalText.slice(this.lastSentIndex)
      };
      this.onRequest(request, () => {
        request.sent = true;
      });
      this.lastSentIndex += request.segment.length;
    }, SPEECH_SPLITS_TIME);
  }

  private handleEnd() {
    this.onEnd();
  }

  public start() {
    if (this.recognition) {
      this.recognition.start();
    }
  }

  public stop() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  public get pendingRequestsSegments() {
    return this.requests
      .filter(r => !r.sent)
      .map(r => r.segment);
  }

  public get finalFranscript() {
    return this.finalText;
  }

  public get currentSegment() {
    return this.tempText;
  }

}
