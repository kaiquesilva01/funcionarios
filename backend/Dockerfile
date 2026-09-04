# syntax=docker/dockerfile:1

FROM maven:3.9-eclipse-temurin-21 AS base
WORKDIR /workspace
COPY pom.xml ./
COPY src src

FROM base AS test
RUN --mount=type=cache,target=/root/.m2 mvn -B verify

FROM base AS builder
RUN --mount=type=cache,target=/root/.m2 mvn -B package -DskipTests \
    && cp target/funcionarios-api.jar /workspace/app.jar

FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app
COPY --from=builder /workspace/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
