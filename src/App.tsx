import './App.css';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import { useCssVars } from './components/Vars';
import { Loading } from './components/Loading';
import { clearRepositories, resetRepositories } from './data/repositories';

import TabScreen from './features/tabs/TabScreen';
import EmptyScreen from './features/commons/EmptyScreen';
import LoginScreen from './features/login/LoginScreen';
import TimelineScreen from './features/tabs/timeline/TimelineScreen';
import SettingsScreen from './features/tabs/settings/SettingsScreen';
import DashboardScreen from './features/tabs/dashboard/DashboardScreen';
import CategoriesScreen from './features/categories/CategoriesScreen';
import AddCategoriesScreen from './features/categories/AddCategoriesScreen';
import CreditCardsInvoices from './features/creaditcards/CreditCardsInvoces';
import AccountScreenForm from './features/accounts/AccountScreenForm';
import AccountsScreen from './features/accounts/AccountsScreen';
import AddRegistryScreen from './features/accounts/AddRegistryScreen';
import EditRegistryScreen from './features/accounts/EditRegistryScreen';

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/main/dashboard" replace /> },
  {
    path: '/main', element: <TabScreen />, children: [
      { path: 'dashboard', element: <DashboardScreen /> },
      { path: 'timeline/:id?', element: <TimelineScreen /> },
      { path: 'settings', element: <SettingsScreen /> },
    ]
  },
  { path: '/accounts', element: <AccountsScreen /> },
  { path: '/accounts/create', element: <AccountScreenForm /> },
  { path: '/accounts/:id/edit', element: <AccountScreenForm /> },
  { path: '/accounts/:id/add-registry', element: <AddRegistryScreen /> },
  { path: '/accounts/:id/edit-registry', element: <EditRegistryScreen /> },
  { path: '/registry/:id', element: <EmptyScreen title='Registry' /> },
  { path: '/creditcards', element: <EmptyScreen title='Credit Cards' /> },
  { path: '/creditcards/:id', element: <EmptyScreen title='Credit Cards' /> },
  { path: '/creditcards/:id/edit', element: <EmptyScreen title='Credit Cards' /> },
  { path: '/creditcards/:id/invoices', element: <CreditCardsInvoices /> },
  { path: '/creditcards/create', element: <EmptyScreen title='Credit Cards' /> },
  { path: '/registry/:id', element: <EmptyScreen title='Registry' /> },
  { path: '/categories', element: <CategoriesScreen /> },
  { path: '/categories/:id', element: <EmptyScreen title='Category' /> },
  { path: '/categories/create', element: <AddCategoriesScreen /> },
])

function App() {

  const [user, setUser] = useState(() => getAuth().currentUser)
  const [loading, setLoading] = useState(true)
  const { theme, density } = useCssVars();

  useEffect(() => {
    onAuthStateChanged(getAuth(), async (currentUser) => {
      setLoading(true)
      console.log('User changed', currentUser)
      if(currentUser) {
        await resetRepositories();
      } else {
        clearRepositories();
      }

      setUser(currentUser)
      setLoading(false)
    })
  }, [])

  return <div className={`App theme ${theme} ${density}`}>
    {loading
      ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loading show={loading} />
        {Lang.commons.loading}
      </div>
      : user
        ? <RouterProvider router={router} />
        : <LoginScreen />
    }
  </div>;
}

export default App;
