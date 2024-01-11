import './LoginScreen.css'
import { OAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const isLogged = () => getAuth().currentUser

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

  let auth = getAuth()
  auth.useDeviceLanguage()
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log(result)
      alert(`Sucesso = ${result.user.displayName}`)
    })
    .catch((error) => {
      console.log(error)
      alert(error.message)
    })
}

const LoginScreen = () => {

    return <div className="">
        <a className='long-button' onClick={() => loginIn("google.com")}>Login com Google</a>
        <a className='long-button' onClick={() => loginIn("apple.com")}>Login com Apple ID</a>
    </div>
}

export default LoginScreen