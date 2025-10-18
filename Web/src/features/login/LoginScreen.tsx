import { OAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import Login from '@layouts/auth/Login';

function loginIn(providerName: string) {
  let provider: OAuthProvider
  switch (providerName) {
    case "apple.com":
      provider = new OAuthProvider(providerName)
      provider.addScope('name');
          break;
    case "google.com":
      provider = new OAuthProvider(providerName)
      provider.addScope('profile');
      break;

    default:
      return;
  }
  provider.addScope('email');

  signInWithPopup(getAuth(), provider)
    .then((result) => {
      console.log(result)
    })
    .catch((error) => {
      console.log(error)
      alert(error.message)
    })
}

const LoginScreen = () => {

  return <Login model={{
    handleGoogleLogin: () => loginIn("google.com"),
    handleAppleLogin: () => loginIn("apple.com")
  }} />
}

export default LoginScreen
