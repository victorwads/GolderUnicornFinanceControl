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

  return (
    <div className="Dialog">
      <div>
        <button className="close-button" onClick={onClose} >Fechar</button>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Dialog;
