import './Containers.css'
import { ReactNode, Children, isValidElement, useRef, useState, useLayoutEffect, useEffect, UIEvent, Ref } from 'react';
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
  /** Ativa auto-scroll (grudar ao final quando já estiver no final). Desligado por padrão. */
  autoScroll?: boolean;
}

export function ContainerFixedContent({ children, spaced }: ContainerContentProps) {
  return <div className={clsx("container-content fixed-deprecated", { spaced })}>
    {children}
  </div>;
}
ContainerFixedContent.displayName = 'ContainerFixedContent';

export function ContainerScrollContent({ children, spaced, autoScroll = false }: ContainerContentProps) {
  // Se autoScroll desativado, render simples
  if (!autoScroll) {
    return <div className={clsx("container-content scroll", { spaced })}>{children}</div>;
  }

  const ref = useRef<HTMLDivElement | null>(null);
  const [stickToBottom, setStickToBottom] = useState(false); // assume inicia no final
  const THRESHOLD_PX = 48; // tolerância para considerar "quase no final"

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setStickToBottom(distanceFromBottom < THRESHOLD_PX);
  };

  // Primeira render: posiciona direto no fim sem animação para evitar salto visual
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, []);

  // Atualizações: usa animação nativa (smooth) sem animação manual custom
  useEffect(() => {
    if (!stickToBottom || !ref.current) return;
    try {
      ref.current.scrollTo({ top: ref.current.scrollHeight * 2, behavior: 'smooth' });
    } catch {
      // fallback sem erro crítico
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [children, stickToBottom]);

  return <div
    ref={ref}
    onScroll={handleScroll}
    data-autoscroll={stickToBottom ? 'stick' : 'free'}
    className={clsx("container-content scroll", { spaced })}>
    {children}
  </div>;
}
ContainerScrollContent.displayName = 'ContainerScrollContent';
