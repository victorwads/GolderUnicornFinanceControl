import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import Card from "../components/visual/Card"
import BankInfo from "../banks/BankInfo"

import Bank from "../../data/models/Bank"
import BanksRepository from "../../data/repositories/BanksRepository"
import CreditCard from "../../data/models/CreditCard"
import CreditcardsRepository from "../../data/repositories/CreditCardsRepository"
import AccountsRepository from "../../data/repositories/AccountsRepository"


const CreditCardsCard: React.FC<{}> = () => {

    let [creditCards, setCreditCards] = useState<CreditCard[]>([])
    let banksRepository = new BanksRepository()
    let creditCardsRepository = new CreditcardsRepository()
    let accountRepository = new AccountsRepository()

    useEffect(() => {
        (async () => {
            creditCardsRepository.getAll().then(setCreditCards)
        })()
    },[])

    return <>
        <Link to={'/creditcards'}>Cartões</Link>
        <Card>
            {creditCards.map(creditCard => {
                let account = accountRepository.getLocalById(creditCard.accountId);
                let bank = banksRepository.getLocalById(account?.bankId);
                if (!bank) return null
                return <BankInfo key={creditCard.id} bank={new Bank('', creditCard.name, '', creditCard.brand.toLowerCase() + '.png')} />
            })}
            <div style={{ textAlign: 'right' }}>
                <Link to={'/creditcards/create'}>Adicionar Conta</Link>
            </div>
        </Card>
    </>
}

export default CreditCardsCard