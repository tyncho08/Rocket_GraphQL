import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminService, LoanApplication } from '../services/admin.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-loan-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="loan-review-container">
      <div class="page-header">
        <h1>Loan Application Review</h1>
        <p>Application #{{applicationId}}</p>
        <a routerLink="/admin/loans" class="back-btn">← Back to Loans</a>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading application details...</p>
      </div>

      <!-- Application Details -->
      <div class="review-content" *ngIf="!loading && application">
        <!-- Application Overview -->
        <div class="overview-section">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
              <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"/>
              <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5V7H9V5Z"/>
            </svg>
            Application Overview
          </h2>
          <div class="overview-grid">
            <div class="overview-card">
              <div class="card-label">Application Status</div>
              <span class="status-badge large" [class]="'status-' + application.status.toLowerCase().replace(' ', '-')">
                {{application.status}}
              </span>
            </div>
            
            <div class="overview-card">
              <div class="card-label">Loan Amount</div>
              <div class="card-value">\${{application.loanAmount | number:'1.0-0'}}</div>
            </div>
            
            <div class="overview-card">
              <div class="card-label">Property Value</div>
              <div class="card-value">\${{application.propertyValue | number:'1.0-0'}}</div>
            </div>
            
            <div class="overview-card">
              <div class="card-label">Loan-to-Value Ratio</div>
              <div class="card-value">{{calculateLTV()}}%</div>
            </div>
          </div>
        </div>

        <!-- Applicant Information -->
        <div class="applicant-section">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Applicant Information
          </h2>
          <div class="applicant-grid">
            <div class="info-row">
              <div class="info-label">Full Name</div>
              <div class="info-value">{{application.userName}}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Annual Income</div>
              <div class="info-value">\${{application.annualIncome | number:'1.0-0'}}</div>
            </div>
            
            <div class="info-row">
              <div class="info-label">Employment Status</div>
              <div class="info-value">{{application.employmentStatus}}</div>
            </div>
            
            <div class="info-row" *ngIf="application.employer">
              <div class="info-label">Employer</div>
              <div class="info-value">{{application.employer}}</div>
            </div>
          </div>
        </div>

        <!-- Loan Details -->
        <div class="loan-details-section">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Loan Details
          </h2>
          <div class="loan-grid">
            <div class="detail-card">
              <div class="detail-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="detail-label">Requested Amount</div>
              <div class="detail-value">\${{application.loanAmount | number:'1.0-0'}}</div>
            </div>
            
            <div class="detail-card">
              <div class="detail-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
              <div class="detail-label">Property Value</div>
              <div class="detail-value">\${{application.propertyValue | number:'1.0-0'}}</div>
            </div>
            
            <div class="detail-card">
              <div class="detail-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div class="detail-label">Down Payment</div>
              <div class="detail-value">\${{application.downPayment | number:'1.0-0'}}</div>
            </div>
            
            <div class="detail-card">
              <div class="detail-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <div class="detail-label">Interest Rate</div>
              <div class="detail-value">{{application.interestRate}}%</div>
            </div>
            
            <div class="detail-card">
              <div class="detail-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div class="detail-label">Loan Term</div>
              <div class="detail-value">{{application.loanTermYears}} years</div>
            </div>
            
            <div class="detail-card">
              <div class="detail-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="detail-label">Monthly Payment</div>
              <div class="detail-value">\${{calculateMonthlyPayment() | number:'1.2-2'}}</div>
            </div>
          </div>
        </div>

        <!-- Risk Assessment -->
        <div class="risk-section">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
              <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.68 21h16.64a2 2 0 0 0 1.86-2.86L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Risk Assessment
          </h2>
          <div class="risk-grid">
            <div class="risk-card" [class]="getDebtToIncomeRisk()">
              <div class="risk-label">Debt-to-Income Ratio</div>
              <div class="risk-value">{{calculateDebtToIncome()}}%</div>
              <div class="risk-status">{{getDebtToIncomeLabel()}}</div>
            </div>
            
            <div class="risk-card" [class]="getLTVRisk()">
              <div class="risk-label">Loan-to-Value Ratio</div>
              <div class="risk-value">{{calculateLTV()}}%</div>
              <div class="risk-status">{{getLTVLabel()}}</div>
            </div>
          </div>
        </div>

        <!-- Decision Section -->
        <div class="decision-section">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            Make Decision
          </h2>
          <form [formGroup]="decisionForm" (ngSubmit)="submitDecision()">
            <div class="decision-options">
              <button 
                type="button" 
                class="decision-btn approve" 
                (click)="setDecision('Approved')"
                [class.active]="decisionForm.get('status')?.value === 'Approved'"
                [disabled]="submitting">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Approve
              </button>
              
              <button 
                type="button" 
                class="decision-btn deny" 
                (click)="setDecision('Denied')"
                [class.active]="decisionForm.get('status')?.value === 'Denied'"
                [disabled]="submitting">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Deny
              </button>
              
              <button 
                type="button" 
                class="decision-btn review" 
                (click)="setDecision('Under Review')"
                [class.active]="decisionForm.get('status')?.value === 'Under Review'"
                [disabled]="submitting">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21L16.65 16.65"/>
                </svg>
                Request More Info
              </button>
            </div>
            
            <div class="notes-section">
              <label for="notes">Admin Notes:</label>
              <textarea 
                id="notes"
                formControlName="notes"
                placeholder="Add notes about this decision..."
                rows="4"
                class="notes-textarea">
              </textarea>
            </div>
            
            <div class="submit-section">
              <button 
                type="submit" 
                class="submit-btn"
                [disabled]="!decisionForm.get('status')?.value || submitting">
                {{submitting ? 'Updating...' : 'Update Application'}}
              </button>
            </div>
          </form>
        </div>

        <!-- Current Notes -->
        <div class="current-notes-section" *ngIf="application.notes">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
              <path d="M17 3C17.2626 2.73735 17.5744 2.52901 17.9176 2.38687C18.2608 2.24473 18.6286 2.17157 19 2.17157C19.3714 2.17157 19.7392 2.24473 20.0824 2.38687C20.4256 2.52901 20.7374 2.73735 21 3C21.2626 3.26264 21.471 3.57444 21.6131 3.9176C21.7553 4.26077 21.8284 4.62856 21.8284 5C21.8284 5.37143 21.7553 5.73923 21.6131 6.08239C21.471 6.42555 21.2626 6.73735 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z"/>
            </svg>
            Current Notes
          </h2>
          <div class="notes-display">
            {{application.notes}}
          </div>
        </div>

        <!-- Timeline -->
        <div class="timeline-section">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Timeline
          </h2>
          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-date">{{formatDate(application.createdAt)}}</div>
              <div class="timeline-event">Application submitted</div>
            </div>
            <div class="timeline-item" *ngIf="application.updatedAt !== application.createdAt">
              <div class="timeline-date">{{formatDate(application.updatedAt)}}</div>
              <div class="timeline-event">Last updated</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loan-review-container {
      min-height: 100vh;
      background: var(--background-secondary);
      padding: 2rem;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
      position: relative;
    }

    .page-header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: var(--primary-dark);
      font-weight: 600;
    }

    .page-header p {
      font-size: 1.2rem;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    .back-btn {
      position: absolute;
      left: 0;
      top: 0;
      color: var(--primary-dark);
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border: 1px solid var(--border-medium);
      border-radius: 0.375rem;
      background: var(--background-primary);
      transition: all 0.2s ease;
      font-weight: 500;
    }

    .back-btn:hover {
      background: var(--background-tertiary);
      border-color: var(--primary-dark);
      color: var(--primary-dark);
      text-decoration: none;
      transform: translateY(-1px);
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      color: var(--text-primary);
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid rgba(255,255,255,0.3);
      border-top: 5px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .review-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .overview-section, .applicant-section, .loan-details-section, 
    .risk-section, .decision-section, .current-notes-section, .timeline-section {
      background: var(--background-primary);
      border-radius: 0.75rem;
      padding: 2rem;
      margin-bottom: 2rem;
      border: 1px solid var(--border-light);
      box-shadow: 0 1px 3px var(--shadow-light);
    }

    h2 {
      margin-bottom: 1.5rem;
      color: var(--primary-dark);
      font-size: 1.5rem;
      font-weight: 600;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .overview-card {
      text-align: center;
      padding: 1.25rem;
      background: var(--background-secondary);
      border-radius: 0.5rem;
      border: 1px solid var(--border-light);
    }

    .card-label {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 0.625rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .card-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--primary-dark);
    }

    .status-badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: bold;
      text-transform: uppercase;
    }

    .status-badge.large {
      padding: 12px 24px;
      font-size: 1rem;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-approved {
      background: #d4edda;
      color: #155724;
    }

    .status-denied {
      background: #f8d7da;
      color: #721c24;
    }

    .status-under-review {
      background: #d1ecf1;
      color: #0c5460;
    }

    .applicant-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 15px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 0.9375rem;
      background: var(--background-secondary);
      border-radius: 0.5rem;
      border: 1px solid var(--border-light);
    }

    .info-label {
      font-weight: 600;
      color: var(--text-secondary);
    }

    .info-value {
      font-weight: 500;
      color: var(--primary-dark);
    }

    .loan-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .detail-card {
      text-align: center;
      padding: 1.25rem;
      background: var(--background-secondary);
      border-radius: 0.5rem;
      border: 1px solid var(--border-light);
      transition: all 0.2s ease;
    }

    .detail-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px var(--shadow-medium);
      border-color: var(--primary-dark);
    }

    .detail-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .detail-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .detail-value {
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--primary-dark);
    }

    .risk-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .risk-card {
      padding: 25px;
      border-radius: 10px;
      text-align: center;
      border: 3px solid;
    }

    .risk-card.low-risk {
      background: #d4edda;
      border-color: #28a745;
      color: #155724;
    }

    .risk-card.medium-risk {
      background: #fff3cd;
      border-color: #ffc107;
      color: #856404;
    }

    .risk-card.high-risk {
      background: #f8d7da;
      border-color: #dc3545;
      color: #721c24;
    }

    .risk-label {
      font-size: 0.9rem;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .risk-value {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .risk-status {
      font-weight: 600;
    }

    .decision-options {
      display: flex;
      gap: 15px;
      margin-bottom: 25px;
      flex-wrap: wrap;
    }

    .decision-btn {
      flex: 1;
      min-width: 150px;
      padding: 15px 20px;
      border: 2px solid #e0e6ed;
      background: white;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .decision-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .decision-btn.approve {
      border-color: #28a745;
      color: #28a745;
    }

    .decision-btn.approve.active,
    .decision-btn.approve:hover:not(:disabled) {
      background: #28a745;
      color: white;
    }

    .decision-btn.deny {
      border-color: #dc3545;
      color: #dc3545;
    }

    .decision-btn.deny.active,
    .decision-btn.deny:hover:not(:disabled) {
      background: #dc3545;
      color: white;
    }

    .decision-btn.review {
      border-color: #007bff;
      color: #007bff;
    }

    .decision-btn.review.active,
    .decision-btn.review:hover:not(:disabled) {
      background: #007bff;
      color: white;
    }

    .decision-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .notes-section {
      margin-bottom: 25px;
    }

    .notes-section label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #333;
    }

    .notes-textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e6ed;
      border-radius: 8px;
      font-family: inherit;
      font-size: 1rem;
      resize: vertical;
      min-height: 100px;
      transition: border-color 0.3s ease;
    }

    .notes-textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .submit-section {
      text-align: center;
    }

    .submit-btn {
      background: #667eea;
      color: white;
      padding: 15px 40px;
      border: none;
      border-radius: 25px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .submit-btn:hover:not(:disabled) {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    .submit-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .notes-display {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      white-space: pre-wrap;
      line-height: 1.6;
    }

    .timeline {
      border-left: 3px solid #e0e6ed;
      padding-left: 20px;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 20px;
    }

    .timeline-item::before {
      content: '';
      position: absolute;
      left: -26px;
      top: 5px;
      width: 12px;
      height: 12px;
      background: #667eea;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 3px #e0e6ed;
    }

    .timeline-date {
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 4px;
    }

    .timeline-event {
      font-weight: 600;
      color: #333;
    }

    @media (max-width: 768px) {
      .loan-review-container {
        padding: 10px;
      }

      .page-header h1 {
        font-size: 2rem;
      }

      .back-btn {
        position: relative;
        display: block;
        width: fit-content;
        margin: 0 auto 20px;
      }

      .decision-options {
        flex-direction: column;
      }

      .decision-btn {
        min-width: unset;
      }

      .overview-grid, .loan-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .applicant-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoanReviewComponent implements OnInit, OnDestroy {
  application: LoanApplication | null = null;
  loading = true;
  submitting = false;
  applicationId!: number;
  decisionForm!: FormGroup;

  private subscription = new Subscription();

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.subscription.add(
      this.route.params.subscribe(params => {
        this.applicationId = +params['id'];
        this.loadApplication();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  initializeForm() {
    this.decisionForm = this.fb.group({
      status: ['', Validators.required],
      notes: ['']
    });
  }

  loadApplication() {
    this.loading = true;
    this.subscription.add(
      this.adminService.getLoanApplicationById(this.applicationId).subscribe({
        next: (application) => {
          this.application = application;
          this.decisionForm.patchValue({
            status: application.status,
            notes: application.notes || ''
          });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading application:', error);
          this.notificationService.loadError('application details');
          this.loading = false;
        }
      })
    );
  }

  setDecision(status: string) {
    this.decisionForm.patchValue({ status });
  }

  submitDecision() {
    if (this.decisionForm.valid && this.application) {
      this.submitting = true;
      const formData = this.decisionForm.value;
      
      this.subscription.add(
        this.adminService.updateLoanApplicationStatus(
          this.application.id,
          formData.status,
          formData.notes
        ).subscribe({
          next: (updatedApplication) => {
            this.application = updatedApplication;
            this.notificationService.success('Updated', `Application ${formData.status.toLowerCase()} successfully`);
            this.submitting = false;
          },
          error: (error) => {
            console.error('Error updating application:', error);
            this.notificationService.saveError('application update');
            this.submitting = false;
          }
        })
      );
    }
  }

  calculateLTV(): number {
    if (!this.application) return 0;
    return Math.round((this.application.loanAmount / this.application.propertyValue) * 100);
  }

  calculateMonthlyPayment(): number {
    if (!this.application) return 0;
    
    const principal = this.application.loanAmount;
    const monthlyRate = this.application.interestRate / 100 / 12;
    const numberOfPayments = this.application.loanTermYears * 12;
    
    if (monthlyRate === 0) return principal / numberOfPayments;
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  calculateDebtToIncome(): number {
    if (!this.application) return 0;
    const monthlyPayment = this.calculateMonthlyPayment();
    const monthlyIncome = this.application.annualIncome / 12;
    return Math.round((monthlyPayment / monthlyIncome) * 100);
  }

  getDebtToIncomeRisk(): string {
    const ratio = this.calculateDebtToIncome();
    if (ratio <= 28) return 'low-risk';
    if (ratio <= 36) return 'medium-risk';
    return 'high-risk';
  }

  getDebtToIncomeLabel(): string {
    const ratio = this.calculateDebtToIncome();
    if (ratio <= 28) return 'Low Risk';
    if (ratio <= 36) return 'Moderate Risk';
    return 'High Risk';
  }

  getLTVRisk(): string {
    const ltv = this.calculateLTV();
    if (ltv <= 80) return 'low-risk';
    if (ltv <= 90) return 'medium-risk';
    return 'high-risk';
  }

  getLTVLabel(): string {
    const ltv = this.calculateLTV();
    if (ltv <= 80) return 'Good';
    if (ltv <= 90) return 'Acceptable';
    return 'High Risk';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
}