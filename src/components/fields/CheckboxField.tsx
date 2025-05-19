import React from "react";
import BaseField from "./BaseField";

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, checked, onChange }) => {
  return (
    <BaseField label={label}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </BaseField>
  );
};

export default CheckboxField;
