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
                .body("{\"councilorId\":\"par-1\",\"officialCode\":\"001-001-2026\",\"value\":10,\"status\":\"Pendente\",\"institutionId\":\"inst-1\",\"classification\":\"EMENDA_PIX\",\"attachments\":[\"http://example.com/a.pdf\"]}")
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

    @Test
    void create_deveFalharQuandoTipoEmendaInvalido() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"councilorId\":\"par-1\",\"officialCode\":\"001-002-2026\",\"value\":10,\"status\":\"Pendente\",\"institutionId\":\"inst-1\",\"classification\":\"TIPO_INEXISTENTE\"}")
                .when()
                .post("/api/emendas")
                .then()
                .statusCode(400)
                .body("error", containsString("Tipo de emenda inválido"));
    }

    @Test
    void create_emendaPix_deveExigirLinkAssinado() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"councilorId\":\"par-1\",\"officialCode\":\"001-003-2026\",\"value\":10,\"status\":\"Pendente\",\"institutionId\":\"inst-1\",\"classification\":\"EMENDA_PIX\"}")
                .when()
                .post("/api/emendas")
                .then()
                .statusCode(400)
                .body("error", containsString("Link assinado"));
    }

    @Test
    void create_transferenciaEspecial_deveExigirObjetoDetalhado() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"councilorId\":\"par-1\",\"officialCode\":\"001-004-2026\",\"value\":10,\"status\":\"Pendente\",\"institutionId\":\"inst-1\",\"classification\":\"INDIVIDUAL_TRANSFERENCIA_ESPECIAL\",\"signedLink\":\"http://example.com/doc.pdf\"}")
                .when()
                .post("/api/emendas")
                .then()
                .statusCode(400)
                .body("error", containsString("Objeto detalhado"));
    }

    @Test
    void create_deveFalharQuandoEsferaAusente() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"councilorId\":\"par-1\",\"officialCode\":\"001-005-2026\",\"value\":10,\"status\":\"Pendente\",\"institutionId\":\"inst-1\",\"classification\":\"EMENDA_PIX\",\"signedLink\":\"http://example.com/doc.pdf\"}")
                .when()
                .post("/api/emendas")
                .then()
                .statusCode(400)
                .body("error", containsString("Esfera"));
    }

    @Test
    void create_deveFalharQuandoEsferaInvalida() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"councilorId\":\"par-1\",\"officialCode\":\"001-006-2026\",\"value\":10,\"status\":\"Pendente\",\"institutionId\":\"inst-1\",\"classification\":\"EMENDA_PIX\",\"signedLink\":\"http://example.com/doc.pdf\",\"esfera\":\"XYZ\"}")
                .when()
                .post("/api/emendas")
                .then()
                .statusCode(400)
                .body("error", containsString("Esfera inválida"));
    }

    @Test
    void create_deveAceitarEsferaValida() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"councilorId\":\"par-1\",\"officialCode\":\"001-007-2026\",\"value\":10,\"status\":\"Pendente\",\"institutionId\":\"inst-1\",\"classification\":\"EMENDA_PIX\",\"signedLink\":\"http://example.com/doc.pdf\",\"esfera\":\"Municipal\"}")
                .when()
                .post("/api/emendas")
                .then()
                .statusCode(anyOf(is(200), is(201)))
                .body("esfera", equalTo("Municipal"));
    }

    @Test
    void create_deveFalharQuandoExisteConvenioMasSemNumeroEAno() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"councilorId\":\"par-1\",\"officialCode\":\"001-008-2026\",\"value\":10,\"status\":\"Pendente\",\"institutionId\":\"inst-1\",\"classification\":\"EMENDA_PIX\",\"signedLink\":\"http://example.com/doc.pdf\",\"esfera\":\"Municipal\",\"existeConvenio\":true}")
                .when()
                .post("/api/emendas")
                .then()
                .statusCode(400)
                .body("error", anyOf(containsString("Número do convênio"), containsString("Ano do convênio")));
    }

    @Test
    void create_deveAceitarQuandoNaoExisteConvenioMesmoComCamposVazios() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"councilorId\":\"par-1\",\"officialCode\":\"001-009-2026\",\"value\":10,\"status\":\"Pendente\",\"institutionId\":\"inst-1\",\"classification\":\"EMENDA_PIX\",\"signedLink\":\"http://example.com/doc.pdf\",\"esfera\":\"Municipal\",\"existeConvenio\":false}")
                .when()
                .post("/api/emendas")
                .then()
                .statusCode(anyOf(is(200), is(201)))
                .body("existeConvenio", equalTo(false));
    }

    @Test
    void create_deveAceitarQuandoExisteConvenioComNumeroEAnoValidos() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"councilorId\":\"par-1\",\"officialCode\":\"001-010-2026\",\"value\":10,\"status\":\"Pendente\",\"institutionId\":\"inst-1\",\"classification\":\"EMENDA_PIX\",\"signedLink\":\"http://example.com/doc.pdf\",\"esfera\":\"Municipal\",\"existeConvenio\":true,\"numeroConvenio\":\"1234567890123456\",\"anoConvenio\":2026}")
                .when()
                .post("/api/emendas")
                .then()
                .statusCode(anyOf(is(200), is(201)))
                .body("existeConvenio", equalTo(true))
                .body("numeroConvenio", equalTo("1234567890123456"))
                .body("anoConvenio", equalTo(2026));
    }
}
