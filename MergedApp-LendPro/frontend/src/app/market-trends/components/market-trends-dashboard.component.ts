import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { MarketTrendsService, MarketTrendData, RegionData, InterestRateData, MarketIndicators, MarketInsight } from '../services/market-trends.service';

@Component({
  selector: 'app-market-trends-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="market-dashboard-container">
      <div class="dashboard-header">
        <h1>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
            <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
            <polyline points="17,6 23,6 23,12"/>
          </svg>
          Market Trends Dashboard
        </h1>
        <p>Real estate market analysis and insights</p>
        <div class="header-actions">
          <a routerLink="/search" class="btn btn-secondary">← Property Search</a>
        </div>
      </div>

      <!-- Region Selector -->
      <div class="region-selector">
        <form [formGroup]="filterForm">
          <div class="form-group">
            <label for="region">Select Region:</label>
            <select id="region" formControlName="region" class="form-input" (change)="onRegionChange()">
              <option value="National">National</option>
              <option value="California">California</option>
              <option value="Texas">Texas</option>
              <option value="Florida">Florida</option>
              <option value="New York">New York</option>
              <option value="Arizona">Arizona</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="timeframe">Time Period:</label>
            <select id="timeframe" formControlName="timeframe" class="form-input" (change)="onTimeframeChange()">
              <option value="12">Last 12 Months</option>
              <option value="24">Last 2 Years</option>
              <option value="36">Last 3 Years</option>
            </select>
          </div>
        </form>
      </div>

      <div class="dashboard-content" *ngIf="!loading; else loadingTemplate">
        <!-- Market Indicators -->
        <div class="indicators-section" *ngIf="marketIndicators">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
            Market Health Indicators
          </h2>
          <div class="indicators-grid">
            <div class="indicator-card temperature" [class]="'temp-' + marketIndicators.marketTemperature">
              <div class="indicator-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 4V2a2 2 0 0 0-4 0v2a7 7 0 0 0-2 13.1A6 6 0 0 0 12 22a6 6 0 0 0 4-6.9A7 7 0 0 0 14 4Z"/>
                  <circle cx="12" cy="18" r="2"/>
                </svg>
              </div>
              <div class="indicator-value">{{ marketIndicators.marketTemperature | titlecase }}</div>
              <div class="indicator-label">Market Temperature</div>
            </div>
            
            <div class="indicator-card">
              <div class="indicator-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="indicator-value">{{ marketIndicators.priceToIncomeRatio | number:'1.1-1' }}</div>
              <div class="indicator-label">Price-to-Income Ratio</div>
            </div>
            
            <div class="indicator-card">
              <div class="indicator-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
              <div class="indicator-value">{{ marketIndicators.affordabilityIndex | number:'1.0-0' }}</div>
              <div class="indicator-label">Affordability Index</div>
            </div>
            
            <div class="indicator-card">
              <div class="indicator-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <div class="indicator-value">{{ marketIndicators.buyerDemand | number:'1.0-0' }}%</div>
              <div class="indicator-label">Buyer Demand</div>
            </div>
          </div>
        </div>

        <!-- Price Trends Chart -->
        <div class="chart-section" *ngIf="trendData.length > 0">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
              <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
              <polyline points="17,6 23,6 23,12"/>
            </svg>
            Price Trends
          </h2>
          <div class="chart-controls">
            <button 
              *ngFor="let metric of chartMetrics" 
              (click)="setActiveMetric(metric.key)"
              [class.active]="activeMetric === metric.key"
              class="metric-btn"
            >
              {{ metric.label }}
            </button>
          </div>
          
          <div class="price-chart-container">
            <div class="chart-wrapper">
              <!-- Y-Axis Labels -->
              <div class="chart-y-axis">
                <div 
                  *ngFor="let label of getYAxisLabels()" 
                  class="y-label"
                  [style.bottom.%]="label.position"
                >
                  {{ label.value }}
                </div>
              </div>
              
              <div class="chart-area">
                <!-- Grid lines -->
                <div class="chart-grid-lines">
                  <div 
                    *ngFor="let line of getGridLines()" 
                    class="grid-line"
                    [style.bottom.%]="line"
                  ></div>
                </div>
                
                <div class="chart-grid">
                  <div 
                    *ngFor="let point of trendData; let i = index"
                    class="chart-point"
                    [style.left.%]="(i / (trendData.length - 1)) * 100"
                    [style.bottom.%]="getChartPointHeight(point, i)"
                    [title]="getPointTooltip(point)"
                  >
                    <div class="point-dot"></div>
                    <div class="point-value" *ngIf="i % 2 === 0">
                      {{ formatChartValue(getPointValue(point)) }}
                    </div>
                  </div>
                  
                  <!-- Chart Line -->
                  <svg class="chart-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline 
                      [attr.points]="getChartPoints()"
                      fill="none"
                      stroke="#667eea"
                      stroke-width="0.8"
                    />
                  </svg>
                </div>
                
                <!-- X-Axis Labels -->
                <div class="chart-x-axis">
                  <div 
                    *ngFor="let point of trendData; let i = index"
                    class="x-label"
                    [style.left.%]="(i / (trendData.length - 1)) * 100"
                  >
                    <span *ngIf="shouldShowXLabel(i)">
                      {{ formatDate(point.date) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Interest Rate Trends -->
        <div class="chart-section" *ngIf="interestRateData.length > 0">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
              <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/>
              <polyline points="17,18 23,18 23,12"/>
            </svg>
            Interest Rate Trends
          </h2>
          <div class="interest-rate-chart">
            <div class="rate-legend">
              <div class="legend-item">
                <div class="legend-color rate-30"></div>
                <span>30-Year Fixed</span>
              </div>
              <div class="legend-item">
                <div class="legend-color rate-15"></div>
                <span>15-Year Fixed</span>
              </div>
              <div class="legend-item">
                <div class="legend-color rate-arm"></div>
                <span>ARM</span>
              </div>
            </div>
            
            <div class="rate-chart-area">
              <!-- Y-Axis Labels for Interest Rates -->
              <div class="rate-y-axis">
                <div 
                  *ngFor="let label of getInterestRateYAxisLabels()" 
                  class="y-label"
                  [style.bottom.%]="label.position"
                >
                  {{ label.value }}%
                </div>
              </div>
              
              <div class="rate-chart-grid">
                <!-- Grid lines for interest rates -->
                <div class="rate-grid-lines">
                  <div 
                    *ngFor="let line of getGridLines()" 
                    class="grid-line"
                    [style.bottom.%]="line"
                  ></div>
                </div>
                
                <!-- 30-Year Rate Line -->
                <svg class="rate-line rate-30-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline 
                    [attr.points]="getRateChartPoints('rate30Year')"
                    fill="none"
                    stroke="#e74c3c"
                    stroke-width="1.2"
                  />
                </svg>
                
                <!-- 15-Year Rate Line -->
                <svg class="rate-line rate-15-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline 
                    [attr.points]="getRateChartPoints('rate15Year')"
                    fill="none"
                    stroke="#27ae60"
                    stroke-width="1.2"
                  />
                </svg>
                
                <!-- ARM Rate Line -->
                <svg class="rate-line rate-arm-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline 
                    [attr.points]="getRateChartPoints('rateARM')"
                    fill="none"
                    stroke="#f39c12"
                    stroke-width="1.2"
                  />
                </svg>
              </div>
              
              <!-- X-Axis Labels for Interest Rates -->
              <div class="rate-x-axis">
                <div 
                  *ngFor="let point of interestRateData; let i = index"
                  class="x-label"
                  [style.left.%]="(i / (interestRateData.length - 1)) * 100"
                >
                  <span *ngIf="shouldShowInterestRateXLabel(i)">
                    {{ formatDate(point.date) }}
                  </span>
                </div>
              </div>
              
              <!-- Current Rate Values -->
              <div class="current-rates">
                <div class="current-rate" *ngIf="interestRateData.length > 0">
                  <span class="rate-label">Current 30-Year:</span>
                  <span class="rate-value">{{ interestRateData[interestRateData.length - 1].rate30Year }}%</span>
                </div>
                <div class="current-rate" *ngIf="interestRateData.length > 0">
                  <span class="rate-label">Current 15-Year:</span>
                  <span class="rate-value">{{ interestRateData[interestRateData.length - 1].rate15Year }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Regional Comparison -->
        <div class="regional-section" *ngIf="regionalData.length > 0">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
              <path d="M3 7V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V7"/>
              <path d="M3 7L12 2L21 7"/>
            </svg>
            Regional Market Comparison
          </h2>
          <div class="regional-grid">
            <div 
              *ngFor="let region of regionalData.slice(0, 6)" 
              class="region-card"
              [class.selected]="region.region === selectedRegion"
              (click)="selectRegion(region.region)"
            >
              <div class="region-header">
                <h3>{{ region.region }}</h3>
                <div class="region-trend" [class]="region.priceChangePercent > 0 ? 'positive' : 'negative'">
                  {{ region.priceChangePercent > 0 ? '↗' : '↘' }} {{ Math.abs(region.priceChangePercent) | number:'1.1-1' }}%
                </div>
              </div>
              
              <div class="region-metrics">
                <div class="metric">
                  <span class="metric-label">Avg Price:</span>
                  <span class="metric-value">\${{ region.currentPrice | number:'1.0-0' }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Sales Volume:</span>
                  <span class="metric-value">{{ region.salesVolume | number:'1.0-0' }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">YoY Change:</span>
                  <span class="metric-value" [class]="region.priceChangePercent > 0 ? 'positive' : 'negative'">
                    \${{ region.priceChange | number:'1.0-0' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Market Insights -->
        <div class="insights-section" *ngIf="marketInsights.length > 0">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            Market Insights & Analysis
          </h2>
          <div class="insights-grid">
            <div 
              *ngFor="let insight of marketInsights" 
              class="insight-card"
              [class]="'insight-' + insight.impact"
            >
              <div class="insight-header">
                <div class="insight-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <ng-container *ngIf="insight.impact === 'positive'">
                      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                      <polyline points="17,6 23,6 23,12"/>
                    </ng-container>
                    <ng-container *ngIf="insight.impact === 'negative'">
                      <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/>
                      <polyline points="17,18 23,18 23,12"/>
                    </ng-container>
                    <ng-container *ngIf="insight.impact !== 'positive' && insight.impact !== 'negative'">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/>
                    </ng-container>
                  </svg>
                </div>
                <div class="insight-confidence">{{ insight.confidence }}% confidence</div>
              </div>
              
              <div class="insight-content">
                <h4>{{ insight.title }}</h4>
                <p>{{ insight.description }}</p>
                <div class="insight-timeframe">
                  <span class="timeframe-label">Timeframe:</span>
                  <span class="timeframe-value">{{ insight.timeframe }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Export and Actions -->
        <div class="dashboard-actions">
          <button (click)="exportData()" class="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Export Market Data
          </button>
          <button (click)="shareInsights()" class="btn btn-outline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
              <path d="M4 12V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V12"/>
              <polyline points="16,6 12,2 8,6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Share Insights
          </button>
          <button (click)="refreshData()" class="btn btn-outline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
              <path d="M21 12C21 16.9706 16.9706 21 12 21C9.69494 21 7.59227 20.1334 6 18.7083L3 16"/>
              <path d="M3 12C3 7.02944 7.02944 3 12 3C14.3051 3 16.4077 3.86656 18 5.29168L21 8"/>
              <path d="M3 21V16H8"/>
              <path d="M16 8H21V3"/>
            </svg>
            Refresh Data
          </button>
        </div>
      </div>

      <!-- Loading Template -->
      <ng-template #loadingTemplate>
        <div class="loading-container">
          <app-loading-spinner></app-loading-spinner>
          <p>Loading market data...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .market-dashboard-container {
      min-height: 100vh;
      background: var(--background-secondary);
      padding: var(--space-lg);
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: var(--space-2xl);
      position: relative;
    }

    .dashboard-header h1 {
      font-size: var(--text-3xl);
      margin-bottom: var(--space-sm);
      color: var(--primary-dark);
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
    }

    .dashboard-header p {
      font-size: var(--text-lg);
      color: var(--text-secondary);
      margin-bottom: var(--space-lg);
    }

    .header-actions {
      display: flex;
      gap: var(--space-md);
      justify-content: center;
      flex-wrap: wrap;
    }

    .region-selector {
      background: var(--background-primary);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      margin-bottom: var(--space-2xl);
      border: 1px solid var(--border-light);
      box-shadow: 0 2px 8px var(--shadow-light);
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    .region-selector form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-lg);
    }

    .dashboard-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .indicators-section {
      background: var(--background-primary);
      border-radius: 0.75rem;
      padding: 2rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border-light);
      box-shadow: 0 1px 3px var(--shadow-light);
    }

    .indicators-section h2 {
      color: var(--primary-dark);
      margin-bottom: var(--space-xl);
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
    }

    .indicators-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-lg);
    }

    .indicator-card {
      text-align: center;
      padding: 25px;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 12px;
      border: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .indicator-card.temperature {
      border-width: 3px;
    }

    .indicator-card.temp-hot {
      border-color: #e74c3c;
      background: linear-gradient(135deg, #fdedec, #fadbd8);
    }

    .indicator-card.temp-warm {
      border-color: #f39c12;
      background: linear-gradient(135deg, #fef9e7, #fcf3cf);
    }

    .indicator-card.temp-balanced {
      border-color: #3498db;
      background: linear-gradient(135deg, #ebf5fb, #d6eaf8);
    }

    .indicator-card.temp-cool {
      border-color: #27ae60;
      background: linear-gradient(135deg, #eafaf1, #d5f4e6);
    }

    .indicator-card.temp-cold {
      border-color: #8e44ad;
      background: linear-gradient(135deg, #f4ecf7, #e8daef);
    }

    .indicator-icon {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }

    .indicator-value {
      font-size: 2rem;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .indicator-label {
      font-size: 0.9rem;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .chart-section {
      background: var(--background-primary);
      border-radius: 0.75rem;
      padding: 2rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border-light);
      box-shadow: 0 1px 3px var(--shadow-light);
    }

    .chart-section h2 {
      color: var(--primary-dark);
      margin-bottom: var(--space-xl);
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
    }

    .chart-controls {
      display: flex;
      gap: var(--space-sm);
      margin-bottom: var(--space-lg);
      flex-wrap: wrap;
      justify-content: center;
    }

    .metric-btn {
      padding: 8px 16px;
      border: 2px solid #dee2e6;
      background: white;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .metric-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .metric-btn:hover:not(.active) {
      border-color: #667eea;
      background: #f8f9ff;
    }

    .price-chart-container {
      position: relative;
      height: 350px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
    }

    .chart-wrapper {
      position: relative;
      height: 100%;
      padding: 20px;
      padding-bottom: 50px;
      display: flex;
    }

    .chart-y-axis {
      position: relative;
      width: 60px;
      height: calc(100% - 60px);
      margin-right: 10px;
    }

    .chart-area {
      position: relative;
      height: calc(100% - 60px);
      flex: 1;
      background: linear-gradient(to top, #f8f9fa 0%, transparent 100%);
    }

    .chart-grid-lines {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }

    .grid-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(0, 0, 0, 0.1);
      border-top: 1px dashed #e9ecef;
    }

    .y-label {
      position: absolute;
      right: 10px;
      transform: translateY(50%);
      font-size: 0.75rem;
      color: #666;
      font-weight: 500;
      background: var(--background-primary);
      padding: 2px 4px;
      border-radius: 2px;
    }

    .chart-grid {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .chart-point {
      position: absolute;
      transform: translateX(-50%);
    }

    .point-dot {
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
    }

    .point-value {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.8rem;
      color: #666;
      font-weight: 500;
      background: white;
      padding: 2px 6px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      white-space: nowrap;
    }

    .chart-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .chart-x-axis {
      position: relative;
      height: 30px;
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid #e9ecef;
    }

    .x-label {
      position: absolute;
      transform: translateX(-50%);
      font-size: 0.8rem;
      color: #666;
      font-weight: 500;
      background: var(--background-primary);
      padding: 2px 4px;
      border-radius: 3px;
      white-space: nowrap;
    }

    .interest-rate-chart {
      position: relative;
    }

    .rate-legend {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
    }

    .legend-color {
      width: 20px;
      height: 4px;
      border-radius: 2px;
    }

    .legend-color.rate-30 {
      background: #e74c3c;
    }

    .legend-color.rate-15 {
      background: #27ae60;
    }

    .legend-color.rate-arm {
      background: #f39c12;
    }

    .rate-chart-area {
      position: relative;
      height: 320px;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      background: var(--background-secondary);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .rate-y-axis {
      position: absolute;
      left: 10px;
      top: 20px;
      width: 50px;
      height: 220px;
      z-index: 2;
    }

    .rate-chart-grid {
      position: relative;
      width: 100%;
      height: 220px;
      padding: var(--space-lg);
      padding-left: 70px;
      overflow: hidden;
      flex: 1;
    }

    .rate-grid-lines {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }

    .rate-x-axis {
      position: relative;
      height: 30px;
      padding: 0 var(--space-lg);
      padding-left: 70px;
      border-top: 1px solid var(--border-light);
    }

    .rate-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
    }

    .rate-line polyline {
      vector-effect: non-scaling-stroke;
    }

    .current-rates {
      display: flex;
      justify-content: space-around;
      padding: var(--space-md);
      background: var(--background-primary);
      border-top: 1px solid var(--border-light);
    }

    .current-rate {
      text-align: center;
    }

    .rate-label {
      display: block;
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin-bottom: var(--space-xs);
      font-weight: 500;
    }

    .rate-value {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--primary-dark);
    }

    .regional-section {
      background: var(--background-primary);
      border-radius: 0.75rem;
      padding: 2rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border-light);
      box-shadow: 0 1px 3px var(--shadow-light);
    }

    .regional-section h2 {
      color: var(--primary-dark);
      margin-bottom: var(--space-xl);
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
    }

    .regional-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-lg);
    }

    .region-card {
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f8f9fa;
    }

    .region-card:hover {
      border-color: #667eea;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
    }

    .region-card.selected {
      border-color: #28a745;
      background: #f8fff9;
      box-shadow: 0 5px 15px rgba(40, 167, 69, 0.2);
    }

    .region-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .region-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.1rem;
    }

    .region-trend {
      font-size: 0.9rem;
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 12px;
    }

    .region-trend.positive {
      background: #d4edda;
      color: #155724;
    }

    .region-trend.negative {
      background: #f8d7da;
      color: #721c24;
    }

    .region-metrics {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-label {
      font-size: 0.9rem;
      color: #666;
    }

    .metric-value {
      font-weight: 600;
      color: #2c3e50;
    }

    .metric-value.positive {
      color: #28a745;
    }

    .metric-value.negative {
      color: #dc3545;
    }

    .insights-section {
      background: var(--background-primary);
      border-radius: 0.75rem;
      padding: 2rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border-light);
      box-shadow: 0 1px 3px var(--shadow-light);
    }

    .insights-section h2 {
      color: var(--primary-dark);
      margin-bottom: var(--space-xl);
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: var(--space-lg);
    }

    .insight-card {
      padding: 20px;
      border-radius: 12px;
      border-left: 5px solid;
    }

    .insight-positive {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      border-color: #28a745;
    }

    .insight-negative {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      border-color: #dc3545;
    }

    .insight-neutral {
      background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
      border-color: #17a2b8;
    }

    .insight-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .insight-icon {
      font-size: 1.5rem;
    }

    .insight-confidence {
      font-size: 0.8rem;
      background: rgba(255,255,255,0.8);
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: bold;
    }

    .insight-content h4 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }

    .insight-content p {
      margin: 0 0 15px 0;
      color: #495057;
      line-height: 1.5;
    }

    .insight-timeframe {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .timeframe-label {
      font-size: 0.8rem;
      color: #666;
      font-weight: bold;
    }

    .timeframe-value {
      font-size: 0.8rem;
      background: rgba(255,255,255,0.9);
      padding: 2px 8px;
      border-radius: 8px;
      font-weight: 500;
    }

    .dashboard-actions {
      display: flex;
      gap: var(--space-md);
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: var(--space-2xl);
      padding: var(--space-lg);
    }

    .btn {
      padding: var(--space-sm) var(--space-lg);
      border: none;
      border-radius: var(--radius-sm);
      font-size: var(--text-base);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      min-width: 180px;
      text-align: center;
    }

    .btn-primary {
      background: var(--primary-dark);
      color: var(--text-white);
      border: 1px solid var(--primary-dark);
    }

    .btn-primary:hover {
      background: var(--primary-light);
      border-color: var(--primary-light);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--shadow-medium);
    }

    .btn-secondary {
      background: var(--text-secondary);
      color: var(--text-white);
      border: 1px solid var(--text-secondary);
    }

    .btn-secondary:hover {
      background: var(--text-primary);
      border-color: var(--text-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--shadow-medium);
    }

    .btn-outline {
      background: var(--background-primary);
      color: var(--primary-dark);
      border: 2px solid var(--primary-dark);
    }

    .btn-outline:hover {
      background: var(--primary-dark);
      color: var(--text-white);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--shadow-medium);
    }

    .form-group {
      margin-bottom: 0;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: #333;
      margin-bottom: 6px;
      font-size: 0.9rem;
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e0e6ed;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: var(--text-primary);
      text-align: center;
    }

    .loading-container p {
      margin-top: 20px;
      font-size: 1.1rem;
    }

    /* Expose Math to template */
    .region-trend {
      /* Math.abs will be available in component */
    }

    /* Responsive */
    @media (max-width: 768px) {
      .market-dashboard-container {
        padding: var(--space-sm);
      }

      .dashboard-header h1 {
        font-size: var(--text-2xl);
        flex-direction: column;
        gap: var(--space-xs);
      }

      .header-actions {
        flex-direction: column;
        align-items: center;
        gap: var(--space-sm);
      }

      .region-selector {
        margin-bottom: var(--space-xl);
      }

      .region-selector form {
        grid-template-columns: 1fr;
        gap: var(--space-md);
      }

      .chart-controls {
        justify-content: center;
      }

      .regional-grid {
        grid-template-columns: 1fr;
      }

      .insights-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-sm);
        padding: var(--space-md);
        max-width: 400px;
        margin: 0 auto;
      }

      .btn {
        min-width: unset;
        width: 100%;
      }

      .indicators-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--space-md);
      }
    }

    @media (max-width: 480px) {
      .dashboard-actions {
        grid-template-columns: 1fr;
        max-width: 280px;
      }

      .btn {
        font-size: var(--text-sm);
        padding: var(--space-xs) var(--space-md);
      }
    }
  `]
})
export class MarketTrendsDashboardComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  trendData: MarketTrendData[] = [];
  regionalData: RegionData[] = [];
  interestRateData: InterestRateData[] = [];
  marketIndicators: MarketIndicators | null = null;
  marketInsights: MarketInsight[] = [];
  
  loading = true;
  selectedRegion = 'National';
  activeMetric = 'averagePrice';
  
  chartMetrics = [
    { key: 'averagePrice', label: 'Average Price' },
    { key: 'medianPrice', label: 'Median Price' },
    { key: 'pricePerSqFt', label: 'Price per Sq Ft' },
    { key: 'salesVolume', label: 'Sales Volume' },
    { key: 'daysOnMarket', label: 'Days on Market' }
  ];

  private subscription = new Subscription();
  
  // Expose Math to template
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private marketTrendsService: MarketTrendsService
  ) {
    this.filterForm = this.fb.group({
      region: ['National'],
      timeframe: ['12']
    });
  }

  ngOnInit() {
    this.loadAllData();
    this.setupFormSubscriptions();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private setupFormSubscriptions() {
    this.subscription.add(
      this.filterForm.valueChanges.subscribe(() => {
        this.loadAllData();
      })
    );
  }

  private loadAllData() {
    this.loading = true;
    const region = this.filterForm.get('region')?.value || 'National';
    const timeframe = parseInt(this.filterForm.get('timeframe')?.value || '12');

    this.subscription.add(
      this.marketTrendsService.getMarketTrends(region, timeframe).subscribe({
        next: (data) => {
          this.trendData = data;
          this.checkLoadingComplete();
        },
        error: (error) => console.error('Error loading trend data:', error)
      })
    );

    this.subscription.add(
      this.marketTrendsService.getRegionalData().subscribe({
        next: (data) => {
          this.regionalData = data;
          this.checkLoadingComplete();
        },
        error: (error) => console.error('Error loading regional data:', error)
      })
    );

    this.subscription.add(
      this.marketTrendsService.getInterestRateHistory(timeframe).subscribe({
        next: (data) => {
          this.interestRateData = data;
          this.checkLoadingComplete();
        },
        error: (error) => console.error('Error loading interest rate data:', error)
      })
    );

    this.subscription.add(
      this.marketTrendsService.getMarketIndicators(region).subscribe({
        next: (data) => {
          this.marketIndicators = data;
          this.checkLoadingComplete();
        },
        error: (error) => console.error('Error loading market indicators:', error)
      })
    );

    this.subscription.add(
      this.marketTrendsService.getMarketInsights(region).subscribe({
        next: (data) => {
          this.marketInsights = data;
          this.checkLoadingComplete();
        },
        error: (error) => console.error('Error loading market insights:', error)
      })
    );
  }

  private checkLoadingComplete() {
    if (this.trendData.length > 0 && this.regionalData.length > 0 && 
        this.interestRateData.length > 0 && this.marketIndicators && 
        this.marketInsights.length > 0) {
      this.loading = false;
    }
  }

  onRegionChange() {
    this.selectedRegion = this.filterForm.get('region')?.value || 'National';
    this.marketTrendsService.setCurrentRegion(this.selectedRegion);
  }

  onTimeframeChange() {
    // Data will reload automatically via form subscription
  }

  setActiveMetric(metric: string) {
    this.activeMetric = metric;
  }

  selectRegion(region: string) {
    this.selectedRegion = region;
    this.filterForm.patchValue({ region });
  }

  getChartPointHeight(point: MarketTrendData, index: number): number {
    if (this.trendData.length === 0) return 0;
    
    const values = this.trendData.map(p => this.getPointValue(p));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const current = this.getPointValue(point);
    
    if (max === min) return 50;
    
    return ((current - min) / (max - min)) * 80 + 10;
  }

  getPointValue(point: MarketTrendData): number {
    switch (this.activeMetric) {
      case 'averagePrice': return point.averagePrice;
      case 'medianPrice': return point.medianPrice;
      case 'pricePerSqFt': return point.pricePerSqFt;
      case 'salesVolume': return point.salesVolume;
      case 'daysOnMarket': return point.daysOnMarket;
      default: return point.averagePrice;
    }
  }

  getChartPoints(): string {
    if (this.trendData.length === 0) return '';
    
    return this.trendData.map((point, index) => {
      const x = (index / (this.trendData.length - 1)) * 100;
      const y = 100 - this.getChartPointHeight(point, index);
      return `${x},${y}`;
    }).join(' ');
  }

  getRateChartPoints(rateType: keyof InterestRateData): string {
    if (this.interestRateData.length === 0) return '';
    
    const rates = this.interestRateData.map(d => d[rateType] as number);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    
    return this.interestRateData.map((data, index) => {
      const x = (index / (this.interestRateData.length - 1)) * 100;
      const rate = data[rateType] as number;
      
      let y: number;
      if (max === min) {
        y = 50; // Center line if all values are the same
      } else {
        // Scale to use 10% padding on top and bottom (10% to 90% range)
        const normalizedValue = (rate - min) / (max - min);
        y = 90 - (normalizedValue * 80); // Invert Y axis and constrain to 10-90 range
      }
      
      // Ensure y is within bounds
      y = Math.max(10, Math.min(90, y));
      
      return `${x},${y}`;
    }).join(' ');
  }

  getPointTooltip(point: MarketTrendData): string {
    const value = this.formatChartValue(this.getPointValue(point));
    const date = this.formatDate(point.date);
    return `${date}: ${value}`;
  }

  formatChartValue(value: number): string {
    if (this.activeMetric.includes('Price') || this.activeMetric === 'pricePerSqFt') {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }

  shouldShowXLabel(index: number): boolean {
    if (this.trendData.length <= 6) return true;
    if (this.trendData.length <= 12) return index % 2 === 0;
    return index % 3 === 0;
  }

  shouldShowInterestRateXLabel(index: number): boolean {
    if (this.interestRateData.length <= 6) return true;
    if (this.interestRateData.length <= 12) return index % 2 === 0;
    return index % 3 === 0;
  }

  getYAxisLabels(): Array<{position: number, value: string}> {
    if (this.trendData.length === 0) return [];
    
    const values = this.trendData.map(p => this.getPointValue(p));
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    if (max === min) {
      return [{ position: 50, value: this.formatChartValue(min) }];
    }
    
    const labels = [];
    for (let i = 0; i <= 4; i++) {
      const value = min + (max - min) * (i / 4);
      const position = 10 + (80 * i / 4);
      labels.push({
        position: position,
        value: this.formatChartValue(value)
      });
    }
    
    return labels;
  }

  getInterestRateYAxisLabels(): Array<{position: number, value: string}> {
    if (this.interestRateData.length === 0) return [];
    
    const allRates = this.interestRateData.flatMap(d => [d.rate30Year, d.rate15Year, d.rateARM]);
    const min = Math.min(...allRates);
    const max = Math.max(...allRates);
    
    if (max === min) {
      return [{ position: 50, value: min.toFixed(1) }];
    }
    
    const labels = [];
    for (let i = 0; i <= 4; i++) {
      const value = min + (max - min) * (i / 4);
      const position = 10 + (80 * i / 4);
      labels.push({
        position: position,
        value: value.toFixed(1)
      });
    }
    
    return labels;
  }

  getGridLines(): number[] {
    return [10, 30, 50, 70, 90];
  }

  refreshData() {
    this.loadAllData();
  }

  exportData() {
    const exportData = {
      region: this.selectedRegion,
      trendData: this.trendData,
      regionalData: this.regionalData,
      interestRates: this.interestRateData,
      indicators: this.marketIndicators,
      insights: this.marketInsights,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `market-trends-${this.selectedRegion}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }


  shareInsights() {
    if (navigator.share) {
      const insights = this.marketInsights.slice(0, 2).map(i => i.title).join(', ');
      navigator.share({
        title: `Market Trends - ${this.selectedRegion}`,
        text: `Latest market insights: ${insights}. Market temperature: ${this.marketIndicators?.marketTemperature}.`,
        url: window.location.href
      }).catch(console.error);
    }
  }

}