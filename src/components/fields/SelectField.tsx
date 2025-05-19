import React from "react";
import BaseField from "./BaseField";

interface SelectFieldProps<T> {
  label: string;
  value?: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}

const SelectField = <T extends string | number>({
  label,
  value,
  onChange,
  options,
}: SelectFieldProps<T>) => {
  return (
    <BaseField label={label}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </BaseField>
  );
};

export default SelectField;
