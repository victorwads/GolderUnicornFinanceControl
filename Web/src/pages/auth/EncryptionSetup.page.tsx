import EncryptionSetup from "@layouts/auth/EncryptionSetup";
import { User } from "@repositories";
import { useEncryptionSetupModel } from "./EncryptionSetup.model";
import type { Progress } from "../../data/crypt/progress";

type EncryptionSetupPageProps = {
  user: User;
  onCompleted: () => void;
  onProgress?: (progress: Progress | null) => void;
};

export default function EncryptionSetupPage(props: EncryptionSetupPageProps) {
  const model = useEncryptionSetupModel(props);
  return <EncryptionSetup model={model} />;
}
