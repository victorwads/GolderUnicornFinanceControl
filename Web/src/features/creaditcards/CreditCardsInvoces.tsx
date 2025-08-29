import React, { useEffect, useState, useRef, use, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import './CreditCardsInvoices.css';

import routes from "../navigate";
import RegistryItem from '../tabs/timeline/RegistryItem';
import { ModalScreen } from "@components/conteiners/ModalScreen";
import Icon from "@components/Icons";

import getRepositories from "@repositories";
import { CreditCard, CreditCardInvoice, RegistryWithDetails } from "@models";

function fetchData(id?: string): { creditCard?: CreditCard, invoices: CreditCardInvoice[] } {
  if (!id) return { invoices: [] };

  const { creditCardsInvoices, creditCards } = getRepositories();

  const creditCard = creditCards.getLocalById(id)!;
  const invoices = creditCardsInvoices.getInvoices(id)

  return { creditCard, invoices };
}

const CreditCardsInvoices: React.FC = () => {
  const navigate = useNavigate();
  const { id, selected } = useParams<{ id: string, selected: string }>();

  const [data, setData] = useState(() => fetchData(id));
  const [selectedInvoice, setSelectedInvoiceModel] = useState<CreditCardInvoice | null>();
  const [invoiceRegistries, setInvoiceRegistries] = useState<RegistryWithDetails[]>([]);

  const invoiceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const setSelectedInvoice = useCallback((invoice?: CreditCardInvoice) => {
    if (!invoice || !id) return setSelectedInvoiceModel(null);
    navigate(routes.invoice(id, invoice.name), { replace: true });
  }, [navigate, id]);

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
    const found = data.invoices.find((inv) =>
      inv.name === selected
    );
    console.log("Selected invoice found:", found);
    setSelectedInvoiceModel(found);
  }, [selected, data.invoices]);

  useEffect(() => {
    const data = fetchData(id);
    const { invoices } = data;
    setData(data);

    if (invoices.length === 0 || selectedInvoice?.cardId === id) return;

    let current = invoices.find((inv) =>
      inv.name === CreditCardInvoice.nowName()
    );
    if (!current) {
      current = invoices[invoices.length - 1];
    }

    setSelectedInvoice(current);
  }, [id, selectedInvoice, setSelectedInvoice]);


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
        key={invoice.name}
        ref={el => { invoiceRefs.current[idx] = el; }}
        onClick={() => setSelectedInvoice(invoice)}
        className={selectedInvoice?.id === invoice.id ? "selected" : ""}>
        {invoice.month}/{invoice.year}
      </div>)}
    </div>
  }>
    {selectedInvoice && (
      <div>
        <h3>{Lang.creditcards.selectedInvoice}</h3>
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
    {id && (
      <div className="FloatButton">
        <Link to={`/creditcards/registry/add?card=${id}`}>
          <Icon icon={Icon.all.faPlus} size="2x" />
        </Link>
      </div>
    )}
  </ModalScreen>;
};

export default CreditCardsInvoices;
