package org.acme.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ExternalCouncilorDTO {

    @JsonProperty("id")
    public String councilorId;

    @JsonProperty("name")
    public String fullName;

    @JsonProperty("party")
    public String politicalParty;

    /** Optional flag if present in the public dataset. */
    @JsonProperty("active")
    public Boolean active;
}
