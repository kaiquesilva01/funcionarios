package br.com.itau.funcionarios.employee.adapter.input.web;

import br.com.itau.funcionarios.employee.domain.exception.EmployeeEmailAlreadyExistsException;
import br.com.itau.funcionarios.employee.domain.exception.EmployeeNotFoundException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(EmployeeNotFoundException.class)
	public ResponseEntity<Map<String, String>> handleNotFound(EmployeeNotFoundException e) {
		return ResponseEntity
				.status(HttpStatus.NOT_FOUND)
				.body(Map.of("message", e.getMessage()));
	}

	@ExceptionHandler(EmployeeEmailAlreadyExistsException.class)
	public ResponseEntity<Map<String, String>> handleEmailAlreadyExists(EmployeeEmailAlreadyExistsException e) {
		return ResponseEntity
				.status(HttpStatus.CONFLICT)
				.body(Map.of("message", e.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
		Map<String, String> fieldErrors = new LinkedHashMap<>();
		e.getBindingResult().getFieldErrors()
				.forEach(error -> fieldErrors.put(error.getField(), error.getDefaultMessage()));

		Map<String, Object> body = new LinkedHashMap<>();
		body.put("message", "Dados inválidos");
		body.put("errors", fieldErrors);

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
	}
}
