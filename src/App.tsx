import { useEffect, useState } from 'react';
import './App.css';
import { AuthProvider, OAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

const isLogged = () => getAuth().currentUser

function loginIn(providerName: string) {
  let provider: AuthProvider
  switch (providerName) {
    case "apple.com":
      let authProvider = new OAuthProvider(providerName)
      authProvider.addScope('email');
      authProvider.addScope('name');
      provider = authProvider
      break;
    case "google.com":
      provider = new OAuthProvider(providerName)
      break;

    default:
      return;
  }

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


function App() {

  const [user, setUser] = useState(getAuth().currentUser)

  useEffect(
    () => onAuthStateChanged(getAuth(), (currentUser) => setUser(currentUser))
    , []
  )

  return (
    <div className="App">
      {user ? <>
        <p>Olá, {user.displayName} - {user.email}</p>
        <a className='long-button' onClick={() => signOut(getAuth())}>Sair</a>
      </> : <>
        <a className='long-button' onClick={() => loginIn("google.com")}>Login com Google</a>
        <a className='long-button' onClick={() => loginIn("apple.com")}>Login com Apple ID</a>
      </>}
    </div>
  );
}

export default App;
