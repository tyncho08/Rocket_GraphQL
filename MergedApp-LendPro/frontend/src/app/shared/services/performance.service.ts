import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, shareReplay, throttleTime } from 'rxjs/operators';

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  cacheHitRate: number;
  networkRequests: number;
  errorRate: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  hits: number;
}

export interface LazyLoadConfig {
  rootMargin?: string;
  threshold?: number | number[];
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private cache = new Map<string, CacheEntry<any>>();
  private performanceMetrics = new BehaviorSubject<Partial<PerformanceMetrics>>({});
  private intersectionObserver?: IntersectionObserver;
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  // Performance monitoring
  private loadStartTime = performance.now();
  private renderStartTime = performance.now();
  private networkRequestCount = 0;
  private errorCount = 0;

  constructor() {
    this.initializePerformanceMonitoring();
    this.setupIntersectionObserver();
    this.monitorNetworkRequests();
  }

  /**
   * Cache data with TTL (Time To Live)
   */
  setCache<T>(key: string, data: T, ttl: number = this.DEFAULT_CACHE_TTL): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      hits: 0
    };
    
    this.cache.set(key, entry);
    
    // Clean up expired entries periodically
    this.cleanExpiredCache();
  }

  /**
   * Get data from cache
   */
  getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hits++;
    return entry.data as T;
  }

  /**
   * Check if data exists in cache and is not expired
   */
  hasValidCache(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && Date.now() <= entry.expiry;
  }

  /**
   * Clear all cache or specific key
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number; entries: Array<{key: string; hits: number; age: number}> } {
    const entries: Array<{key: string; hits: number; age: number}> = [];
    let totalHits = 0;
    let totalRequests = 0;
    
    this.cache.forEach((entry, key) => {
      entries.push({
        key,
        hits: entry.hits,
        age: Date.now() - entry.timestamp
      });
      totalHits += entry.hits;
      totalRequests += entry.hits > 0 ? entry.hits : 1;
    });
    
    return {
      size: this.cache.size,
      hitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
      entries
    };
  }

  /**
   * Debounce function calls to prevent excessive API requests
   */
  debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timeoutId: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Throttle function calls to limit execution frequency
   */
  throttle<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }

  /**
   * Lazy load images with intersection observer
   */
  lazyLoadImage(img: HTMLImageElement, src: string): void {
    if (!this.intersectionObserver) {
      // Fallback for browsers without intersection observer
      img.src = src;
      return;
    }

    img.dataset['lazySrc'] = src;
    this.intersectionObserver.observe(img);
  }

  /**
   * Preload critical resources
   */
  preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font' = 'script'): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      
      switch (type) {
        case 'script':
          link.as = 'script';
          break;
        case 'style':
          link.as = 'style';
          break;
        case 'image':
          link.as = 'image';
          break;
        case 'font':
          link.as = 'font';
          link.crossOrigin = 'anonymous';
          break;
      }
      
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload ${url}`));
      
      document.head.appendChild(link);
    });
  }

  /**
   * Monitor bundle size and suggest optimizations
   */
  analyzeBundleSize(): Observable<{size: number; suggestions: string[]}> {
    const suggestions: string[] = [];
    
    // Estimate bundle size (this would be more accurate with build tools)
    const scriptTags = document.querySelectorAll('script[src]');
    let estimatedSize = 0;
    
    scriptTags.forEach(script => {
      // This is a rough estimate - in a real app you'd get actual sizes
      estimatedSize += 500000; // Assume 500KB per script
    });
    
    if (estimatedSize > 2000000) { // > 2MB
      suggestions.push('Consider code splitting to reduce initial bundle size');
    }
    
    if (scriptTags.length > 10) {
      suggestions.push('Consider bundling scripts to reduce HTTP requests');
    }
    
    // Check for unused CSS
    const styleTags = document.querySelectorAll('style, link[rel="stylesheet"]');
    if (styleTags.length > 5) {
      suggestions.push('Consider CSS optimization to remove unused styles');
    }
    
    return of({
      size: estimatedSize,
      suggestions
    });
  }

  /**
   * Memory usage monitoring
   */
  getMemoryUsage(): {used: number; limit: number; percentage: number} {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    
    return { used: 0, limit: 0, percentage: 0 };
  }

  /**
   * Network performance monitoring
   */
  getNetworkMetrics(): {requests: number; errors: number; averageLatency: number} {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const networkEntry = entries[0];
    
    let averageLatency = 0;
    if (networkEntry) {
      averageLatency = networkEntry.responseEnd - networkEntry.requestStart;
    }
    
    return {
      requests: this.networkRequestCount,
      errors: this.errorCount,
      averageLatency
    };
  }

  /**
   * Get performance metrics observable
   */
  getPerformanceMetrics(): Observable<Partial<PerformanceMetrics>> {
    return this.performanceMetrics.asObservable();
  }

  /**
   * Optimize images by compressing and converting format
   */
  optimizeImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject(new Error('Failed to optimize image')),
            'image/jpeg',
            quality
          );
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Detect slow network conditions
   */
  detectSlowConnection(): boolean {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType === 'slow-2g' || 
             connection.effectiveType === '2g' ||
             connection.downlink < 1.5;
    }
    return false;
  }

  /**
   * Virtual scrolling helper for large lists
   */
  calculateVisibleItems(scrollTop: number, itemHeight: number, containerHeight: number, totalItems: number): {start: number; end: number} {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 1, totalItems);
    
    return { start: Math.max(0, start), end };
  }

  /**
   * Monitor Core Web Vitals
   */
  monitorWebVitals(): Observable<{metric: string; value: number; rating: 'good' | 'needs-improvement' | 'poor'}> {
    return new Observable(observer => {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry;
        const lcp = lastEntry.startTime;
        
        observer.next({
          metric: 'LCP',
          value: lcp,
          rating: lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor'
        });
      });
      
      // First Input Delay (FID) - simplified
      let firstInputTime: number;
      const handleFirstInput = (event: Event) => {
        if (!firstInputTime) {
          firstInputTime = performance.now();
          const fid = firstInputTime - (event as any).timeStamp;
          
          observer.next({
            metric: 'FID',
            value: fid,
            rating: fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor'
          });
          
          // Remove listeners after first input
          ['click', 'keydown', 'touchstart'].forEach(type => {
            document.removeEventListener(type, handleFirstInput, { capture: true });
          });
        }
      };
      
      // Listen for first input
      ['click', 'keydown', 'touchstart'].forEach(type => {
        document.addEventListener(type, handleFirstInput, { capture: true, once: true });
      });
      
      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        observer.next({
          metric: 'CLS',
          value: clsValue,
          rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor'
        });
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('Performance observers not supported:', error);
      }
      
      return () => {
        lcpObserver.disconnect();
        clsObserver.disconnect();
      };
    });
  }

  private initializePerformanceMonitoring(): void {
    // Monitor page load performance
    window.addEventListener('load', () => {
      const loadTime = performance.now() - this.loadStartTime;
      this.updateMetrics({ loadTime });
    });

    // Monitor memory usage periodically
    if ('memory' in performance) {
      setInterval(() => {
        const memoryInfo = this.getMemoryUsage();
        this.updateMetrics({ memoryUsage: memoryInfo.percentage });
      }, 30000); // Every 30 seconds
    }
  }

  private setupIntersectionObserver(): void {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = img.dataset['lazySrc'];
              if (src) {
                img.src = src;
                img.removeAttribute('data-lazy-src');
                this.intersectionObserver?.unobserve(img);
              }
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }

  private monitorNetworkRequests(): void {
    // Monitor XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._url = url;
      this._method = method;
      return originalOpen.apply(this, [method, url, ...args]);
    };
    
    XMLHttpRequest.prototype.send = function(data) {
      this.addEventListener('loadstart', () => {
        this.networkRequestCount++;
      });
      
      this.addEventListener('error', () => {
        this.errorCount++;
      });
      
      return originalSend.apply(this, [data]);
    }.bind(this);
    
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      this.networkRequestCount++;
      
      return originalFetch.call(this, input, init)
        .catch(error => {
          this.errorCount++;
          throw error;
        });
    }.bind(this);
  }

  private updateMetrics(metrics: Partial<PerformanceMetrics>): void {
    const current = this.performanceMetrics.value;
    this.performanceMetrics.next({ ...current, ...metrics });
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Service Worker registration for caching
   */
  registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      return navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered successfully');
          return registration;
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
          return null;
        });
    }
    
    return Promise.resolve(null);
  }

  /**
   * Cleanup method for component destruction
   */
  cleanup(): void {
    this.intersectionObserver?.disconnect();
    this.clearCache();
  }
}