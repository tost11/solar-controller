package de.tostsoft.controller;

import de.tostsoft.Converter;
import de.tostsoft.dto.DayDTO;
import de.tostsoft.dto.SolarInfoDTO;
import de.tostsoft.dto.ViewScaleDTO;
import de.tostsoft.dto.YearDTO;
import de.tostsoft.model.Day;
import de.tostsoft.model.SolarData;
import de.tostsoft.service.StatisticService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.annotation.PostConstruct;
import java.time.LocalDate;
import java.time.Year;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

@RestController
@EnableAutoConfiguration
@RequestMapping("/api/solar")
@CrossOrigin
@EnableScheduling
public class MainController {

    @Autowired
    private SimpMessagingTemplate webSocket;

    private SolarInfoDTO solardataDTO = null;
    private ViewScaleDTO viewScaleDTO = null;
    private LinkedList<SolarInfoDTO> solarDataDTOS = new LinkedList<>();

    @Autowired
    private StatisticService statisticService;

    @Value("${input.delay:10}")
    private float inputDelay;

    @Value("${view.min-battery-voltage:10}")
    private Float minBatteryVoltage;
    @Value("${view.max-battery-voltage:15}")
    private Float maxBatteryVoltage;

    @Value("${view.max-load-voltage:70}")
    private Float maxLoadVoltage;
    @Value("${view.max-load-ampere:20}")
    private Float maxLoadAmpere;
    @Value("${view.max-load-watt:350}")
    private Float maxLoadWatt;

    @Value("${view.max-consumer-voltage:15}")
    private Float maxConsumerVoltage;
    @Value("${view.max-consumer-ampere:10}")
    private Float maxConsumerAmpere;
    @Value("${view.max-consumer-watt:75}")
    private Float maxConsumerWatt;

    @Value("${view.max-year-watt-hours:2000}")
    private Float maxYearWattHours;

    @Value("${view.max-year-consumed-watt-hours:200}")
    private Float maxYearConsumedWattHours;

    @Value("${client.auth-token}")
    private String clientAuthToken;

    @PostConstruct
    public void init() {
        viewScaleDTO = ViewScaleDTO.builder()
                .minBatteryVoltage(minBatteryVoltage)
                .maxBatteryVoltage(maxBatteryVoltage)
                .maxLoadVoltage(maxLoadVoltage)
                .maxLoadAmpere(maxLoadAmpere)
                .maxLoadWatt(maxLoadWatt)
                .maxConsumerVoltage(maxConsumerVoltage)
                .maxConsumerAmpere(maxConsumerAmpere)
                .maxConsumerWatt(maxConsumerWatt)
                .maxYearWattHours(maxYearWattHours)
                .maxYearConsumedWattHours(maxYearConsumedWattHours)
                .build();

    }

    @PostMapping
    public String addData(@RequestBody SolarInfoDTO solardataDTO, @RequestHeader(value = "client-token", required = false) String token) {
        if (token == null || !StringUtils.equals(token, clientAuthToken)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not Authenticated");
        }


        System.out.println("New solar data: " + solardataDTO);

        solardataDTO.setChargeVolt(solardataDTO.getChargeVolt() / 100.f);
        solardataDTO.setChargeAmpere(solardataDTO.getChargeAmpere() / 100.f);
        solardataDTO.setBatteryVoltage(solardataDTO.getBatteryVoltage() / 100.f);
        solardataDTO.setBatteryAmperes(solardataDTO.getBatteryAmperes() / 100.f);
        solardataDTO.setDischargeVoltage(solardataDTO.getDischargeVoltage() / 100.f);
        solardataDTO.setDischargeAmperes(solardataDTO.getDischargeAmperes() / 100.f);
        solardataDTO.setBatteryTemperature(solardataDTO.getBatteryTemperature() / 100.f);
        solardataDTO.setDeviceTemperature(solardataDTO.getDeviceTemperature() / 100.f);
        solardataDTO.setChargerTemperature(solardataDTO.getChargerTemperature() / 100.f);

        SolarData solarData = new SolarData();
        solarData.setChargeVolt(solardataDTO.getChargeVolt());
        solarData.setChargeAmpere(solardataDTO.getChargeAmpere());
        solarData.setChargeWatt(solarData.getChargeVolt() * solarData.getChargeAmpere());
        solarData.setBatteryVoltage(solardataDTO.getBatteryVoltage());
        solarData.setBatteryAmperes(solardataDTO.getBatteryAmperes());
        solarData.setDischargeVoltage(solardataDTO.getDischargeVoltage());
        solarData.setDischargeAmperes(solardataDTO.getDischargeAmperes());
        solarData.setDischargeWatt(solarData.getDischargeVoltage() * solarData.getDischargeAmperes());
        solarData.setBatteryTemperature(solardataDTO.getBatteryTemperature());
        solarData.setDeviceTemperature(solardataDTO.getDeviceTemperature());
        solarData.setChargerTemperature(solardataDTO.getChargerTemperature());

        statisticService.addData(solarData);

        solardataDTO.setTotalWattHours(statisticService.getTotalWattHours());
        solardataDTO.setWattHoursToday(statisticService.getDayWattHours());

        solardataDTO.setTotalConsumedWattHours(statisticService.getTotalConsumedWattHours());
        solardataDTO.setConsumedWattHoursToday(statisticService.getDayConsumedWattHours());

        solardataDTO.setDate(solarData.getCreationDate());

        solarDataDTOS.add(solardataDTO);
        if (this.solarDataDTOS.size() > 50) {
            this.solarDataDTOS.pop();
        }

        this.solardataDTO = solardataDTO;

        webSocket.convertAndSend("/info", Collections.singletonList(solardataDTO));

        return "" + inputDelay;
    }

    @GetMapping("/last")
    public ResponseEntity<List<SolarInfoDTO>> getLast() {
        if (solardataDTO == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(solarDataDTOS);
    }

    @GetMapping("/info")
    public ResponseEntity<SolarInfoDTO> getInfo() {
        if (solardataDTO == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(solardataDTO);
    }

    @GetMapping("/settings")
    public ResponseEntity<ViewScaleDTO> getSettings() {
        return ResponseEntity.ok(viewScaleDTO);
    }

    @GetMapping("/day/{date}")
    public ResponseEntity<DayDTO> getDay(@PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Day day = statisticService.getDayInfo(date);
        return ResponseEntity.ok(Converter.ConvertDayToDayDTO(day));
    }

    @GetMapping("/year/{year}")
    public ResponseEntity<YearDTO> getDay(@PathVariable("year") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Year year) {
        YearDTO yearDto = statisticService.getYearInfo(year);
        return ResponseEntity.ok(yearDto);
    }
}
