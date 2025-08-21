import { AIConfig } from "../speech/AIParserManager";
import { GroceryItemModel } from "@models";

export const AIGroceryListConfig: AIConfig = {
  listDescription: "lists of grocery and household items stored or to buy that are separated by the fields 'toBuy'",
  outputAditionalFieldsDescription: `
name: (pretty product description, optionally with weight, brand, flavor, etc)
quantity?: (integer of how many packages of the item)
location?: (where the item is stored)
purchaseDate?: (when the product was purchased if informed)
expirationDate?: string (when the products will expire)
paidPrice?: number
opened?: ( true if the package is in use or opened )
toBuy?: (true if the user needs to buy it, false otherwise)
`,
  outputExample: `
Context: there is no rice on list and he just bought it
User: "i've bought 2 packages with 2kg of rice and the beans are gone"
Assistant:
[{ "action": "add", "id": "d52aadfd1", "name": "rice 5kg", quantity: 2, toBuy: false },{ "action": "remove", "id": "beans" }]

Context: there is already a milk on list
User: "the milk on refrigerator expiry to Friday"
Assistant:
[{ "action": "update", "id": "milk", "expiryDate": "CALCULATED_DATE", location: "refrigerator" }]
`,
};

export const normalizer = (item: Partial<GroceryItemModel>) => {
  if (item.opened !== undefined) item.opened = String(item.opened) === "true";
  if (item.toBuy !== undefined) item.toBuy = String(item.toBuy) === "true";
  if (item.expirationDate !== undefined)
    item.expirationDate = new Date(item.expirationDate);
  return item;
};
