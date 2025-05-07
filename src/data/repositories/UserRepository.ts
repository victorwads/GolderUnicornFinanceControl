import { doc, DocumentData, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import RepositoryWithCrypt from './RepositoryWithCrypt';

import { Collections } from "../firebase/Collections";
import BaseRepository, { DatabasesUse } from './RepositoryBase';
import DocumentModel from '../models/DocumentModel';

export class User extends DocumentModel {
  public dbUse?: DatabasesUse;
}

export default class UserRepository extends RepositoryWithCrypt<User> {
  constructor() {
    super(Collections.Users, User);
  }

  public async updateUserData(data: DocumentData) {
    const userId = getAuth().currentUser?.uid;
    await this.set(data as any, userId, true);
  }

  public async getUserData(): Promise<User> {
    const userId = getAuth().currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    let model;
    if(UserRepository.userTotalCache ) {
      model = new User(userId);
      model.dbUse = UserRepository.userTotalCache;
    } else {
      const user = await getDoc(doc(this.ref, userId));
      BaseRepository.updateUse((use) => {
        use.remote.docReads++;
      });
      model = await this.fromFirestore(user.id, user.data());
    }

    const currentUse = BaseRepository.getDatabaseUse();
    if(model.dbUse) {
      model.dbUse.cache.docReads += currentUse.cache.docReads;
      model.dbUse.cache.queryReads += currentUse.cache.queryReads;
      model.dbUse.cache.writes += currentUse.cache.writes;
      model.dbUse.local.docReads += currentUse.local.docReads;
      model.dbUse.local.queryReads += currentUse.local.queryReads;
      model.dbUse.local.writes += currentUse.local.writes;
      model.dbUse.remote.docReads += currentUse.remote.docReads;
      model.dbUse.remote.queryReads += currentUse.remote.queryReads;
      model.dbUse.remote.writes += currentUse.remote.writes;  
    } else {
      model.dbUse = currentUse;
    }

    return model;
  }

  public static userTotalCache?: DatabasesUse;
}

BaseRepository.updateUserUse = async (dbUse: any) => {
  new UserRepository().updateUserData({ dbUse: {...dbUse, encrypted: false}});
  UserRepository.userTotalCache = undefined;
};
