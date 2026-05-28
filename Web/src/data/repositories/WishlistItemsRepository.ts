import RepositoryWithCrypt from './RepositoryWithCrypt';

import { Collections } from "../firebase/Collections";
import { WishlistItem } from '@models';

export default class WishlistItemsRepository extends RepositoryWithCrypt<WishlistItem> {
  constructor() {
    super(
      "Wishlist Item",
      `${Collections.Users}/{userId}/${Collections.WishlistItems}`,
      WishlistItem,
    );
  }
}
