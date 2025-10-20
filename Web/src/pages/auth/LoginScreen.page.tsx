import { OAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import Login from '@layouts/auth/Login';
import useLoginScreenModel from "./LoginScreen.model";

const LoginScreen = () => {
  const model = useLoginScreenModel();

  return <Login model={model} />
}

export default LoginScreen
