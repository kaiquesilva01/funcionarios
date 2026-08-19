package br.com.itau.funcionarios.employee.adapter.output.jpa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "employees")
public class EmployeeEntity {

	@Id
	private UUID id;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false, unique = true)
	private String email;

	@Column(nullable = false)
	private String role;

	@Column(nullable = false)
	private BigDecimal salary;

	@Column(name = "hire_date", nullable = false)
	private LocalDate hireDate;

	protected EmployeeEntity() {
	}

	public EmployeeEntity(UUID id, String name, String email, String role, BigDecimal salary, LocalDate hireDate) {
		this.id = id;
		this.name = name;
		this.email = email;
		this.role = role;
		this.salary = salary;
		this.hireDate = hireDate;
	}

	public UUID getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public String getEmail() {
		return email;
	}

	public String getRole() {
		return role;
	}

	public BigDecimal getSalary() {
		return salary;
	}

	public LocalDate getHireDate() {
		return hireDate;
	}
}
