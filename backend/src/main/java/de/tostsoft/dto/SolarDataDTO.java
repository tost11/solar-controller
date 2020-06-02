package de.tostsoft.dto;

import lombok.*;
import org.springframework.data.annotation.Id;

import java.util.Date;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SolarDataDTO {
    private float durationTime;

    private Date creationDate;

    private float chargeVolt;
    private float chargeAmpere;
    private float chargeWatt;

    private float batteryVoltage;
    private float batteryAmperes;

    private float dischargeVoltage;
    private float dischargeAmperes;
    private float dischargeWatt;

    private float batteryTemperature;
    private float deviceTemperature;
    private float chargerTemperature;
}