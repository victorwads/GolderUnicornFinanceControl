import { doc, DocumentData, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { DocumentModel } from '@models';

import { Collections } from "../firebase/Collections";
import RepositoryWithCrypt from './RepositoryWithCrypt';
import BaseRepository, { DatabasesUse } from './RepositoryBase';

export class User extends DocumentModel {
  public dbUse?: DatabasesUse;
}

export default class UserRepository extends RepositoryWithCrypt<User> {
  constructor() {
    super(Collections.Users, User);

    BaseRepository.updateUserUse = async (dbUse: any) => {
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
      BaseRepository.updateUse((use) => {
        use.remote.docReads++;
      });
      model = await this.fromFirestore(user.id, user.data());
      UserRepository.userTotalCache = model.dbUse;
    }

    const currentUse = BaseRepository.getDatabaseUse();
    if (model.dbUse) {
      model.dbUse.cache.docReads += currentUse.cache.docReads;
      model.dbUse.cache.queryReads += currentUse.cache.queryReads;
      model.dbUse.cache.writes += currentUse.cache.writes;
      model.dbUse.local.docReads += currentUse.local.docReads;
      model.dbUse.local.queryReads += currentUse.local.queryReads;
      model.dbUse.local.writes += currentUse.local.writes;
      model.dbUse.remote.docReads += currentUse.remote.docReads;
      model.dbUse.remote.queryReads += currentUse.remote.queryReads;
      model.dbUse.remote.writes += currentUse.remote.writes;
      model.dbUse.openai = currentUse.openai || { requests: 0, tokens: { input: 0, output: 0 } };
      model.dbUse.openai.requests += currentUse.openai?.requests || 0;
      model.dbUse.openai.tokens.input += currentUse.openai?.tokens?.input || 0;
      model.dbUse.openai.tokens.output += currentUse.openai?.tokens?.output || 0;
    } else {
      model.dbUse = currentUse;
    }

    return model;
  }

  public static userTotalCache?: DatabasesUse;
}
