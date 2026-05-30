import { Injectable } from '@nestjs/common';
import { SearchResults } from '../common/domain';
import { FacilitiesService } from '../facilities/facilities.service';
import { ResourcesService } from '../resources/resources.service';
import { IncidentsService } from '../incidents/incidents.service';

/** A candidate field and how strongly a match on it should count. */
interface WeightedField {
  value: string | undefined;
  weight: number;
}

@Injectable()
export class SearchService {
  constructor(
    private readonly facilities: FacilitiesService,
    private readonly resources: ResourcesService,
    private readonly incidents: IncidentsService,
  ) {}

  /**
   * Score a record against the query by summing weighted field matches.
   * Exact and prefix matches are boosted over plain substring containment.
   * Returns 0 when nothing matches, so the record is excluded.
   */
  private score(query: string, fields: WeightedField[]): number {
    let score = 0;
    for (const { value, weight } of fields) {
      if (!value) continue;
      const haystack = value.toLowerCase();
      if (haystack === query) {
        score += weight * 3;
      } else if (haystack.startsWith(query)) {
        score += weight * 2;
      } else if (haystack.includes(query)) {
        score += weight;
      }
    }
    return score;
  }

  search(rawQuery: string): SearchResults {
    const query = rawQuery.trim().toLowerCase();

    if (!query) {
      return { query: rawQuery, total: 0, incidents: [], resources: [], facilities: [] };
    }

    const incidents = this.incidents
      .findAll()
      .map((i) => ({
        item: i,
        score: this.score(query, [
          { value: i.type, weight: 5 },
          { value: i.priority, weight: 4 },
          { value: i.status, weight: 3 },
          { value: i.location.address, weight: 3 },
          { value: i.description, weight: 2 },
          { value: i.id, weight: 1 },
        ]),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item);

    const resources = this.resources
      .findAll()
      .map((r) => ({
        item: r,
        score: this.score(query, [
          { value: r.unitNumber, weight: 5 },
          { value: r.type, weight: 4 },
          { value: r.status, weight: 3 },
          { value: r.id, weight: 1 },
        ]),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item);

    const facilities = this.facilities
      .findAll()
      .map((f) => ({
        item: f,
        score: this.score(query, [
          { value: f.name, weight: 5 },
          { value: f.type, weight: 4 },
          { value: f.status, weight: 3 },
          { value: f.id, weight: 1 },
        ]),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item);

    return {
      query: rawQuery,
      total: incidents.length + resources.length + facilities.length,
      incidents,
      resources,
      facilities,
    };
  }
}
