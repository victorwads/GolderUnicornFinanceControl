import './App.css';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
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
import AddAccountScreen from './features/accounts/AddAccountScreen';
import AddCategoriesScreen from './features/categories/AddCategoriesScreen';
import CreditCardsInvoices from './features/creaditcards/CreditCardsInvoces';

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
  { path: '/accounts/create', element: <AddAccountScreen /> },
  { path: '/accounts/:id/edit', element: <EmptyScreen title='Accounts' /> },
  { path: '/accounts/:id/view', element: <EmptyScreen title='Accounts' /> },
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

  return <div className={`App ${theme} ${density}`}>
    {loading
      ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loading show={loading} />
        Loading...
      </div>
      : user
        ? <RouterProvider router={router} />
        : <LoginScreen />
    }
  </div>;
}

export default App;
