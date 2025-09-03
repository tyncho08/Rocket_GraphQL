using HotChocolate.Types;
using MortgagePlatform.API.Models;
using MortgagePlatform.API.Data;

namespace MortgagePlatform.API.GraphQL.Types;

public class LoanApplicationType : ObjectType<LoanApplication>
{
    protected override void Configure(IObjectTypeDescriptor<LoanApplication> descriptor)
    {
        descriptor.Field(la => la.Id);
        descriptor.Field(la => la.UserId);
        descriptor.Field(la => la.LoanAmount);
        descriptor.Field(la => la.PropertyValue);
        descriptor.Field(la => la.DownPayment);
        descriptor.Field(la => la.InterestRate);
        descriptor.Field(la => la.LoanTermYears);
        descriptor.Field(la => la.AnnualIncome);
        descriptor.Field(la => la.EmploymentStatus);
        descriptor.Field(la => la.Employer);
        descriptor.Field(la => la.Status);
        descriptor.Field(la => la.Notes);
        descriptor.Field(la => la.CreatedAt);
        descriptor.Field(la => la.UpdatedAt);
        
        descriptor.Field(la => la.User)
            .UseDbContext<ApplicationDbContext>();
            
        descriptor.Field(la => la.Documents)
            .UseDbContext<ApplicationDbContext>();
            
        descriptor.Field(la => la.Payments)
            .UseDbContext<ApplicationDbContext>();
            
        // Add computed field for monthly payment
        descriptor.Field("monthlyPayment")
            .Type<DecimalType>()
            .Resolve(ctx =>
            {
                var loan = ctx.Parent<LoanApplication>();
                var monthlyRate = (double)(loan.InterestRate / 100 / 12);
                var numberOfPayments = (double)(loan.LoanTermYears * 12);
                
                if (monthlyRate == 0) return loan.LoanAmount / (decimal)numberOfPayments;
                
                return (decimal)((double)loan.LoanAmount * (monthlyRate * Math.Pow(1 + monthlyRate, numberOfPayments)) / 
                       (Math.Pow(1 + monthlyRate, numberOfPayments) - 1));
            });
    }
}