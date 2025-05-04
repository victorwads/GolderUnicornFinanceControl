import './App.css';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import TabScreen from './features/tabs/TabScreen';
import LoginScreen from './features/login/LoginScreen';
import DashboardScreen from './features/tabs/dashboard/DashboardScreen';
import TimelineScreen from './features/tabs/timeline/TimelineScreen';
import SettingsScreen from './features/tabs/settings/SettingsScreen';
import CategoriesScreen from './features/categories/CategoriesScreen';
import AddCategoriesScreen from './features/categories/AddCategoriesScreen';
import EmptyScreen from './commons/EmptyScreen';
import { EncryptorSingletone } from './data/crypt/Encryptor';

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/main/dashboard" replace /> },
  {
    path: '/main', element: <TabScreen />, children: [
      { path: 'dashboard', element: <DashboardScreen /> },
      { path: 'timeline/:id?', element: <TimelineScreen /> },
      { path: 'settings', element: <SettingsScreen /> },
    ]
  },
  { path: '/accounts', element: <EmptyScreen title='Accounts' /> },
  { path: '/accounts/create', element: <EmptyScreen title='Accounts' /> },
  { path: '/accounts/:id/edit', element: <EmptyScreen title='Accounts' /> },
  { path: '/accounts/:id/view', element: <EmptyScreen title='Accounts' /> },
  { path: '/registry/:id', element: <EmptyScreen title='Registry' /> },
  { path: '/creditcards', element: <EmptyScreen title='Credit Cards' /> },
  { path: '/creditcards/:id', element: <EmptyScreen title='Credit Cards' /> },
  { path: '/creditcards/:id/edit', element: <EmptyScreen title='Credit Cards' /> },
  { path: '/creditcards/:id/invoces', element: <EmptyScreen title='Credit Cards' /> },
  { path: '/creditcards/:id/invoces', element: <EmptyScreen title='Credit Cards' /> },
  { path: '/creditcards/create', element: <EmptyScreen title='Credit Cards' /> },
  { path: '/registry/:id', element: <EmptyScreen title='Registry' /> },
  { path: '/categories', element: <CategoriesScreen /> },
  { path: '/categories/:id', element: <EmptyScreen title='Category' /> },
  { path: '/categories/create', element: <AddCategoriesScreen /> },
])

function App() {

  const [user, setUser] = useState(getAuth().currentUser)

  useEffect(() => {
    onAuthStateChanged(getAuth(), (currentUser) => {
      if(currentUser) {
        EncryptorSingletone.init(currentUser.uid)
      }
      setUser(currentUser)
    })
  }, [])

  return (
    <div className="App dark">
      {user ? <RouterProvider router={router} /> : <LoginScreen />}
    </div>
  );
}

export default App;
