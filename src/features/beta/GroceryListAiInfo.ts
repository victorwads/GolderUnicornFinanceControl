import { AIConfig } from "./AIParserManager";

export const AIGroceryListConfig: AIConfig = {
  listDescription: "grocery and household items",
  outputAditionalFieldsDescription: `
name: (pretty product description with weight, details, avoid duplicates)
opened?: ( true if the package is in use or opened )
quantity?: (integer of how many packages are there)
location?: (where the item is stored)
expirationDate?: string (when the products will expire)
paidPrice?: number
toBuy?: boolean (true if the user needs to buy it, false if already owned)
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
