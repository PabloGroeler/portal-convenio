package org.acme.dto;

import org.acme.entity.Emenda;
import org.acme.entity.Institution;
import org.acme.entity.Councilor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class EmendaDetailDTO {
    public String id;
    public String councilorId;
    public String councilorName; // From Councilor entity
    public String officialCode;
    public LocalDate date;
    public BigDecimal value;
    public String classification;
    public String category;
    public String status;
    public String federalStatus;
    public String institutionId;
    public String institutionName; // From Institution entity
    public String signedLink;
    public List<String> attachments;
    public String description;
    public String objectDetail;

    public EmendaDetailDTO() {
    }

    public EmendaDetailDTO(Emenda emenda, Institution institution, Councilor councilor) {
        this.id = emenda.id;
        this.councilorId = emenda.councilorId;
        this.councilorName = councilor != null ? councilor.fullName : null;
         this.officialCode = emenda.officialCode;
        this.date = emenda.date;
        this.value = emenda.value;
        this.classification = emenda.classification;
        this.category = emenda.category;
        this.status = emenda.status;
        this.federalStatus = emenda.federalStatus;
        this.institutionId = emenda.institutionId;
        this.institutionName = institution != null ? institution.name : null;
        this.signedLink = emenda.signedLink;
        this.attachments = emenda.attachments != null ? new ArrayList<>(emenda.attachments) : new ArrayList<>();
        this.description = emenda.description;
        this.objectDetail = emenda.objectDetail;
    }

    public static EmendaDetailDTO fromEmenda(Emenda emenda) {
        EmendaDetailDTO dto = new EmendaDetailDTO();
        dto.id = emenda.id;
        dto.councilorId = emenda.councilorId;
        dto.officialCode = emenda.officialCode;
        dto.date = emenda.date;
        dto.value = emenda.value;
        dto.classification = emenda.classification;
        dto.category = emenda.category;
        dto.status = emenda.status;
        dto.federalStatus = emenda.federalStatus;
        dto.institutionId = emenda.institutionId;
        dto.signedLink = emenda.signedLink;
        dto.attachments = emenda.attachments != null ? new ArrayList<>(emenda.attachments) : new ArrayList<>();
        dto.description = emenda.description;
        dto.objectDetail = emenda.objectDetail;
        return dto;
    }
}
