import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import Card from "../../components/visual/Card"
import BankInfo from "../banks/BankInfo"

import Bank from "../../data/models/Bank"
import CreditCard from "../../data/models/CreditCard"
import getRepositories from "../../data/repositories"

interface CreditCardWithInfos extends CreditCard {
  bank: Bank
}

const CreditCardsCard: React.FC<{}> = () => {

  let [creditCards, setCreditCards] = useState<CreditCardWithInfos[]>([])

  useEffect(() => {
    const { creditCards } = getRepositories();
    const cards = creditCards.getCache().map(creditCard => ({
      ...creditCard,
      bank: new Bank('', creditCard.name, '', creditCard.brand.toLowerCase() + '.png')
    }));
    setCreditCards(cards)
  }, [])

  return <>
    <Link to={'/creditcards'}>Cartões</Link>
    <Card>
      {creditCards.map(creditCard => <Link key={creditCard.id} to={`/creditcards/${creditCard.id}/invoices`}>
        <BankInfo bank={creditCard.bank} />
      </Link>)}
      {creditCards.length === 0 &&
        <div className="centerInfo">There is no credit card registered yet.</div>}
      <div style={{ textAlign: 'right' }}>
        <Link to={'/creditcards/create'}>Add Credit Card</Link>
      </div>
    </Card>
  </>
}

export default CreditCardsCard