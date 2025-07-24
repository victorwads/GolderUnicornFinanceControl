import { InputField, InputGroup } from './index';

export interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  min?: Date;
  max?: Date;
  disabled?: boolean;
}

export default function DateTimePicker({ label, value, onChange, min, max, disabled }: DatePickerProps) {
  const formatted = value ? new Date(value.getTime() - value.getTimezoneOffset()*60000).toISOString().substring(0,16) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val ? new Date(val) : null);
  };

  const input = (
    <InputField
      type="datetime-local"
      value={formatted}
      onChange={handleChange}
      min={min ? new Date(min.getTime() - min.getTimezoneOffset()*60000).toISOString().substring(0,16) : undefined}
      max={max ? new Date(max.getTime() - max.getTimezoneOffset()*60000).toISOString().substring(0,16) : undefined}
      disabled={disabled}
    />
  );

  return label ? <InputGroup label={label}>{input}</InputGroup> : input;
}
