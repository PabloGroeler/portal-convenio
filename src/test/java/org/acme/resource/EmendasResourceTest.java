package org.acme.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
public class EmendasResourceTest {

    @Test
    void executarAcao_deveRetornarJsonSemErroLazy() {
        // Create a minimal emenda
        String id = given()
                .contentType(ContentType.JSON)
                .body("{\"councilorId\":\"par-1\",\"officialCode\":\"001-001-2026\",\"value\":10,\"status\":\"Pendente\",\"institutionId\":\"inst-1\",\"attachments\":[\"http://example.com/a.pdf\"]}")
                .when()
                .post("/api/emendas")
                .then()
                .statusCode(anyOf(is(200), is(201)))
                .body("id", not(emptyOrNullString()))
                .extract()
                .path("id");

        // Execute action and assert response includes attachments and doesn't 500
        given()
                .contentType(ContentType.JSON)
                .body("{\"acao\":\"APROVAR\",\"observacao\":\"ok\"}")
                .when()
                .post("/api/emendas/" + id + "/acao")
                .then()
                .statusCode(200)
                .body("id", equalTo(id))
                .body("status", anyOf(equalTo("Aprovada"), equalTo("APROVADA")))
                .body("attachments", notNullValue());
    }
}
