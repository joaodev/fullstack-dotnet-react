using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductsDotnetApi.Models
{
    /// <summary>
    /// Entidade que representa um departamento.
    /// </summary>
    [Table("Departments")]
    public class Department
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public bool Status { get; set; }
    }
}
