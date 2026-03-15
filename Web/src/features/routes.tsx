import { createBrowserRouter } from 'react-router-dom';

import { withRepos } from '@componentsDeprecated/WithRepo';

import TabScreen from '@features/tabs/TabScreen';
import EmptyScreen from '@features/commons/EmptyScreen';
import TimelineImportScreen from '@features/tabs/timeline/TimelineImportScreen';
import SettingsScreen from '@features/tabs/settings/SettingsScreen';
import ResourceUsageScreen from '@features/tabs/resourceUsage/ResourceUsageScreen';
import RecurrentRegistriesScreen from '@features/recurrent/RecurrentRegistriesScreen';
import AiCallsScreen from '@features/assistant/AiCallsScreen';
import DashboardScreen from '@features/tabs/dashboard/DashboardScreen';
import CreditCardsInvoices from '@features/creaditcards/CreditCardsInvoces';
import CreditCardRegistryScreen from '@features/creaditcards/CreditCardRegistryScreen';
import RegistryScreenForm from '@features/accounts/RegistryScreenForm';
import GroceryItemForm from '@features/groceries/GroceryItemForm';
import GroceriesMainScreen from '@features/groceries/GroceriesMainScreen';
import GroceriesTrashScreen from '@features/groceries/GroceriesTrashScreen';
import SubscriptionsRouter from '@features/subscriptions/SubscriptionsRouter';

import LoginScreen from '@pages/auth/LoginScreen.page';
import AddAccountTransactionPage from '@pages/accounts/AddAccountTransaction.page';
import AccountsListPage from '@pages/accounts/AccountsList.page';
import CreateBankAccountPage from '@pages/accounts/CreateBankAccount.page';
import MorePage from '@pages/settings/More.page';
import ConnectedAccountsPage from '@pages/settings/ConnectedAccounts.page';
import SettingsPage from '@pages/settings/Settings.page';
import HomePage from '@pages/core/Home.page';
import TimelinePage from '@pages/core/Timeline.page';
import CreateRecurrentPage from '@pages/transactions/CreateRecurrent.page';
import PrivacyPage from '@pages/privacy/Privacy.page';
import DeleteAccountPage from '@pages/privacy/DeleteAccount.page';
import ExportDataPage from '@pages/privacy/ExportData.page';
import PolicyPage from '@pages/privacy/Policy.page';
import TermsPage from '@pages/privacy/Terms.page';
import CategoriesListPage from '@pages/categories/CategoriesList.page';
import CreateCategoryPage from '@pages/categories/CreateCategory.page';
import CreditCardsListPage from '@pages/credit-cards/CreditCardsList.page';
import CreateCreditCardPage from '@pages/credit-cards/CreateCreditCard.page';

export const privateRouter = createBrowserRouter([
  {
    path: '/', element: withRepos(<TabScreen />, 'user'), children: [
      { path: '/', element: <HomePage />},
      { path: 'old/dashboard', element: <DashboardScreen />},
      { path: 'timeline/filters', element: <TimelinePage /> },
      { path: 'timeline/import', element: withRepos(
        <TimelineImportScreen />,
        'accountTransactions', 'creditCardsTransactions', 'creditCards', 'accounts'
      ) },
      { path: 'timeline/:accountId?', element: <TimelinePage /> },
      { path: 'recurrents', element: withRepos(<RecurrentRegistriesScreen />, 'recurrentTransactions', 'accounts', 'creditCards', 'categories') },
      { path: 'groceries', element: withRepos(<GroceriesMainScreen />, 'groceries', 'products') },
      { path: 'groceries/removed', element: withRepos(<GroceriesTrashScreen />, 'groceries') },
      { path: 'assistant/:userId?', element: withRepos(<AiCallsScreen />, 'aiCalls') },
      { path: 'me/linkedaccounts', element: <ConnectedAccountsPage /> },
      { path: 'me/resource-usage', element: withRepos(<ResourceUsageScreen />,  'resourcesUse') },
      { path: 'me/privacy', element: <PrivacyPage /> },
      { path: 'me/privacy/delete', element: <DeleteAccountPage /> },
      { path: 'me/privacy/export', element: <ExportDataPage /> },
      { path: 'settings', element: <MorePage /> },
      { path: 'settings/app', element: <SettingsPage /> },
      { path: 'old/settings', element: <SettingsScreen /> },
      { path: 'old/resource-usage', element: withRepos(<ResourceUsageScreen />,  'resourcesUse') },
      { path: '/accounts', element: <AccountsListPage /> },
      { path: '/accounts/create', element: <CreateBankAccountPage /> },
      { path: '/accounts/:id', element: <CreateBankAccountPage /> },
      { path: '/accounts/expense/add', element: <AddAccountTransactionPage /> },
      { path: '/accounts/income/add', element: <AddAccountTransactionPage /> },
      { path: '/accounts/registry/:id', element: <AddAccountTransactionPage /> },
      { path: '/accounts/transfers/create', element: <EmptyScreen title='Transfer Create' /> },
      { path: '/accounts/transfers/:id/edit', element: withRepos(<RegistryScreenForm />, 'accounts', 'banks', 'categories', 'accountTransactions') },
      { path: '/creditcards', element: <CreditCardsListPage /> },
      { path: '/creditcards/create', element: <CreateCreditCardPage /> },
      { path: '/creditcards/:id', element: <CreateCreditCardPage /> },
      { path: '/creditcards/:id/invoices/:selected?', element: withRepos(
        <CreditCardsInvoices />,
        'creditCardsInvoices', 'creditCardsTransactions', 'categories', 'creditCards'
      ) },
      { path: '/creditcards/transaction/add', element: withRepos(<CreditCardRegistryScreen />, 'categories', 'creditCards') },
      { path: '/creditcards/transaction/:id/edit', element: withRepos(<CreditCardRegistryScreen />, 'categories', 'creditCards', 'creditCardsTransactions') },
      { path: '/categories', element: <CategoriesListPage /> },
      { path: '/categories/create', element: <CreateCategoryPage /> },
      { path: '/categories/:id', element: <CreateCategoryPage /> },
      { path: '/groceries/create', element: <GroceryItemForm /> },
      { path: '/groceries/:id/edit', element: withRepos(<GroceryItemForm />, 'groceries') },
      { path: '/recurrents/create', element: <CreateRecurrentPage /> },
      { path: '/recurrents/:id', element: <CreateRecurrentPage /> },
      { path: '/subscriptions/*', element: <SubscriptionsRouter /> },
    ]
  },
  { path: '/subscriptions/*', element: <SubscriptionsRouter /> },
  { path: '/privacy/terms', element: <TermsPage /> },
  { path: '/privacy/policy', element: <PolicyPage /> },
  { path: '*', element: <EmptyScreen title='Not Found' /> },
])

export const publicRouter = createBrowserRouter([
  { path: '/', element: <LoginScreen /> },
  { path: '/subscriptions/*', element: <SubscriptionsRouter /> },
  { path: '/privacy/terms', element: <TermsPage /> },
  { path: '/privacy/policy', element: <PolicyPage /> },
  { path: '*', element: <LoginScreen /> },
])
