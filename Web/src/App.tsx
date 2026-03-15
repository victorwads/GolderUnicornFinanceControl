import './App.css';
import { useEffect, useState, useCallback } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { RouterProvider } from 'react-router-dom';

import getRepositories, {
  clearRepositories, CryptoPassRepository, getCurrentRepositoryUserId, resetRepositories,
  User
} from '@repositories';
import { clearServices, resetServices } from '@services';
import { getCurrentUser, saveUser } from '@configs';

import CryptoPassSetupScreen from '@features/security/CryptoPassSetupScreen';
import { privateRouter, publicRouter } from '@features/routes';
import { Progress } from './data/crypt/progress';
import { FloatingProgress } from '@componentsDeprecated/progress/FloatingProgress';
import AppLoading from '@layouts/core/AppLoading';

let userID = getCurrentRepositoryUserId();
let callBack: (needPass: boolean, dbUser: User | null) => void = () => {};
let progressCallback: (progress: Progress | null) => void = () => {};

async function initUser(currentUser: FirebaseUser) {
    if (currentUser.uid !== userID) {
      userID = currentUser.uid;
      const passRepository = new CryptoPassRepository(currentUser.uid, progress => progressCallback(progress));
      const savedHash = await passRepository.getHash();

      const repos = await resetRepositories(currentUser.uid, savedHash);
      resetServices(currentUser.uid, repos);

      const user = await getRepositories().user.getUserData();
      callBack(!savedHash, user);

      if(savedHash) {
        if(!user.fullyMigrated) {
          passRepository.updateEncryption(savedHash)
        }
      }
    }
}

function App() {

  const [progress, setProgress] = useState<Progress | null>();
  const [firebaseUser, setFirebaseUser] = useState(() => getCurrentUser())
  const [dbUser, setDbUser] = useState<User | null>(null)
  const [needPass, setNeedPass] = useState(() => !CryptoPassRepository.isAvailable(firebaseUser?.uid));

  callBack = (needPass, dbUser) => {
    setNeedPass(needPass);
    setDbUser(dbUser);
  }
  progressCallback = (progress) => {
    setProgress(progress);
  }
  if (firebaseUser) initUser(firebaseUser);

  useEffect(() => {
    return onAuthStateChanged(getAuth(), async (currentUser) => {
      if (currentUser) {
        initUser(currentUser);
      } else {
        userID = null;
        callBack(true, null);
        clearRepositories();
        clearServices();
      }

      saveUser(currentUser);
      setFirebaseUser(currentUser)
    })
  }, [initUser])

  if (firebaseUser && needPass && (CryptoPassRepository.hasToken(firebaseUser.uid) || !dbUser))
    return <AppLoading />;

  return <>
    <FloatingProgress progress={progress} />
    {firebaseUser && needPass
      ? <CryptoPassSetupScreen user={dbUser || (() => { throw new Error("DB User is null") })()} onProgress={setProgress} onCompleted={() => setNeedPass(false)} />
      : <RouterProvider router={firebaseUser ? privateRouter : publicRouter} />
    }
  </>;
}

export default App;
