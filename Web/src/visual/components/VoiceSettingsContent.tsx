import { useState } from "react";
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

const voices = [
  "Luciana", "Felipe", "Camila", "Ricardo", "Fernanda",
  "Google português do Brasil", "Microsoft Maria", "Vocalware Brazilian Portuguese Female"
];

interface VoiceSettingsContentProps {
  showEnableToggle?: boolean;
}

export default function VoiceSettingsContent({ showEnableToggle = false }: VoiceSettingsContentProps) {
  const [speechRate, setSpeechRate] = useState([1.0]);
  const [selectedVoice, setSelectedVoice] = useState(voices[0]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const handleTestVoice = () => {
    const utterance = new SpeechSynthesisUtterance(
      "Olá, esta é uma demonstração da voz selecionada com a velocidade configurada."
    );
    utterance.rate = speechRate[0];
    utterance.lang = "pt-BR";
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-4">
      {showEnableToggle && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Ativar voz</Label>
          <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
        </div>
      )}

      {/* Speech Rate */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Velocidade da Fala</Label>
          <span className="text-sm text-muted-foreground">{speechRate[0].toFixed(1)}x</span>
        </div>
        <Slider
          value={speechRate}
          onValueChange={setSpeechRate}
          min={0.5}
          max={2.0}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Mais lento</span>
          <span>Normal</span>
          <span>Mais rápido</span>
        </div>
      </div>

      {/* Voice Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Selecionar Voz</Label>
        <Select value={selectedVoice} onValueChange={setSelectedVoice}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {voices.map((voice) => (
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
        onClick={handleTestVoice}
      >
        <Volume2 className="h-4 w-4 mr-2" />
        Testar Voz
      </Button>
    </div>
  );
}
