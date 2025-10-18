import { useCallback, useState } from "react"
import { Link } from "react-router-dom"

import Card from "@componentsDeprecated/visual/Card"
import BankInfo from "../banks/BankInfo"

import getRepositories from "@repositories"
import { WithRepo } from "@componentsDeprecated/WithRepo"
import { CreditCardWithInfos } from "src/data/repositories/CreditcardsRepository"

const CreditCardsCard: React.FC<{}> = () => {

  let [creditCards, setCreditCards] = useState<CreditCardWithInfos[]>([])

  const fetchCreditCards = useCallback(() => {
    const repo = getRepositories().creditCards;
    setCreditCards(repo.getCacheWithBank())
    return repo.addUpdatedEventListenner(repo =>
      setCreditCards(repo.getCacheWithBank())
    )
  }, [])
  
  return <>
    <Link to={'/creditcards'}>{Lang.creditcards.title}</Link>
    <Card>
      <WithRepo names={['creditCards']} onReady={fetchCreditCards} >
      {creditCards.map(creditCard => <Link key={creditCard.id} to={`/creditcards/${creditCard.id}/invoices`}>
        <BankInfo bank={creditCard.bank} />
      </Link>)}
      {creditCards.length === 0 &&
        <div className="centerInfo">{Lang.creditcards.noCreditCards}</div>}
      <div style={{ textAlign: 'right' }}>
        <Link to={'/creditcards/create'}>{Lang.creditcards.addCreditCard}</Link>
      </div>
      </WithRepo>
    </Card>
  </>
}

export default CreditCardsCard
