package org.acme.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ExternalInstitutionDTO {

    @JsonProperty("id")
    public String institutionId;

    @JsonProperty("name")
    public String name;

    @JsonProperty("cnpj")
    public String cnpj;
}
