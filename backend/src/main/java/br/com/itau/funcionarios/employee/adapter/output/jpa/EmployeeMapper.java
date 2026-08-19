package br.com.itau.funcionarios.employee.adapter.output.jpa;

import br.com.itau.funcionarios.employee.domain.model.Employee;

final class EmployeeMapper {

	private EmployeeMapper() {
	}

	static EmployeeEntity toEntity(Employee employee) {
		return new EmployeeEntity(
				employee.id(),
				employee.name(),
				employee.email(),
				employee.role(),
				employee.salary(),
				employee.hireDate());
	}

	static Employee toDomain(EmployeeEntity entity) {
		return new Employee(
				entity.getId(),
				entity.getName(),
				entity.getEmail(),
				entity.getRole(),
				entity.getSalary(),
				entity.getHireDate());
	}
}
