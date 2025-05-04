import React, { useEffect, useState } from 'react';
import Category from '../../data/models/Category';
import CategoriesRepository from '../../data/repositories/CategoriesRepository';
import { Link } from 'react-router-dom';

const CategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  const categoriesRepository = new CategoriesRepository();

  useEffect(() => {
    // Carregar categorias do banco de dados aqui
  }, []);

  const handleAddCategory = async () => {
    if (newCategoryName) {
      const newCategory = new Category('', newCategoryName);
      await categoriesRepository.set(newCategory);
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
    }
  };

  return (
    <div>
      <h2>Categorias</h2>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul>
      <Link to="/categories/create">Adicionar</Link>
    </div>
  );
};

export default CategoriesScreen;
