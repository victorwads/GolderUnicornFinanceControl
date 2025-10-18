import './CreditCardsScreen.css';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Card from "@componentsDeprecated/visual/Card";
import Icon, { Icons } from "@componentsDeprecated/Icons";
import { ModalScreen } from "@componentsDeprecated/conteiners/ModalScreen";

import { Bank, CreditCard } from "@models";
import getRepositories from "@repositories";
import BankInfo from "@features/banks/BankInfo";

interface CreditCardWithInfo extends CreditCard {
  bank: Bank;
}

const CreditCardsScreen = () => {
  const [creditCards, setCreditCards] = useState<CreditCardWithInfo[]>([]);

  useEffect(() => {
    const { creditCards } = getRepositories();
    const cards = creditCards.getCache().map(card => ({
      ...card,
      bank: new Bank('', card.name, '', card.brand.toLowerCase() + '.png')
    }));
    setCreditCards(cards);
  }, []);

  return (
    <ModalScreen title={Lang.creditcards.title}>
      <Card>
        {creditCards.map(card => (
          <Link key={card.id} to={`/creditcards/${card.id}/edit`}>
            <BankInfo bank={card.bank} />
          </Link>
        ))}
        {creditCards.length === 0 && (
          <div className="centerInfo">{Lang.creditcards.noCreditCards}</div>
        )}
        <div className="FloatButton">
          <Link to={'/creditcards/create'}>
            <Icon icon={Icons.faPlus} size="2x" />
          </Link>
        </div>
      </Card>
    </ModalScreen>
  );
};

export default CreditCardsScreen;
