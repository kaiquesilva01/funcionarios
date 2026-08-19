package br.com.itau.funcionarios.employee;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

class HexagonalArchitectureTest {

	private static final String DOMAIN_PACKAGE = "..employee.domain..";
	private static final String PORT_PACKAGE = "..employee.port..";
	private static final String APPLICATION_PACKAGE = "..employee.application..";
	private static final String ADAPTER_PACKAGE = "..employee.adapter..";

	private static final JavaClasses CLASSES = new ClassFileImporter()
			.withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
			.importPackages("br.com.itau.funcionarios.employee");

	@Test
	void hexagonalLayersRespectDependencyDirection() {
		noClasses()
				.that().resideInAPackage(DOMAIN_PACKAGE)
				.should().dependOnClassesThat().resideInAnyPackage(PORT_PACKAGE, APPLICATION_PACKAGE, ADAPTER_PACKAGE)
				.check(CLASSES);

		noClasses()
				.that().resideInAPackage(PORT_PACKAGE)
				.should().dependOnClassesThat().resideInAnyPackage(APPLICATION_PACKAGE, ADAPTER_PACKAGE)
				.check(CLASSES);

		noClasses()
				.that().resideInAPackage(APPLICATION_PACKAGE)
				.should().dependOnClassesThat().resideInAnyPackage(ADAPTER_PACKAGE)
				.check(CLASSES);
	}

	@Test
	void domainDoesNotDependOnTheSpringFramework() {
		noClasses()
				.that().resideInAPackage(DOMAIN_PACKAGE)
				.should().dependOnClassesThat().resideInAPackage("org.springframework..")
				.check(CLASSES);
	}
}
