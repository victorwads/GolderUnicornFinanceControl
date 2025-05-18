import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import './CreditCardsInvoices.css';

import RegistryItem from '../tabs/timeline/RegistryItem';
import { ModalScreen } from "../../components/conteiners/ModalScreen";

import getRepositories from "../../data/repositories";
import CreditCardInvoice from "../../data/models/CreditCardInvoice";
import { RegistryWithDetails } from "../../data/models/Registry";
import CreditCard from "../../data/models/CreditCard";

function fetchData(id?: string): { creditCard?: CreditCard, invoices: CreditCardInvoice[] } {
  if (!id) return { invoices: [] };

  const { creditCardsInvoices, creditCards } = getRepositories();

  const creditCard = creditCards.getLocalById(id)!;
  const invoices = creditCardsInvoices.getInvoices(id)

  return { creditCard, invoices };
}

const CreditCardsInvoices: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState(() => fetchData(id));
  const [selectedInvoice, setSelectedInvoice] = useState<CreditCardInvoice | null>(null);
  const [invoiceRegistries, setInvoiceRegistries] = useState<RegistryWithDetails[]>([]);

  const invoiceRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const index = data.invoices.indexOf(selectedInvoice as any);
    if (invoiceRefs.current[index]) {
      invoiceRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [data, selectedInvoice]);

  useEffect(() => {
    const data = fetchData(id);
    const { invoices } = data;
    setData(data);
    
    if (invoices.length === 0 || selectedInvoice) return
    let currentMonthIndex = invoices.findIndex((inv) =>
      inv.month === new Date().getMonth() + 1 &&
      inv.year === new Date().getFullYear()
    );
    if (currentMonthIndex === -1) {
      currentMonthIndex = invoices.length - 1;
    }

    setSelectedInvoice(invoices[currentMonthIndex]);
  }, [id, selectedInvoice]);


  useEffect(() => {
    if (!selectedInvoice) return;

    const { creditCardsRegistries, categories } = getRepositories();
    const registries = creditCardsRegistries.getRegistriesByInvoice(selectedInvoice)
    setInvoiceRegistries(registries.map((registry) => ({
      registry,
      category: categories.getLocalById(registry.categoryId),
      sourceName: '',
    })));
  }, [selectedInvoice]);
  
  return <ModalScreen title={data.creditCard?.name} header={
    <div className="scrollableInvoices">
      {data.invoices.map((invoice, idx) => <div
        ref={el => { invoiceRefs.current[idx] = el; }}
        onClick={() => setSelectedInvoice(invoice)}
        className={selectedInvoice?.id === invoice.id ? "selected" : ""}>
        {invoice.month}/{invoice.year}
      </div>)}
    </div>
  }>
    {selectedInvoice && (
      <div>
        <h3>Fatura Selecionada</h3>
        <pre>
          {JSON.stringify(selectedInvoice, null, 2)}
        </pre>
      </div>
    )}
    <div className="TimelineList">
      {invoiceRegistries.map((item) => (
        <RegistryItem onlyOutcome item={item} key={item.registry.id} />
      ))}
    </div>
  </ModalScreen>;
};

export default CreditCardsInvoices;