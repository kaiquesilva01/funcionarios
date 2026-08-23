package br.com.itau.funcionarios.employee.adapter.output.jpa;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface SpringDataEmployeeRepository extends JpaRepository<EmployeeEntity, UUID> {

	boolean existsByEmail(String email);

	boolean existsByEmailAndIdNot(String email, UUID id);

	@Query("""
			SELECT e FROM EmployeeEntity e
			WHERE (:role = '' OR LOWER(e.role) LIKE LOWER(CONCAT('%', :role, '%')))
			AND (:search = '' OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%'))
				OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')))
			""")
	Page<EmployeeEntity> search(@Param("role") String role, @Param("search") String search, Pageable pageable);
}
