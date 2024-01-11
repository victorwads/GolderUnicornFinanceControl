import './App.css';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Navigate, RouterProvider, createBrowserRouter, useParams } from 'react-router-dom';

import TabScreen from './features/TabScreen';
import LoginScreen from './features/login/LoginScreen';
import AccountsScreen from './features/accounts/AccountsScreen';
import CreditCardsScreen from './features/creaditcards/CreditCardsScreen';
import DashboardScreen from './features/dashboard/DashboardScreen';
import SettingsScreen from './features/settings/SettingsScreen';
import TimelineScreen from './features/timeline/TimelineScreen';

interface TestInfoParams {
  info: string
}

function TesteIdInfo({info}: TestInfoParams) {
  let { id } = useParams()

  return <>
    <div>{info}</div>
    <div>Id: {id}</div>
  </>
}

const router = createBrowserRouter([
  {path: "/", element: <Navigate to="/main/dashboard" replace /> },
  {path: '/main', element: <TabScreen />, children: [
    {path: 'dashboard', element: <DashboardScreen />},
    {path: 'timeline', element: <TimelineScreen />},
    {path: 'settings', element: <SettingsScreen />},
  ]},
  {path: '/accounts', element: <AccountsScreen />},
  {path: '/accounts/create', element: <div>TODO: Create Account</div>},
  {path: '/accounts/edit/:id', element: <TesteIdInfo info='TODO: Edit Account' />},
  {path: '/creditcards', element: <CreditCardsScreen />},
  {path: '/creditcards/create', element: <div>TODO: Create Credit Card</div>},
  {path: '/creditcards/edit/:id', element: (<TesteIdInfo info='TODO: Edit Credit Card' />)},
])

function App() {

  const [user, setUser] = useState(getAuth().currentUser)

  useEffect(
    () => onAuthStateChanged(getAuth(), (currentUser) => setUser(currentUser))
    , []
  )

  return (
    <div className="App">
      {user ? <RouterProvider router={router} /> : <LoginScreen />}
    </div>
  );
}

export default App;
