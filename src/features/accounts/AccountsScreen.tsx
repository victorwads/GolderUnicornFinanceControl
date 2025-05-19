import './AccountsScreen.css'
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import getRepositories from "../../data/repositories"
import BankInfo from "../banks/BankInfo"
import Card from "../../components/visual/Card"
import { ModalScreen } from "../../components/conteiners/ModalScreen"

const AccountsScreen = () => {
    const [accounts, setAccounts] = useState([])
    const [showArchived, setShowArchived] = useState(false)

    useEffect(() => {
        const { accounts: accountsRepo, banks } = getRepositories();

        setAccounts(
            accountsRepo.getCache().map(account => {
                return {
                    ...account,
                    bank: banks.getLocalById(account.bankId)
                }
            })
        )
    }, [showArchived])

    return <ModalScreen title="Accounts">
        <div>
            <label><input onChange={() => setShowArchived(!showArchived)} type="checkbox" checked={showArchived} /> Show archived</label>
        </div>
        <Card>
            {accounts.filter(account => showArchived || !account.archived).map(account => <AccountItem key={account.id} account={account} />)}
            {accounts.length === 0 && <div className="centerInfo">There is no account registered yet.</div>}
            <div style={{ textAlign: 'right' }}>
                <Link to={'/accounts/create'}>Add Account</Link>
            </div>
        </Card>
    </ModalScreen>
}

const AccountItem = ({ account }) => {
    const [balance, setBalance] = useState<number|true>(true)

    useEffect(() => {
        const { accounts } = getRepositories();
        setBalance(accounts.getAccountBalance(account.id))
    }, [account.id]);

    return <Link to={'/accounts/' + account.id + '/edit'} key={account.id}>
        <BankInfo bank={account.bank} balance={balance} />
    </Link>
}

export default AccountsScreen
