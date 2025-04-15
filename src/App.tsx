import './App.css';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import TabScreen from './features/tabs/TabScreen';
import LoginScreen from './features/login/LoginScreen';
import DashboardScreen from './features/tabs/dashboard/DashboardScreen';
import TimelineScreen from './features/tabs/timeline/TimelineScreen';
import SettingsScreen from './features/tabs/settings/SettingsScreen';
import AccountsScreen from './features/accounts/AccountsScreen';
import AddAccountScreen from './features/accounts/AddAccountScreen';
import EditAccountScreen from './features/accounts/EditAccountScreen';
import ViewAccountScreen from './features/accounts/ViewAccountScreen';
import CreditCardsScreen from './features/creaditcards/CreditCardsScreen';
import AddCreditCardsScreen from './features/creaditcards/AddCreditCardsScreen';
import ViewCreditCardsScreen from './features/creaditcards/ViewCreditCardsScreen';
import EditCreditCardsScreen from './features/creaditcards/EditCreditCardsScreen';
import CategoriesScreen from './features/categories/CategoriesScreen';
import AddCategoriesScreen from './features/categories/AddCategoriesScreen';
import BanksRepository from './data/repositories/BanksRepository';
import CategoriesRepository from './data/repositories/CategoriesRepository';

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/main/dashboard" replace /> },
  {
    path: '/main', element: <TabScreen />, children: [
      { path: 'dashboard', element: <DashboardScreen /> },
      { path: 'timeline', element: <TimelineScreen /> },
      { path: 'settings', element: <SettingsScreen /> },
    ]
  },
  { path: '/accounts', element: <AccountsScreen /> },
  { path: '/accounts/create', element: <AddAccountScreen /> },
  { path: '/accounts/edit/:id', element: <EditAccountScreen /> },
  { path: '/accounts/view/:id', element: <ViewAccountScreen /> },
  { path: '/creditcards', element: <CreditCardsScreen /> },
  { path: '/creditcards/create', element: <AddCreditCardsScreen /> },
  { path: '/creditcards/edit/:id', element: (<EditCreditCardsScreen />) },
  { path: '/creditcards/view/:id', element: (<ViewCreditCardsScreen />) },
  { path: '/categories', element: (<CategoriesScreen />) },
  { path: '/categories/create', element: <AddCategoriesScreen /> },
])

function App() {

  const [user, setUser] = useState(getAuth().currentUser)

  useEffect(() => {
    onAuthStateChanged(getAuth(), (currentUser) => setUser(currentUser))
  }, [])

  return (
    <div className="App dark">
      {user ? <RouterProvider router={router} /> : <LoginScreen />}
    </div>
  );
}

export default App;
