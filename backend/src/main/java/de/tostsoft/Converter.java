package de.tostsoft;

import de.tostsoft.dto.DayDTO;
import de.tostsoft.dto.SolarDataDTO;
import de.tostsoft.dto.YearDayDTO;
import de.tostsoft.model.Day;
import de.tostsoft.model.SolarData;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class Converter {

    public static List<SolarDataDTO> convertSolarDataToSolarDataTDOs(Collection<SolarData> solarDataCollections){
        return solarDataCollections.stream().map(Converter::convertSolarDataToSolarDataDTO).collect(Collectors.toList());
    }

    public static SolarDataDTO convertSolarDataToSolarDataDTO(SolarData solarData){
        return SolarDataDTO.builder()
                .batteryAmperes(solarData.getBatteryAmperes())
                .batteryTemperature(solarData.getBatteryTemperature())
                .batteryVoltage(solarData.getBatteryVoltage())
                .chargeAmpere(solarData.getChargeAmpere())
                .chargerTemperature(solarData.getChargerTemperature())
                .chargeVolt(solarData.getChargeVolt())
                .chargeWatt(solarData.getChargeWatt())
                .creationDate(solarData.getCreationDate())
                .deviceTemperature(solarData.getDeviceTemperature())
                .dischargeAmperes(solarData.getDischargeAmperes())
                .dischargeVoltage(solarData.getDischargeVoltage())
                .dischargeWatt(solarData.getDischargeWatt())
                .durationTime(solarData.getDurationTime())
                .build();
    }

    public static DayDTO ConvertDayToDayDTO(Day day){
        return DayDTO.builder().solardata(convertSolarDataToSolarDataTDOs(day.getData()))
                .wattHours(day.getProducedWattHours())
                .consumedWattHours(day.getConsumedWattHours())
                .build();
    }

    public static YearDayDTO convertDayToYearDayDTO(Day day){
        return YearDayDTO.builder()
                .consumedWattHours(day.getConsumedWattHours())
                .wattHours(day.getProducedWattHours())
                .date(day.getDate())
                .build();
    }
}
