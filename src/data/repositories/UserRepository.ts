import { doc, DocumentData, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { DocumentModel } from '@models';

import { Collections } from "../firebase/Collections";
import RepositoryWithCrypt from './RepositoryWithCrypt';

export class User extends DocumentModel {}

export default class UserRepository extends RepositoryWithCrypt<User> {
  constructor() {
    super(Collections.Users, User);
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
    const user = await getDoc(doc(this.ref, this.safeUserId));
    return await this.fromFirestore(user.id, user.data());;
  }
}
