import { useState } from "react";

import Button from "../../components/Button";
import Field from "../../components/fields/Field";
import PriceField from "../../components/fields/PriceField";
import Row from "../../components/visual/Row";
import BankSelector from "../banks/BankSelector";
import Bank from "../../data/models/Bank";

const AddAccountScreen = () => {
  const [name, setName] = useState("");
  const [bank, setBank] = useState<Bank | undefined>();
  const [saldoInicial, setSaldoInicial] = useState(0);

  return (
    <div className="Screen">
      <h2>AddAccountScreen</h2>
      <Field label={"Nome da Conta"} value={name} onChange={setName} />
      <BankSelector bank={bank} onChange={bank => setBank(bank)} />
      <PriceField label={"Saldo Inicial"} price={saldoInicial} onChange={setSaldoInicial} />

      <div style={{ height: 20 }}></div>
      <h3> To Do:</h3>
      <div>- Tipo da Conta</div>
      <div>- Cor da Conta</div>

      <Row>
        <Button text="Cancelar" />
        <Button
          text="Salvar"
          disabled={name.trim() == "" || bank == null}
        />
      </Row>
    </div>
  );
};

export default AddAccountScreen;
