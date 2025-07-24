import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import getRepositories from '@repositories';
import { GroceryItemModel, QuantityUnit, ProductModel, ProductPrice } from '@models';

import Button from '@components/Button';
import Field from '@components/fields/Field';
import { DatePicker } from '@components/inputs';
import PriceField from '@components/fields/PriceField';
import SelectField from '@components/fields/SelectField';
import { ModalScreen } from '@components/conteiners/ModalScreen';
import BarcodeScanner from './BarcodeScanner';

const units = [
  { value: QuantityUnit.UN, label: 'un' },
  { value: QuantityUnit.KG, label: 'kg' },
  { value: QuantityUnit.G, label: 'g' },
  { value: QuantityUnit.L, label: 'l' },
  { value: QuantityUnit.ML, label: 'ml' },
];

const GroceryItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groceries, products } = getRepositories();

  const item = id ? groceries.getLocalById(id) : undefined;

  const [name, setName] = useState(item?.name || '');
  const [barcode, setBarcode] = useState<string | undefined>(item?.barcode);
  const [expiration, setExpiration] = useState<Date | null>(item?.expirationDate ?? null);
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [unit, setUnit] = useState<QuantityUnit>(item?.unit || QuantityUnit.UN);
  const [paidPrice, setPaidPrice] = useState(item?.paidPrice || 0);
  const [purchase, setPurchase] = useState<Date | null>(item?.purchaseDate ?? new Date());
  const [location, setLocation] = useState(item?.location || '');

  useEffect(() => {
    if (barcode) {
      const product = products.getByBarcode(barcode);
      if (product) {
        if (!name) setName(product.name);
        if (!paidPrice) setPaidPrice(product.lastPrice);
        if (!expiration && product.shelfLife > 0) {
          const dt = new Date();
          dt.setDate(dt.getDate() + product.shelfLife);
          setExpiration(dt);
        }
      }
    }
  }, [barcode]);

  const saveItem = async () => {
    const purchaseDate = purchase ?? new Date();
    const expirationDate = expiration || undefined;
    const itemModel = new GroceryItemModel(
      id || '',
      name,
      quantity,
      unit,
      barcode,
      expirationDate,
      paidPrice || undefined,
      purchaseDate,
      location || undefined,
    );
    await groceries.set(itemModel);

    let product = products.getByBarcode(barcode);
    if (!product && barcode) {
      let shelfLife = 0;
      if (purchaseDate && expirationDate) {
        shelfLife = Math.ceil(
          (expirationDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      product = new ProductModel('', name, barcode, paidPrice, [], shelfLife);
    }
    if (product) {
      if (paidPrice && product.lastPrice !== paidPrice) {
        product.lastPrice = paidPrice;
        product.prices.push({ value: paidPrice, date: purchaseDate });
      }
      await products.set(product, true);
    }

    alert(id ? Lang.groceries.itemCreated : Lang.groceries.itemCreated);
    navigate(-1);
  };

  return <ModalScreen title={id ? Lang.groceries.editItem : Lang.groceries.addItem}>
    <Field label={Lang.groceries.name} value={name} onChange={setName} />
    <Field label={Lang.groceries.barcode} value={barcode || ''} onChange={setBarcode} />
    <BarcodeScanner onScan={(code) => { setBarcode(code); }} />
    <DatePicker label={Lang.groceries.expirationDate} value={expiration} onChange={setExpiration} />
    <DatePicker label={Lang.groceries.purchaseDate} value={purchase} onChange={setPurchase} />
    <Field label={Lang.groceries.quantity} value={String(quantity)} onChange={(v) => setQuantity(Number(v))} />
    <SelectField label={Lang.groceries.unit} value={unit} onChange={setUnit} options={units} />
    <PriceField label={Lang.groceries.paidPrice} price={paidPrice} onChange={setPaidPrice} />
    <Field label={Lang.groceries.storageLocation} value={location} onChange={setLocation} />
    <div>
      <Button text={Lang.commons.cancel} onClick={() => navigate(-1)} />
      <Button text={Lang.commons.save} onClick={saveItem} />
    </div>
  </ModalScreen>;
};

export default GroceryItemForm;
