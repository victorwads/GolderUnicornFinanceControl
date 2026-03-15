const routes = {
    invoice: (cardId: string, invoiceName: string): string => {
        return `/creditcards/${cardId}/invoices/${invoiceName}`;
    },
    account: (id: string): string => {
        return `/accounts/${id}`;
    },
    timeline: (accountId?: string, categories?: string[]): string => {
        const params = new URLSearchParams();
        if (accountId) {
            params.set("account", accountId);
        }
        if (categories?.length) {
            params.set("categories", categories.join(","));
        }
        const queryString = params.toString();
        return `/timeline${queryString ? `?${queryString}` : ""}`;
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
    timelineDebit: (id: string, search: string = ""): string => {
        return `/timeline/entry/account/${id}${search}`;
    },
    timelineCredit: (id: string, search: string = ""): string => {
        return `/timeline/entry/credit/${id}${search}`;
    },
    timelineTransfer: (id: string, search: string = ""): string => {
        return `/timeline/entry/transfer/${id}${search}`;
    },
    timelineInvoice: (cardId: string, invoiceName: string, search: string = ""): string => {
        return `/timeline/entry/creditcards/${cardId}/invoices/${invoiceName}${search}`;
    },
    timelineCreateTransfer: (search: string = ""): string => {
        return `/timeline/entry/transfer/create${search}`;
    },
    timelineCreateIncome: (search: string = ""): string => {
        return `/timeline/entry/account/income/create${search}`;
    },
    timelineCreateExpense: (search: string = ""): string => {
        return `/timeline/entry/account/expense/create${search}`;
    },
    timelineCreateCredit: (search: string = ""): string => {
        return `/timeline/entry/credit/create${search}`;
    },
};

export default routes;
