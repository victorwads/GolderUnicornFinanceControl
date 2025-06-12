import React from 'react';
import Icon, { getIconByCaseInsensitiveName } from '@components/Icons';
import Category from '@model/Category';

interface CategoryListItemProps {
  category: Category;
  selected?: boolean;
  onClick?: () => void;
}

const CategoryListItem: React.FC<CategoryListItemProps> = ({ category, selected, onClick }) => (
  <div
    className={`category-info${selected ? ' selected' : ''}`}
    style={{ display: 'flex', alignItems: 'center', cursor: onClick ? 'pointer' : undefined}}
    onClick={onClick}
    tabIndex={onClick ? 0 : -1}
    role={onClick ? 'option' : undefined}
    aria-selected={selected}
  >
    <span
      className="category-color IconBall"
      style={{ backgroundColor: category.color || '#ccc', marginRight: 8 }}
    >
      <Icon icon={getIconByCaseInsensitiveName(category.icon || "")} size="1x" />
    </span>
    {category.name}
  </div>
);

export default CategoryListItem;
