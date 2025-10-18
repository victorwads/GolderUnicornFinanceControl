import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Container, ContainerFixedContent } from "@componentsDeprecated/conteiners";

import TimelineOfxImport from "./TimelineOfxImport";

const TimelineImportScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultAccountId = searchParams.get("account") ?? undefined;
  const defaultCardId = searchParams.get("card") ?? undefined;

  const exitScreen = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <Container spaced>
      <ContainerFixedContent>
        <TimelineOfxImport
          isOpen
          onClose={exitScreen}
          onImported={exitScreen}
          defaultAccountId={defaultAccountId}
          defaultCardId={defaultCardId}
        />
      </ContainerFixedContent>
    </Container>
  );
};

export default TimelineImportScreen;
