package org.acme.resource;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
public class TiposEmendaResourceTest {

    @Test
    void listTiposEmenda_returnsSeededActiveList() {
        given()
                .when().get("/api/tipos-emenda")
                .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(5))
                .body("codigo", hasItems(
                        "EMENDA_BANCADA",
                        "EMENDA_COMISSAO",
                        "EMENDA_PIX",
                        "INDIVIDUAL_FINALIDADE_DEFINIDA",
                        "INDIVIDUAL_TRANSFERENCIA_ESPECIAL"
                ))
                .body("ativo", everyItem(is(true)))
                .body("nome", everyItem(not(isEmptyOrNullString())));
    }

    @Test
    void listTiposEmenda_aliasEndpoint_works() {
        given()
                .when().get("/tipos-emenda")
                .then()
                .statusCode(200)
                .body("size()", greaterThanOrEqualTo(5))
                .body("codigo", hasItems(
                        "EMENDA_BANCADA",
                        "EMENDA_COMISSAO",
                        "EMENDA_PIX",
                        "INDIVIDUAL_FINALIDADE_DEFINIDA",
                        "INDIVIDUAL_TRANSFERENCIA_ESPECIAL"
                ));
    }
}
