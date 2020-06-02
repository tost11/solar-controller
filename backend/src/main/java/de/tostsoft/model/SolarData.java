package de.tostsoft.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
public class SolarData {

    @Id
    private String id;
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


    @Override
    public String toString() {
        return "SolarData{" +
                "id='" + id + '\'' +
                ", durationTime=" + durationTime +
                ", creationDate=" + creationDate +
                ", chargeVolt=" + chargeVolt +
                ", chargeAmpere=" + chargeAmpere +
                ", chargeWatt=" + chargeWatt +
                ", batteryVoltage=" + batteryVoltage +
                ", batteryAmperes=" + batteryAmperes +
                ", dischargeVoltage=" + dischargeVoltage +
                ", dischargeAmperes=" + dischargeAmperes +
                ", dischargeWatt=" + dischargeWatt +
                ", batteryTemperature=" + batteryTemperature +
                ", deviceTemperature=" + deviceTemperature +
                ", chargerTemperature=" + chargerTemperature +
                '}';
    }
}
