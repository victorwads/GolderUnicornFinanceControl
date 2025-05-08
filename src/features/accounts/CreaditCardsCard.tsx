import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import Card from "../../components/visual/Card"
import BankInfo from "../banks/BankInfo"

import Bank from "../../data/models/Bank"
import CreditCard from "../../data/models/CreditCard"
import CreditcardsRepository from "../../data/repositories/CreditCardsRepository"

interface CreditCardWithInfos extends CreditCard {
    bank: Bank
}

const CreditCardsCard: React.FC<{}> = () => {

    let [creditCards, setCreditCards] = useState<CreditCardWithInfos[]>([])

    useEffect(() => {
        const creditCardsRepository = new CreditcardsRepository();
        (async () => {
            await creditCardsRepository.waitInit();

            const cards = creditCardsRepository.getCache().map(creditCard => ({
                ...creditCard,
                bank: new Bank('', creditCard.name, '', creditCard.brand.toLowerCase() + '.png')
            }));
            setCreditCards(cards)
        })()
    },[])

    return <>
        <Link to={'/creditcards'}>Cartões</Link>
        <Card>
            {creditCards.map(creditCard => <Link key={creditCard.id} to={'/creditcards/:id'}>
                <BankInfo bank={creditCard.bank} />
            </Link>)}
            <div style={{ textAlign: 'right' }}>
                <Link to={'/creditcards/create'}>Adicionar Conta</Link>
            </div>
        </Card>
    </>
}

export default CreditCardsCard