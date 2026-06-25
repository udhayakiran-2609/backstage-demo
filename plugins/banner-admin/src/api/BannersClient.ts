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

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = await this.baseUrl();
    const res = await this.fetchApi.fetch(`${url}${path}`, options);
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`Banners API error ${res.status}: ${text}`);
    }
    if (res.status === 204) return undefined as unknown as T;
    return await res.json();
  }

  async getAll(): Promise<Banner[]> {
    const data = await this.request<{ banners?: Banner[] }>('/');
    return data?.banners ?? [];
  }

  async getActive(): Promise<Banner[]> {
    const data = await this.request<{ banners?: Banner[] }>('/active');
    return data?.banners ?? [];
  }

  async create(input: BannerInput): Promise<Banner> {
    const data = await this.request<{ banner: Banner }>('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return data.banner;
  }

  async update(id: string, input: Partial<BannerInput>): Promise<Banner> {
    const data = await this.request<{ banner: Banner }>(`/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return data.banner;
  }

  async toggle(id: string): Promise<Banner> {
    const data = await this.request<{ banner: Banner }>(`/${id}/toggle`, {
      method: 'PATCH',
    });
    return data.banner;
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/${id}`, { method: 'DELETE' });
  }
}