import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TabScreen from '../TabScreen';

test('renders navigation links', () => {
  render(
    <MemoryRouter initialEntries={['/']}> 
      <Routes>
        <Route path="/" element={<TabScreen />} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText(Lang.dashboard.title)).toBeInTheDocument();
  expect(screen.getByText(Lang.timeline.title)).toBeInTheDocument();
  expect(screen.getByText(Lang.groceries.title)).toBeInTheDocument();
  expect(screen.getByText(Lang.settings.title)).toBeInTheDocument();
});
