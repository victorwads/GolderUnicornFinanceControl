import React, { useState } from "react";
import Row from "../../components/visual/Row";
import Button from "../../components/Button";
import Field from "../../components/fields/Field";
import SelectField from "../../components/fields/SelectField";
import { ModalScreen } from "../../components/conteiners/ModalScreen";
import getRepositories from "../../data/repositories";
import Category from "../../data/models/Category";

const AddCategoriesScreen: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [parentCategory, setParentCategory] = useState<string | undefined>(undefined);

  const handleAddCategory = async () => {
    if (name.trim() === "") {
      alert(Lang.commons.fillAllFields);
      return;
    }

    const newCategory = new Category("", name, undefined, undefined, parentCategory);
    await getRepositories().categories.set(newCategory);
    alert(Lang.categories.categoryCreated);
  };

  const rootCategories = getRepositories().categories.getAllRoots().map(category => ({
    value: category.id,
    label: category.name,
  }));

  return <ModalScreen title={Lang.categories.addCategory}>
    <Field
      label={Lang.categories.categoryName}
      value={name}
      onChange={(value) => setName(value)}
    />
    <SelectField
      label={Lang.categories.parentCategory}
      value={parentCategory}
      onChange={setParentCategory}
      options={rootCategories}
    />
    <Row>
      <Button text={Lang.commons.cancel} />
      <Button text={Lang.commons.save} disabled={name.trim() == ""} onClick={handleAddCategory} />
    </Row>
  </ModalScreen>;
};

export default AddCategoriesScreen;
