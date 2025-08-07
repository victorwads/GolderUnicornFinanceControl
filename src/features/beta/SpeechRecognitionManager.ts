const SPEECH_SPLITS_TIME = 500;

export type UpdateListener = (manager: SpeechRecognitionManager) => void;
export type RequestListener = (request: Request, finish: () => void) => void;
export type EndListener = () => void;
export type Request = {
  sent: boolean;
  segment: string;
};

export class SpeechRecognitionManager {
  private finalText = '';
  private tempText = '';
  private lastSent = '';
  private requests: Request[] = [];
  private running = false;

  private recognition: SpeechRecognition;
  private timer: NodeJS.Timeout | null = null;
  public onUpdate: UpdateListener;
  public onRequest: RequestListener;
  public onEnd: EndListener;

  constructor(
    language: string,
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

    if (final) {
      this.finalText = final;
    }
    this.tempText = temp;

    this.onUpdate(this);
    
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const request: Request = {
        sent: false,
        segment: this.finalText.slice(this.lastSent.length)
      };

      if (!request.segment) {
        console.log('No new segment to send', this.finalText, this.lastSent);
        return;
      }

      this.onRequest(request, () => {
        request.sent = true;
      });
      this.lastSent = this.finalText;
    }, SPEECH_SPLITS_TIME);
  }

  private handleEnd() {
    console.log('Recognition auto ended');
    this.finalText = '';
    this.tempText = '';
    this.lastSent = '';
    if (this.running) {
      setTimeout(() => this.recognition.start(), 200);
    } else {
      this.onEnd();
    }
  }

  public start() {
    console.log('Manual Starting recognition');
    if (this.recognition) {
      this.recognition.start();
      this.running = true;
    }
  }

  public stop() {
    console.log('Manual Stopping recognition');
    if (this.recognition) {
      this.recognition.stop();
      this.running = false;
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
