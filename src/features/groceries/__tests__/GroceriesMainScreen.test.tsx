import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import GroceriesMainScreen from '../GroceriesMainScreen';
import { GroceryItemModel } from '../../../data/models/GroceryItemModel';

vi.stubEnv('VITE_MOD_K', btoa(''));
vi.stubEnv('VITE_MOD_P', btoa(''));
vi.stubEnv('VITE_MOD_O', btoa(''));

let items: GroceryItemModel[] = [];

vi.mock('@repositories', () => ({
  default: () => ({ groceries: { getCache: () => items } }),
}));

test('renders grocery items from repository', () => {
  items = [
    new GroceryItemModel('1', 'Rice', 1),
    new GroceryItemModel('2', 'Beans', 2),
  ];

  render(
    <MemoryRouter>
      <GroceriesMainScreen />
    </MemoryRouter>
  );

  expect(screen.getByText('Rice')).toBeInTheDocument();
  expect(screen.getByText('Beans')).toBeInTheDocument();
});

test('shows correct expiration labels based on date', () => {
  const now = new Date();
  const day = 1000 * 60 * 60 * 24;
  items = [
    new GroceryItemModel('1', 'Expired Item', 1, false, undefined, new Date(now.getTime() - day)),
    new GroceryItemModel('2', 'Soon Item', 1, false, undefined, new Date(now.getTime() + 2 * day)),
    new GroceryItemModel('3', 'Week Item', 1, false, undefined, new Date(now.getTime() + 5 * day)),
    new GroceryItemModel('4', 'Month Item', 1, false, undefined, new Date(now.getTime() + 20 * day)),
    new GroceryItemModel('5', 'Valid Item', 1, false, undefined, new Date(now.getTime() + 40 * day)),
  ];

  render(
    <MemoryRouter>
      <GroceriesMainScreen />
    </MemoryRouter>
  );

  expect(screen.getByText(Lang.groceries.expired)).toBeInTheDocument();
  expect(screen.getByText(Lang.groceries.expiringSoon)).toBeInTheDocument();
  expect(screen.getByText(Lang.groceries.thisWeek)).toBeInTheDocument();
  expect(screen.getByText(Lang.groceries.thisMonth)).toBeInTheDocument();
  expect(screen.getByText(Lang.groceries.valid)).toBeInTheDocument();
});
