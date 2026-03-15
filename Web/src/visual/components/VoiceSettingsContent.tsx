import { Button } from "@components/ui/button";
import { Slider } from "@components/ui/slider";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Volume2 } from "lucide-react";
import { Switch } from "@components/ui/switch";

interface VoiceSettingsContentProps {
  model: VoiceSettingsContentViewModel;
  showEnableToggle?: boolean;
}

export default function VoiceSettingsContent({ model, showEnableToggle = false }: VoiceSettingsContentProps) {
  const LocalLang = Lang.settings;

  return (
    <div className="space-y-4">
      {showEnableToggle && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{LocalLang.enableVoice}</Label>
          <Switch checked={model.voiceEnabled} onCheckedChange={model.onVoiceEnabledChange} />
        </div>
      )}

      {/* Speech Rate */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">{LocalLang.speechRate}</Label>
          <span className="text-sm text-muted-foreground">{model.speechRate.toFixed(1)}x</span>
        </div>
        <Slider
          value={[model.speechRate]}
          onValueChange={(value) => model.onSpeechRateChange(value[0] ?? model.speechRate)}
          min={0.5}
          max={2.0}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{LocalLang.speechRateSlow}</span>
          <span>{LocalLang.speechRateNormal}</span>
          <span>{LocalLang.speechRateFast}</span>
        </div>
      </div>

      {/* Voice Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">{LocalLang.selectVoice}</Label>
        <Select value={model.selectedVoice} onValueChange={model.onSelectedVoiceChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {model.availableVoices.map((voice) => (
              <SelectItem key={voice} value={voice}>
                {voice}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Test Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={model.onTestVoice}
      >
        <Volume2 className="h-4 w-4 mr-2" />
        {LocalLang.testSpeech}
      </Button>
    </div>
  );
}

export interface VoiceSettingsContentViewModel {
  voiceEnabled: boolean;
  onVoiceEnabledChange: (enabled: boolean) => void;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  selectedVoice: string;
  availableVoices: string[];
  onSelectedVoiceChange: (voice: string) => void;
  onTestVoice: () => void;
}
