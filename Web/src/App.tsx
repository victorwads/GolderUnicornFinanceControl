import './App.css';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { RouterProvider } from 'react-router-dom';

import getRepositories, { 
  clearRepositories, CryptoPassRepository, getCurrentRepositoryUserId, resetRepositories
} from '@repositories';
import { useCssVars } from '@components/Vars';
import { clearServices, resetServices } from '@services';
import { getCurrentUser, saveUser } from '@configs';

import CryptoPassSetupScreen from '@features/security/CryptoPassSetupScreen';
import { privateRouter, publicRouter } from '@features/routes';
import { Progress } from './data/crypt/progress';
import { FloatingProgress } from '@components/progress/FloatingProgress';

let userID = getCurrentRepositoryUserId();

function App() {

  const [progress, setProgress] = useState<Progress | null>();

  const [user, setUser] = useState(() => getCurrentUser())
  const [needPass, setNeedPass] = useState(!CryptoPassRepository.isAvailable(user?.uid))
  const { theme, density } = useCssVars();

  useEffect(() => {
    onAuthStateChanged(getAuth(), async (currentUser) => {
      if (currentUser) {
        if (currentUser.uid !== userID) {
          userID = currentUser.uid;
          const passRepository = new CryptoPassRepository(currentUser.uid, setProgress);
          const savedHash = await passRepository.getHash();

          const repos =   await resetRepositories(currentUser.uid, savedHash);
          resetServices(currentUser.uid, repos);

          setNeedPass(!savedHash);

          const { fullyMigrated } = await getRepositories().user.getUserData()
          if(savedHash && !fullyMigrated) {
            alert(`Fully migrating value is ${fullyMigrated} and savedHash is ${savedHash}.`);
            passRepository.updateEncryption(savedHash)
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

  return <div className={`App theme ${theme} ${density}`}>
    <FloatingProgress progress={progress} />
    {needPass && user
      ? <CryptoPassSetupScreen uid={user?.uid} onProgress={setProgress} onCompleted={() => setNeedPass(false)} />
      : <RouterProvider router={user ? privateRouter : publicRouter} />
    }
  </div>;
}

export default App;
