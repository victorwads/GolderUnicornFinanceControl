import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModalScreen } from "../../components/conteiners/ModalScreen";
import Field from "../../components/fields/Field";
import PriceField from "../../components/fields/PriceField";
import SelectField from "../../components/fields/SelectField";
import CheckboxField from "../../components/fields/CheckboxField";
import Button from "../../components/Button";
import AccountsRegistry from "../../data/models/AccountRegistry";
import getRepositories from "../../data/repositories";

const AddRegistryScreen = () => {
  const [description, setDescription] = useState("");
  const [value, setValue] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [paid, setPaid] = useState(false);
  const [accountId, setAccountId] = useState("");
  const navigate = useNavigate();

  const saveRegistry = async () => {
    if (description.trim() === "" || value === 0 || accountId === "") {
      alert(Lang.commons.fillAllFields);
      return;
    }

    const registry = new AccountsRegistry(
      "",
      accountId,
      value,
      description,
      new Date(date),
      paid
    );

    await getRepositories().accountsRegistry.addRegistry(registry);
    alert(Lang.accounts.registryAdded);
    navigate(-1);
  };

  return (
    <ModalScreen title={Lang.accounts.addRegistry}>
      <Field label={Lang.accounts.description} value={description} onChange={setDescription} />
      <PriceField label={Lang.accounts.value} price={value} onChange={setValue} />
      <Field label={Lang.accounts.date} value={date} onChange={setDate} />
      <SelectField
        label={Lang.accounts.account}
        value={accountId}
        onChange={setAccountId}
        options={getRepositories().accounts.getCache().map(account => ({
          value: account.id,
          label: account.name
        }))}
      />
      <CheckboxField label={Lang.accounts.paid} checked={paid} onChange={setPaid} />
      <div>
        <Button text={Lang.commons.cancel} onClick={() => navigate(-1)} />
        <Button text={Lang.commons.save} onClick={saveRegistry} />
      </div>
    </ModalScreen>
  );
};

export default AddRegistryScreen;
