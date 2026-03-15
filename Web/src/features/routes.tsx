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
import RegistryScreenForm from '@features/accounts/RegistryScreenForm';
import GroceryItemForm from '@features/groceries/GroceryItemForm';
import GroceriesMainScreen from '@features/groceries/GroceriesMainScreen';
import GroceriesTrashScreen from '@features/groceries/GroceriesTrashScreen';
import SubscriptionsRouter from '@features/subscriptions/SubscriptionsRouter';
import MasterDetailShell, {
  MasterDetailPlaceholder,
  ResponsiveMasterDetailIndex,
} from '@layouts/core/MasterDetailShell';

import LoginScreen from '@pages/auth/LoginScreen.page';
import AddAccountTransactionPage from '@pages/accounts/AddAccountTransaction.page';
import AccountsListPage from '@pages/accounts/AccountsList.page';
import CreateBankAccountPage from '@pages/accounts/CreateBankAccount.page';
import MorePage from '@pages/settings/More.page';
import ConnectedAccountsPage from '@pages/settings/ConnectedAccounts.page';
import SettingsPage from '@pages/settings/Settings.page';
import ResourceUsagePage from '@pages/settings/ResourceUsage.page';
import HomePage from '@pages/core/Home.page';
import TimelinePage from '@pages/core/Timeline.page';
import CreateRecurrentPage from '@pages/transactions/CreateRecurrent.page';
import CreateTransferPage from '@pages/transactions/CreateTransfer.page';
import PrivacyPage from '@pages/privacy/Privacy.page';
import DeleteAccountPage from '@pages/privacy/DeleteAccount.page';
import ExportDataPage from '@pages/privacy/ExportData.page';
import PolicyPage from '@pages/privacy/Policy.page';
import TermsPage from '@pages/privacy/Terms.page';
import CategoriesListPage from '@pages/categories/CategoriesList.page';
import CreateCategoryPage from '@pages/categories/CreateCategory.page';
import CreditCardsListPage from '@pages/credit-cards/CreditCardsList.page';
import CreateCreditCardPage from '@pages/credit-cards/CreateCreditCard.page';
import AddCreditCardTransactionPage from '@pages/credit-cards/AddCreditCardTransaction.page';

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
      { path: 'me/resource-usage', element: withRepos(<ResourceUsagePage />,  'resourcesUse', 'aiCalls') },
      { path: 'me/privacy', element: <PrivacyPage /> },
      { path: 'me/privacy/delete', element: <DeleteAccountPage /> },
      { path: 'me/privacy/export', element: <ExportDataPage /> },
      { path: 'settings', element: <MorePage /> },
      { path: 'settings/app', element: <SettingsPage /> },
      { path: 'old/settings', element: <SettingsScreen /> },
      { path: 'old/resource-usage', element: withRepos(<ResourceUsageScreen />,  'resourcesUse') },
      {
        path: 'accounts',
        element: <MasterDetailShell listPane={<AccountsListPage embedded />} />,
        children: [
          {
            index: true,
            element: (
              <ResponsiveMasterDetailIndex
                portraitContent={<AccountsListPage />}
                landscapeContent={
                  <MasterDetailPlaceholder
                    title="Selecione uma conta"
                    description="Escolha uma conta na lista para editar ou crie uma nova conta."
                  />
                }
              />
            ),
          },
          { path: 'create', element: <CreateBankAccountPage /> },
          { path: ':id', element: <CreateBankAccountPage /> },
        ],
      },
      { path: '/accounts/expense/add', element: <AddAccountTransactionPage /> },
      { path: '/accounts/income/add', element: <AddAccountTransactionPage /> },
      { path: '/accounts/registry/:id', element: <AddAccountTransactionPage /> },
      { path: '/accounts/transfers/create', element: <CreateTransferPage /> },
      { path: '/accounts/transfers/:id/edit', element: withRepos(<RegistryScreenForm />, 'accounts', 'banks', 'categories', 'accountTransactions') },
      {
        path: 'creditcards',
        element: <MasterDetailShell listPane={<CreditCardsListPage embedded />} />,
        children: [
          {
            index: true,
            element: (
              <ResponsiveMasterDetailIndex
                portraitContent={<CreditCardsListPage />}
                landscapeContent={
                  <MasterDetailPlaceholder
                    title="Selecione um cartao"
                    description="Escolha um cartao na lista para editar ou crie um novo cartao."
                  />
                }
              />
            ),
          },
          { path: 'create', element: <CreateCreditCardPage /> },
          { path: ':id', element: <CreateCreditCardPage /> },
        ],
      },
      { path: '/creditcards/:id/invoices/:selected?', element: withRepos(
        <CreditCardsInvoices />,
        'creditCardsInvoices', 'creditCardsTransactions', 'categories', 'creditCards'
      ) },
      { path: '/creditcards/transaction/add', element: <AddCreditCardTransactionPage /> },
      { path: '/creditcards/transaction/:id/edit', element: <AddCreditCardTransactionPage /> },
      {
        path: 'categories',
        element: <MasterDetailShell listPane={<CategoriesListPage embedded />} />,
        children: [
          {
            index: true,
            element: (
              <ResponsiveMasterDetailIndex
                portraitContent={<CategoriesListPage />}
                landscapeContent={
                  <MasterDetailPlaceholder
                    title="Selecione uma categoria"
                    description="Escolha uma categoria na lista para editar ou crie uma nova categoria."
                  />
                }
              />
            ),
          },
          { path: 'create', element: <CreateCategoryPage /> },
          { path: ':id', element: <CreateCategoryPage /> },
        ],
      },
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
