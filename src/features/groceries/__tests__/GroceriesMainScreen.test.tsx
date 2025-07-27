import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import GroceriesMainScreen from '../GroceriesMainScreen';
import { GroceryItemModel, QuantityUnit } from '../../../data/models/GroceryItemModel';

const items = [
  new GroceryItemModel('1', 'Rice', 1, QuantityUnit.UN),
  new GroceryItemModel('2', 'Beans', 2, QuantityUnit.UN),
];

vi.mock('../expirationUtils', () => ({ getExpirationLabel: () => undefined }));
vi.mock('@repositories', () => ({ default: () => ({ groceries: { getAllSorted: () => items } }) }));

test('renders grocery items from repository', () => {
  render(
    <MemoryRouter>
      <GroceriesMainScreen />
    </MemoryRouter>
  );

  expect(screen.getByText('Rice')).toBeInTheDocument();
  expect(screen.getByText('Beans')).toBeInTheDocument();
});
