import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

import { Container, ContainerFixedContent, ContainerScrollContent } from "../../components/conteiners";
import RegistryItem from '../tabs/timeline/RegistryItem';

import getRepositories from "../../data/repositories";
import CreditCardInvoice from "../../data/models/CreditCardInvoice";
import { RegistryWithDetails } from "../../data/models/Registry";

const CreditCardsInvoices: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [invoices, setInvoices] = useState<CreditCardInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<CreditCardInvoice | null>(null);
  const [invoiceRegistries, setInvoiceRegistries] = useState<RegistryWithDetails[]>([]);

  const invoiceRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const index = invoices.indexOf(selectedInvoice as any);
    if (invoiceRefs.current[index]) {
      console.log("Focusing on current month invoice", index);
      invoiceRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
    console.log("Focusing on current month invoice", index);
  }, [selectedInvoice]);

  useEffect(() => {
    if (!id) return;

    const { creditCardsInvoices } = getRepositories();
    const invoices = creditCardsInvoices.getInvoices(id)
    setInvoices(invoices);

    if (invoices.length === 0 || selectedInvoice) return
    const currentMonthIndex = invoices.findIndex((inv) =>
      inv.month === new Date().getMonth() + 1 &&
      inv.year === new Date().getFullYear() - 1
    );


    setSelectedInvoice(invoices[currentMonthIndex]);
  }, [id]);


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

  return <Container>
    <ContainerFixedContent>
      <h2>Faturas do Cartão - ({invoices.length})</h2>
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: 0,
          paddingBottom: 8,
          marginBottom: 16,
        }}
      >
        {invoices.map((invoice, idx) => <div
          ref={el => { invoiceRefs.current[idx] = el; }}
          onClick={() => setSelectedInvoice(invoice)}
          style={{
            padding: "8px 16px",
            borderBottom: selectedInvoice?.id === invoice.id ? "2px solid #007bff" : "1px solid #ccc",
            background: selectedInvoice?.id === invoice.id ? "var(--bg-color-shadow)" : "transparent",
            cursor: "pointer",
            minWidth: '30%',
            textAlign: "center",
            transition: "border 0.2s, background 0.2s",
            fontWeight: selectedInvoice?.id === invoice.id ? "bold" : "normal",
          }}
        >
          {invoice.month}/{invoice.year}
        </div>)}
      </div>
      {selectedInvoice && (
        <div>
          <h3>Fatura Selecionada</h3>
          <pre>
            {JSON.stringify(selectedInvoice, null, 2)}
          </pre>
        </div>
      )}
    </ContainerFixedContent>
    <ContainerScrollContent>
      <ul>
        {invoiceRegistries.map((item) => (
          <RegistryItem item={item} key={item.registry.id} />
        ))}
      </ul>
    </ContainerScrollContent>
  </Container>;
};

export default CreditCardsInvoices;