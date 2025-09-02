import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ReportConfig {
  title: string;
  subtitle?: string;
  author?: string;
  date?: Date;
  includeHeader?: boolean;
  includeFooter?: boolean;
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

export interface LoanApplicationReport extends ReportConfig {
  applicant: ApplicantInfo;
  loanDetails: LoanDetails;
  propertyInfo: PropertyInfo;
  financialInfo: FinancialInfo;
  documents: DocumentInfo[];
  recommendation?: string;
  riskAssessment?: RiskAssessment;
}

export interface MarketAnalysisReport extends ReportConfig {
  region: string;
  timeframe: string;
  marketTrends: any[];
  priceAnalysis: any;
  insights: any[];
  forecast: any;
}

export interface PropertyComparisonReport extends ReportConfig {
  properties: any[];
  comparisonData: any;
  recommendations: any[];
}

interface ApplicantInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ssn?: string;
  dateOfBirth?: string;
  employmentStatus: string;
  annualIncome: number;
}

interface LoanDetails {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  loanType: string;
  monthlyPayment: number;
  downPayment: number;
  ltvRatio: number;
}

interface PropertyInfo {
  address: string;
  propertyType: string;
  price: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt?: number;
  appraisedValue?: number;
}

interface FinancialInfo {
  monthlyIncome: number;
  monthlyExpenses: number;
  assets: number;
  debts: number;
  creditScore?: number;
  debtToIncomeRatio: number;
}

interface DocumentInfo {
  type: string;
  status: string;
  uploadDate: string;
  required: boolean;
}

interface RiskAssessment {
  overallRisk: 'Low' | 'Medium' | 'High';
  riskScore: number;
  factors: RiskFactor[];
}

