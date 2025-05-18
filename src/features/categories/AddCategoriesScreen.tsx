import React, { useState } from "react";
import Row from "../../components/visual/Row";
import Button from "../../components/Button";
import Field from "../../components/fields/Field";
import { ModalScreen } from "../../components/conteiners/ModalScreen";

const AddCategoriesScreen: React.FC = () => {
  const [name, setName] = useState<string>("");

  const handleAddCategory = () => {
    // Implemente o código para adicionar a subcategoria aqui
  };

  return <ModalScreen title="Adicionar Categoria">
    <Field
      label="Nome da Categoria"
      value={name}
      onChange={(value) => setName(value)}
    />
    <Row>
      <Button text="Cancelar" />
      <Button text="Salvar" disabled={name.trim() == ""} />
    </Row>
  </ModalScreen>;
};

export default AddCategoriesScreen;
