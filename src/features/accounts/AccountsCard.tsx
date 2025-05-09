import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import Card from "../../components/visual/Card"
import BankInfo from "../banks/BankInfo"

import Bank from "../../data/models/Bank"
import BanksRepository from "../../data/repositories/BanksRepository"
import Account from "../../data/models/Account"
import AccountsRepository from "../../data/repositories/AccountsRepository"

interface WithInfoAccount extends Account {
  bank: Bank
}

const AccountsCard: React.FC<{}> = () => {
  const [accounts, setAccounts] = useState<WithInfoAccount[]>([])
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    const banksRepository = new BanksRepository();
    const accountRepository = new AccountsRepository();

    (async () => {
      await banksRepository.waitInit()
      await accountRepository.waitInit()
      setAccounts(
        accountRepository.getCache().map(account => {
          return {
            ...account,
            bank: new Bank(
              account.bankId, account.name, '',
              banksRepository.getLocalById(account.bankId)?.logoUrl
            )
          }
        })
      )
    })()
  }, [showArchived])

  return <>
    <div>
      <label><input onClick={() => setShowArchived(!showArchived)} type="checkbox" checked={showArchived} /> Show archived</label>
    </div>
    <Link to={'/accounts'}>Contas</Link>
    <Card>
      {accounts.filter(account => showArchived || !account.archived).map(account => <AccountItem key={account.id} account={account} />)}
      <div style={{ textAlign: 'right' }}>
        <Link to={'/accounts/create'}>Adicionar Conta</Link>
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
    (async () => {
      const accountRepository = new AccountsRepository();
      await accountRepository.waitItems()

      setBalance(accountRepository.getAccountBalance(account.id))
    })()
  });

  return <Link to={'/main/timeline/' + account.id} key={account.id}>
    <BankInfo bank={account.bank} balance={balance} />
  </Link>
}

export default AccountsCard