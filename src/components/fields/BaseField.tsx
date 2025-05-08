import "./BaseField.css";

interface BaseFieldParams {
  label: string;
  children: React.ReactNode
}

const BaseField = ({ label, children }: BaseFieldParams) => {
  return (
    <div className="Field">
      <label>{label}</label>
      {children}
    </div>
  );
};

export default BaseField;
