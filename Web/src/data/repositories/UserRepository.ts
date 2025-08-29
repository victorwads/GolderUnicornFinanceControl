import { doc, DocumentData, getDoc } from 'firebase/firestore';

import { DocumentModel } from '@models';
import { getCurrentUser } from '@configs';

import { Collections } from "../firebase/Collections";
import RepositoryWithCrypt from './RepositoryWithCrypt';

export class User extends DocumentModel {}

export default class UserRepository extends RepositoryWithCrypt<User> {
  constructor() {
    super(Collections.Users, User);
  }

  protected override async waitInit(): Promise<void> { }

  public override async getAll(): Promise<User[]> {
    return [
      await this.getUserData(),
    ];
  }

  public async updateUserData(data: DocumentData) {
    const userId = getCurrentUser;
    data.id = userId;
    await this.set(data as any, true, false);
  }

  public async getUserData(): Promise<User> {
    const user = await getDoc(doc(this.ref, this.safeUserId));
    return await this.fromFirestore(user.id, user.data());;
  }
}
