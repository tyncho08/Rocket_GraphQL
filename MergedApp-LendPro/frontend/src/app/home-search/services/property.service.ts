import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Property, PropertySearchFilters, PropertySearchResult, PropertyLocations } from '../../shared/models/property.model';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = `${environment.apiUrl}/properties`;
  private favoritePropertiesSubject = new BehaviorSubject<Property[]>([]);
  public favoriteProperties$ = this.favoritePropertiesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  searchProperties(filters: PropertySearchFilters): Observable<PropertySearchResult> {
    let params = new HttpParams();
    
    if (filters.city) params = params.set('city', filters.city);
    if (filters.state) params = params.set('state', filters.state);
    if (filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minBedrooms) params = params.set('minBedrooms', filters.minBedrooms.toString());
    if (filters.maxBedrooms) params = params.set('maxBedrooms', filters.maxBedrooms.toString());
    if (filters.minBathrooms) params = params.set('minBathrooms', filters.minBathrooms.toString());
    if (filters.maxBathrooms) params = params.set('maxBathrooms', filters.maxBathrooms.toString());
    if (filters.propertyType) params = params.set('propertyType', filters.propertyType);
    
    params = params.set('page', filters.page.toString());
    params = params.set('pageSize', filters.pageSize.toString());
    params = params.set('sortBy', filters.sortBy);
    params = params.set('sortOrder', filters.sortOrder);

    const headers = this.authService.isAuthenticated() ? this.authService.getAuthHeaders() : {};
    
    return this.http.get<PropertySearchResult>(`${this.apiUrl}/search`, { params, headers });
  }

  getPropertyById(id: number): Observable<Property> {
    const headers = this.authService.isAuthenticated() ? this.authService.getAuthHeaders() : {};
    return this.http.get<Property>(`${this.apiUrl}/${id}`, { headers });
  }

  toggleFavorite(propertyId: number): Observable<{ isFavorite: boolean }> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('Must be logged in to manage favorites');
    }

    const headers = this.authService.getAuthHeaders();
    return this.http.post<{ isFavorite: boolean }>(`${this.apiUrl}/${propertyId}/favorite`, {}, { headers })
      .pipe(
        tap(() => this.loadFavoriteProperties())
      );
  }

  getFavoriteProperties(): Observable<Property[]> {
    if (!this.authService.isAuthenticated()) {
      return new Observable(observer => observer.next([]));
    }

    const headers = this.authService.getAuthHeaders();
    return this.http.get<Property[]>(`${this.apiUrl}/favorites`, { headers })
      .pipe(
        tap(favorites => this.favoritePropertiesSubject.next(favorites))
      );
  }

  private loadFavoriteProperties(): void {
    this.getFavoriteProperties().subscribe();
  }

  // Helper method to check if property is favorite
  isPropertyFavorite(propertyId: number): boolean {
    const favorites = this.favoritePropertiesSubject.value;
    return favorites.some(prop => prop.id === propertyId);
  }

  // Get property types for filter dropdown
  getPropertyTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/types`).pipe(
      // Fallback to default types if API doesn't exist
      map(types => types.length > 0 ? types : ['Single Family', 'Condo', 'Townhouse', 'Multi-Family'])
    );
  }

  // Get available states/cities for location filters
  getLocations(): Observable<PropertyLocations> {
    return this.http.get<PropertyLocations>(`${this.apiUrl}/locations`);
  }
}