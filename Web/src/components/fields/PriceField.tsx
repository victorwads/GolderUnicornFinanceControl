import { useEffect, useState } from "react";
import BaseField from "./BaseField";

interface PriceFieldParams {
  label: string;
  price: number;
  onChange(price: number): void;
}

const PriceField = ({
  label,
  price: initialPrice,
  onChange,
}: PriceFieldParams) => {
  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const [price, setPrice] = useState(initialPrice);

  const handleInputChange = (inputValue: string) => {
    const value = inputValue.replace(/[^\d]/g, "");
    const price = parseFloat(value) / 100;

    setPrice(price);
    onChange(price);
  };

  const moveCursorToEnd = (input: HTMLInputElement) => {
    if (input) {
      input.selectionStart = input.selectionEnd = input.value.length;
    }
  };

  useEffect(() => {
    setPrice(initialPrice);
  }, [initialPrice]);

  return (
    <BaseField label={label}>
      <input
        type="text"
        value={currencyFormatter.format(price)}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={(event) => moveCursorToEnd(event.target)}
      />
    </BaseField>
  );
};

export default PriceField;
