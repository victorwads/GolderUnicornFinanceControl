import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import './CategoriesScreen.css';
import { ModalScreen } from '@components/conteiners/ModalScreen';
import Icon, { getIconByCaseInsensitiveName } from '@components/Icons';
import getRepositories from '@repositories';
import { RootCategory } from '@repositories/CategoriesRepository';
import CategoryListItem from './CategoryListItem';

const CategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState<RootCategory[]>([]);

  useEffect(() => {
    const { categories } = getRepositories();
    setCategories(categories.getAllRoots());
  }, []);

  return <ModalScreen title={Lang.categories.title}>
      <ul className="categories-list">
        {categories.map((category) => (
          <li key={category.id} className="category-item">
            <CategoryListItem category={category} />
            <ul className="subcategories-list">
              {category.children.map((child) => (
                <li key={child.id} className="subcategory-item">
                  <CategoryListItem category={child} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <Link to="/categories/create" className="add-category-button">
        {Lang.categories.addCategory}
      </Link>
  </ModalScreen>;
};

export default CategoriesScreen;
