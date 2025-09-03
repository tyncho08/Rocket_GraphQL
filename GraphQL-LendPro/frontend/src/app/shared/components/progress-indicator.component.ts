import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  completed?: boolean;
  error?: boolean;
}

@Component({
  selector: 'app-progress-indicator',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('stepAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('progressAnimation', [
      transition('* => *', [
        style({ width: '0%' }),
        animate('500ms ease-out')
      ])
    ])
  ],
  template: `
    <div class="progress-indicator" [class]="'layout-' + layout">
      <!-- Horizontal Layout -->
      <div *ngIf="layout === 'horizontal'" class="horizontal-progress">
        <div class="progress-line">
          <div class="progress-fill" [style.width.%]="progressPercentage" [@progressAnimation]></div>
        </div>
        
        <div class="steps-container">
          <div 
            *ngFor="let step of steps; let i = index" 
            class="step"
            [class.active]="i === currentStep"
            [class.completed]="step.completed"
            [class.error]="step.error"
            [@stepAnimation]
          >
            <div class="step-circle">
              <span *ngIf="step.icon && !step.completed && !step.error" class="step-icon">{{ step.icon }}</span>
              <span *ngIf="step.completed" class="step-icon">✓</span>
              <span *ngIf="step.error" class="step-icon">✕</span>
              <span *ngIf="!step.icon && !step.completed && !step.error" class="step-number">{{ i + 1 }}</span>
            </div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div *ngIf="step.description" class="step-description">{{ step.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vertical Layout -->
      <div *ngIf="layout === 'vertical'" class="vertical-progress">
        <div 
          *ngFor="let step of steps; let i = index" 
          class="step vertical-step"
          [class.active]="i === currentStep"
          [class.completed]="step.completed"
          [class.error]="step.error"
          [@stepAnimation]
        >
          <div class="step-indicator">
            <div class="step-circle">
              <span *ngIf="step.icon && !step.completed && !step.error" class="step-icon">{{ step.icon }}</span>
              <span *ngIf="step.completed" class="step-icon">✓</span>
              <span *ngIf="step.error" class="step-icon">✕</span>
              <span *ngIf="!step.icon && !step.completed && !step.error" class="step-number">{{ i + 1 }}</span>
            </div>
            <div *ngIf="i < steps.length - 1" class="step-connector" [class.filled]="step.completed"></div>
          </div>
          <div class="step-content">
            <div class="step-title">{{ step.title }}</div>
            <div *ngIf="step.description" class="step-description">{{ step.description }}</div>
          </div>
        </div>
      </div>

      <!-- Dots Layout -->
      <div *ngIf="layout === 'dots'" class="dots-progress">
        <div 
          *ngFor="let step of steps; let i = index" 
          class="dot"
          [class.active]="i === currentStep"
          [class.completed]="step.completed"
          [class.error]="step.error"
          [@stepAnimation]
          [title]="step.title + (step.description ? ': ' + step.description : '')"
        >
          <div class="dot-circle">
            <span *ngIf="step.completed" class="dot-icon">✓</span>
            <span *ngIf="step.error" class="dot-icon">✕</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .progress-indicator {
      width: 100%;
      padding: 20px 0;
    }

    /* Horizontal Layout */
    .horizontal-progress {
      position: relative;
    }

    .progress-line {
      position: absolute;
      top: 25px;
      left: 0;
      right: 0;
      height: 2px;
      background: #e0e6ed;
      border-radius: 1px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      border-radius: 1px;
      transition: width 0.5s ease;
    }

    .steps-container {
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 1;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: white;
      padding: 0 10px;
      min-width: 120px;
      text-align: center;
    }

    .step-circle {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      border: 2px solid #e0e6ed;
      color: #6c757d;
      font-weight: bold;
      margin-bottom: 12px;
      transition: all 0.3s ease;
    }

    .step.active .step-circle {
      background: #667eea;
      border-color: #667eea;
      color: white;
      transform: scale(1.1);
    }

    .step.completed .step-circle {
      background: #28a745;
      border-color: #28a745;
      color: white;
    }

    .step.error .step-circle {
      background: #dc3545;
      border-color: #dc3545;
      color: white;
    }

    .step-content {
      max-width: 150px;
    }

    .step-title {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
      margin-bottom: 4px;
    }

    .step.active .step-title {
      color: #667eea;
    }

    .step-description {
      font-size: 0.8rem;
      color: #6c757d;
      line-height: 1.3;
    }

    .step-icon {
      font-size: 1.2rem;
    }

    .step-number {
      font-size: 1.1rem;
    }

    /* Vertical Layout */
    .vertical-progress {
      max-width: 400px;
    }

    .vertical-step {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20px;
      padding: 0;
      min-width: auto;
      text-align: left;
    }

    .step-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 20px;
    }

    .vertical-step .step-circle {
      margin-bottom: 0;
      width: 40px;
      height: 40px;
    }

    .step-connector {
      width: 2px;
      height: 40px;
      background: #e0e6ed;
      margin-top: 8px;
      transition: background 0.3s ease;
    }

    .step-connector.filled {
      background: #28a745;
    }

    .vertical-step .step-content {
      flex: 1;
      max-width: none;
      padding-top: 8px;
    }

    /* Dots Layout */
    .dots-progress {
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    .dot {
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .dot:hover {
      transform: scale(1.1);
    }

    .dot-circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #e0e6ed;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .dot.active .dot-circle {
      background: #667eea;
      transform: scale(1.2);
    }

    .dot.completed .dot-circle {
      background: #28a745;
    }

    .dot.error .dot-circle {
      background: #dc3545;
    }

    .dot-icon {
      font-size: 0.8rem;
      color: white;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .step {
        min-width: 80px;
      }

      .step-content {
        max-width: 100px;
      }

      .step-title {
        font-size: 0.8rem;
      }

      .step-description {
        font-size: 0.7rem;
      }

      .vertical-step {
        margin-bottom: 15px;
      }

      .step-indicator {
        margin-right: 15px;
      }
    }
  `]
})
export class ProgressIndicatorComponent {
  @Input() steps: ProgressStep[] = [];
  @Input() currentStep: number = 0;
  @Input() layout: 'horizontal' | 'vertical' | 'dots' = 'horizontal';

  get progressPercentage(): number {
    if (this.steps.length === 0) return 0;
    const completedSteps = this.steps.filter(step => step.completed).length;
    return Math.min((completedSteps / this.steps.length) * 100, 100);
  }
}