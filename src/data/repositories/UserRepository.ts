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

    const user = await getDoc(doc(this.ref, userId));
    BaseRepository.updateUse((use) => {
      use.remote.docReads++;
    });
    return this.fromFirestore(userId, user.data());
  }
}

BaseRepository.updateUserUse = async (dbUse) => {
  new UserRepository().updateUserData({ dbUse: {...dbUse, encrypted: false}});
};
