/**
 * OpenAPI document loader - fetches from remote URLs
 */

import axios from 'axios';
import type { OpenAPIDocument } from '../types.js';
import { logger } from '../logger.js';
import { OpenAPICache } from './cache.js';

export class OpenAPILoader {
  private cache: OpenAPICache;
  private url: string;

  constructor(url: string, cacheTtl?: number) {
    this.url = url;
    this.cache = new OpenAPICache(cacheTtl);
  }

  /**
   * Load OpenAPI document from URL
   */
  async load(forceRefresh: boolean = false): Promise<OpenAPIDocument> {
    // Check cache first
    if (!forceRefresh) {
      const cached = this.cache.get();
      if (cached) {
        logger.debug('Using cached OpenAPI document');
        return cached;
      }
    }

    logger.info(`Loading OpenAPI document from ${this.url}`);

    try {
      // Fetch the document
      const response = await axios.get(this.url, {
        headers: {
          'Accept': 'application/json, application/yaml, application/x-yaml',
        },
        timeout: 30000, // 30 second timeout
      });

      const document = response.data;

      // Basic validation - check if it's an OpenAPI document
      logger.debug('Validating OpenAPI document structure');
      if (!document || typeof document !== 'object') {
        throw new Error('Invalid OpenAPI document: not a valid object');
      }

      if (!document.openapi && !document.swagger) {
        throw new Error('Invalid OpenAPI document: missing openapi or swagger version field');
      }

      if (!document.paths && !document.components) {
        throw new Error('Invalid OpenAPI document: missing paths or components');
      }

      logger.info('OpenAPI document loaded and validated successfully');
      logger.info(`OpenAPI version: ${document.openapi || document.swagger}`);

      // Cache the document
      this.cache.set(document);

      return document;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response
          ? `HTTP ${error.response.status}: ${error.response.statusText}`
          : error.message;
        logger.error(`Failed to load OpenAPI document: ${message}`);
        throw new Error(`Failed to load OpenAPI document from ${this.url}: ${message}`);
      }

      logger.error('Failed to load OpenAPI document', error);
      throw error;
    }
  }

  /**
   * Get cached document without loading
   */
  getCached(): OpenAPIDocument | null {
    return this.cache.get();
  }

  /**
   * Clear cached document
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if cache is valid
   */
  isCacheValid(): boolean {
    return this.cache.isValid();
  }
}
