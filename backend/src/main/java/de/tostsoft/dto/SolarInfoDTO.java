package de.tostsoft.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SolarInfoDTO {

    private float chargeVolt;
    private float chargeAmpere;
    private float batteryVoltage;
    private float batteryAmperes;
    private float dischargeVoltage;
    private float dischargeAmperes;
    private float batteryTemperature;
    private float deviceTemperature;
    private float chargerTemperature;

    private double wattHoursToday;
    private double totalWattHours;

    private double consumedWattHoursToday;
    private double totalConsumedWattHours;

    private Date date;

    @Override
    public String toString(){
        return "SolarInfoDTO{"+
                "chargeVolt="+chargeVolt+
                ", chargeAmpere="+chargeAmpere+
                ", batteryVoltage="+batteryVoltage+
                ", batteryAmperes="+batteryAmperes+
                ", dischargeVoltage="+dischargeVoltage+
                ", dischargeAmperes="+dischargeAmperes+
                ", batteryTemperature="+batteryTemperature+
                ", deviceTemperature="+deviceTemperature+
                ", chargerTemperature="+chargerTemperature+
                ", wattHoursToday="+wattHoursToday+
                ", totalWattHours="+totalWattHours+
                ", consumedWattHoursToday="+consumedWattHoursToday+
                ", totalConsumedWattHours="+totalConsumedWattHours+
                '}';
    }
}
