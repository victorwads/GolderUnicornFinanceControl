import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import Button from "@components/Button";
import { ModalScreen } from "@components/conteiners/ModalScreen";
import Field from "@components/fields/Field";
import PriceField from "@components/fields/PriceField";
import { DatePicker } from "@components/inputs";
import Selector, { SelectorSection } from "@components/Selector";

import { CreditCardRegistry, Category } from "@models";
import getRepositories from "@repositories";

import CategoryListItem from "../categories/CategoryListItem";
import BankInfo from "@features/banks/BankInfo";

const CreditCardRegistryScreen = () => {
  const { id } = useParams();
  const { card } = useSearchParams();
  const navigate = useNavigate();

  const creditCards = getRepositories().creditCards.getCacheWithBank();
  const categorySections = getRepositories().categories
    .getAllRoots()
    .map((root): SelectorSection<Category> => ({
      section: root,
      options: root.children,
      selectable: true,
    }));

  const registry = useMemo(() => {
    if (!id) return undefined;
    return getRepositories().creditCardsRegistries.getLocalById(id);
  }, [id]);

  const [description, setDescription] = useState("");
  const [value, setValue] = useState(0);
  const [date, setDate] = useState<Date | null>(new Date());
  const [cardId, setCardId] = useState<string | undefined>(card);
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const [searchParams] = useSearchParams();
  useEffect(() => {
    if (id) return;
    const cardParam = searchParams.get("card");
    if (cardParam) setCardId(cardParam);
    else if (creditCards.length > 0) setCardId(creditCards[0].id);

    const categoryParam = searchParams.get("category");
    if (categoryParam) setCategoryId(categoryParam);
  }, [id, searchParams, creditCards]);

  useEffect(() => {
    if (!registry) return;
    setDescription(registry.description);
    setValue(registry.value);
    setDate(registry.date);
    setCardId(registry.cardId);
    setCategoryId(registry.categoryId);
  }, [registry]);

  const selectedCard = useMemo(() => creditCards.find(c => c.id === cardId), [creditCards, cardId]);

  const invoiceInfo = useMemo(() => {
    if (!selectedCard || !date) return null;
    const invoiceDate = new Date(date);
    if (invoiceDate.getDate() > selectedCard.closingDay) {
      invoiceDate.setMonth(invoiceDate.getMonth() + 1);
    }
    return { month: invoiceDate.getMonth() + 1, year: invoiceDate.getFullYear() };
  }, [selectedCard, date]);

  const saveRegistry = async () => {
    if (description.trim() === "" || value === 0 || !cardId) {
      alert(Lang.commons.fillAllFields);
      return;
    }
    const card = creditCards.find(c => c.id === cardId)!;
    const { month, year } = invoiceInfo || {
      month: date?.getMonth() ?? 0,
      year: date?.getFullYear() ?? 0,
    };
    const newRegistry = new CreditCardRegistry(
      id || "",
      card.id,
      month,
      year,
      date ?? new Date(),
      description,
      value,
      [],
      categoryId
    );
    if (id) {
      await getRepositories().creditCardsRegistries.editRegistry(newRegistry);
    } else {
      await getRepositories().creditCardsRegistries.addRegistry(newRegistry);
    }
    alert(Lang.registry.messages.saved);
    navigate(-1);
  };

  return (
    <ModalScreen title={Lang.registry.title}>
      <Field label={Lang.registry.description} value={description} onChange={setDescription} />
      <PriceField label={Lang.registry.value} price={value} onChange={setValue} />
      <DatePicker label={Lang.registry.date} value={date} onChange={setDate} />
      <Selector
        label={Lang.creditcards.title}
        value={cardId}
        sections={[{ options: creditCards }]}
        getInfo={option => ({ label: option.name, value: option.id })}
        onChange={option => setCardId(option.id)}
        renderOption={(option, selected) => 
          <BankInfo bank={option.bank} />
        }
      />
      <Selector
        label={Lang.categories.title}
        value={categoryId}
        sections={categorySections}
        getInfo={option => ({ label: option.name, value: option.id })}
        onChange={option => setCategoryId(option.id)}
        renderOption={(option, selected) => (
          <CategoryListItem category={option} selected={selected} />
        )}
        renderSection={(section, selected) => (
          <CategoryListItem category={section.section!} selected={selected} />
        )}
      />
      {invoiceInfo && (
        <div style={{ marginTop: "1em" }}>
          {Lang.creditcards.selectedInvoice}: {invoiceInfo.month}/{invoiceInfo.year}
        </div>
      )}
      <div>
        <Button text={Lang.commons.cancel} onClick={() => navigate(-1)} />
        <Button text={Lang.commons.save} onClick={saveRegistry} />
      </div>
    </ModalScreen>
  );
};

export default CreditCardRegistryScreen;

