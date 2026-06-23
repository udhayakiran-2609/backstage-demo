import { createApiRef, DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

export interface Banner {
  id: string;
  title: string;
  message: string;
  variant: 'release' | 'info' | 'success' | 'warning';
  badge?: string;
  ctaLabel?: string;
  ctaHref?: string;
  activeFrom: string;
  activeTo: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BannerInput = Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>;

export interface BannersApi {
  getAll(): Promise<Banner[]>;
  getActive(): Promise<Banner[]>;
  create(input: BannerInput): Promise<Banner>;
  update(id: string, input: Partial<BannerInput>): Promise<Banner>;
  toggle(id: string): Promise<Banner>;
  delete(id: string): Promise<void>;
}

export const bannersApiRef = createApiRef<BannersApi>({
  id: 'plugin.banners.service',
});

export class BannersClient implements BannersApi {
  constructor(
    private readonly discoveryApi: DiscoveryApi,
    private readonly fetchApi: FetchApi,
  ) {}

  private async baseUrl() {
    return await this.discoveryApi.getBaseUrl('banners');
  }

  async getAll(): Promise<Banner[]> {
    const url = await this.baseUrl();
    const res = await this.fetchApi.fetch(`${url}/`);
    const data = await res.json();
    return data.banners;
  }

  async getActive(): Promise<Banner[]> {
    const url = await this.baseUrl();
    const res = await this.fetchApi.fetch(`${url}/active`);
    const data = await res.json();
    return data.banners;
  }

  async create(input: BannerInput): Promise<Banner> {
    const url = await this.baseUrl();
    const res = await this.fetchApi.fetch(`${url}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.banner;
  }

  async update(id: string, input: Partial<BannerInput>): Promise<Banner> {
    const url = await this.baseUrl();
    const res = await this.fetchApi.fetch(`${url}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.banner;
  }

  async toggle(id: string): Promise<Banner> {
    const url = await this.baseUrl();
    const res = await this.fetchApi.fetch(`${url}/${id}/toggle`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.banner;
  }

  async delete(id: string): Promise<void> {
    const url = await this.baseUrl();
    await this.fetchApi.fetch(`${url}/${id}`, { method: 'DELETE' });
  }
}