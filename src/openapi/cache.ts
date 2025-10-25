/**
 * OpenAPI document caching
 */

import type { OpenAPIDocument } from '../types.js';

export class OpenAPICache {
  private document: OpenAPIDocument | null = null;
  private loadedAt: number | null = null;
  private ttl: number; // Time to live in milliseconds

  constructor(ttl: number = 5 * 60 * 1000) { // Default: 5 minutes
    this.ttl = ttl;
  }

  set(document: OpenAPIDocument): void {
    this.document = document;
    this.loadedAt = Date.now();
  }

  get(): OpenAPIDocument | null {
    if (!this.document || !this.loadedAt) {
      return null;
    }

    // Check if cache has expired
    if (Date.now() - this.loadedAt > this.ttl) {
      this.clear();
      return null;
    }

    return this.document;
  }

  clear(): void {
    this.document = null;
    this.loadedAt = null;
  }

  isValid(): boolean {
    return this.get() !== null;
  }
}
