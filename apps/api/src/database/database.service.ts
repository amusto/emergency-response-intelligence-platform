import { existsSync, readFileSync } from 'fs';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import { SCHEMA_SQL } from './schema.sql';
import { FACILITIES } from '../seed/facilities.seed';
import { RESOURCES } from '../seed/resources.seed';
import { INCIDENTS } from '../seed/incidents.seed';

/** Advisory-lock key used to serialize schema bootstrap across instances. */
const BOOTSTRAP_LOCK_KEY = 4_911_001;

/**
 * Owns the Postgres connection pool, bootstraps the PostGIS schema on startup,
 * and seeds reference data from the canonical TS seed arrays when the tables
 * are empty. This keeps the seed files as the single source of truth while the
 * data is served from PostGIS.
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;

  constructor() {
    const config: PoolConfig = {
      connectionString:
        process.env.DATABASE_URL ??
        'postgres://erip:erip@localhost:5432/erip',
      ssl: this.resolveSsl(),
    };
    this.pool = new Pool(config);
  }

  /**
   * TLS config for the connection. AWS RDS requires SSL; enable it by setting
   * DATABASE_SSL=true. Provide the RDS CA bundle via DATABASE_CA_CERT (inline
   * PEM or a file path) to keep certificate verification on — the secure
   * default. Set DATABASE_SSL_REJECT_UNAUTHORIZED=false only as a last resort.
   */
  private resolveSsl(): PoolConfig['ssl'] {
    if ((process.env.DATABASE_SSL ?? 'false').toLowerCase() !== 'true') {
      return undefined;
    }
    const ca = this.loadCaCert();
    const rejectUnauthorized =
      (process.env.DATABASE_SSL_REJECT_UNAUTHORIZED ?? 'true').toLowerCase() !==
      'false';
    return ca ? { ca, rejectUnauthorized } : { rejectUnauthorized };
  }

  private loadCaCert(): string | undefined {
    const raw = process.env.DATABASE_CA_CERT;
    if (!raw) return undefined;
    if (raw.includes('BEGIN CERTIFICATE')) return raw;
    return existsSync(raw) ? readFileSync(raw, 'utf8') : undefined;
  }

  async onModuleInit(): Promise<void> {
    if ((process.env.DB_BOOTSTRAP ?? 'true').toLowerCase() === 'false') {
      this.logger.log('DB_BOOTSTRAP=false — skipping schema/seed bootstrap');
      return;
    }
    // Serialize bootstrap so concurrent instances (e.g. behind a load
    // balancer) don't race on CREATE EXTENSION / seeding against shared RDS.
    const client = await this.pool.connect();
    try {
      await client.query('SELECT pg_advisory_lock($1)', [BOOTSTRAP_LOCK_KEY]);
      await client.query(SCHEMA_SQL);
      if ((process.env.DB_SEED ?? 'true').toLowerCase() !== 'false') {
        await this.seed();
      }
      this.logger.log('PostGIS schema ready and seed data ensured');
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [BOOTSTRAP_LOCK_KEY]);
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  /** Insert seed rows only when a table is empty (idempotent on restart). */
  private async seed(): Promise<void> {
    const { rows } = await this.pool.query<{ count: string }>(
      'SELECT count(*)::text AS count FROM facilities',
    );
    if (Number(rows[0].count) > 0) {
      return;
    }

    for (const f of FACILITIES) {
      await this.pool.query(
        `INSERT INTO facilities (id, name, type, status, available_beds, geom)
         VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography)`,
        [f.id, f.name, f.type, f.status, f.availableBeds ?? null, f.longitude, f.latitude],
      );
    }

    for (const r of RESOURCES) {
      await this.pool.query(
        `INSERT INTO resources (id, unit_number, type, status, assigned_incident_id, geom)
         VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326)::geography)`,
        [
          r.id,
          r.unitNumber,
          r.type,
          r.status,
          r.assignedIncidentId ?? null,
          r.longitude,
          r.latitude,
        ],
      );
    }

    for (const i of INCIDENTS) {
      await this.pool.query(
        `INSERT INTO incidents (id, type, priority, status, address, description, reported_at, geom)
         VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($8, $9), 4326)::geography)`,
        [
          i.id,
          i.type,
          i.priority,
          i.status,
          i.location.address ?? null,
          i.description,
          i.reportedAt,
          i.location.longitude,
          i.location.latitude,
        ],
      );
    }

    this.logger.log(
      `Seeded ${FACILITIES.length} facilities, ${RESOURCES.length} resources, ${INCIDENTS.length} incidents`,
    );
  }
}
