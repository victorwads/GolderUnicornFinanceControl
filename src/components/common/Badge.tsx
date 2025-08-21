import { ReactNode } from 'react';
import './Badge.css';

interface BadgeProps {
  children: ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ children }) => (
  <span className="Badge">{children}</span>
);

export default Badge;
