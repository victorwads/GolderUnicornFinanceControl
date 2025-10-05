import { Navigate, createBrowserRouter } from 'react-router-dom';

import { withRepos } from '@components/WithRepo';

import TabScreen from '@features/tabs/TabScreen';
import EmptyScreen from '@features/commons/EmptyScreen';
import LoginScreen from '@features/login/LoginScreen';
import TimelineScreen from '@features/tabs/timeline/TimelineScreen';
import TimelineFilterScreen from '@features/tabs/timeline/TimelineFilterScreen';
import SettingsScreen from '@features/tabs/settings/SettingsScreen';
import ResourceUsageScreen from '@features/tabs/resourceUsage/ResourceUsageScreen';
import AiCallsScreen from '@features/assistant/AiCallsScreen';
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
import GroceryItemForm from '@features/groceries/GroceryItemForm';
import GroceriesMainScreen from '@features/groceries/GroceriesMainScreen';
import GroceriesTrashScreen from '@features/groceries/GroceriesTrashScreen';
import SubscriptionsRouter from '@features/subscriptions/SubscriptionsRouter';

export const privateRouter = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  {
    path: '/', element: withRepos(<TabScreen />), children: [
      { path: 'dashboard', element: <DashboardScreen />},
      { path: 'timeline/filters', element: withRepos(<TimelineFilterScreen />, 'banks', 'creditCards', 'accounts', 'categories') },
      { path: 'timeline/:id?', element: withRepos(
        <TimelineScreen />,
        'accountRegistries', 'creditCardsInvoices', 'creditCards', 'accounts', 'categories'
      ) },
      { path: 'groceries', element: withRepos(<GroceriesMainScreen />, 'groceries', 'products') },
      { path: 'groceries/removed', element: withRepos(<GroceriesTrashScreen />, 'groceries') },
      { path: 'settings', element: <SettingsScreen /> },
      { path: 'settings/ai-calls', element: withRepos(<AiCallsScreen />, 'aiCalls') },
      { path: 'resource-usage', element: withRepos(<ResourceUsageScreen />,  'resourcesUse') },
      { path: '/accounts', element: withRepos(<AccountsScreen />, 'accounts', 'banks') },
      { path: '/accounts/create', element: withRepos(<AccountScreenForm />, 'banks') },
      { path: '/accounts/:id/edit', element: withRepos(<AccountScreenForm />, 'accounts', 'banks') },
      { path: '/accounts/registry/add', element: withRepos(<RegistryScreenForm />, 'accounts', 'categories', 'banks') },
      { path: '/accounts/registry/:id/edit', element: withRepos(<RegistryScreenForm />, 'accounts', 'banks', 'categories', 'accountRegistries') },
      { path: '/creditcards', element: withRepos(<CreditCardsScreen />, 'creditCards') },
      { path: '/creditcards/create', element: withRepos(<CreditCardScreenForm />, 'accounts') },
      { path: '/creditcards/:id', element: <ViewCreditCardsScreen /> },
      { path: '/creditcards/:id/edit', element: withRepos(<CreditCardScreenForm />, 'creditCards', 'accounts') },
      { path: '/creditcards/:id/invoices/:selected?', element: withRepos(
        <CreditCardsInvoices />,
        'creditCardsInvoices', 'creditCardsRegistries', 'categories', 'creditCards'
      ) },
      { path: '/creditcards/registry/add', element: withRepos(<CreditCardRegistryScreen />, 'categories', 'creditCards') },
      { path: '/creditcards/registry/:id/edit', element: withRepos(<CreditCardRegistryScreen />, 'categories', 'creditCards', 'creditCardsRegistries') },
      { path: '/categories', element: <CategoriesScreen /> },
      { path: '/categories/create', element: <AddCategoriesScreen /> },
      { path: '/groceries/create', element: <GroceryItemForm /> },
      { path: '/groceries/:id/edit', element: withRepos(<GroceryItemForm />, 'groceries') },
      { path: '/subscriptions/*', element: <SubscriptionsRouter /> },
    ]
  },
  { path: '*', element: <EmptyScreen title='Not Found' /> },
])

export const publicRouter = createBrowserRouter([
  { path: '/', element: <LoginScreen /> },
  { path: '/subscriptions/*', element: <SubscriptionsRouter /> },
  { path: '*', element: <LoginScreen /> },
])
