import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import Card from "../components/visual/Card"
import BankInfo from "../banks/BankInfo"

import Bank from "../../data/models/Bank"
import BanksRepository from "../../data/repositories/BanksRepository"
import Account from "../../data/models/Account"
import AccountsRepository from "../../data/repositories/AccountsRepository"


const AccountsCard: React.FC<{}> = () => {

    let [accounts, setAccounts] = useState<Account[]>([])
    let banksRepository = new BanksRepository()
    let accountRepository = new AccountsRepository()

    useEffect(() => {
        accountRepository.getAll().then(setAccounts)
    },[])

    return <>
        <Link to={'/accounts'}>Contas</Link>
        <Card>
            {accounts.map(account =>
                <BankInfo bank={new Bank('', account.name, '',
                    banksRepository.getById(account.bankId)?.logoUrl ?? '')} />
            )}
            <div style={{ textAlign: 'right' }}>
                <Link to={'/accounts/create'}>Adicionar Conta</Link>
            </div>
        </Card>
    </>
}

export default AccountsCard