import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import CategoriesRepository, { RootCategory } from '../../data/repositories/CategoriesRepository';
import './CategoriesScreen.css';

const CategoriesScreen: React.FC = () => {
  const [categories, setCategories] = useState<RootCategory[]>([]);

  useEffect(() => {
    const categories = new CategoriesRepository();
    categories.getAllRoots().then((categories) => {
      setCategories(categories);
    });
  }, []);

  return (
    <div className="categories-screen">
      <h2 className="categories-title">Categorias</h2>
      <ul className="categories-list">
        {categories.map((category) => (
          <li key={category.id} className="category-item">
            <div className="category-info">
              <span
                className="category-color"
                style={{ backgroundColor: category.color || '#ccc' }}
              ></span>
              {category.name}
            </div>
            <ul className="subcategories-list">
              {category.children.map((child) => (
                <li key={child.id} className="subcategory-item">
                  <div className="category-info">
                    <span
                      className="category-color"
                      style={{ backgroundColor: child.color || '#ccc' }}
                    ></span>
                    {child.name}
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
    </div>
  );
};

export default CategoriesScreen;