import './Containers.css'
import { ReactNode, Children, isValidElement } from 'react';
import clsx from 'clsx';

interface ContainerProps {
  children: ReactNode;
  wide?: boolean;
  spaced?: boolean;
  screen?: boolean;
  full?: boolean;
  className?: string;
}

const containerContentTypes = [
  'ContainerFixedContent', 'ContainerScrollContent',
];

export function Container({ children, wide = false, spaced = false, screen = false, full = false, className }: ContainerProps) {
  Children.forEach(children, child => {
    const name = (child as any)?.type?.displayName;
    if (isValidElement(child) && !containerContentTypes.includes(name)) {
      throw Error(`Container only accepts ContainerFixedContent or ContainerScrollContent as children, but received: '${name}'`);
    }
  });

  return <div className={clsx('container', className, {
    'wide': wide,
    'spaced': spaced,
    'screen': screen,
    'full': full,
  })}>{children}</div>;
}

interface ContainerContentProps {
  children: ReactNode;
  spaced?: boolean;
}

export function ContainerFixedContent({ children, spaced }: ContainerContentProps) {
  return <div className={clsx("container-content fixed", { spaced })}>
    {children}
  </div>;
}
ContainerFixedContent.displayName = 'ContainerFixedContent';

export function ContainerScrollContent({ children, spaced }: ContainerContentProps) {
  return <div className={clsx("container-content scroll", { spaced })}>
    {children}
  </div>;
}
ContainerScrollContent.displayName = 'ContainerScrollContent';