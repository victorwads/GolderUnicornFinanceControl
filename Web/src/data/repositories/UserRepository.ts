import { doc, getDoc } from 'firebase/firestore';

import { DocumentModel } from '@models';

import { Collections } from "../firebase/Collections";
import RepositoryWithCrypt from './RepositoryWithCrypt';

export class User extends DocumentModel {
  constructor(
    id: string = '',
    public privateHash?: string,
    public fullyMigrated: boolean = false,
    public onboardingDone: boolean = false,
  ) {
    super(id);
  }
}

export default class UserRepository extends RepositoryWithCrypt<User> {
  constructor() {
    super(
      "User",
      Collections.Users,
      User,
    );
  }

  protected override async waitInit(): Promise<void> { }

  public override async getAll(): Promise<User[]> {
    return [
      await this.getUserData(),
    ];
  }

  public async updateUserData(data: { [key in keyof User]?: typeof User.prototype[key] }): Promise<void> {
    data.id = this.userId;
    await this.set(data as any, true, false);
  }

  public async getUserData(): Promise<User> {
    const user = await getDoc(doc(this.ref, this.safeUserId));
    return await this.fromFirestore(user.id, user.data());
  }
}
