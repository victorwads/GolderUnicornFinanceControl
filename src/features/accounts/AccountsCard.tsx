import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import Card from "../components/visual/Card"
import BankInfo from "../banks/BankInfo"

import Bank from "../../data/models/Bank"
import BanksRepository from "../../data/repositories/BanksRepository"
import Account from "../../data/models/Account"
import AccountsRepository from "../../data/repositories/AccountsRepository"

interface WithInfoAccount extends Account {
    bank: Bank
    balance: number
}

const AccountsCard: React.FC<{}> = () => {

    let [accounts, setAccounts] = useState<WithInfoAccount[]>([])
    
    useEffect(() => {
        const banksRepository = new BanksRepository();
        const accountRepository = new AccountsRepository();

        (async () => {
            await banksRepository.waitInit()
            await accountRepository.waitInit()
            setAccounts(
                accountRepository.getCache()
                .map(account => {
                    let bank = banksRepository.getLocalById(account.bankId)!;
                    return {
                        ...account,
                        bank: new Bank(
                            account.bankId, account.name, '',
                            banksRepository.getLocalById(account.bankId)?.logoUrl
                        ),
                        balance: accountRepository.getAccountBalance(account.id)
                    }
                })
            )
        })()
    },[])

    return <>
        <Link to={'/accounts'}>Contas</Link>
        <Card>
            {accounts.map(account => <Link to={'/main/timeline/' + account.id} key={account.id}>
                <BankInfo bank={account.bank} balance={account.balance} />
            </Link>)}
            <div style={{ textAlign: 'right' }}>
                <Link to={'/accounts/create'}>Adicionar Conta</Link>
            </div>
        </Card>
    </>
}

export default AccountsCard