interface RiskFactor {
  factor: string;
  impact: 'Positive' | 'Negative' | 'Neutral';
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class PdfReportService {

  constructor() {}

  generateLoanApplicationReport(data: LoanApplicationReport): Observable<Blob> {
    const htmlContent = this.createLoanApplicationHTML(data);
    return this.generatePDFFromHTML(htmlContent, data);
  }

  generateMarketAnalysisReport(data: MarketAnalysisReport): Observable<Blob> {
    const htmlContent = this.createMarketAnalysisHTML(data);
    return this.generatePDFFromHTML(htmlContent, data);
  }

  generatePropertyComparisonReport(data: PropertyComparisonReport): Observable<Blob> {
    const htmlContent = this.createPropertyComparisonHTML(data);
    return this.generatePDFFromHTML(htmlContent, data);
  }

  generateCalculatorReport(calculatorType: string, data: any): Observable<Blob> {
    const htmlContent = this.createCalculatorHTML(calculatorType, data);
    return this.generatePDFFromHTML(htmlContent, {
      title: `${calculatorType} Report`,
      subtitle: 'Mortgage Calculator Analysis',
      date: new Date()
    });
  }

  private generatePDFFromHTML(htmlContent: string, config: ReportConfig): Observable<Blob> {
    // Create a temporary container for the content
    const printContainer = document.createElement('div');
    printContainer.innerHTML = htmlContent;
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '-9999px';
    printContainer.style.width = '8.5in';
    printContainer.style.fontSize = '12px';
    printContainer.style.lineHeight = '1.4';
    printContainer.style.color = '#000';
    printContainer.style.background = '#fff';
    
    document.body.appendChild(printContainer);

    // Use window.print() API or create downloadable HTML
    try {
      // For modern browsers, we can use the Print API
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(this.getFullHTMLDocument(htmlContent, config));
        printWindow.document.close();
        
        // Auto-trigger print dialog
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
      
      // Create downloadable HTML file as fallback
      const blob = new Blob([this.getFullHTMLDocument(htmlContent, config)], { 
        type: 'text/html' 
      });
      
      document.body.removeChild(printContainer);
      return of(blob);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      document.body.removeChild(printContainer);
      
      // Return HTML blob as fallback
      const blob = new Blob([this.getFullHTMLDocument(htmlContent, config)], { 
        type: 'text/html' 
      });
      return of(blob);
    }
  }

  private getFullHTMLDocument(content: string, config: ReportConfig): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${config.title}</title>
    <style>
        ${this.getPrintStyles()}
    </style>
</head>
<body>
    ${config.includeHeader !== false ? this.createHeader(config) : ''}
    <main class="report-content">
        ${content}
    </main>
    ${config.includeFooter !== false ? this.createFooter(config) : ''}
</body>
</html>`;
  }

  private getPrintStyles(): string {
    return `
        @media print {
            @page {
                margin: 0.75in;
                size: ${this.getPageSize()};
            }
            
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.4;
                color: #333;
                font-size: 11pt;
            }
            
            .page-break {
                page-break-before: always;
            }
            
            .no-break {
                page-break-inside: avoid;
            }
            
            h1, h2, h3 {
                page-break-after: avoid;
            }
        }
        
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            background: white;
        }
        
        .report-header {
            border-bottom: 2px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .report-header h1 {
            color: #667eea;
            font-size: 24px;
            margin: 0 0 5px 0;
        }
        
        .report-header h2 {
            color: #666;
            font-size: 14px;
            margin: 0 0 10px 0;
            font-weight: normal;
        }
        
        .report-header .meta {
            font-size: 11px;
            color: #888;
        }
        
        .report-footer {
            border-top: 1px solid #ddd;
            padding-top: 15px;
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .section h3 {
            color: #333;
            font-size: 16px;
            margin: 0 0 15px 0;
            padding-bottom: 5px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 15px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dotted #ccc;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
        }
        
        .info-value {
            color: #333;
        }
        
        .highlight {
            background: #fffacd;
            padding: 2px 4px;
            font-weight: bold;
        }
        
        .positive {
            color: #28a745;
        }
        
        .negative {
            color: #dc3545;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        .table th,
        .table td {
            padding: 8px 12px;
            border: 1px solid #ddd;
            text-align: left;
        }
        
        .table th {
            background: #f8f9fa;
            font-weight: bold;
            color: #333;
        }
        
        .table tr:nth-child(even) {
            background: #f9f9f9;
        }
        
        .risk-low { color: #28a745; }
        .risk-medium { color: #ffc107; }
        .risk-high { color: #dc3545; }
        
        .chart-placeholder {
            background: #f8f9fa;
            border: 1px solid #ddd;
            padding: 40px;
            text-align: center;
            color: #666;
            margin: 15px 0;
        }
        
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 10px;
        }
        
        .signature-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        
        .signature-box {
            display: inline-block;
            width: 200px;
            border-bottom: 1px solid #333;
            margin: 20px 40px 0 0;
            padding: 0 0 3px 0;
            text-align: center;
        }
        
        .signature-label {
            display: block;
            margin-top: 5px;
            font-size: 10px;
            color: #666;
        }
    `;
  }

  private getPageSize(): string {
    return 'letter'; // Default to US Letter
  }

  private createHeader(config: ReportConfig): string {
    return `
        <header class="report-header">
            <h1>${config.title}</h1>
            ${config.subtitle ? `<h2>${config.subtitle}</h2>` : ''}
            <div class="meta">
                ${config.author ? `Prepared by: ${config.author} | ` : ''}
                Generated: ${(config.date || new Date()).toLocaleDateString()}
                ${config.author ? ` | Rocket Mortgage Platform` : ''}
            </div>
        </header>
    `;
  }

  private createFooter(config: ReportConfig): string {
    return `
        <footer class="report-footer">
            <p>This report was generated by Rocket Mortgage Platform on ${new Date().toLocaleDateString()}</p>
            <p>For questions about this report, please contact your loan officer or visit our website.</p>
        </footer>
    `;
  }

  private createLoanApplicationHTML(data: LoanApplicationReport): string {
    return `
        <div class="section">
            <h3>Applicant Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${data.applicant.firstName} ${data.applicant.lastName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${data.applicant.email}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${data.applicant.phone}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Employment:</span>
                    <span class="info-value">${data.applicant.employmentStatus}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Annual Income:</span>
                    <span class="info-value highlight">$${data.applicant.annualIncome.toLocaleString()}</span>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h3>Loan Details</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Loan Amount:</span>
                    <span class="info-value highlight">$${data.loanDetails.loanAmount.toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Interest Rate:</span>
                    <span class="info-value">${data.loanDetails.interestRate}%</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Loan Term:</span>
                    <span class="info-value">${data.loanDetails.loanTerm} years</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Loan Type:</span>
                    <span class="info-value">${data.loanDetails.loanType}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Monthly Payment:</span>
                    <span class="info-value highlight">$${data.loanDetails.monthlyPayment.toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Down Payment:</span>
                    <span class="info-value">$${data.loanDetails.downPayment.toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">LTV Ratio:</span>
                    <span class="info-value">${data.loanDetails.ltvRatio}%</span>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h3>Property Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Address:</span>
                    <span class="info-value">${data.propertyInfo.address}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Property Type:</span>
                    <span class="info-value">${data.propertyInfo.propertyType}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Purchase Price:</span>
                    <span class="info-value highlight">$${data.propertyInfo.price.toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Square Feet:</span>
                    <span class="info-value">${data.propertyInfo.sqft.toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Bedrooms:</span>
                    <span class="info-value">${data.propertyInfo.bedrooms}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Bathrooms:</span>
                    <span class="info-value">${data.propertyInfo.bathrooms}</span>
                </div>
                ${data.propertyInfo.yearBuilt ? `
                <div class="info-item">
                    <span class="info-label">Year Built:</span>
                    <span class="info-value">${data.propertyInfo.yearBuilt}</span>
                </div>` : ''}
                ${data.propertyInfo.appraisedValue ? `
                <div class="info-item">
                    <span class="info-label">Appraised Value:</span>
                    <span class="info-value">$${data.propertyInfo.appraisedValue.toLocaleString()}</span>
                </div>` : ''}
            </div>
        </div>
        
        <div class="section">
            <h3>Financial Summary</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Monthly Income:</span>
                    <span class="info-value">$${data.financialInfo.monthlyIncome.toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Monthly Expenses:</span>
                    <span class="info-value">$${data.financialInfo.monthlyExpenses.toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Total Assets:</span>
                    <span class="info-value">$${data.financialInfo.assets.toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Total Debts:</span>
                    <span class="info-value">$${data.financialInfo.debts.toLocaleString()}</span>
                </div>
                ${data.financialInfo.creditScore ? `
                <div class="info-item">
                    <span class="info-label">Credit Score:</span>
                    <span class="info-value highlight">${data.financialInfo.creditScore}</span>
                </div>` : ''}
                <div class="info-item">
                    <span class="info-label">Debt-to-Income Ratio:</span>
                    <span class="info-value ${data.financialInfo.debtToIncomeRatio > 43 ? 'negative' : 'positive'}">${data.financialInfo.debtToIncomeRatio}%</span>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h3>Required Documents</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Document Type</th>
                        <th>Status</th>
                        <th>Upload Date</th>
                        <th>Required</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.documents.map(doc => `
                        <tr>
                            <td>${doc.type}</td>
                            <td class="${doc.status.toLowerCase() === 'approved' ? 'positive' : doc.status.toLowerCase() === 'rejected' ? 'negative' : ''}">${doc.status}</td>
                            <td>${new Date(doc.uploadDate).toLocaleDateString()}</td>
                            <td>${doc.required ? 'Yes' : 'No'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        ${data.riskAssessment ? `
        <div class="section">
            <h3>Risk Assessment</h3>
            <div class="info-item">
                <span class="info-label">Overall Risk Level:</span>
                <span class="info-value risk-${data.riskAssessment.overallRisk.toLowerCase()}">${data.riskAssessment.overallRisk}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Risk Score:</span>
                <span class="info-value">${data.riskAssessment.riskScore}/100</span>
            </div>
            
            <h4>Risk Factors:</h4>
            <table class="table">
                <thead>
                    <tr>
                        <th>Factor</th>
                        <th>Impact</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.riskAssessment.factors.map(factor => `
                        <tr>
                            <td>${factor.factor}</td>
                            <td class="${factor.impact.toLowerCase() === 'positive' ? 'positive' : factor.impact.toLowerCase() === 'negative' ? 'negative' : ''}">${factor.impact}</td>
                            <td>${factor.description}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>` : ''}
        
        ${data.recommendation ? `
        <div class="section">
            <h3>Recommendation</h3>
            <p>${data.recommendation}</p>
        </div>` : ''}
        
        <div class="signature-section">
            <div class="signature-box">
                <span class="signature-label">Applicant Signature / Date</span>
            </div>
            <div class="signature-box">
                <span class="signature-label">Loan Officer Signature / Date</span>
            </div>
        </div>
    `;
  }

  private createMarketAnalysisHTML(data: MarketAnalysisReport): string {
    return `
        <div class="section">
            <h3>Market Overview</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Region:</span>
                    <span class="info-value highlight">${data.region}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Analysis Period:</span>
                    <span class="info-value">${data.timeframe}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Report Date:</span>
                    <span class="info-value">${new Date().toLocaleDateString()}</span>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h3>Price Trends</h3>
            <div class="chart-placeholder">
                [Price trend chart would be displayed here]
                <br>
                Data shows ${data.marketTrends.length} data points over the analysis period.
            </div>
            <div class="info-grid">
                ${data.priceAnalysis ? Object.entries(data.priceAnalysis).map(([key, value]) => `
                    <div class="info-item">
                        <span class="info-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                        <span class="info-value">${typeof value === 'number' ? (key.includes('Price') || key.includes('Cost') ? '$' + value.toLocaleString() : value) : value}</span>
                    </div>
                `).join('') : ''}
            </div>
        </div>
        
        <div class="section">
            <h3>Market Insights</h3>
            ${data.insights.map(insight => `
                <div class="info-item no-break">
                    <div>
                        <strong>${insight.title}</strong>
                        <p>${insight.description}</p>
                        <small>Confidence: ${insight.confidence}% | Timeframe: ${insight.timeframe}</small>
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${data.forecast ? `
        <div class="section">
            <h3>Market Forecast</h3>
            <div class="chart-placeholder">
                [Forecast chart would be displayed here]
                <br>
                Forecast data available for upcoming periods.
            </div>
        </div>` : ''}
    `;
  }

  private createPropertyComparisonHTML(data: PropertyComparisonReport): string {
    return `
        <div class="section">
            <h3>Property Comparison Summary</h3>
            <p>Comparing ${data.properties.length} properties selected for analysis.</p>
        </div>
        
        <div class="section">
            <h3>Property Details</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Property</th>
                        <th>Price</th>
                        <th>Sq Ft</th>
                        <th>Price/Sq Ft</th>
                        <th>Bedrooms</th>
                        <th>Bathrooms</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.properties.map(property => `
                        <tr>
                            <td>${property.address}</td>
                            <td>$${property.price.toLocaleString()}</td>
                            <td>${property.sqft.toLocaleString()}</td>
                            <td>$${Math.round(property.price / property.sqft)}</td>
                            <td>${property.bedrooms}</td>
                            <td>${property.bathrooms}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        ${data.comparisonData ? `
        <div class="section">
            <h3>Financial Analysis</h3>
            <div class="chart-placeholder">
                [Financial comparison charts would be displayed here]
            </div>
        </div>` : ''}
        
        <div class="section">
            <h3>Recommendations</h3>
            ${data.recommendations.map(rec => `
                <div class="info-item no-break">
                    <div>
                        <strong>${rec.title}</strong>
                        <p>${rec.description}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
  }

  private createCalculatorHTML(calculatorType: string, data: any): string {
    return `
        <div class="section">
            <h3>${calculatorType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Results</h3>
            <div class="info-grid">
                ${Object.entries(data).map(([key, value]) => `
                    <div class="info-item">
                        <span class="info-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                        <span class="info-value">${this.formatValue(key, value)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="section">
            <h3>Calculation Details</h3>
            <p>This report contains detailed analysis based on the input parameters provided. 
               All calculations are performed using industry-standard formulas and current market data.</p>
        </div>
    `;
  }

  private formatValue(key: string, value: any): string {
    if (typeof value === 'number') {
      if (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost') || 
          key.toLowerCase().includes('payment') || key.toLowerCase().includes('amount')) {
        return '$' + value.toLocaleString();
      } else if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percent')) {
        return value.toFixed(2) + '%';
      } else {
        return value.toLocaleString();
      }
    }
    return String(value);
  }

  // Convenience methods for different report types
  downloadLoanApplicationReport(data: LoanApplicationReport): void {
    this.generateLoanApplicationReport(data).subscribe(blob => {
      this.downloadBlob(blob, `loan-application-${data.applicant.lastName}-${this.getDateString()}.html`);
    });
  }

  downloadMarketAnalysisReport(data: MarketAnalysisReport): void {
    this.generateMarketAnalysisReport(data).subscribe(blob => {
      this.downloadBlob(blob, `market-analysis-${data.region}-${this.getDateString()}.html`);
    });
  }

  downloadPropertyComparisonReport(data: PropertyComparisonReport): void {
    this.generatePropertyComparisonReport(data).subscribe(blob => {
      this.downloadBlob(blob, `property-comparison-${this.getDateString()}.html`);
    });
  }

  downloadCalculatorReport(calculatorType: string, data: any): void {
    this.generateCalculatorReport(calculatorType, data).subscribe(blob => {
      this.downloadBlob(blob, `${calculatorType}-report-${this.getDateString()}.html`);
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private getDateString(): string {
    return new Date().toISOString().split('T')[0];
  }
}