/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface HttpError extends Error {
  status?: number;
  statusText?: string;
  data?: unknown;
}

@Injectable()
export class HttpService {
  constructor(
    @InjectPinoLogger(HttpService.name)
    private readonly logger: PinoLogger,
  ) {}

  private async handleRequest<T>(
    method: HttpMethod,
    url: string,
    payload?: unknown,
  ): Promise<T> {
    try {
      this.logger.info(`Making ${method} request to ${url}`, {
        method,
        url,
        payload,
      });

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (payload && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(payload);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const error = new Error(
          `HTTP error! status: ${response.status}`,
        ) as HttpError;
        error.status = response.status;
        error.statusText = response.statusText;
        try {
          error.data = await response.json();
        } catch {
          error.data = await response.text();
        }
        this.logger.error(`${method} request to ${url} failed`, {
          error: error.message,
          status: error.status,
          statusText: error.statusText,
          data: error.data,
        });
        throw error;
      }

      const data = await response.json();

      this.logger.info(`${method} request to ${url} completed successfully`, {
        status: response.status,
        statusText: response.statusText,
      });

      return data as T;
    } catch (error) {
      const httpError = error as HttpError;
      this.logger.error(`${method} request to ${url} failed`, {
        error: httpError.message,
        status: httpError.status,
        statusText: httpError.statusText,
        data: httpError.data,
      });
      throw error;
    }
  }

  async get<T>(url: string): Promise<T> {
    return this.handleRequest<T>('GET', url);
  }

  async post<T>(url: string, payload: unknown): Promise<T> {
    return this.handleRequest<T>('POST', url, payload);
  }

  async put<T>(url: string, payload: unknown): Promise<T> {
    return this.handleRequest<T>('PUT', url, payload);
  }

  async delete<T>(url: string): Promise<T> {
    return this.handleRequest<T>('DELETE', url);
  }
}
