import type { Translation } from "../../core/types";

export default interface GroceriesModuleTranslation extends Translation {
  groceries: {
    title: string;
    addItem: string;
    editItem: string;
    name: string;
    barcode: string;
    expirationDate: string;
    quantity: string;
    unit: string;
    paidPrice: string;
    purchaseDate: string;
    storageLocation: string;
    scanBarcode: string;
    itemCreated: string;
    productCreated: string;
    expired: string;
    expiringSoon: string;
    thisWeek: string;
    thisMonth: string;
    valid: string;
  };
}
