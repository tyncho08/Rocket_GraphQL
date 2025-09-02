namespace MortgagePlatform.API.DTOs
{
    public class PropertySearchDto
    {
        public string City { get; set; }
        public string State { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? MinBedrooms { get; set; }
        public int? MaxBedrooms { get; set; }
        public int? MinBathrooms { get; set; }
        public int? MaxBathrooms { get; set; }
        public string PropertyType { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "ListedDate";
        public string SortOrder { get; set; } = "desc";
    }

    public class PropertySearchResultDto
    {
        public PropertyDto[] Properties { get; set; }
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class PropertyDto
    {
        public int Id { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }
        public decimal Price { get; set; }
        public int Bedrooms { get; set; }
        public int Bathrooms { get; set; }
        public int SquareFeet { get; set; }
        public string PropertyType { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public bool IsFavorite { get; set; }
    }
}