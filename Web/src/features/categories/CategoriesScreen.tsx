import './CategoriesScreen.css';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { RootCategory } from '@models';
import getRepositories from '@repositories';

import { ModalScreen } from '@components/conteiners/ModalScreen';
import CategoryListItem from './CategoryListItem';
import { WithRepo } from '@components/WithRepo';


const CategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState<RootCategory[]>([]);

  const fetchCategories = useCallback(async () => {
    const repo = getRepositories().categories;
    setCategories(repo.getAllRoots());
    repo.addUpdatedEventListenner((repo) => {
      setCategories(repo.getAllRoots());
    });
  }, []);

  return <ModalScreen title={Lang.categories.title}><WithRepo names={['categories']} onReady={fetchCategories}>
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
  </WithRepo></ModalScreen>;
};

export default CategoriesScreen;
