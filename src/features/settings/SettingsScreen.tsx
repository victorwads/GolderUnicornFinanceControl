import "./SettingsScreen.css";
import { getAuth, signOut } from "firebase/auth";

const SettingsScreen = () => {

  return (
    <div>
      Settings Screen:
      <a className="long-button" onClick={() => signOut(getAuth())}>Sair</a>
    </div>
  );
};

export default SettingsScreen;
