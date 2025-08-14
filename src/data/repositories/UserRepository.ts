import { doc, DocumentData, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { DocumentModel } from '@models';

import { Collections } from "../firebase/Collections";
import RepositoryWithCrypt from './RepositoryWithCrypt';
import BaseRepository from './RepositoryBase';
import {
  DatabasesUse,
  sumValues,
  ResourceUseNode,
  createEmptyUse,
  FirestoreDatabasesUse,
} from './useUtils';

export class User extends DocumentModel {
  public dbUse?: DatabasesUse;
}

export default class UserRepository extends RepositoryWithCrypt<User> {
  constructor() {
    super(Collections.Users, User);

    BaseRepository.updateUserUse = async (dbUse: FirestoreDatabasesUse) => {
      this.updateUserData({ dbUse: { ...dbUse, encrypted: false } });
      UserRepository.userTotalCache = undefined;
    };
  }

  public override async waitInit(): Promise<void> { }

  public override async getAll(): Promise<User[]> {
    return [
      await this.getUserData(),
    ];
  }

  public async updateUserData(data: DocumentData) {
    const userId = getAuth().currentUser?.uid;
    data.id = userId;
    await this.set(data as any, true, false);
  }

  public async getUserData(): Promise<User> {
    const userId = getAuth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    let model;
    if (UserRepository.userTotalCache) {
      model = new User(userId);
      model.dbUse = UserRepository.userTotalCache;
    } else {
      const user = await getDoc(doc(this.ref, userId));
      BaseRepository.addUse({
        db: { remote: { docReads: 1 } },
      });
      model = await this.fromFirestore(user.id, user.data());
      UserRepository.userTotalCache = model.dbUse;
    }

    const currentUse = BaseRepository.getDatabaseUse();
    if (model.dbUse) {
      sumValues(model.dbUse as ResourceUseNode, currentUse as ResourceUseNode);
    } else {
      model.dbUse = sumValues(
        createEmptyUse() as ResourceUseNode,
        currentUse as ResourceUseNode
      ) as DatabasesUse;
    }

    return model;
  }

  public static userTotalCache?: DatabasesUse;
}
