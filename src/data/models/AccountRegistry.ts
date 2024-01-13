import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";

interface IAccountsRegistry {
    when: number
}

export default class AccountsRegistry implements IAccountsRegistry {
    
    public when: number = Date.now();

    static firestoreConverter: FirestoreDataConverter<AccountsRegistry> = {
        toFirestore(account: AccountsRegistry): DocumentData {
            return {
            };
        },
        fromFirestore(
            snapshot: QueryDocumentSnapshot,
            options: SnapshotOptions
        ): AccountsRegistry {
            const data = snapshot.data(options)!;
            return new AccountsRegistry(
                //TODO
            );
        }
    };
}