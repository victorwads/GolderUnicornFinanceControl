import './App.css';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { RouterProvider } from 'react-router-dom';

import getRepositories, { 
  clearRepositories, CryptoPassRepository, getCurrentRepositoryUserId, resetRepositories,
  User
} from '@repositories';
import { useCssVars } from '@components/Vars';
import { clearServices, resetServices } from '@services';
import { getCurrentUser, saveUser } from '@configs';

import CryptoPassSetupScreen from '@features/security/CryptoPassSetupScreen';
import { privateRouter, publicRouter } from '@features/routes';
import { Progress } from './data/crypt/progress';
import { FloatingProgress } from '@components/progress/FloatingProgress';
import { Loading } from '@components/Loading';

let userID = getCurrentRepositoryUserId();

function App() {

  const [progress, setProgress] = useState<Progress | null>();
  const [user, setUser] = useState(() => getCurrentUser())
  const [dbUser, setDbUser] = useState<User | null>(null)
  const [needPass, setNeedPass] = useState(!CryptoPassRepository.isAvailable(user?.uid))
  const { theme, density } = useCssVars();

  useEffect(() => {
    onAuthStateChanged(getAuth(), async (currentUser) => {
      if (currentUser) {
        if (currentUser.uid !== userID) {
          userID = currentUser.uid;
          const passRepository = new CryptoPassRepository(currentUser.uid, setProgress);
          const savedHash = await passRepository.getHash();

          const repos = await resetRepositories(currentUser.uid, savedHash);
          resetServices(currentUser.uid, repos);

          const user = await getRepositories().user.getUserData();
          setDbUser(user);
          setNeedPass(!savedHash);

          if(savedHash) {
            if(!user.fullyMigrated) {
              passRepository.updateEncryption(savedHash)
            }
          }
        }
      } else {
        userID = null;
        setNeedPass(false);
        clearRepositories();
        clearServices();
      }

      saveUser(currentUser);
      setUser(currentUser)
    })
  }, [])

  if (user && needPass && CryptoPassRepository.hasToken(user.uid))
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Loading show={true} />
      {Lang.commons.loading}
    </div>;

  return <div className={`App theme ${theme} ${density}`}>
    <FloatingProgress progress={progress} />
    {needPass && user && dbUser
      ? <CryptoPassSetupScreen user={dbUser} onProgress={setProgress} onCompleted={() => setNeedPass(false)} />
      : <RouterProvider router={user ? privateRouter : publicRouter} />
    }
  </div>;
}

export default App;
