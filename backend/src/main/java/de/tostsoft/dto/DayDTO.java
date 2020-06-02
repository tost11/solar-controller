package de.tostsoft.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DayDTO {

    private float wattHours;

    private float consumedWattHours;

    private List<SolarDataDTO> solardata;

}
