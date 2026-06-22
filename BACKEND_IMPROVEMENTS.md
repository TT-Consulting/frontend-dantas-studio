// ============================================
// SUGGESTED IMPROVEMENT FOR ClienteRepository
// ============================================
// Add this method to ClienteRepository.kt for unified client search
// This improves the BookingScreen search experience significantly

@Query("SELECT c FROM Cliente c WHERE " +
       "(LOWER(c.nome) LIKE LOWER(CONCAT('%', :termo, '%')) " +
       "OR c.whatsapp LIKE CONCAT('%', :termo, '%')) " +
       "AND c.isAtivo = true " +
       "ORDER BY c.nome ASC")
fun buscarAtivosPorNomeOuWhatsapp(@Param("termo") termo: String): List<Cliente>

// ============================================
// Then, update ClienteController to use it:
// ============================================

@GetMapping("/buscar")
fun buscar(@RequestParam termo: String): ResponseEntity<List<ClienteDTO>> {
    val clientes = repository.buscarAtivosPorNomeOuWhatsapp(termo)
    return if (clientes.isEmpty()) 
        ResponseEntity.noContent().build()
    else 
        ResponseEntity.ok(clientes.map { it.toDTO() })
}

// ============================================
// Then update frontend API in services.js:
// ============================================

export const buscarClientesPorTermo = (termo) =>
  apiClient
    .get('/clientes/buscar', { params: { termo } })
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao buscar clientes:', err);
      throw err;
    });

// ============================================
// Benefits:
// ============================================
// 1. Single query parameter (termo) instead of conditional logic
// 2. Searches across both name AND whatsapp simultaneously
// 3. Only returns active clients (isAtivo = true)
// 4. Results sorted alphabetically by name
// 5. Reduces frontend complexity for search logic
// 6. Better performance with native SQL LIKE query
