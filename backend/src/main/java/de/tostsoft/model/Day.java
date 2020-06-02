package de.tostsoft.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.aggregation.DateOperators;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDate;
import java.time.Year;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Day{
    @Id
    private String id;

    private LocalDate date;

    @DBRef
    private List<SolarData> data;

    private float producedWattHours;
    private float consumedWattHours;
}
