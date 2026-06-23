import { Knex } from 'knex';
const { randomUUID } = require('crypto');
export interface BannerRow {
  id: string;
  title: string;
  message: string;
  variant: 'release' | 'info' | 'success' | 'warning';
  badge: string | null;
  cta_label: string | null;
  cta_href: string | null;
  active_from: string;
  active_to: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface BannerInput {
  title: string;
  message: string;
  variant?: 'release' | 'info' | 'success' | 'warning';
  badge?: string;
  ctaLabel?: string;
  ctaHref?: string;
  activeFrom: string;
  activeTo: string;
  enabled?: boolean;
}

function toApiShape(row: BannerRow) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    variant: row.variant,
    badge: row.badge ?? undefined,
    ctaLabel: row.cta_label ?? undefined,
    ctaHref: row.cta_href ?? undefined,
    activeFrom: row.active_from,
    activeTo: row.active_to,
    enabled: Boolean(row.enabled),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class BannerDatabase {
  constructor(private readonly db: Knex) {}

  async getAll() {
    const rows = await this.db<BannerRow>('banners').orderBy('created_at', 'desc');
    return rows.map(toApiShape);
  }

  async getActive() {
    const today = new Date().toISOString().split('T')[0];
    const rows = await this.db<BannerRow>('banners')
      .where('enabled', true)
      .where('active_from', '<=', today)
      .where('active_to', '>=', today)
      .orderBy('created_at', 'desc');
    return rows.map(toApiShape);
  }

  async getById(id: string) {
    const row = await this.db<BannerRow>('banners').where({ id }).first();
    return row ? toApiShape(row) : null;
  }

  async create(input: BannerInput) {
    const id: string = randomUUID();
    await this.db<BannerRow>('banners').insert({
      id,
      title: input.title,
      message: input.message,
      variant: input.variant ?? 'info',
      badge: input.badge ?? null,
      cta_label: input.ctaLabel ?? null,
      cta_href: input.ctaHref ?? null,
      active_from: input.activeFrom,
      active_to: input.activeTo,
      enabled: input.enabled ?? true,
    });
    return this.getById(id);
  }

  async update(id: string, input: Partial<BannerInput>) {
    const patch: Partial<BannerRow> = {};
    if (input.title !== undefined) patch.title = input.title;
    if (input.message !== undefined) patch.message = input.message;
    if (input.variant !== undefined) patch.variant = input.variant;
    if (input.badge !== undefined) patch.badge = input.badge;
    if (input.ctaLabel !== undefined) patch.cta_label = input.ctaLabel;
    if (input.ctaHref !== undefined) patch.cta_href = input.ctaHref;
    if (input.activeFrom !== undefined) patch.active_from = input.activeFrom;
    if (input.activeTo !== undefined) patch.active_to = input.activeTo;
    if (input.enabled !== undefined) patch.enabled = input.enabled;
    await this.db<BannerRow>('banners').where({ id }).update({
      ...patch,
      updated_at: new Date().toISOString(),
    });
    return this.getById(id);
  }

  async delete(id: string) {
    await this.db<BannerRow>('banners').where({ id }).delete();
  }
}