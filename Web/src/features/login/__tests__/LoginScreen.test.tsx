import { render, screen } from '@testing-library/react';
import LoginScreen from '../LoginScreen';

test('shows login buttons', () => {
  render(<LoginScreen />);

  expect(screen.getByText(Lang.login.loginWithGoogle)).toBeInTheDocument();
  expect(screen.getByText(Lang.login.loginWithApple)).toBeInTheDocument();
});
