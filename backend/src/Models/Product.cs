using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductsDotnetApi.Models
{
    /// <summary>
    /// Entidade que representa um produto.
    /// </summary>
    [Table("Products")]
    public class Product
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [ForeignKey("Department")]
        public int DepartmentId { get; set; }


        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public bool Status { get; set; }
    }
}
