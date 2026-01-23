package org.acme.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Represents the consolidated public dataset returned by:
 * GET /api/public/v1/data
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExternalPublicDataDTO {

    @JsonProperty("councilors")
    public List<ExternalCouncilorDTO> councilors;

    @JsonProperty("institutions")
    public List<org.acme.dto.external.ExternalInstitutionDTO> institutions;

    @JsonProperty("amendments")
    public List<ExternalEmendaDTO> amendments;
}
