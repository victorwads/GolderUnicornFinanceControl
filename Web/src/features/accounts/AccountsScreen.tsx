import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import './AccountsScreen.css'

import { Bank, WithInfoAccount } from "@models"
import { getServices } from "@services"
import getRepositories from "@repositories"

import Card from "@componentsDeprecated/visual/Card"
import Icon, { Icons } from "@componentsDeprecated/Icons"
import { ModalScreen } from "@componentsDeprecated/conteiners/ModalScreen"

import BankInfo from "../banks/BankInfo"

const AccountsScreen = () => {
  const [accounts, setAccounts] = useState<WithInfoAccount[]>([])
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    const { accounts: accountsRepo, banks } = getRepositories();

    const allAccounts = accountsRepo.getCache().map(account => {
      return {
        ...account,
        bank: new Bank(
          account.bankId, account.name, '',
          banks.getLocalById(account.bankId)?.logoUrl
        )
      }
    });
    setAccounts(allAccounts)
  }, [showArchived])

  return <ModalScreen title={Lang.accounts.title}>
    <div>
      <label><input onChange={() => setShowArchived(!showArchived)} type="checkbox" checked={showArchived} /> {Lang.accounts.showArchived}</label>
    </div>
    <Card>
      {accounts
        .filter(account => showArchived || !account.archived)
        .map(account => <AccountItem key={account.id} account={account} />)}
      {accounts.length === 0 && <div className="centerInfo">{Lang.accounts.noAccounts}</div>}
      <div className="FloatButton">
        <Link to={'/accounts/create'}>
        <Icon icon={Icons.faPlus} size="2x" />
        </Link>
      </div>
    </Card>
  </ModalScreen>
}

const AccountItem = ({ account }: { account: WithInfoAccount }) => {
  const [balance, setBalance] = useState<number | true>(true)

  useEffect(() => {
    const { balance } = getServices();
    setBalance(balance.getBalance(account.id))
  }, [account.id]);

  return <Link to={'/accounts/' + account.id + '/edit'} key={account.id}>
    <BankInfo bank={account.bank} balance={balance} />
  </Link>
}

export default AccountsScreen
