import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import Button from "@components/Button";
import { ModalScreen } from "@components/conteiners/ModalScreen";
import CheckboxField from "@components/fields/CheckboxField";
import Field from "@components/fields/Field";
import { DatePicker } from "@components/inputs";
import PriceField from "@components/fields/PriceField";
import Selector, { SelectorSection } from "@components/Selector";

import { AccountsRegistry, RegistryType, Category} from "@models";
import getRepositories from "@repositories";

import BankInfo from "../banks/BankInfo";
import CategoryListItem from "../categories/CategoryListItem";

const RegistryScreenForm = () => {
  const { id } = useParams();
  const accounts = getRepositories().accounts.getCache();
  const categorySections = getRepositories().categories
    .getAllRoots().map((root): SelectorSection<Category> => ({
      section: root,
      options: root.children,
      selectable: true
    }));
  const registry = useMemo(() => {
    if (!id) return undefined;
    return getRepositories().accountRegistries.getLocalById(id);
  }, [id]);

  const [description, setDescription] = useState("");
  const [value, setValue] = useState(0);
  const [date, setDate] = useState<Date | null>(new Date());
  const [paid, setPaid] = useState(false);
  const [accountId, setAccountId] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (id) return;

    const categoryIdParam = searchParams.get('category');
    if (categoryIdParam) setCategoryId(categoryIdParam);

    const accountIdParam = searchParams.get('account');
    if (accountIdParam) setAccountId(accountIdParam);
  }, [id, searchParams]);

  useEffect(() => {
    if (id) {
      const registry = getRepositories().accountRegistries.getCache().find((r: AccountsRegistry) => r.id === id);
      if (registry) {
        setDescription(registry.description);
        setValue(registry.value);
        setDate(registry.date);
        setPaid(registry.paid);
        setAccountId(registry.accountId);
        setCategoryId(registry.categoryId);
      }
    }
  }, [id]);

  const saveRegistry = async () => {
    if (description.trim() === "" || value === 0 || !accountId || accountId === "") {
      alert(Lang.commons.fillAllFields);
      return;
    }

    const newRegistry = new AccountsRegistry(
      id || "",
      registry?.type ?? RegistryType.ACCOUNT,
      accountId,
      value,
      description,
      registry?.date ?? (date ?? new Date()),
      paid || registry?.type === RegistryType.TRANSFER,
      registry?.tags ?? [],
      categoryId
    );

    if (id) {
      await getRepositories().accountRegistries.editRegistry(newRegistry);
      alert(Lang.registry.messages.saved);
    } else {
      await getRepositories().accountRegistries.addRegistry(newRegistry);
      alert(Lang.registry.messages.saved);
    }
    navigate(-1);
  };

  const isTransfer = registry?.type === RegistryType.TRANSFER;

  return (
    <ModalScreen title={Lang.registry.title}>
      <Field
        disabled={isTransfer} label={Lang.registry.description} value={description}
        onChange={setDescription} />
      <PriceField label={Lang.registry.value} price={value} onChange={setValue} />
      <DatePicker label={Lang.registry.date} value={date} onChange={setDate} />
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
      {!isTransfer && <>
      <Selector
        label={Lang.categories.title}
        value={categoryId}
        sections={categorySections}
        getInfo={option => ({ label: option.name, value: option.id })}
        onChange={option => setCategoryId(option.id)}
        renderOption={(option, selected) => 
          <CategoryListItem category={option} selected={selected} />
        }
        renderSection={(section, selected) => 
          <CategoryListItem category={section.section!} selected={selected} />
        }
      />
      <CheckboxField label={Lang.registry.paid} checked={paid} onChange={setPaid} />
      </>}
      <div>
        <Button text={Lang.commons.cancel} onClick={() => navigate(-1)} />
        <Button text={Lang.commons.save} onClick={saveRegistry} />
      </div>
    </ModalScreen>
  );
};

export default RegistryScreenForm;
