/**
 * PostGIS schema for the operational entities.
 *
 * Coordinates are stored as `geography(Point, 4326)` so that ST_Distance and
 * ST_DWithin return values in metres without manual projection. Each table
 * gets a GiST index on the geography column to keep proximity search fast.
 */
export const SCHEMA_SQL = `
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS facilities (
  id             text PRIMARY KEY,
  name           text NOT NULL,
  type           text NOT NULL,
  status         text NOT NULL,
  available_beds integer,
  geom           geography(Point, 4326) NOT NULL
);

CREATE TABLE IF NOT EXISTS resources (
  id                   text PRIMARY KEY,
  unit_number          text NOT NULL,
  type                 text NOT NULL,
  status               text NOT NULL,
  assigned_incident_id text,
  geom                 geography(Point, 4326) NOT NULL
);

CREATE TABLE IF NOT EXISTS incidents (
  id          text PRIMARY KEY,
  type        text NOT NULL,
  priority    text NOT NULL,
  status      text NOT NULL,
  address     text,
  description text NOT NULL,
  reported_at timestamptz NOT NULL,
  geom        geography(Point, 4326) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_facilities_geom ON facilities USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_resources_geom  ON resources  USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_incidents_geom  ON incidents  USING GIST (geom);
`;
