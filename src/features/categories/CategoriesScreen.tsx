import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import './CategoriesScreen.css';
import { ModalScreen } from '../../components/conteiners/ModalScreen';
import Icon, { getIconByCaseInsensitiveName } from '../../components/Icons';
import CategoriesRepository, { RootCategory } from '../../data/repositories/CategoriesRepository';

const CategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState<RootCategory[]>([]);

  useEffect(() => {
    const categories = new CategoriesRepository();
    categories.getAllRoots().then((categories) => {
      setCategories(categories);
    });
  }, []);

  return <ModalScreen title='Categorias'>
      <ul className="categories-list">
        {categories.map((category) => (
          <li key={category.id} className="category-item">
            <div className="category-info">
              <span
                className="category-color"
                style={{ backgroundColor: category.color || '#ccc' }}
              >
                <Icon icon={getIconByCaseInsensitiveName(category.icon || "")} size="xs" />
              </span>
              {category.name} - {category.id}
            </div>
            <ul className="subcategories-list">
              {category.children.map((child) => (
                <li key={child.id} className="subcategory-item">
                  <div className="category-info">
                    <span
                      className="category-color"
                      style={{ backgroundColor: child.color || '#ccc' }}
                    >
                      <Icon icon={getIconByCaseInsensitiveName(child.icon || "")} size="xs" />
                    </span>
                    {child.name} - {child.id} - {child.parentId}
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <Link to="/categories/create" className="add-category-button">
        Adicionar Categoria
      </Link>
  </ModalScreen>;
};

export default CategoriesScreen;