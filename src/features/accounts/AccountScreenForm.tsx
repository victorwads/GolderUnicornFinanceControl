import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ModalScreen } from "../../components/conteiners/ModalScreen";
import PriceField from "../../components/fields/PriceField";
import Button from "../../components/Button";
import Field from "../../components/fields/Field";
import Row from "../../components/visual/Row";
import BankSelector from "../banks/BankSelector";
import SelectField from "../../components/fields/SelectField";
import CheckboxField from "../../components/fields/CheckboxField";

import Bank from "../../data/models/Bank";
import getRepositories from "../../data/repositories";
import Account, { AccountType } from "../../data/models/Account";

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
      alert("Preencha todos os campos");
      return;
    }

    const account = new Account(
      id || "", name, saldoInicial, bank.id, accountType, false, accountColor, includeInTotal
    );

    getRepositories().accounts.set(account);
    alert(id ? "Conta atualizada com sucesso" : "Conta criada com sucesso");
    navigate(-1);
  };

  return <ModalScreen title={id ? "Edit Account" : "Add Account"}>
    <Field label={"Nome da Conta"} value={name} onChange={setName} />
    <BankSelector bank={bank} onChange={bank => setBank(bank)} />
    <PriceField label={"Saldo Inicial"} price={saldoInicial} onChange={setSaldoInicial} />
    <SelectField
      label="Tipo da Conta"
      value={accountType}
      onChange={setAccountType}
      options={[
        { value: AccountType.CURRENT, label: "Corrente" },
        { value: AccountType.SAVINGS, label: "Poupança" },
        { value: AccountType.INVESTMENT, label: "Investimento" },
        { value: AccountType.CASH, label: "Dinheiro" },
      ]}
    />
    <Field label={"Cor da Conta"} value={accountColor} onChange={setAccountColor} />
    <CheckboxField
      label="Incluir no Total"
      checked={includeInTotal}
      onChange={setIncludeInTotal}
    />

    <Row>
      <Button text="Cancelar" onClick={() => navigate(-1)} />
      <Button
        text="Salvar"
        disabled={name.trim() == "" || bank == null}
        onClick={saveAccount}
      />
    </Row>
  </ModalScreen>
};

export default AccountScreenForm;
