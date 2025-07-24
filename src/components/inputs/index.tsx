import { ReactNode, InputHTMLAttributes } from 'react';
import './Inputs.css';

interface InputGroupProps {
  label: string;
  children: ReactNode;
}

export function InputGroup({ label, children }: InputGroupProps) {
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      {children}
    </div>
  );
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {}

export function InputField(props: InputFieldProps) {
  return <input className="input-field" {...props} />;
}

interface InputActionsProps {
  children: ReactNode;
}

export function InputActions({ children }: InputActionsProps) {
  return <div className="input-actions">{children}</div>;
}

export { default as DatePicker } from './DatePicker';
export { default as DateTimePicker } from './DateTimePicker';
