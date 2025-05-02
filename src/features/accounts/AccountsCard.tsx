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
    const banksRepository = new BanksRepository();
    const accountRepository = new AccountsRepository();
    
    useEffect(() => {
        (async () => {
            await banksRepository.waitInit()
            await accountRepository.waitInit()
            setAccounts(accountRepository.getCache())
        })()
    },[])

    return <>
        <Link to={'/accounts'}>Contas</Link>
        <Card>
            {accounts.map(account => <>
                <BankInfo bank={new Bank(
                    account.bankId, account.name, '',
                    banksRepository.getLocalById(account.bankId)?.logoUrl
                )} balance={accountRepository.getAccountBalance(account.id)} />
                
            </>)}
            <div style={{ textAlign: 'right' }}>
                <Link to={'/accounts/create'}>Adicionar Conta</Link>
            </div>
        </Card>
    </>
}

export default AccountsCard