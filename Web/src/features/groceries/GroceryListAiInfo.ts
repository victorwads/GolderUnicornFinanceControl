import { AIConfig } from "../speech/AIParserManager";
import { GroceryItemModel } from "@models";

export const AIGroceryListConfig: AIConfig = {
  listDescription: "lists of grocery and household items stored or to buy that are separated by the fields 'toBuy'",
  additionalFields: [
    {name: "name", description: "pretty product description, optionally with weight, brand, flavor, etc"},
    {name: "quantity", description: "integer of how many packages of the item", type: "number"},
    {name: "location", description: "when user mentions the place of the item is stored", type: "string"},
    {name: "purchaseDate", description: "when the product was purchased if informed"},
    {name: "expirationDate", description: "when the products will expire"},
    {name: "paidPrice", description: "how much was paid for the product", type: "number"},
    {name: "opened", description: "true if the package is in use or opened", type: "boolean"},
    {name: "toBuy", description: "true if the user explicitly says needs to buy it, false if explicitly says that already has it, otherwise omit the field", type: "boolean"},
  ]
};

export const normalizer = (item: Partial<GroceryItemModel>) => {
  if (item.opened !== undefined) item.opened = String(item.opened) === "true";
  if (item.toBuy !== undefined) item.toBuy = String(item.toBuy) === "true";
  if (item.expirationDate !== undefined)
    item.expirationDate = new Date(item.expirationDate);
  return item;
};
