import { useEffect, useState } from "react";
import BaseField from "./BaseField";

interface FieldParams {
  label: string;
  value: string;
  onChange(value: string): void;
}

const Field = ({ label, value, onChange }: FieldParams) => {
  const [stateValue, setValue] = useState(value);

  const handleInputChange = (inputValue: string) => {
    setValue(inputValue);
    onChange(inputValue);
  };

  const moveCursorToEnd = (input: HTMLInputElement) => {
    if (input) {
      input.selectionStart = input.selectionEnd = input.value.length;
    }
  };

  useEffect(() => {
    setValue(value);
  }, [value]);

  return (
    <BaseField label={label}>
      <input
        type="text"
        value={stateValue}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={(event) => moveCursorToEnd(event.target)}
      />
    </BaseField>
  );
};

export default Field;
