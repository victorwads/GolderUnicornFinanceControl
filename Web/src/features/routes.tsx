import { Navigate, createBrowserRouter } from 'react-router-dom';

import { withRepos } from '@componentsDeprecated/WithRepo';

import TabScreen from '@features/tabs/TabScreen';
import EmptyScreen from '@features/commons/EmptyScreen';
import TimelineImportScreen from '@features/tabs/timeline/TimelineImportScreen';
import SettingsScreen from '@features/tabs/settings/SettingsScreen';
import ResourceUsageScreen from '@features/tabs/resourceUsage/ResourceUsageScreen';
import RecurrentRegistriesScreen from '@features/recurrent/RecurrentRegistriesScreen';
import DashboardScreen from '@features/tabs/dashboard/DashboardScreen';
import CreditCardsInvoices from '@features/creaditcards/CreditCardsInvoces';
import RegistryScreenForm from '@features/accounts/RegistryScreenForm';
import GroceryItemForm from '@features/groceries/GroceryItemForm';
import GroceriesMainScreen from '@features/groceries/GroceriesMainScreen';
import GroceriesTrashScreen from '@features/groceries/GroceriesTrashScreen';
import SubscriptionsRouter from '@features/subscriptions/SubscriptionsRouter';
import MasterDetailShell from '@layouts/core/MasterDetailShell';

import LoginScreen from '@pages/auth/LoginScreen.page';
import AddAccountTransactionPage from '@pages/accounts/AddAccountTransaction.page';
import AccountsListPage from '@pages/accounts/AccountsList.page';
import CreateBankAccountPage from '@pages/accounts/CreateBankAccount.page';
import MorePage from '@pages/settings/More.page';
import ConnectedAccountsPage from '@pages/settings/ConnectedAccounts.page';
import SettingsPage from '@pages/settings/Settings.page';
import LanguagePage from '@pages/settings/Language.page';
import DeveloperPage from '@pages/settings/Developer.page';
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
import AssistantHistoryPage from '@pages/assistant/AssistantHistory.page';
import AssistantConversationPage from '@pages/assistant/AssistantConversation.page';

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
      {
        path: 'timeline',
        element: (
          <MasterDetailShell
            basePath="/timeline"
            listPane={<TimelinePage embedded />}
          />
        ),
        children: [
          { index: true, element: <TimelinePage /> },
          { path: 'entry/account/expense/create', element: <AddAccountTransactionPage /> },
          { path: 'entry/account/income/create', element: <AddAccountTransactionPage /> },
          { path: 'entry/account/:id', element: <AddAccountTransactionPage /> },
          { path: 'entry/credit/create', element: <AddCreditCardTransactionPage /> },
          { path: 'entry/credit/:id', element: <AddCreditCardTransactionPage /> },
          { path: 'entry/transfer/create', element: <CreateTransferPage /> },
          { path: 'entry/transfer/:id', element: withRepos(<RegistryScreenForm />, 'accounts', 'banks', 'categories', 'accountTransactions') },
          {
            path: 'entry/creditcards/:id/invoices/:selected?',
            element: withRepos(
              <CreditCardsInvoices />,
              'creditCardsInvoices', 'creditCardsTransactions', 'categories', 'creditCards'
            ),
          },
        ],
      },
      { path: 'recurrents', element: withRepos(<RecurrentRegistriesScreen />, 'recurrentTransactions', 'accounts', 'creditCards', 'categories') },
      { path: 'groceries', element: withRepos(<GroceriesMainScreen />, 'groceries', 'products') },
      { path: 'groceries/removed', element: withRepos(<GroceriesTrashScreen />, 'groceries') },
      {
        path: 'assistant',
        element: withRepos(
          <MasterDetailShell
            basePath="/assistant"
            listPane={<AssistantHistoryPage embedded />}
          />,
          'aiCalls',
          'resourcesUse'
        ),
        children: [
          { index: true, element: <AssistantHistoryPage /> },
          { path: ':conversationId', element: <AssistantConversationPage /> },
        ],
      },
      { path: 'ai-calls', element: <Navigate to="/assistant" replace /> },
      { path: 'me/linkedaccounts', element: <ConnectedAccountsPage /> },
      { path: 'me/resource-usage', element: withRepos(<ResourceUsagePage />,  'resourcesUse', 'aiCalls') },
      { path: 'me/privacy', element: <PrivacyPage /> },
      { path: 'me/privacy/delete', element: <DeleteAccountPage /> },
      { path: 'me/privacy/export', element: <ExportDataPage /> },
      { path: 'settings', element: <MorePage /> },
      { path: 'settings/app', element: <SettingsPage /> },
      { path: 'settings/language', element: <LanguagePage /> },
      { path: 'settings/developer', element: <DeveloperPage /> },
      { path: 'old/settings', element: <SettingsScreen /> },
      { path: 'old/resource-usage', element: withRepos(<ResourceUsageScreen />,  'resourcesUse') },
      {
        path: 'accounts',
        element: (
          <MasterDetailShell
            basePath="/accounts"
            listPane={<AccountsListPage embedded />}
          />
        ),
        children: [
          { index: true, element: <AccountsListPage /> },
          { path: 'create', element: <CreateBankAccountPage /> },
          { path: ':id', element: <CreateBankAccountPage /> },
        ],
      },
      {
        path: 'creditcards',
        element: (
          <MasterDetailShell
            basePath="/creditcards"
            listPane={<CreditCardsListPage embedded />}
          />
        ),
        children: [
          { index: true, element: <CreditCardsListPage /> },
          { path: 'create', element: <CreateCreditCardPage /> },
          { path: ':id', element: <CreateCreditCardPage /> },
        ],
      },
      { path: '/creditcards/:id/invoices/:selected?', element: withRepos(
        <CreditCardsInvoices />,
        'creditCardsInvoices', 'creditCardsTransactions', 'categories', 'creditCards'
      ) },
      {
        path: 'categories',
        element: (
          <MasterDetailShell
            basePath="/categories"
            listPane={<CategoriesListPage embedded />}
          />
        ),
        children: [
          { index: true, element: <CategoriesListPage /> },
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
