import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container">
      <!-- Table skeleton -->
      <div *ngIf="type === 'table'" class="skeleton-table">
        <div class="skeleton-table-header">
          <div class="skeleton-item skeleton-header" *ngFor="let col of getArray(columns)"></div>
        </div>
        <div class="skeleton-table-row" *ngFor="let row of getArray(rows)">
          <div class="skeleton-item skeleton-cell" *ngFor="let col of getArray(columns)"></div>
        </div>
      </div>

      <!-- Card grid skeleton -->
      <div *ngIf="type === 'cards'" class="skeleton-cards">
        <div class="skeleton-card" *ngFor="let card of getArray(count)">
          <div class="skeleton-item skeleton-card-header"></div>
          <div class="skeleton-item skeleton-card-content"></div>
          <div class="skeleton-item skeleton-card-footer"></div>
        </div>
      </div>

      <!-- List skeleton -->
      <div *ngIf="type === 'list'" class="skeleton-list">
        <div class="skeleton-list-item" *ngFor="let item of getArray(count)">
          <div class="skeleton-item skeleton-avatar"></div>
          <div class="skeleton-list-content">
            <div class="skeleton-item skeleton-title"></div>
            <div class="skeleton-item skeleton-subtitle"></div>
          </div>
        </div>
      </div>

      <!-- Form skeleton -->
      <div *ngIf="type === 'form'" class="skeleton-form">
        <div class="skeleton-form-group" *ngFor="let field of getArray(count)">
          <div class="skeleton-item skeleton-label"></div>
          <div class="skeleton-item skeleton-input"></div>
        </div>
      </div>

      <!-- Dashboard skeleton -->
      <div *ngIf="type === 'dashboard'" class="skeleton-dashboard">
        <div class="skeleton-metrics">
          <div class="skeleton-metric" *ngFor="let metric of getArray(4)">
            <div class="skeleton-item skeleton-metric-icon"></div>
            <div class="skeleton-item skeleton-metric-value"></div>
            <div class="skeleton-item skeleton-metric-label"></div>
          </div>
        </div>
        <div class="skeleton-charts">
          <div class="skeleton-item skeleton-chart"></div>
        </div>
      </div>

      <!-- Text skeleton -->
      <div *ngIf="type === 'text'" class="skeleton-text">
        <div class="skeleton-item skeleton-line" *ngFor="let line of getArray(count)" 
             [style.width.%]="getLineWidth(line)"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-container {
      padding: 20px;
    }

    .skeleton-item {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    /* Table Skeleton */
    .skeleton-table {
      width: 100%;
    }

    .skeleton-table-header,
    .skeleton-table-row {
      display: grid;
      grid-template-columns: repeat(var(--columns, 4), 1fr);
      gap: 15px;
      margin-bottom: 15px;
    }

    .skeleton-header {
      height: 20px;
    }

    .skeleton-cell {
      height: 16px;
    }

    /* Cards Skeleton */
    .skeleton-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }

    .skeleton-card {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .skeleton-card-header {
      height: 24px;
      margin-bottom: 15px;
      width: 80%;
    }

    .skeleton-card-content {
      height: 60px;
      margin-bottom: 15px;
    }

    .skeleton-card-footer {
      height: 16px;
      width: 60%;
    }

    /* List Skeleton */
    .skeleton-list-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .skeleton-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .skeleton-list-content {
      flex: 1;
    }

    .skeleton-title {
      height: 20px;
      width: 70%;
      margin-bottom: 8px;
    }

    .skeleton-subtitle {
      height: 16px;
      width: 40%;
    }

    /* Form Skeleton */
    .skeleton-form-group {
      margin-bottom: 20px;
    }

    .skeleton-label {
      height: 16px;
      width: 30%;
      margin-bottom: 8px;
    }

    .skeleton-input {
      height: 40px;
      width: 100%;
    }

    /* Dashboard Skeleton */
    .skeleton-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .skeleton-metric {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      text-align: center;
    }

    .skeleton-metric-icon {
      width: 40px;
      height: 40px;
      margin: 0 auto 10px;
      border-radius: 50%;
    }

    .skeleton-metric-value {
      height: 32px;
      width: 80%;
      margin: 0 auto 8px;
    }

    .skeleton-metric-label {
      height: 16px;
      width: 90%;
      margin: 0 auto;
    }

    .skeleton-chart {
      height: 300px;
      width: 100%;
    }

    /* Text Skeleton */
    .skeleton-line {
      height: 16px;
      margin-bottom: 10px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .skeleton-container {
        padding: 10px;
      }

      .skeleton-cards {
        grid-template-columns: 1fr;
      }

      .skeleton-metrics {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .skeleton-table-header,
      .skeleton-table-row {
        gap: 10px;
      }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: 'table' | 'cards' | 'list' | 'form' | 'dashboard' | 'text' = 'text';
  @Input() count: number = 3;
  @Input() columns: number = 4;
  @Input() rows: number = 5;

  getArray(length: number): number[] {
    return Array(length).fill(0).map((_, i) => i);
  }

  getLineWidth(index: number): number {
    // Vary line widths for more realistic text skeleton
    const widths = [100, 85, 95, 60, 90];
    return widths[index % widths.length];
  }
}