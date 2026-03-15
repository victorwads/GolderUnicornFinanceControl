import type { Translation } from "../../core/types";

export default interface CommonsModuleTranslation extends Translation {
  commons: {
    search: string;
    save: string;
    cancel: string;
    update: string;
    edit: string;
    add: string;
    confirm: string;
    select: string;
    clear: string;
    loading: string;
    fillAllFields: string;
    currentPath: string;
    params: string;
    selectOption: (label: string) => string;
    selectOptions: (label: string) => string;
    noResults: string;
    typeAndPressEnter: string;
    addNotes: string;
    default: string;
    gohome: string;
    balance: string;
    limit: string;
  };
}
