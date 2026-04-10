import crypto from 'crypto';

/**
 * IntentCache: A high-performance Hash Table implementation for GTM Adventures.
 * It uses SHA256 hashing to generate unique identifiers (fingerprints) for 
 * fast retrieval of payment and login state without stressing the database.
 */
class IntentCache {
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private maxAge: number = 5 * 60 * 1000; // 5 minute standard for payment intents

  /**
   * Generates a fixed-size Hash (Fingerprint) for a specific intent.
   * This "points to where the data is stored" in our internal table.
   */
  public generateHash(id: string, action: string): string {
    return crypto
      .createHash('sha256')
      .update(`${id}:${action}`)
      .digest('hex');
  }

  /**
   * Performs sub-millisecond retrieval from the Hash Table.
   */
  public get(hash: string): any {
    const entry = this.cache.get(hash);
    
    if (!entry) return null;

    // Fast-expiry logic to prevent stale data
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(hash);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Stores data in the Hash Table, effectively making it available for rapid lookup.
   */
  public set(hash: string, data: any): void {
    this.cache.set(hash, {
      data,
      timestamp: Date.now()
    });
    
    // Auto-cleanup after 10 minutes to save RAM on Render Free Plan
    setTimeout(() => {
      this.cache.delete(hash);
    }, 10 * 60 * 1000);
  }

  public has(hash: string): boolean {
    return !!this.get(hash);
  }

  public delete(hash: string): void {
    this.cache.delete(hash);
  }
}

export const intentCache = new IntentCache();
