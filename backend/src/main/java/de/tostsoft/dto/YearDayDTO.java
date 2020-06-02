package de.tostsoft.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class YearDayDTO{
    private float wattHours;
    private float consumedWattHours;

    private LocalDate date;
}
