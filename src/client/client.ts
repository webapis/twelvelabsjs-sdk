import { HttpClient, HttpClientConfig } from '../internal/http-client';
import { VERSION, API_VERSION } from '../version';
import { Indexes } from '../resources/indexes';

export interface TwelveLabsConfig extends HttpClientConfig {}

export class TwelveLabsClient {
  public static readonly VERSION = VERSION;
  public static readonly API_VERSION = API_VERSION;

  private httpClient: HttpClient;
  public indexes: Indexes;

  constructor(config: TwelveLabsConfig) {
    this.httpClient = new HttpClient(config);
    this.indexes = new Indexes(this.httpClient);
    // Other resources will be initialized here
  }

  /**
   * Get the current SDK version
   */
  public getVersion(): string {
    return VERSION;
  }
}
