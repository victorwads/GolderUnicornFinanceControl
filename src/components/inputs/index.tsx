import { ReactNode, InputHTMLAttributes } from 'react';

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
