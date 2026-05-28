import CreateWishlistItem from "@layouts/wishlist/CreateWishlistItem";
import { useCreateWishlistItemModel } from "./CreateWishlistItem.model";

export default function CreateWishlistItemPage() {
  const model = useCreateWishlistItemModel();
  return <CreateWishlistItem model={model} />;
}
