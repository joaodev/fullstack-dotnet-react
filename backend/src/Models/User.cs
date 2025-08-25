using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductsDotnetApi.Models
{
    /// <summary>
    /// Entidade que representa um usuário do sistema.
    /// </summary>
    [Table("Users")]
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string PasswordHash { get; set; } = string.Empty;

        public bool Status { get; set; }
    }
}
