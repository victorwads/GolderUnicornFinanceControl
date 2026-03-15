import CreateCreditCard from "@layouts/credit-cards/CreateCreditCard";
import { useCreateCreditCardModel } from "./CreateCreditCard.model";

export default function CreateCreditCardPage() {
  const model = useCreateCreditCardModel();
  return <CreateCreditCard model={model} />;
}
