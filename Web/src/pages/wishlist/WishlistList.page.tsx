import WishlistList from "@layouts/wishlist/WishlistList";
import { useWishlistListModel } from "./WishlistList.model";

export default function WishlistListPage() {
  const model = useWishlistListModel();
  return <WishlistList model={model} />;
}
