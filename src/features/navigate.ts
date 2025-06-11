
const routes = {
    invoice: (cardId: string, invoiceName: string): string => {
        return `/creditcards/${cardId}/invoices/${invoiceName}`;
    },
    registry: (id: string): string => {
        return `/accounts/registry/${id}/edit`;
    },
    account: (id: string): string => {
        return `/accounts/${id}`;
    },
    timeline: (accountId?: string, categories?: string[]): string => {
        return `/main/timeline${accountId ? `/${accountId}` : ''}`
            + `${categories?.length ? `?categories=${categories.join(',')}` : ''}`;
    },
};

export default routes;