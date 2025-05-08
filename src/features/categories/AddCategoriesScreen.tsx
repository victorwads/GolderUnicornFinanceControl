import React, { useState } from "react";
import Row from "../../components/visual/Row";
import Button from "../../components/Button";
import Field from "../../components/fields/Field";

const AddCategoriesScreen: React.FC = () => {
  const [name, setName] = useState<string>("");

  const handleAddCategory = () => {
    // Implemente o código para adicionar a subcategoria aqui
  };

  return (
    <div>
      <h2>Adicionar Categoria</h2>
      <Field
        label="Nome da Categoria"
        value={name}
        onChange={(value) => setName(value)}
      />
      <Row>
        <Button text="Cancelar" />
        <Button text="Salvar" disabled={name.trim() == ""} />
      </Row>
    </div>
  );
};

export default AddCategoriesScreen;
