
const routes = {
    invoice: (cardId: string, invoiceName: string): string => {
        return `/creditcards/${cardId}/invoices/${invoiceName}`;
    },
    debit: (id: string): string => {
        return `/accounts/registry/${id}/edit`;
    },
    credit: (id: string): string => {
        return `/creditcards/registry/${id}/edit`;
    },
    account: (id: string): string => {
        return `/accounts/${id}`;
    },
    timeline: (accountId?: string, categories?: string[]): string => {
        return `/timeline${accountId ? `/${accountId}` : ''}`
            + `${categories?.length ? `?categories=${categories.join(',')}` : ''}`;
    },
    timelineImport: (accountId?: string, cardId?: string): string => {
        const params = new URLSearchParams();
        if (accountId) {
            params.set('account', accountId);
        }
        if (cardId) {
            params.set('card', cardId);
        }
        const queryString = params.toString();
        return `/timeline/import${queryString ? `?${queryString}` : ''}`;
    },
};

export default routes;
