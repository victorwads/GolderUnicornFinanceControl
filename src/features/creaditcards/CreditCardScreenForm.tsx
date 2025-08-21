import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ModalScreen } from "@components/conteiners/ModalScreen";
import Field from "@components/fields/Field";
import PriceField from "@components/fields/PriceField";
import SelectField from "@components/fields/SelectField";
import Row from "@components/visual/Row";
import Button from "@components/Button";

import { CreditCard } from "@models";
import getRepositories from "@repositories";

const CreditCardScreenForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [limit, setLimit] = useState(0);
  const [accountId, setAccountId] = useState("");
  const [closingDay, setClosingDay] = useState(1);
  const [dueDay, setDueDay] = useState(1);

  useEffect(() => {
    if (id) {
      const card = getRepositories().creditCards.getLocalById(id);
      if (card) {
        setName(card.name);
        setBrand(card.brand);
        setLimit(card.limit);
        setAccountId(card.accountId);
        setClosingDay(card.closingDay);
        setDueDay(card.dueDay);
      }
    }
  }, [id]);

  const saveCard = async () => {
    if (name.trim() === "" || accountId.trim() === "") {
      alert(Lang.commons.fillAllFields);
      return;
    }

    const card = new CreditCard(
      id || "",
      name,
      limit,
      brand,
      accountId,
      closingDay,
      dueDay,
      false
    );

    await getRepositories().creditCards.set(card);
    alert(id ? Lang.creditcards.creditCardUpdated : Lang.creditcards.creditCardCreated);
    navigate(-1);
  };

  const dayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }));

  const accountOptions = getRepositories().accounts
    .getCache()
    .map((account) => ({ value: account.id, label: account.name }));

  return (
    <ModalScreen
      title={id ? `${Lang.creditcards.editCreditCard} - ${name}` : Lang.creditcards.addCreditCard}
    >
      <Field label={Lang.creditcards.cardName} value={name} onChange={setName} />
      <Field label={Lang.creditcards.brand} value={brand} onChange={setBrand} />
      <PriceField label={Lang.creditcards.limit} price={limit} onChange={setLimit} />
      <SelectField
        label={Lang.creditcards.account}
        value={accountId}
        onChange={setAccountId}
        options={accountOptions}
      />
      <SelectField<number>
        label={Lang.creditcards.closingDay}
        value={closingDay}
        onChange={setClosingDay}
        options={dayOptions}
      />
      <SelectField<number>
        label={Lang.creditcards.dueDay}
        value={dueDay}
        onChange={setDueDay}
        options={dayOptions}
      />
      <Row>
        <Button text={Lang.commons.cancel} onClick={() => navigate(-1)} />
        <Button
          text={Lang.commons.save}
          disabled={name.trim() === "" || accountId.trim() === ""}
          onClick={saveCard}
        />
      </Row>
    </ModalScreen>
  );
};

export default CreditCardScreenForm;
