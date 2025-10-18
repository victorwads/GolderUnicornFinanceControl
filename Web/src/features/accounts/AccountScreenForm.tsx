import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ModalScreen } from "@componentsDeprecated/conteiners/ModalScreen";
import PriceField from "@componentsDeprecated/fields/PriceField";
import Button from "@componentsDeprecated/Button";
import Field from "@componentsDeprecated/fields/Field";
import Row from "@componentsDeprecated/visual/Row";
import Selector from "@componentsDeprecated/Selector";
import SelectField from "@componentsDeprecated/fields/SelectField";
import CheckboxField from "@componentsDeprecated/fields/CheckboxField";
import BankInfo from "@features/banks/BankInfo";

import { Bank, Account, AccountType } from "@models";
import getRepositories from "@repositories";

const AccountScreenForm = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [bank, setBank] = useState<Bank | undefined>();
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [accountType, setAccountType] = useState<AccountType>(AccountType.CURRENT);
  const [accountColor, setAccountColor] = useState<string>("");
  const [includeInTotal, setIncludeInTotal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const account = getRepositories().accounts.getLocalById(id);
      if (account) {
        setName(account.name);
        setBank(getRepositories().banks.getLocalById(account.bankId));
        setSaldoInicial(account.initialBalance);
        setAccountType(account.type);
        setAccountColor(account.color || "");
        setIncludeInTotal(account.includeInTotal);
      }
    }
  }, [id]);

  const saveAccount = async () => {
    if (name.trim() === "" || bank === undefined) {
      alert(Lang.commons.fillAllFields);
      return;
    }

    const account = new Account(
      id || "", name, saldoInicial, bank.id, accountType, false, accountColor, includeInTotal
    );

    await getRepositories().accounts.set(account);
    alert(id ? Lang.accounts.accountUpdated : Lang.accounts.accountCreated);
    navigate(-1);
  };

  return <ModalScreen title={id ? Lang.accounts.editAccount + " - " + name : Lang.accounts.addAccount}>
    <Field label={Lang.accounts.accountName} value={name} onChange={setName} />
    <Selector
      label={Lang.accounts.bank}
      value={bank?.id}
      sections={[{ options: getRepositories().banks.getCache() }]}
      getInfo={option => ({ label: option.name, value: option.id })}
      onChange={option => setBank(option)}
      renderOption={option => <BankInfo bank={option} />}
      renderSection={undefined}
    />
    <PriceField label={Lang.accounts.initialBalance} price={saldoInicial} onChange={setSaldoInicial} />
    <SelectField
      label={Lang.accounts.types.label}
      value={accountType}
      onChange={setAccountType}
      options={[
        { value: AccountType.CURRENT, label: Lang.accounts.types.current },
        { value: AccountType.SAVINGS, label: Lang.accounts.types.savings },
        { value: AccountType.INVESTMENT, label: Lang.accounts.types.investment },
        { value: AccountType.CASH, label: Lang.accounts.types.cash },
      ]}
    />
    <Field label={Lang.accounts.accountColor} value={accountColor} onChange={setAccountColor} />
    <CheckboxField
      label={Lang.accounts.includeInTotal}
      checked={includeInTotal}
      onChange={setIncludeInTotal}
    />

    <Row>
      <Button text={Lang.commons.cancel} onClick={() => navigate(-1)} />
      <Button
        text={Lang.commons.save}
        disabled={name.trim() === "" || bank == null}
        onClick={saveAccount}
      />
    </Row>
  </ModalScreen>
};

export default AccountScreenForm;
