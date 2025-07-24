import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@components/Button';
import Field from '@components/fields/Field';
import PriceField from '@components/fields/PriceField';
import SelectField from '@components/fields/SelectField';
import { ModalScreen } from '@components/conteiners/ModalScreen';
import BarcodeScanner from './BarcodeScanner';
import { GroceryItemModel, QuantityUnit, ProductModel, ProductPrice } from '@models';
import getRepositories from '@repositories';

const units = [
  { value: QuantityUnit.UNIT, label: 'un' },
  { value: QuantityUnit.KG, label: 'kg' },
  { value: QuantityUnit.G, label: 'g' },
  { value: QuantityUnit.L, label: 'l' },
  { value: QuantityUnit.ML, label: 'ml' },
];

const GroceryItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groceries, products } = getRepositories();

  const [showScanner, setShowScanner] = useState(false);

  const item = id ? groceries.getLocalById(id) : undefined;

  const [name, setName] = useState(item?.name || '');
  const [barcode, setBarcode] = useState<string | undefined>(item?.barcode);
  const [expiration, setExpiration] = useState<string>(item?.expirationDate ? item.expirationDate.toISOString().substring(0,10) : '');
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [unit, setUnit] = useState<QuantityUnit>(item?.unit || QuantityUnit.UNIT);
  const [paidPrice, setPaidPrice] = useState(item?.paidPrice || 0);
  const [purchase, setPurchase] = useState<string>(item?.purchaseDate ? item.purchaseDate.toISOString().substring(0,10) : new Date().toISOString().substring(0,10));
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
          setExpiration(dt.toISOString().substring(0,10));
        }
      }
    }
  }, [barcode]);

  const saveItem = async () => {
    const itemModel = new GroceryItemModel(
      id || '',
      name,
      quantity,
      unit,
      barcode,
      expiration ? new Date(expiration) : undefined,
      paidPrice || undefined,
      new Date(purchase),
      location || undefined,
    );
    await groceries.set(itemModel);

    let product = products.getByBarcode(barcode);
    if (!product && barcode) {
      product = new ProductModel('', name, barcode, paidPrice, [], 0);
    }
    if (product) {
      if (paidPrice) {
        const price: ProductPrice = { value: paidPrice, date: new Date(purchase) };
        product.lastPrice = paidPrice;
        product.prices.push(price);
      }
      await products.set(product, true);
    }

    alert(id ? Lang.groceries.itemCreated : Lang.groceries.itemCreated);
    navigate(-1);
  };

  return <ModalScreen title={id ? Lang.groceries.editItem : Lang.groceries.addItem}>
    <Field label={Lang.groceries.name} value={name} onChange={setName} />
    <Field label={Lang.groceries.barcode} value={barcode || ''} onChange={setBarcode} />
    <button type="button" onClick={() => setShowScanner(true)}>{Lang.groceries.scanBarcode}</button>
    {showScanner && <BarcodeScanner onScan={(code) => { setBarcode(code); setShowScanner(false); }} onClose={() => setShowScanner(false)} />}
    <Field label={Lang.groceries.expirationDate} value={expiration} onChange={setExpiration} />
    <Field label={Lang.groceries.purchaseDate} value={purchase} onChange={setPurchase} />
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
