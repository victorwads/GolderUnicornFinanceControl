import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/Button";
import { ModalScreen } from "../../components/conteiners/ModalScreen";
import CheckboxField from "../../components/fields/CheckboxField";
import Field from "../../components/fields/Field";
import PriceField from "../../components/fields/PriceField";
import Selector, { SelectorSection } from "../../components/Selector";

import AccountsRegistry from "../../data/models/AccountRegistry";
import Category from "../../data/models/Category";
import { RegistryType } from "../../data/models/Registry";
import getRepositories from "../../data/repositories";

import BankInfo from "../banks/BankInfo";
import CategoryListItem from "../categories/CategoryListItem";

const AddRegistryScreen = () => {
  const accounts = getRepositories().accounts.getCache();
  const categorySections = getRepositories().categories
  .getAllRoots().map((root): SelectorSection<Category> => ({
    section: root,
    options: root.children,
    selectable: true
  }));

  const [description, setDescription] = useState("");
  const [value, setValue] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [paid, setPaid] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const saveRegistry = async () => {
    if (description.trim() === "" || value === 0 || accountId === "") {
      alert(Lang.commons.fillAllFields);
      return;
    }

    const registry = new AccountsRegistry(
      "",
      RegistryType.ACCOUNT,
      accountId,
      value,
      description,
      new Date(date),
      paid
    );

    await getRepositories().accountRegistries.addRegistry(registry);
    alert(Lang.registry.messages.saved);
    navigate(-1);
  };

  return (
    <ModalScreen title={Lang.registry.title}>
      <Field label={Lang.registry.description} value={description} onChange={setDescription} />
      <PriceField label={Lang.registry.value} price={value} onChange={setValue} />
      <Field label={Lang.registry.date} value={date} onChange={setDate} />
      <Selector
        label={Lang.registry.account}
        value={accountId}
        sections={[{ options: accounts }]}
        getInfo={option => ({ label: option.name, value: option.id })}
        onChange={option => setAccountId(option.id)}
        renderOption={(option) => {
          let bank: any = getRepositories().banks.getLocalById(option.bankId);
          return <BankInfo bank={{...bank, name: option.name}} />;
        }}
        renderSection={undefined}
      />
      <Selector
        label={Lang.categories.title}
        value={categoryId}
        sections={categorySections}
        getInfo={option => ({ label: option.name, value: option.id })}
        onChange={option => {
          console.log("Selected category:", option);
          setCategoryId(option.id)
        }}
        renderOption={(option, selected) => 
          <CategoryListItem category={option} selected={selected} />
        }
        renderSection={(section, selected) => 
          <CategoryListItem category={section.section!} selected={selected} />
        }
      />
      <CheckboxField label={Lang.registry.paid} checked={paid} onChange={setPaid} />
      <div>
        <Button text={Lang.commons.cancel} onClick={() => navigate(-1)} />
        <Button text={Lang.commons.save} onClick={saveRegistry} />
      </div>
    </ModalScreen>
  );
};

export default AddRegistryScreen;
