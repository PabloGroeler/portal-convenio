package org.acme.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
public class EmendasCicloVidaResourceTest {

    @Test
    void create_deveDefinirStatusCicloVidaDefaultRecebido() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"councilorId\":\"par-1\",\"officialCode\":\"001-011-2026\",\"value\":10,\"status\":\"Pendente\",\"institutionId\":\"inst-1\",\"classification\":\"EMENDA_PIX\",\"signedLink\":\"http://example.com/doc.pdf\",\"esfera\":\"Municipal\"}")
                .when()
                .post("/api/emendas")
                .then()
                .statusCode(anyOf(is(200), is(201)))
                .body("statusCicloVida", anyOf(equalTo("Recebido"), nullValue()));
    }

    @Test
    void create_deveFalharQuandoStatusCicloVidaInvalido() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"councilorId\":\"par-1\",\"officialCode\":\"001-012-2026\",\"value\":10,\"status\":\"Pendente\",\"institutionId\":\"inst-1\",\"classification\":\"EMENDA_PIX\",\"signedLink\":\"http://example.com/doc.pdf\",\"esfera\":\"Municipal\",\"statusCicloVida\":\"QUALQUER\"}")
                .when()
                .post("/api/emendas")
                .then()
                .statusCode(400)
                .body("error", containsString("Status do ciclo de vida inválido"));
    }

    @Test
    void create_deveAceitarQuandoStatusCicloVidaValido() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"councilorId\":\"par-1\",\"officialCode\":\"001-013-2026\",\"value\":10,\"status\":\"Pendente\",\"institutionId\":\"inst-1\",\"classification\":\"EMENDA_PIX\",\"signedLink\":\"http://example.com/doc.pdf\",\"esfera\":\"Municipal\",\"statusCicloVida\":\"Em execução\"}")
                .when()
                .post("/api/emendas")
                .then()
                .statusCode(anyOf(is(200), is(201)))
                .body("statusCicloVida", equalTo("Em execução"));
    }
}

