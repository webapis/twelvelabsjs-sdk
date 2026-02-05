import { HttpClient } from './http-client';

export class BaseResource {
  protected client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }
}
