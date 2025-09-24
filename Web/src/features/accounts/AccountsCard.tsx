import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import Card from "@components/visual/Card"
import BankInfo from "../banks/BankInfo"

import { Bank, Account } from "@models"
import getRepositories from "@repositories"
import { waitUntilReady } from '@repositories';
import { WithRepo } from "@components/WithRepo"
import { getServices } from "@services"

export interface WithInfoAccount extends Account {
  bank: Bank
}

const AccountsCard: React.FC<{}> = () => {
  const [accounts, setAccounts] = useState<WithInfoAccount[]>([])
  const [showArchived, setShowArchived] = useState<boolean|null>(null)

  useEffect(() => {
    if (showArchived === null) return
    const { accounts: accountsRepo, banks } = getRepositories();

    setAccounts(
      accountsRepo.getCache(showArchived).map(account => {
        return {
          ...account,
          bank: new Bank(
            account.bankId, account.name, '',
            banks.getLocalById(account.bankId)?.logoUrl
          )
        }
      })
    )
  }, [showArchived])

  return <>
    <Link to={'/accounts'}>{Lang.accounts.title}</Link>
    <div>
      <label><input onChange={() => setShowArchived(!showArchived)} type="checkbox" checked={!!showArchived} /> {Lang.accounts.showArchived}</label>
    </div>
    <Card>
      <WithRepo names={['accounts', 'banks']} onReady={() => setShowArchived(false)}>
      {accounts.map(account => 
        <AccountItem key={account.id} account={account} />
      )}
      {accounts.length === 0 && <div className="centerInfo">{Lang.accounts.noAccounts}</div>}
      <div style={{ textAlign: 'right' }}>
        <Link to={'/accounts/create'}>{Lang.accounts.addAccount}</Link>
      </div>
      </WithRepo>
    </Card>
  </>
}

interface AccountItemParams {
  account: WithInfoAccount,
}
const AccountItem = ({ account }: AccountItemParams) => {

  const [balance, setBalance] = useState<number|true>(true)

  useEffect(() => {
    waitUntilReady('accountRegistries', 'creditCardsInvoices').then(() => {
      const { balance } = getServices();
      setBalance(balance.getBalance(account.id))
    });
  }, [account.id]);

  return <Link to={'/timeline/' + account.id} key={account.id}>
    <BankInfo bank={account.bank} balance={balance} />
  </Link>
}

export default AccountsCard
