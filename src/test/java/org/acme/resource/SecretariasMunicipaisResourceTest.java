package org.acme.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
public class SecretariasMunicipaisResourceTest {

    @Test
    void create_deveCriar() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"nome\":\"Secretaria de Teste\",\"sigla\":\"ST\",\"email\":\"teste@example.com\",\"telefone\":\"(66) 99999-9999\"}")
                .when()
                .post("/api/secretarias-municipais")
                .then()
                .statusCode(anyOf(is(200), is(201)))
                .body("secretariaId", not(emptyOrNullString()))
                .body("nome", equalTo("Secretaria de Teste"))
                .body("ativo", equalTo(true));
    }

    @Test
    void create_deveFalharSemNome() {
        given()
                .contentType(ContentType.JSON)
                .body("{\"sigla\":\"ST\"}")
                .when()
                .post("/api/secretarias-municipais")
                .then()
                .statusCode(400)
                .body("error", containsString("Nome"));
    }

    @Test
    void patchAtivo_deveDesativarEAtivar() {
        // create
        String id = given()
                .contentType(ContentType.JSON)
                .body("{\"nome\":\"Secretaria Alternar\"}")
                .when()
                .post("/api/secretarias-municipais")
                .then()
                .statusCode(anyOf(is(200), is(201)))
                .extract().path("secretariaId");

        // deactivate
        given()
                .contentType(ContentType.JSON)
                .body("{\"ativo\":false}")
                .when()
                .patch("/api/secretarias-municipais/" + id + "/ativo")
                .then()
                .statusCode(200)
                .body("ativo", equalTo(false));

        // activate
        given()
                .contentType(ContentType.JSON)
                .body("{\"ativo\":true}")
                .when()
                .patch("/api/secretarias-municipais/" + id + "/ativo")
                .then()
                .statusCode(200)
                .body("ativo", equalTo(true));
    }
}

