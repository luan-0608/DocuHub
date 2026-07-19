# ---- Build: Maven + JDK 21, context la GOC repo de reactor thay du cac module ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

COPY pom.xml .
COPY common-lib/pom.xml common-lib/
COPY discovery-server/pom.xml discovery-server/
COPY api-gateway/pom.xml api-gateway/
COPY user-service/pom.xml user-service/
COPY document-service/pom.xml document-service/
COPY chat-service/pom.xml chat-service/

COPY api-gateway/src api-gateway/src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -q -pl api-gateway -am package -DskipTests

# ---- Run: chi can JRE ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /build/api-gateway/target/api-gateway-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
