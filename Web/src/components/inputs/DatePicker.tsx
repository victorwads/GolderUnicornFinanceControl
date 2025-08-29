import { InputField, InputGroup } from './index';

export interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  min?: Date;
  max?: Date;
  disabled?: boolean;
}

export default function DatePicker({ label, value, onChange, min, max, disabled }: DatePickerProps) {
  const formatted = value ? value.toISOString().substring(0, 10) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val ? new Date(val) : null);
  };

  const input = (
    <InputField
      type="date"
      value={formatted}
      onChange={handleChange}
      min={min ? min.toISOString().substring(0, 10) : undefined}
      max={max ? max.toISOString().substring(0, 10) : undefined}
      disabled={disabled}
    />
  );

  return label ? <InputGroup label={label}>{input}</InputGroup> : input;
}
