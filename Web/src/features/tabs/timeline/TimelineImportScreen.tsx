import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Container, ContainerFixedContent } from "@components/conteiners";

import TimelineOfxImport from "./TimelineOfxImport";

const TimelineImportScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const defaultAccountId = searchParams.get("account") ?? undefined;
  const defaultCardId = searchParams.get("card") ?? undefined;
  const shouldAutoOpenFilePicker = searchParams.has("account") || searchParams.has("card");

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleImported = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <Container spaced>
      <ContainerFixedContent>
        <TimelineOfxImport
          isOpen
          onClose={handleClose}
          onImported={handleImported}
          defaultAccountId={defaultAccountId}
          defaultCardId={defaultCardId}
          autoOpenFilePicker={shouldAutoOpenFilePicker}
        />
      </ContainerFixedContent>
    </Container>
  );
};

export default TimelineImportScreen;
