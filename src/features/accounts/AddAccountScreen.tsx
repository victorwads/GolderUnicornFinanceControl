import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ModalScreen } from "../../components/conteiners/ModalScreen";
import PriceField from "../../components/fields/PriceField";
import BankSelector from "../banks/BankSelector";
import Button from "../../components/Button";
import Field from "../../components/fields/Field";
import Row from "../../components/visual/Row";

import Bank from "../../data/models/Bank";
import Account, { AccountType } from "../../data/models/Account";
import AccountsRepository from "../../data/repositories/AccountsRepository";

const AddAccountScreen = () => {
  const [name, setName] = useState("");
  const [bank, setBank] = useState<Bank | undefined>();
  const [saldoInicial, setSaldoInicial] = useState(0);
  const navigate = useNavigate();

  const createAccount = async () => {
    if (name.trim() === "" || bank === undefined) {
      alert("Preencha todos os campos");
      return;
    }
    const account = new Account(
        "", name, saldoInicial, bank.id, AccountType.CURRENT
    );
    
    await new AccountsRepository().set(account);
    alert("Conta criada com sucesso");
    navigate(-1);
  };

  return <ModalScreen title="Add Account">
    <Field label={"Nome da Conta"} value={name} onChange={setName} />
    <BankSelector bank={bank} onChange={bank => setBank(bank)} />
    <PriceField label={"Saldo Inicial"} price={saldoInicial} onChange={setSaldoInicial} />

    <div style={{ height: 20 }}></div>
    <h3> To Do:</h3>
    <div>- Tipo da Conta</div>
    <div>- Cor da Conta</div>

    <Row>
      <Button text="Cancelar" onClick={() => navigate(-1)} />
      <Button
        text="Salvar"
        disabled={name.trim() == "" || bank == null}
        onClick={createAccount}
      />
    </Row>
  </ModalScreen>
};

export default AddAccountScreen;
