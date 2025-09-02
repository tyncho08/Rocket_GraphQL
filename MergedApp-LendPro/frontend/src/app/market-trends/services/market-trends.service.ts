import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface MarketTrendData {
  date: string;
  averagePrice: number;
  medianPrice: number;
  pricePerSqFt: number;
  salesVolume: number;
  daysOnMarket: number;
  inventoryLevel: number;
}

export interface RegionData {
  region: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  salesVolume: number;
  forecast: PriceForecast[];
}

export interface PriceForecast {
  month: string;
  predictedPrice: number;
  confidence: number;
}

export interface InterestRateData {
  date: string;
  rate30Year: number;
  rate15Year: number;
  rateARM: number;
}

export interface MarketIndicators {
  priceToIncomeRatio: number;
  affordabilityIndex: number;
  marketTemperature: 'hot' | 'warm' | 'balanced' | 'cool' | 'cold';
  buyerDemand: number;
  sellerActivity: number;
  marketVolatility: number;
}

export interface MarketInsight {
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  timeframe: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarketTrendsService {
  private currentRegion = new BehaviorSubject<string>('National');
  public currentRegion$ = this.currentRegion.asObservable();

  constructor() {}

  setCurrentRegion(region: string): void {
    this.currentRegion.next(region);
  }

  getMarketTrends(region: string = 'National', months: number = 12): Observable<MarketTrendData[]> {
    return of(this.generateMarketTrendData(months)).pipe(delay(800));
  }

  getRegionalData(): Observable<RegionData[]> {
    const regions = [
      'National', 'California', 'Texas', 'Florida', 'New York', 'Arizona', 
      'North Carolina', 'Washington', 'Colorado', 'Georgia'
    ];

    const data = regions.map(region => ({
      region,
      currentPrice: this.generateRandomPrice(300000, 800000),
      priceChange: this.generateRandomChange(-50000, 100000),
      priceChangePercent: this.generateRandomChange(-15, 25),
      salesVolume: Math.floor(Math.random() * 10000) + 1000,
      forecast: this.generateForecastData(6)
    }));

    return of(data).pipe(delay(600));
  }

  getInterestRateHistory(months: number = 24): Observable<InterestRateData[]> {
    return of(this.generateInterestRateData(months)).pipe(delay(500));
  }

  getMarketIndicators(region: string = 'National'): Observable<MarketIndicators> {
    const indicators: MarketIndicators = {
      priceToIncomeRatio: 4.2 + Math.random() * 2,
      affordabilityIndex: 60 + Math.random() * 40,
      marketTemperature: this.getRandomMarketTemp(),
      buyerDemand: Math.random() * 100,
      sellerActivity: Math.random() * 100,
      marketVolatility: Math.random() * 50
    };

    return of(indicators).pipe(delay(400));
  }

  getMarketInsights(region: string = 'National'): Observable<MarketInsight[]> {
    const insights: MarketInsight[] = [
      {
        title: 'Rising Inventory Levels',
        description: 'Housing inventory has increased by 15% compared to last month, providing more options for buyers.',
        impact: 'positive',
        confidence: 85,
        timeframe: '1-3 months'
      },
      {
        title: 'Interest Rate Stabilization',
        description: 'Mortgage rates have stabilized around 6.5%, reducing market uncertainty.',
        impact: 'positive',
        confidence: 78,
        timeframe: '3-6 months'
      },
      {
        title: 'Seasonal Price Adjustment',
        description: 'Typical seasonal slowdown expected in Q4, with potential 2-5% price adjustments.',
        impact: 'neutral',
        confidence: 72,
        timeframe: '3-4 months'
      },
      {
        title: 'First-Time Buyer Challenges',
        description: 'High prices continue to impact first-time buyer affordability in major metropolitan areas.',
        impact: 'negative',
        confidence: 90,
        timeframe: '6-12 months'
      },
      {
        title: 'Investment Property Demand',
        description: 'Strong investor demand for rental properties is supporting price floors in key markets.',
        impact: 'positive',
        confidence: 80,
        timeframe: '6-12 months'
      }
    ];

    return of(insights).pipe(delay(700));
  }

  getComparativeMarketAnalysis(region: string): Observable<any> {
    return of({
      region,
      averagePrice: this.generateRandomPrice(400000, 700000),
      pricePerSqFt: 150 + Math.random() * 200,
      daysOnMarket: 30 + Math.random() * 60,
      saleToListRatio: 0.95 + Math.random() * 0.1,
      yearOverYearChange: -5 + Math.random() * 20,
      competitiveMarkets: this.getCompetitiveMarkets(),
      neighborhoodTrends: this.getNeighborhoodTrends()
    }).pipe(delay(900));
  }

  private generateMarketTrendData(months: number): MarketTrendData[] {
    const data: MarketTrendData[] = [];
    const basePrice = 450000;
    const basePricePerSqFt = 180;
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Create realistic trends
      const seasonalFactor = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 0.1;
      const trendFactor = (months - i) / months * 0.15; // Upward trend
      const randomFactor = (Math.random() - 0.5) * 0.1;
      
      const priceMultiplier = 1 + seasonalFactor + trendFactor + randomFactor;
      const averagePrice = Math.round(basePrice * priceMultiplier);
      const medianPrice = Math.round(averagePrice * (0.85 + Math.random() * 0.3));
      
      data.push({
        date: date.toISOString().split('T')[0],
        averagePrice,
        medianPrice,
        pricePerSqFt: Math.round(basePricePerSqFt * priceMultiplier),
        salesVolume: Math.floor(2000 + Math.random() * 1500),
        daysOnMarket: Math.round(45 + Math.random() * 30),
        inventoryLevel: Math.round(15000 + Math.random() * 10000)
      });
    }
    
    return data;
  }

