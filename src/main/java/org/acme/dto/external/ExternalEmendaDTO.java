package org.acme.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO representing an emenda as returned by an external API.
 *
 * NOTE: Field names are intentionally flexible to match common API conventions.
 * If your external API uses different names, adjust the @JsonProperty bindings.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExternalEmendaDTO {

    /** Stable ID from the external system (preferred for idempotency). */
    @JsonProperty("id")
    public String id;

    @JsonProperty("councilorId")
    public String councilorId;

    @JsonProperty("officialCode")
    public String officialCode;

    /** ISO date string if present. Some datasets only provide year. */
    @JsonProperty("date")
    public String date;

    /** Year (string or number) if present in the consolidated dataset. */
    @JsonProperty("year")
    public String year;

    /** Value can come as number in consolidated dataset; we normalize to String for mapper. */
    @JsonProperty("value")
    public Object value;

    @JsonProperty("classification")
    public String classification;

    @JsonProperty("category")
    public String category;

    @JsonProperty("status")
    public String status;

    /**
     * New field present in the consolidated endpoint.
     * Typically represents the federal-level status and may be used as a fallback.
     */
    @JsonProperty("federalStatus")
    public String federalStatus;

    /** Alternative names used by some external datasets. */
    @JsonProperty("state")
    public String state;

    /** Alternative names used by some external datasets. */
    @JsonProperty("situation")
    public String situation;

    /** JIRA 6 — Optional sphere classification from external dataset. */
    @JsonProperty("esfera")
    public String esfera;

    @JsonProperty("existeConvenio")
    public Boolean existeConvenio;

    @JsonProperty("numeroConvenio")
    public String numeroConvenio;

    @JsonProperty("anoConvenio")
    public Integer anoConvenio;

    @JsonProperty("institutionId")
    public String institutionId;

    @JsonProperty("signedLink")
    public String signedLink;

    @JsonProperty("description")
    public String description;

    @JsonProperty("objectDetail")
    public String objectDetail;

    /** Tipo de transferência: Direta ou Indireta */
    @JsonProperty("tipoTransferencia")
    public String tipoTransferencia;
}
