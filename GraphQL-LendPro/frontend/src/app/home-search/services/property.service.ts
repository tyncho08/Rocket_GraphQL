import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map, BehaviorSubject, tap } from 'rxjs';
import { 
  SEARCH_PROPERTIES_QUERY, 
  GET_PROPERTY_QUERY, 
  TOGGLE_FAVORITE_MUTATION,
  GET_LOCATIONS_QUERY,
  GET_FAVORITE_PROPERTIES_QUERY
} from '../../graphql/queries';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private favoritePropertiesSubject = new BehaviorSubject<any[]>([]);
  public favoriteProperties$ = this.favoritePropertiesSubject.asObservable();

  constructor(private apollo: Apollo) {}

  searchProperties(searchParams: any): Observable<any> {
    return this.apollo.query({
      query: SEARCH_PROPERTIES_QUERY,
      variables: {
        search: {
          city: searchParams.city || null,
          state: searchParams.state || null,
          minPrice: searchParams.minPrice || null,
          maxPrice: searchParams.maxPrice || null,
          minBedrooms: searchParams.minBedrooms || null,
          maxBedrooms: searchParams.maxBedrooms || null,
          minBathrooms: searchParams.minBathrooms || null,
          maxBathrooms: searchParams.maxBathrooms || null,
          propertyType: searchParams.propertyType || null
        },
        first: searchParams.pageSize || 10,
        after: searchParams.cursor || null
      }
    }).pipe(
      map(result => {
        const data = result.data as any;
        return {
          properties: data.properties.edges.map((e: any) => e.node),
          hasNextPage: data.properties.pageInfo.hasNextPage,
          endCursor: data.properties.pageInfo.endCursor
        };
      })
    );
  }

  getPropertyById(id: number): Observable<any> {
    return this.apollo.query({
      query: GET_PROPERTY_QUERY,
      variables: { id }
    }).pipe(
      map(result => (result.data as any).property)
    );
  }

  toggleFavorite(propertyId: number): Observable<boolean> {
    return this.apollo.mutate({
      mutation: TOGGLE_FAVORITE_MUTATION,
      variables: { propertyId }
    } as any).pipe(
      map(result => (result.data as any)?.toggleFavoriteProperty?.isFavorite || false),
      tap(() => this.loadFavoriteProperties())
    );
  }

  getFavoriteProperties(): Observable<any[]> {
    return this.apollo.query({
      query: GET_FAVORITE_PROPERTIES_QUERY,
      variables: { first: 50 }
    }).pipe(
      map(result => {
        const data = result.data as any;
        const properties = data.favoriteProperties.edges.map((e: any) => e.node);
        this.favoritePropertiesSubject.next(properties);
        return properties;
      })
    );
  }

  private loadFavoriteProperties(): void {
    this.getFavoriteProperties().subscribe();
  }

  isPropertyFavorite(propertyId: number): boolean {
    const favorites = this.favoritePropertiesSubject.value;
    return favorites.some(prop => prop.id === propertyId);
  }

  getLocations(): Observable<any> {
    return this.apollo.query({
      query: GET_LOCATIONS_QUERY
    }).pipe(
      map(result => (result.data as any).locations)
    );
  }

  getPropertyTypes(): Observable<string[]> {
    // For now, return default property types since we don't have a specific GraphQL query for this
    // This could be enhanced later with a dedicated query
    return new Observable(observer => {
      observer.next(['Single Family', 'Condo', 'Townhouse', 'Multi-Family']);
      observer.complete();
    });
  }
}