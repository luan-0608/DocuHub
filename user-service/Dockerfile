# ---- Build: Maven + JDK 21, context la GOC repo de build kem common-lib ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

COPY pom.xml .
COPY common-lib/pom.xml common-lib/
COPY discovery-server/pom.xml discovery-server/
COPY api-gateway/pom.xml api-gateway/
COPY user-service/pom.xml user-service/
COPY document-service/pom.xml document-service/
COPY chat-service/pom.xml chat-service/

COPY common-lib/src common-lib/src
COPY user-service/src user-service/src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -q -pl user-service -am package -DskipTests

# ---- Run: chi can JRE ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /build/user-service/target/user-service-*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
