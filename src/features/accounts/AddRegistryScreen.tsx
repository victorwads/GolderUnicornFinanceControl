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
import { RegistryType } from "../../data/models/Registry";

const AddRegistryScreen = () => {
  const accounts = getRepositories().accounts.getCache();
  const [description, setDescription] = useState("");
  const [value, setValue] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [paid, setPaid] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
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
      <SelectField
        label={Lang.registry.account}
        value={accountId}
        onChange={setAccountId}
        options={accounts.map(account => ({
          value: account.id,
          label: account.name
        }))}
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
