import EncryptionUnlock from "@layouts/auth/EncryptionUnlock";
import { User } from "@repositories";
import { useEncryptionUnlockModel } from "./EncryptionUnlock.model";
import type { Progress } from "../../data/crypt/progress";

type EncryptionUnlockPageProps = {
  user: User;
  onCompleted: () => void;
  onProgress?: (progress: Progress | null) => void;
};

export default function EncryptionUnlockPage(props: EncryptionUnlockPageProps) {
  const model = useEncryptionUnlockModel(props);
  return <EncryptionUnlock model={model} />;
}
