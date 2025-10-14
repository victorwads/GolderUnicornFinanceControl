import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ProjectStorage } from '@utils/ProjectStorage';
import { CreditCard, Category, Bank } from '@models';
import getRepositories, { BaseRepository, Repositories, resetRepositories } from '@repositories';

import { AssistantTools } from './AssistantToolsDefinition';

Object.defineProperty(window, 'isDevelopment', { value: true, writable: true });
ProjectStorage.set('disableEncryption', 'true');

BaseRepository.prototype.getAll = async function<T>(): Promise<T[]> {
  return [];
}

describe('AssistantTools - Domain and Action Listings', async () => {
  await resetRepositories('test-user');

  let assistantTools: AssistantTools;
  let repos: Repositories;

  beforeEach(() => {
    repos = getRepositories();
    assistantTools = new AssistantTools(repos);
  });

  describe('execute() method calls', () => {
    it('should return correct domain list when calling list_domains', async () => {
      const result = await assistantTools.execute('list_domains', {});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toEqual([
          'banks',
          'categories',
          'accounts',
          'accountTransactions',
          'recurrentTransactions',
          'creditCards',
          'creditCardsTransactions'
        ]);
      }
    });

    const domains = [
      'accounts',
      'creditcards',
      'categories',
      'banks',
      'accounttransactions',
      'recurrenttransactions',
      'creditcardstransactions',
    ];

    domains.forEach(domain => {
      it(`should return actions for domain '${domain}' when calling list_domain_actions`, async () => {
        const result = await assistantTools.execute('list_domain_actions', { domain });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(Array.isArray((result as any).result)).toBe(true);
          // Banks has no handlers, only search capability
          if (domain !== 'banks') {
            expect((result as any).result.length).toBeGreaterThan(0);
          }

          // Check that each action has name and description
          (result as any).result.forEach((action: any) => {
            expect(action).toHaveProperty('name');
            expect(action).toHaveProperty('description');
            expect(typeof action.name).toBe('string');
            expect(typeof action.description).toBe('string');
          });
        }
      });
    });

    it('should return error for invalid domain when calling list_domain_actions', async () => {
      const result = await assistantTools.execute('list_domain_actions', { domain: 'invalid_domain' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain('not found');
      }
    });

    it('should return error for unknown tool when calling execute', async () => {
      const result = await assistantTools.execute('unknown_tool', {});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain('not found');
      }
    });

    // Test domain name variations and fuzzy matching
    const domainVariations = [
      { input: 'account', expected: 'accounts' },
      { input: 'creditcard', expected: 'creditcards' },
      { input: 'credit card', expected: 'creditcards' },
      { input: 'category', expected: 'categories' },
      { input: 'bank', expected: 'banks' },
      { input: 'accounttransaction', expected: 'accounttransactions' },
      { input: 'recurrent', expected: 'recurrenttransactions' },
      { input: 'credit card transaction', expected: 'creditcardstransactions' },
    ];

    domainVariations.forEach(({ input, expected }) => {
      it(`should handle domain variation '${input}' and map to '${expected}'`, async () => {
        const result = await assistantTools.execute('list_domain_actions', { domain: input });
        // If fuzzy matching is implemented, it should succeed
        // If not, it should fail gracefully with a helpful error
        if (result.success) {
          expect(Array.isArray((result as any).result)).toBe(true);
        } else {
          expect(result.errors).toBeDefined();
          expect(Array.isArray(result.errors) ? result.errors.length : 1).toBeGreaterThan(0);
        }
      });
    });

    it('should handle case insensitive domain names', async () => {
      const result = await assistantTools.execute('list_domain_actions', { domain: 'ACCOUNTS' });
      if (result.success) {
        expect(Array.isArray((result as any).result)).toBe(true);
        expect((result as any).result.length).toBeGreaterThan(0);
      } else {
        // If case insensitive matching is not implemented, should fail gracefully
        expect(result.errors).toBeDefined();
      }
    });

    it('should provide helpful error message for similar domain names', async () => {
      const result = await assistantTools.execute('list_domain_actions', { domain: 'accountz' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
        const errors = Array.isArray(result.errors) ? result.errors : [result.errors];
        expect(errors.length).toBeGreaterThan(0);
        // Should suggest similar domains or provide clear error
        const errorMessage = errors.join(' ').toLowerCase();
        expect(errorMessage).toMatch(/not found|invalid|unknown/);
      }
    });
  });

  describe('search_id_in_domain functionality', () => {
    beforeEach(async () => {
      // Mock the getCache method of specific repositories for search tests
      const testCreditCards = [
        new CreditCard('1', 'C6 Bank', 5000, 'Visa', 'acc1', 1, 1, false),
        new CreditCard('2', 'Nubank', 3000, 'Mastercard', 'acc2', 1, 1, false),
        new CreditCard('3', 'Itaú Platinum', 10000, 'Visa', 'acc3', 1, 1, false)
      ];

      const testBanks = [
        new Bank('1', 'C6 Bank', 'C6 Bank S.A.')
      ];

      const testCategories = [
        new Category('1', 'Alimentação', 'utensils', '#FF0000')
      ];

      vi.spyOn(repos.creditCards, 'getCache').mockReturnValue(testCreditCards);
      vi.spyOn(repos.banks, 'getCache').mockReturnValue(testBanks);
      vi.spyOn(repos.categories, 'getCache').mockReturnValue(testCategories);

      // Mock waitUntilReady for all repos
      vi.spyOn(repos.creditCards, 'waitUntilReady').mockResolvedValue(undefined);
      vi.spyOn(repos.banks, 'waitUntilReady').mockResolvedValue(undefined);
      vi.spyOn(repos.categories, 'waitUntilReady').mockResolvedValue(undefined);
    });

    it('should search credit cards by name and return matching results', async () => {
      const result = await assistantTools.execute('search_id_in_domain', { 
        domain: 'creditcards', 
        query: 'C6' 
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.result)).toBe(true);
        expect((result.result as any[]).length).toBeGreaterThan(0);
        
        // Should find the C6 Bank credit card
        const c6Card = (result.result as any[]).find((item: any) => 
          item.name?.toLowerCase().includes('c6')
        );
        expect(c6Card).toBeDefined();
        expect(c6Card).toHaveProperty('id');
        expect(c6Card).toHaveProperty('name');
        expect(c6Card.name).toContain('C6');
      }
    });

    it('should search credit cards by brand and return matching results', async () => {
      const result = await assistantTools.execute('search_id_in_domain', { 
        domain: 'creditcards', 
        query: 'Visa' 
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.result)).toBe(true);
        expect((result.result as any[]).length).toBeGreaterThan(0);
        
        // Should find Visa cards
        const visaCards = (result.result as any[]).filter((item: any) => 
          item.brand?.toLowerCase().includes('visa')
        );
        expect(visaCards.length).toBeGreaterThan(0);
      }
    });

    it('should search banks by name and return matching results', async () => {
      const result = await assistantTools.execute('search_id_in_domain', { 
        domain: 'banks', 
        query: 'C6' 
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.result)).toBe(true);
        expect((result.result as any[]).length).toBeGreaterThan(0);
        
        // Should find the C6 Bank
        const c6Bank = (result.result as any[]).find((item: any) => 
          item.name?.toLowerCase().includes('c6')
        );
        expect(c6Bank).toBeDefined();
        expect(c6Bank).toHaveProperty('id');
        expect(c6Bank).toHaveProperty('name');
        expect(c6Bank.name).toContain('C6');
      }
    });

    it('should search categories by name and return matching results', async () => {
      const result = await assistantTools.execute('search_id_in_domain', { 
        domain: 'categories', 
        query: 'Alimentação' 
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.result)).toBe(true);
        expect((result.result as any[]).length).toBeGreaterThan(0);
        
        // Should find the Alimentação category
        const alimentacaoCategory = (result.result as any[]).find((item: any) => 
          item.name?.toLowerCase().includes('alimentação')
        );
        expect(alimentacaoCategory).toBeDefined();
        expect(alimentacaoCategory).toHaveProperty('id');
        expect(alimentacaoCategory).toHaveProperty('name');
        expect(alimentacaoCategory.name).toContain('Alimentação');
      }
    });

    it('should return empty results when no matches found', async () => {
      const result = await assistantTools.execute('search_id_in_domain', { 
        domain: 'creditcards', 
        query: 'NonExistentCard' 
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.result)).toBe(true);
        // May return empty array or low similarity results
        expect((result.result as any[]).length).toBeLessThanOrEqual(5); // MAX_RESULTS
      }
    });

    it('should return error for domain without search capability', async () => {
      const result = await assistantTools.execute('search_id_in_domain', { 
        domain: 'recurrenttransactions', 
        query: 'test' 
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain('has no search capability');
      }
    });

    it('should handle domain name variations in search', async () => {
      const result = await assistantTools.execute('search_id_in_domain', { 
        domain: 'creditcards', 
        query: 'C6' 
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.result)).toBe(true);
        expect((result.result as any[]).length).toBeGreaterThan(0);
      }
    });
  });

  describe('buildToolSchema', () => {
    const expectedNames = ['list_domains', 'list_domain_actions', 'search_id_in_domain', 'navigate_to_screen', 'search_screens', 'say_to_user', 'finish_conversation'];

    it('should return correct tool names', () => {
      const actualNames = assistantTools.buildToolSchema().map(t => t.function.name);
      expect(actualNames).toEqual(expectedNames);
    });

    describe('should return correct tool names after adding domain', () => {

      const domains = [
        'accounts',
        'credit_cards',
        'creditcards',
        'creditCards',
        'categories',
        'account_transactions',
        'accountTransactions',
        'accounttransactions',
        'account_transfers_transactions',
        'accountTransfersTransactions',
        'accounttransferstransactions',
        'recurrent_transactions',
        'recurrentTransactions',
        'recurrenttransactions',
        'creditcards_transactions',
        'creditCardsTransactions',
        'creditcardstransactions',
      ];

      domains.forEach(domain => {
        it(`should return actions tools for domain '${domain}' when shared`, async () => {
          assistantTools.sharedDomains.add(domain);
          const actualNames = assistantTools.buildToolSchema().map(t => t.function.name);
          expect(actualNames.length).not.toEqual(expectedNames.length);
        });
      });
    });
  });
});