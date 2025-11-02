import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Account, HomeViewModel } from "@layouts/core/Home";
import getRepositories, { CreditCardWithInfos, waitUntilReady } from "@repositories";
import { WithInfoAccount } from "@models";
import { getCurrentUser } from "@configs";
import { getServices } from "@services";

export function useHomeModel(): HomeViewModel {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [accountBalances, setAccountBalances] = useState<Record<string, number | undefined>>({});
  const [cardInvoices, setCardInvoices] = useState<Record<string, number | null>>({});
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const [totalInvoices, setTotalInvoices] = useState<number | null>(null);

  useEffect(() => {
    const repo = getRepositories().accounts;
    const { balance } = getServices();

    function setAccountsMapped(accounts: WithInfoAccount[]) {
      setAccounts(accounts.map(account => ({
        id: account.id || '',
        name: account.name,
        bank: account.bank.name,
        color: account.color || "bg-gray-500",
      })));
      waitUntilReady('accountTransactions', 'creditCardsInvoices').then(() => {
        accounts.forEach( async account => {
          const value = balance.getBalance(account.id);
          setAccountBalances(prev => ({ 
            ...prev,
            [account.id]: value 
          }));
        });
      });
    }

    waitUntilReady('banks', 'accounts').then(() => {
      setAccountsMapped(repo.getCacheWithBank());
    });
    return repo.addUpdatedEventListenner(repo =>
      setAccountsMapped(repo.getCacheWithBank())
    )
  }, [])
  
  useEffect(() => {
    const { creditCards: repo, creditCardsInvoices } = getRepositories() ;

    function setCreditcardsMapped(creditCards: CreditCardWithInfos[]) {
      setCreditCards(creditCards.map(creditCard => ({
        id: creditCard.id || '',
        name: creditCard.name,
        brand: creditCard.brand,
      })));
      waitUntilReady('creditCardsInvoices').then(() => {
        creditCards.forEach( async creditCard => {
          const invoice = await creditCardsInvoices.getNextInvoice(creditCard.id);
          setCardInvoices(prev => ({ 
            ...prev,
            [creditCard.id]: invoice.value 
          }));
        });
      });
    }

    waitUntilReady('creditCards').then(() => {
      setCreditcardsMapped(repo.getCacheWithBank());
    });
    return repo.addUpdatedEventListenner(repo =>
      setCreditcardsMapped(repo.getCacheWithBank())
    )
  }, [])

  useEffect(() => {
    const loadedInvoices = Object.values(cardInvoices).filter(i => i !== null) as number[];
    if (loadedInvoices.length === creditCards.length) {
      setTotalInvoices(loadedInvoices.reduce((sum, invoice) => sum + invoice, 0));
    }
  }, [cardInvoices]);
  
  const [openAccordions, setOpenAccordions] = useState<string[]>(() => {
    const saved = localStorage.getItem('home-accordion-state');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('home-accordion-state', JSON.stringify(openAccordions));
  }, [openAccordions]);

  const handleAccordionChange = (accordionId: string) => (value: string) => {
    setOpenAccordions(prev => {
      if (value) {
        return [...prev.filter(id => id !== accordionId), accordionId];
      } else {
        return prev.filter(id => id !== accordionId);
      }
    });
  };

  // Build credit cards with loaded invoices
  const creditCardsWithValues: CreditCard[] = creditCards.map(card => ({
    ...card,
    invoice: cardInvoices[card.id] ?? null,
  }));

  const accountsWithBalances: Account[] = accounts.map(account => ({
    ...account,
    balance: accountBalances[account.id],
  }));

  return {
    userName: getCurrentUser()?.displayName || "Usuário",
    navigate,
    creditCards: creditCardsWithValues,
    accounts: accountsWithBalances,
    totalInvoices,
    totalBalance,
    openAccordions,
    handleAccordionChange,
  };
}
