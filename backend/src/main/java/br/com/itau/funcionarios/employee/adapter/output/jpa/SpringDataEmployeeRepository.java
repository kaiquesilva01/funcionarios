package br.com.itau.funcionarios.employee.adapter.output.jpa;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataEmployeeRepository extends JpaRepository<EmployeeEntity, UUID> {

	boolean existsByEmail(String email);

	boolean existsByEmailAndIdNot(String email, UUID id);

	List<EmployeeEntity> findByRoleContainingIgnoreCase(String role);
}
