import './App.css';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';

import { useCssVars } from '@components/Vars';
import { withRepos } from '@components/WithRepo';

import TabScreen from '@features/tabs/TabScreen';
import EmptyScreen from '@features/commons/EmptyScreen';
import LoginScreen from '@features/login/LoginScreen';
import TimelineScreen from '@features/tabs/timeline/TimelineScreen';
import TimelineFilterScreen from '@features/tabs/timeline/TimelineFilterScreen';
import SettingsScreen from '@features/tabs/settings/SettingsScreen';
import ResourceUsageScreen from '@features/tabs/resourceUsage/ResourceUsageScreen';
import DashboardScreen from '@features/tabs/dashboard/DashboardScreen';
import CategoriesScreen from '@features/categories/CategoriesScreen';
import AddCategoriesScreen from '@features/categories/AddCategoriesScreen';
import CreditCardsInvoices from '@features/creaditcards/CreditCardsInvoces';
import CreditCardRegistryScreen from '@features/creaditcards/CreditCardRegistryScreen';
import CreditCardsScreen from '@features/creaditcards/CreditCardsScreen';
import CreditCardScreenForm from '@features/creaditcards/CreditCardScreenForm';
import ViewCreditCardsScreen from '@features/creaditcards/ViewCreditCardsScreen';
import AccountScreenForm from '@features/accounts/AccountScreenForm';
import AccountsScreen from '@features/accounts/AccountsScreen';
import RegistryScreenForm from '@features/accounts/RegistryScreenForm';
import GroceriesMainScreen from '@features/groceries/GroceriesMainScreen';
import GroceryItemForm from '@features/groceries/GroceryItemForm';
import SpeechScreen from '@features/beta/SpeechScreen';
import SubscriptionsRouter from '@features/subscriptions/SubscriptionsRouter';

import { clearRepositories, resetRepositories } from '@repositories';
import { getCurrentUser, saveUser } from '@configs';

// Private routes (requires authenticated user)
const privateRouter = createBrowserRouter([
  { path: "/", element: <Navigate to="/main/dashboard" replace /> },
  {
    path: '/main', element: <TabScreen />, children: [
      { path: 'dashboard', element: <DashboardScreen />},
      { path: 'timeline/:id?', element: withRepos(
        <TimelineScreen />,
        'accountRegistries', 'creditCardsInvoices', 'creditCards', 'accounts', 'categories'
      ) },
      { path: 'groceries', element: withRepos(<GroceriesMainScreen />, 'groceries', 'products') },
      { path: 'settings', element: <SettingsScreen /> },
      { path: 'resource-usage', element: <ResourceUsageScreen /> },
    ]
  },
  { path: '/accounts', element: <AccountsScreen /> },
  { path: '/accounts/create', element: <AccountScreenForm /> },
  { path: '/accounts/:id/edit', element: <AccountScreenForm /> },
  { path: '/accounts/registry/add', element: <RegistryScreenForm /> },
  { path: '/accounts/registry/:id/edit', element: <RegistryScreenForm /> },
  { path: '/creditcards', element: <CreditCardsScreen /> },
  { path: '/creditcards/create', element: <CreditCardScreenForm /> },
  { path: '/creditcards/:id', element: <ViewCreditCardsScreen /> },
  { path: '/creditcards/:id/edit', element: <CreditCardScreenForm /> },
  { path: '/creditcards/:id/invoices/:selected?', element: withRepos(
    <CreditCardsInvoices />,
    'creditCardsInvoices', 'creditCardsRegistries'
  ) },
  { path: '/creditcards/registry/add', element: <CreditCardRegistryScreen /> },
  { path: '/creditcards/registry/:id/edit', element: <CreditCardRegistryScreen /> },
  { path: '/categories', element: <CategoriesScreen /> },
  { path: '/categories/create', element: <AddCategoriesScreen /> },
  { path: '/timeline/filters', element: <TimelineFilterScreen /> },
  { path: '/groceries/create', element: <GroceryItemForm /> },
  { path: '/groceries/:id/edit', element: <GroceryItemForm /> },
  { path: '/beta/speech', element: <SpeechScreen /> },
  { path: '/subscriptions/*', element: <SubscriptionsRouter /> },
  { path: '*', element: <EmptyScreen title='Not Found' /> },
])

const publicRouter = createBrowserRouter([
  { path: '/', element: <LoginScreen /> },
  { path: '/subscriptions/*', element: <SubscriptionsRouter /> },
  { path: '*', element: <LoginScreen /> },
])

function App() {

  const [user, setUser] = useState(() => getCurrentUser())
  const [loading, setLoading] = useState(true)
  const { theme, density } = useCssVars();

  useEffect(() => {
    onAuthStateChanged(getAuth(), async (currentUser) => {
      setLoading(true)
      if(currentUser) {
        await resetRepositories();
      } else {
        clearRepositories();
      }

      saveUser(currentUser);
      setUser(currentUser)
      setLoading(false)
    })
  }, [])

  return <div className={`App theme ${theme} ${density}`}>
    {/* {!user ? (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loading show={loading} />
        {Lang.commons.loading}
      </div>
    ) : ( */}
      <RouterProvider router={user ? privateRouter : publicRouter} />
    {/* )} */}
  </div>;
}

export default App;
