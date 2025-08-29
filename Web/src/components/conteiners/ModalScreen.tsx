import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ModalScreen.css';

import { Container, ContainerFixedContent, ContainerScrollContent } from './';
import Icon from '../Icons';

interface ModalScreenProps {
  title?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
}

export function ModalScreen({ title, header, children }: ModalScreenProps) {
  const navigate = useNavigate();

  return <Container wide screen spaced className="modal-screen">
    <ContainerFixedContent>
      <div className="modal-screen-header">
        {title && <h1 className="modal-screen-title">{title}</h1>}
        <div className="spacer" />
        <button onClick={() => navigate(-1)} className="modal-back-button">
          <Icon icon={Icon.all.faClose} />
        </button>
      </div>
      {header}
    </ContainerFixedContent>
    <ContainerScrollContent spaced>{children}</ContainerScrollContent>
  </Container>
}