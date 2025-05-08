import './Containers.css'
import { ReactNode, Children, isValidElement } from 'react';
import clsx from 'clsx';

interface ContainerProps {
  children: ReactNode;
  wide?: boolean;
  spaced?: boolean;
}

const containerContentTypes = [
  'ContainerFixedContent', 'ContainerScrollContent',
];

export function Container({ children, wide = false, spaced = false }: ContainerProps) {
  Children.forEach(children, child => {
    const name = (child as any)?.type?.displayName;
    if (isValidElement(child) && !containerContentTypes.includes(name)) {
      throw Error(`Container only accepts ContainerFixedContent or ContainerScrollContent as children, but received: '${name}'`);
    }
  });

  return <div className={clsx('container', {
    'wide': wide,
    'spaced': spaced,
  })}>{children}</div>;
}

interface ContainerContentProps {
  children: ReactNode;
}

export function ContainerFixedContent({ children }: ContainerContentProps) {
  return <div className="container fixed">{children}</div>;
}
ContainerFixedContent.displayName = 'ContainerFixedContent';

export function ContainerScrollContent({ children }: ContainerContentProps) {
  return <div className="container scroll">{children}</div>;
}
ContainerScrollContent.displayName = 'ContainerScrollContent';