  private generateForecastData(months: number): PriceForecast[] {
    const forecast: PriceForecast[] = [];
    const basePrice = 550000;
    
    for (let i = 1; i <= months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      const growth = 0.02 * i; // 2% monthly growth trend
      const confidence = Math.max(50, 90 - (i * 5)); // Decreasing confidence
      
      forecast.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        predictedPrice: Math.round(basePrice * (1 + growth)),
        confidence
      });
    }
    
    return forecast;
  }

  private generateInterestRateData(months: number): InterestRateData[] {
    const data: InterestRateData[] = [];
    let base30Year = 3.5;
    let base15Year = 3.0;
    let baseARM = 3.2;
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Simulate rate changes
      const volatility = 0.1;
      base30Year += (Math.random() - 0.5) * volatility;
      base15Year = base30Year - 0.3 - Math.random() * 0.4;
      baseARM = base30Year - 0.2 + Math.random() * 0.3;
      
      // Keep rates in realistic range
      base30Year = Math.max(2.5, Math.min(8.0, base30Year));
      base15Year = Math.max(2.0, Math.min(7.5, base15Year));
      baseARM = Math.max(2.2, Math.min(7.8, baseARM));
      
      data.push({
        date: date.toISOString().split('T')[0],
        rate30Year: Math.round(base30Year * 100) / 100,
        rate15Year: Math.round(base15Year * 100) / 100,
        rateARM: Math.round(baseARM * 100) / 100
      });
    }
    
    return data;
  }

  private generateRandomPrice(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  private generateRandomChange(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  }

  private getRandomMarketTemp(): 'hot' | 'warm' | 'balanced' | 'cool' | 'cold' {
    const temps = ['hot', 'warm', 'balanced', 'cool', 'cold'] as const;
    return temps[Math.floor(Math.random() * temps.length)];
  }

  private getCompetitiveMarkets(): any[] {
    return [
      { market: 'Austin, TX', similarity: 0.92, avgPrice: 485000 },
      { market: 'Denver, CO', similarity: 0.88, avgPrice: 520000 },
      { market: 'Phoenix, AZ', similarity: 0.85, avgPrice: 415000 },
      { market: 'Nashville, TN', similarity: 0.82, avgPrice: 395000 }
    ];
  }

  private getNeighborhoodTrends(): any[] {
    return [
      { neighborhood: 'Downtown', trend: 'up', change: 8.5 },
      { neighborhood: 'Midtown', trend: 'stable', change: 2.1 },
      { neighborhood: 'Suburbs', trend: 'up', change: 5.3 },
      { neighborhood: 'Waterfront', trend: 'down', change: -3.2 }
    ];
  }
}