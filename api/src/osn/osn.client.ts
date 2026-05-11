import { Logger } from '@nestjs/common';

import { BadRequestError, InternalServerError } from '@/errors';
import { osnConfig } from './osn.config';

type RequestOptions = {
  method: string;
  path: string;
  body?: any;
  query?: Record<string, string | number | boolean | undefined>;
};

function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** Minting and submit flows — log full request/response to compare with OSN contract (amount format, destination, etc.). */
function isMintingPath(path: string): boolean {
  return path.includes('/minting/');
}

export class OsnClient {
  private readonly log = new Logger(OsnClient.name);
  private timeoutMs: number;

  constructor() {
    this.timeoutMs = osnConfig.requestTimeoutMs;
  }

  private buildUrl(path: string, query?: RequestOptions['query']): string {
    const base = osnConfig.baseUrl.replace(/\/+$/, '');
    const prefix = osnConfig.apiVersionPrefix || '';
    const fullPath = path.startsWith('/') ? `${prefix}${path}` : `${prefix}/${path}`;

    const url = new URL(`${base}${fullPath}`);
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        url.searchParams.set(k, String(v));
      });
    }
    return url.toString();
  }

  private async request<T>({ method, path, body, query }: RequestOptions): Promise<T> {
    if (!osnConfig.baseUrl) {
      throw new InternalServerError('OSN_BASE_URL is not configured');
    }
    if (!osnConfig.apiKey) {
      throw new InternalServerError('OSN_API_KEY is not configured');
    }

    const url = this.buildUrl(path, query);

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': osnConfig.apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const text = await res.text();
      const parsed = text ? safeJsonParse(text) : null;
      const responseForLog = parsed !== null ? parsed : text;
      const requestForLog = body ?? null;

      if (!res.ok) {
        this.log.warn(
          `OSN HTTP error ${res.status} ${method} ${path}\nurl=${url}\nrequest=${safeJsonStringify(requestForLog)}\nresponse=${typeof responseForLog === 'string' ? responseForLog : safeJsonStringify(responseForLog)}`,
        );
        const msg =
          (parsed && (parsed.message || parsed.error)) ||
          `OSN request failed with status ${res.status}`;
        throw new BadRequestError(msg);
      }

      if (isMintingPath(path)) {
        this.log.log(
          `OSN ${method} ${path} OK ${res.status}\nurl=${url}\nrequest=${safeJsonStringify(requestForLog)}\nresponse=${typeof responseForLog === 'string' ? responseForLog : safeJsonStringify(responseForLog)}`,
        );
      }

      return parsed as T;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new BadRequestError(`OSN request timeout after ${this.timeoutMs}ms`);
      }
      if (err instanceof BadRequestError) throw err;
      this.log.error(
        `OSN fetch/network error ${method} ${path}\nurl=${url}\nrequest=${safeJsonStringify(body ?? null)}\nerror=${err?.message ?? err}`,
      );
      throw new InternalServerError(err?.message || 'OSN request failed');
    } finally {
      clearTimeout(t);
    }
  }

  async get<T>(path: string, query?: RequestOptions['query']): Promise<T> {
    return this.request<T>({ method: 'GET', path, query });
  }

  async post<T>(path: string, body?: any): Promise<T> {
    return this.request<T>({ method: 'POST', path, body });
  }

  async put<T>(path: string, body?: any): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body });
  }
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

