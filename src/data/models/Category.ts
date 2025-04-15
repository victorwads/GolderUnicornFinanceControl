import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore';

export interface ICategory {
  id?: string;
  name: string;
  icon?: string;
  color?: string;
  parentId?: string;
}

export default class Category implements ICategory {
  constructor(
    public id: string,
    public name: string,
    public icon?: string,
    public color?: string,
    public parentId?: string
  ) { }

  static firestoreConverter: FirestoreDataConverter<Category> = {
    toFirestore(category: Category): DocumentData {
      const data = { ...category } as any
      delete data.id;
      return data;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): Category {
      const data = snapshot.data(options)!;
      return new Category(
        snapshot.id,
        data.name,
        data.icon,
        data.color,
        data.parentId
      );
    },
  };
}
