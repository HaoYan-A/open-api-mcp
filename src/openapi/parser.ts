/**
 * OpenAPI document parser - extracts and indexes API endpoints
 */

import type { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import type { OpenAPIDocument, ApiEndpoint, ApiSchemaDetails, SearchOptions, ListOptions } from '../types.js';
import { logger } from '../logger.js';

type PathItemObject = OpenAPIV3.PathItemObject | OpenAPIV3_1.PathItemObject;
type OperationObject = OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject;
type ParameterObject = OpenAPIV3.ParameterObject | OpenAPIV3_1.ParameterObject;

export class OpenAPIParser {
  private document: OpenAPIDocument;
  private endpoints: ApiEndpoint[] = [];
  private baseUrl: string;

  constructor(document: OpenAPIDocument) {
    this.document = document;
    this.baseUrl = this.extractBaseUrl();
    this.indexEndpoints();
  }

  /**
   * Extract base URL from servers
   */
  private extractBaseUrl(): string {
    if (this.document.servers && this.document.servers.length > 0) {
      return this.document.servers[0].url;
    }
    return '';
  }

  /**
   * Index all API endpoints
   */
  private indexEndpoints(): void {
    const paths = this.document.paths || {};

    for (const [path, pathItem] of Object.entries(paths)) {
      if (!pathItem) continue;

      const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'] as const;

      for (const method of methods) {
        const operation = pathItem[method] as OperationObject | undefined;
        if (!operation) continue;

        this.endpoints.push({
          path,
          method: method.toUpperCase(),
          operationId: operation.operationId,
          summary: operation.summary,
          description: operation.description,
          tags: operation.tags,
          deprecated: operation.deprecated,
          security: operation.security as Array<Record<string, string[]>> | undefined,
        });
      }
    }

    logger.info(`Indexed ${this.endpoints.length} API endpoints`);
  }

  /**
   * Get all endpoints
   */
  getAllEndpoints(): ApiEndpoint[] {
    return [...this.endpoints];
  }

  /**
   * List endpoints with pagination and filtering
   */
  listEndpoints(options: ListOptions = {}): { endpoints: ApiEndpoint[]; total: number } {
    let filtered = [...this.endpoints];

    // Filter by tag
    if (options.tag) {
      const tag = options.tag.toLowerCase();
      filtered = filtered.filter((endpoint) =>
        endpoint.tags?.some((t) => t.toLowerCase().includes(tag))
      );
    }

    const total = filtered.length;

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;

    const paginated = filtered.slice(offset, offset + limit);

    return {
      endpoints: paginated,
      total,
    };
  }

  /**
   * Search endpoints
   */
  searchEndpoints(options: SearchOptions): ApiEndpoint[] {
    const { query, method, tag } = options;
    const queryLower = query.toLowerCase();

    return this.endpoints.filter((endpoint) => {
      // Filter by method if specified
      if (method && endpoint.method.toLowerCase() !== method.toLowerCase()) {
        return false;
      }

      // Filter by tag if specified
      if (tag) {
        const tagLower = tag.toLowerCase();
        if (!endpoint.tags?.some((t) => t.toLowerCase().includes(tagLower))) {
          return false;
        }
      }

      // Search in path, summary, description, operationId
      return (
        endpoint.path.toLowerCase().includes(queryLower) ||
        endpoint.summary?.toLowerCase().includes(queryLower) ||
        endpoint.description?.toLowerCase().includes(queryLower) ||
        endpoint.operationId?.toLowerCase().includes(queryLower) ||
        endpoint.tags?.some((t) => t.toLowerCase().includes(queryLower))
      );
    });
  }

  /**
   * Resolve $ref references in the schema
   */
  private resolveRef(schema: any, maxDepth: number = 10): any {
    if (maxDepth <= 0) {
      logger.warn('Max depth reached while resolving $ref');
      return schema;
    }

    if (!schema || typeof schema !== 'object') {
      return schema;
    }

    // If this is a $ref, resolve it
    if (schema.$ref && typeof schema.$ref === 'string') {
      const refPath = schema.$ref;

      // Handle #/components/schemas/... references
      if (refPath.startsWith('#/')) {
        const parts = refPath.substring(2).split('/'); // Remove #/ and split
        let resolved: any = this.document;

        for (const part of parts) {
          if (resolved && typeof resolved === 'object') {
            resolved = resolved[part];
          } else {
            logger.warn(`Failed to resolve $ref: ${refPath}`);
            return schema;
          }
        }

        // Recursively resolve the referenced schema
        if (resolved) {
          return this.resolveRef(resolved, maxDepth - 1);
        }
      }

      return schema;
    }

    // If it's an array, resolve each item
    if (Array.isArray(schema)) {
      return schema.map(item => this.resolveRef(item, maxDepth));
    }

    // If it's an object, resolve all properties
    const result: any = {};
    for (const [key, value] of Object.entries(schema)) {
      result[key] = this.resolveRef(value, maxDepth);
    }

    return result;
  }

  /**
   * Get detailed schema for a specific endpoint with resolved $refs
   */
  getEndpointSchema(path: string, method: string): ApiSchemaDetails | null {
    const methodLower = method.toLowerCase();
    const pathItem = this.document.paths?.[path];

    if (!pathItem) {
      return null;
    }

    const operation = pathItem[methodLower as keyof PathItemObject] as OperationObject | undefined;

    if (!operation) {
      return null;
    }

    // Resolve parameters (including path-level parameters)
    const pathParams = (pathItem.parameters as ParameterObject[] | undefined) || [];
    const opParams = (operation.parameters as ParameterObject[] | undefined) || [];
    const allParams = [...pathParams, ...opParams];

    // Resolve $refs in parameters, requestBody and responses
    const resolvedParameters = allParams.length > 0
      ? this.resolveRef(allParams)
      : [];

    const resolvedRequestBody = operation.requestBody
      ? this.resolveRef(operation.requestBody)
      : undefined;

    const resolvedResponses = operation.responses
      ? this.resolveRef(operation.responses)
      : undefined;

    return {
      path,
      method: method.toUpperCase(),
      operationId: operation.operationId,
      summary: operation.summary,
      description: operation.description,
      tags: operation.tags,
      deprecated: operation.deprecated,
      parameters: resolvedParameters,
      requestBody: resolvedRequestBody,
      responses: resolvedResponses,
      security: operation.security as Array<Record<string, string[]>> | undefined,
    };
  }

  /**
   * Get all unique tags
   */
  getTags(): string[] {
    const tagsSet = new Set<string>();

    for (const endpoint of this.endpoints) {
      if (endpoint.tags) {
        for (const tag of endpoint.tags) {
          tagsSet.add(tag);
        }
      }
    }

    return Array.from(tagsSet).sort();
  }

  /**
   * Get document info
   */
  getInfo(): {
    title?: string;
    version?: string;
    description?: string;
    baseUrl: string;
    totalEndpoints: number;
    tags: string[];
  } {
    return {
      title: this.document.info?.title,
      version: this.document.info?.version,
      description: this.document.info?.description,
      baseUrl: this.baseUrl,
      totalEndpoints: this.endpoints.length,
      tags: this.getTags(),
    };
  }

  /**
   * Get security schemes from the document
   */
  getSecuritySchemes(): Record<string, any> | undefined {
    return (this.document.components as any)?.securitySchemes;
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Reload parser with a new OpenAPI document
   */
  reload(document: OpenAPIDocument): void {
    logger.info('Reloading OpenAPI document...');
    this.document = document;
    this.endpoints = [];
    this.baseUrl = this.extractBaseUrl();
    this.indexEndpoints();
    logger.info('OpenAPI document reloaded successfully');
  }
}
