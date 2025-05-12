import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const { creditCardsInvoices } = getRepositories();
    const invoices = creditCardsInvoices
      .getCache()
      .filter((invoice) => invoice.cardId === id)
      // order by year and month descending
      .sort((a, b) => b.year - a.year || b.month - a.month);
    setInvoices(invoices);

    if (invoices.length === 0 || selectedInvoice) return
    setSelectedInvoice(invoices[0]);
  }, [id]);


  useEffect(() => {
    if (!selectedInvoice) return;

    const { creditCardsRegistries, categories } = getRepositories();
    creditCardsRegistries.getRegistriesByInvoice(selectedInvoice).then((registries) => {
      console.log("Registries", registries);
      setInvoiceRegistries(registries.map((registry) => ({
        registry,
        category: categories.getLocalById(registry.categoryId),
        sourceName: registry.cardId,
      })));
    });
  }, [selectedInvoice]);

  return <Container>
    <ContainerFixedContent>
      <h2>Faturas do Cartão - ({invoices.length})</h2>
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
      {/* <ul>
        {invoices.map((invoice) => (
          <li key={invoice.id}>
            <pre>
              {JSON.stringify(invoice, null, 2)}
            </pre>
          </li>
        ))}
      </ul> */}
      <ul>
        {invoiceRegistries.map((item) => (
          <RegistryItem item={item} key={item.registry.id} />
        ))}
      </ul>
    </ContainerScrollContent>
  </Container>;
};

export default CreditCardsInvoices;