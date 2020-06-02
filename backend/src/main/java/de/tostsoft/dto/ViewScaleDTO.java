package de.tostsoft.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ViewScaleDTO{
    private Float minBatteryVoltage;
    private Float maxBatteryVoltage;

    private Float maxLoadVoltage;
    private Float maxLoadWatt;
    private Float maxLoadAmpere;

    private Float maxConsumerVoltage;
    private Float maxConsumerAmpere;
    private Float maxConsumerWatt;

    private Float maxYearWattHours;
    private Float maxYearConsumedWattHours;
}
