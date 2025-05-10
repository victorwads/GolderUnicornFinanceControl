import "./Dialog.css";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return <div className="Dialog" onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>;
};

export default Dialog;
