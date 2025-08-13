import { doc, DocumentData, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { DocumentModel } from '@models';

import { Collections } from "../firebase/Collections";
import RepositoryWithCrypt from './RepositoryWithCrypt';
import BaseRepository, { DatabasesUse } from './RepositoryBase';
import { sumValues, UseNode } from './useUtils';

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
      model.dbUse = sumValues(model.dbUse as UseNode, currentUse as unknown as UseNode) as DatabasesUse;
    } else {
      model.dbUse = currentUse;
    }

    return model;
  }

  public static userTotalCache?: DatabasesUse;

  public static getAIUsageTotals() {
    const dbAi = UserRepository.userTotalCache?.openai?.ai as UseNode | undefined;
    const localAi = BaseRepository.getDatabaseUse().openai?.ai as UseNode | undefined;
    const combined = sumValues(dbAi || {}, localAi || {}) as Record<string, any>;
    let requests = 0;
    let input = 0;
    let output = 0;
    Object.values(combined).forEach((m: any) => {
      requests += m.requests || 0;
      input += m.inputTokens || 0;
      output += m.outputTokens || 0;
    });
    return { requests, tokens: { input, output } };
  }
}
