import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import Card from "../../components/visual/Card"
import BankInfo from "../banks/BankInfo"

import Bank from "../../data/models/Bank"
import Account from "../../data/models/Account"
import getRepositories from "../../data/repositories"

export interface WithInfoAccount extends Account {
  bank: Bank
}

const AccountsCard: React.FC<{}> = () => {
  const [accounts, setAccounts] = useState<WithInfoAccount[]>([])
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    const { accounts: accountsRepo, banks } = getRepositories();

    setAccounts(
      accountsRepo.getCache().map(account => {
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
    <div>
      <label><input onChange={() => setShowArchived(!showArchived)} type="checkbox" checked={showArchived} /> Show archived</label>
    </div>
    <Link to={'/accounts'}>Contas</Link>
    <Card>
      {accounts
        .filter(account => showArchived || !account.archived)
        .map(account => <AccountItem key={account.id} account={account} />)}
      {accounts.length === 0 && <div className="centerInfo">There is no account registered yet.</div>}
      <div style={{ textAlign: 'right' }}>
        <Link to={'/accounts/create'}>Add Account</Link>
      </div>
    </Card>
  </>
}

interface AccountItemParams {
  account: WithInfoAccount,
}
const AccountItem = ({ account }: AccountItemParams) => {

  const [balance, setBalance] = useState<number|true>(true)

  useEffect(() => {
      const { accounts } = getRepositories();
      setBalance(accounts.getAccountBalance(account.id))
  }, [account.id]);

  return <Link to={'/main/timeline/' + account.id} key={account.id}>
    <BankInfo bank={account.bank} balance={balance} />
  </Link>
}

export default AccountsCard
