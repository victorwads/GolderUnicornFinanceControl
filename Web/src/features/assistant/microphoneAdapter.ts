import type { AIActionHandler, AIItemData, AIParseResponse } from '@features/speech/AIParserManager';

export type MicrophoneProcessor = (text: string, userLanguage: string) => Promise<void>;

/**
 * Adapter to reuse the existing AIMicrophone component without touching its
 * implementation. It mimics the minimal API surface that the component expects
 * from AIActionsParser.
 */
export class AssistantMicrophoneAdapter<T extends AIItemData = AIItemData> {
  public items: T[] = [];
  public onAction: AIActionHandler<T, string> = () => {};

  constructor(private processor: MicrophoneProcessor) {}

  async parse(text: string, userLanguage: string): Promise<AIParseResponse> {
    await this.processor(text, userLanguage);
    console.log('Processed text:', text);
    return {
      actions: 0,
      usedTokens: { input: 0, output: 0 },
    };
  }
}
