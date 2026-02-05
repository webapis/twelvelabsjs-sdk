import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  TwelveLabsError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NotFoundError,
} from '../client/errors';
import { USER_AGENT } from '../version';

export interface HttpClientConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}

export class HttpClient {
  private client: AxiosInstance;
  private config: HttpClientConfig;

  constructor(config: HttpClientConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.twelvelabs.io/v1.3',
      timeout: config.timeout || 10000,
      headers: {
        'x-api-key': config.apiKey,
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/json',
      },
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );
  }

  private handleError(error: any): Promise<never> {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || error.message;
      const details = data;

      switch (status) {
        case 400:
          throw new ValidationError(message, details);
        case 401:
          throw new AuthenticationError(message, details);
        case 404:
          throw new NotFoundError(message, details);
        case 429:
          throw new RateLimitError(message, details);
        default:
          throw new TwelveLabsError(message, 'api_error', status, details);
      }
    }
    throw new TwelveLabsError(error.message, 'network_error');
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config
    );
    return response.data;
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}
