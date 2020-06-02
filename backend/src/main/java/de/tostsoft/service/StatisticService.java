package de.tostsoft.service;

import de.tostsoft.Converter;
import de.tostsoft.dto.YearDTO;
import de.tostsoft.dto.YearDayDTO;
import de.tostsoft.model.Day;
import de.tostsoft.model.SolarData;
import de.tostsoft.repository.DayRepository;
import de.tostsoft.repository.SolarDataRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.annotation.PostConstruct;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Year;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@EnableScheduling
public class StatisticService {

    Logger logger = LoggerFactory.getLogger(StatisticService.class);

    private Date lastUpdate = new Date();
    private long accumulatedTime = 0;
    private List<SolarData> listOfUpdates = new ArrayList<>();

    private Day currentDay = null;

    private double totalWattHours;
    private double dayWattHours;

    private double totalConsumedWattHours;
    private double dayConsumedWattHours;


    @Value("${input.delay:10}")
    private float inputDelay;

    @Autowired
    private SolarDataRepository solarDataRepository;

    @Autowired
    private DayRepository dayRepository;

    @PostConstruct
    public synchronized void init(){
        Date now = new Date();
        double wattSeconds = 0;
        double todayWattSeconds = 0;
        double consumedWattSeconds = 0;
        double todayConsumedWattSeconds = 0;
        dayWattHours=0;
        int sizeOnPage = 3000;
        int offset = 0;
        int i = 0;
        while(true) {
            Page<SolarData> page = solarDataRepository.findAll(PageRequest.of(i++,sizeOnPage));
            for (SolarData data : page) {
                double watt = data.getChargeWatt() * data.getDurationTime();
                double consumedWatt = data.getDischargeWatt() * data.getDurationTime();
                wattSeconds += watt;
                consumedWattSeconds +=consumedWatt;
                SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMdd");
                if(fmt.format(now).equals(fmt.format(data.getCreationDate()))){
                    todayWattSeconds += watt;
                    todayConsumedWattSeconds += consumedWatt;
                }
            }
            offset += sizeOnPage;
            if(page.getTotalElements() <= offset){
                break;
            }
        }
        totalWattHours = wattSeconds / 3600;
        dayWattHours = todayWattSeconds / 3600;

        totalConsumedWattHours = consumedWattSeconds / 3600;
        dayConsumedWattHours = todayConsumedWattSeconds/ 3600;

        setCurrentDay();
        
        logger.info("Init finished: twh->{} dwh->{} tcwh->{} dcwh{}",totalWattHours,dayWattHours,totalConsumedWattHours,dayConsumedWattHours);
    }

    void setCurrentDay(){
        LocalDate now = LocalDate.now();
        currentDay = dayRepository.findDayByDate(now);
        if(currentDay == null){
            currentDay = Day.builder()
                    .date(now)
                    .data(new ArrayList<>())
                    .consumedWattHours(0)
                    .producedWattHours(0)
                    .build();
            currentDay = dayRepository.save(currentDay);
        }
    }

    private void akkumulateData(SolarData currentResult,SolarData update,float fak){
        currentResult.setChargeAmpere(currentResult.getChargeAmpere() + update.getChargeAmpere() * fak);
        currentResult.setChargeVolt(currentResult.getChargeVolt() + update.getChargeVolt() * fak);
        currentResult.setChargeWatt(currentResult.getChargeWatt() + update.getChargeWatt() * fak);
        currentResult.setBatteryVoltage(currentResult.getBatteryVoltage() + update.getBatteryVoltage() * fak);
        currentResult.setBatteryAmperes(currentResult.getBatteryAmperes() + update.getBatteryAmperes() * fak);
        currentResult.setDischargeVoltage(currentResult.getDischargeVoltage() + update.getDischargeVoltage() * fak);
        currentResult.setDischargeAmperes(currentResult.getDischargeAmperes() + update.getDischargeAmperes() * fak);
        currentResult.setDischargeWatt(currentResult.getDischargeWatt() + update.getDischargeWatt() * fak);
        currentResult.setChargerTemperature(currentResult.getChargerTemperature() + update.getChargerTemperature() * fak);
        currentResult.setDeviceTemperature(currentResult.getDeviceTemperature() + update.getDeviceTemperature() * fak);
        currentResult.setBatteryTemperature(currentResult.getBatteryTemperature() + update.getBatteryTemperature() * fak);
    }

    @Scheduled(cron="0 */5 * * * *")
    public synchronized void saveToDatabase(){
        Date now = new Date();
        LocalDate localNow = Instant.ofEpochMilli(now.getTime())
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        if(!currentDay.getDate().equals(localNow)){
            setCurrentDay();
        }
        SolarData res = new SolarData();
        res.setCreationDate(now);
        res.setDurationTime(accumulatedTime);
        for (SolarData solarData : listOfUpdates) {
            akkumulateData(res,solarData,solarData.getDurationTime() / accumulatedTime);
        }
        solarDataRepository.save(res);

        currentDay.getData().add(res);
        currentDay.setProducedWattHours(currentDay.getProducedWattHours()+res.getChargeWatt()*res.getDurationTime()/3600.f);
        currentDay.setConsumedWattHours(currentDay.getConsumedWattHours()+res.getDischargeWatt()*res.getDurationTime()/3600.f);
        dayRepository.save(currentDay);

        accumulatedTime = 0;
        listOfUpdates.clear();
        System.out.println("Saved Solardata to database: "+res);
    }

    @Scheduled(cron="0 0 0 * * *")
    public synchronized void resetDate(){
        dayWattHours = 0;
        dayConsumedWattHours = 0;
    }

    public synchronized void addData(SolarData solarData){
        Date now = new Date();
        solarData.setDurationTime((float)((now.getTime()-lastUpdate.getTime())/1000));
        solarData.setCreationDate(now);
        if(solarData.getDurationTime() > inputDelay * 1.5){
            solarData.setDurationTime(inputDelay * 1.5f);
        }
        listOfUpdates.add(solarData);
        accumulatedTime += solarData.getDurationTime();

        float wattHours = solarData.getChargeWatt() * solarData.getDurationTime() / 3600;
        totalWattHours += wattHours;
        dayWattHours += wattHours;

        float consumedWattHours = solarData.getDischargeWatt() * solarData.getDurationTime() / 3600;
        dayConsumedWattHours += consumedWattHours;
        totalConsumedWattHours += consumedWattHours;

        lastUpdate = now;
    }

    public double getTotalWattHours() {
        return totalWattHours;
    }

    public double getDayWattHours() {
        return dayWattHours;
    }

    public double getTotalConsumedWattHours() {
        return totalConsumedWattHours;
    }

    public double getDayConsumedWattHours() {
        return dayConsumedWattHours;
    }

    public Day getDayInfo(LocalDate date){
        Day day = dayRepository.findDayByDate(date);
        if(day == null){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"No data available for date: "+date);
        }
        return day;
    }

    public YearDTO getYearInfo(Year year){
        YearDTO yearDTO = new YearDTO();
        List<YearDayDTO> yearDayDTOS = new ArrayList<>();
        int numDays = year.isLeap()?266:265;
        float wattHours = 0;
        float consumedWattHours = 0;
        for(int i = 1;i<numDays;i++){
            LocalDate localDate=year.atDay(i);
            Day day = dayRepository.findDayByDateAndEmpty(localDate);
            if(day == null){
                yearDayDTOS.add(new YearDayDTO());
            }else{
                yearDayDTOS.add(Converter.convertDayToYearDayDTO(day));
                wattHours += day.getProducedWattHours();
                consumedWattHours += day.getConsumedWattHours();
            }
        }
        yearDTO.setYear(year);
        yearDTO.setDays(yearDayDTOS);
        yearDTO.setWattHours(wattHours);
        yearDTO.setConsumedWattHours(consumedWattHours);
        return yearDTO;
    }

    public synchronized void recalculateDays(){

        dayRepository.deleteAll();
        int days = 0;

        Page<SolarData> page = solarDataRepository.findAllByOrderByCreationDateAsc(PageRequest.of(1,1));
        if(page.isEmpty()){
            return;
        }
        Date date = page.get().findFirst().get().getCreationDate();

        LocalDate localDate = Instant.ofEpochMilli(date.getTime()).atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate start = localDate.atStartOfDay().toLocalDate();

        java.util.Date.from(start.atStartOfDay().atZone(ZoneId.systemDefault()).toInstant());

        do{
            if(recalculateDay(start)){
                days++;
            }
            start = start.plusDays(1);
        }while(solarDataRepository.countAllByCreationDateAfter(start)>0);

        logger.info("Recalculated: {} days",days);

        setCurrentDay();
    }

    boolean recalculateDay(LocalDate start){
        LocalDate end = start.plusDays(1);

        List<SolarData> solarDatas = solarDataRepository.findAllByCreationDateIsBetweenOrderByCreationDate(start,end);
        if(solarDatas.isEmpty()){
            return false;
        }

        Day day = new Day();
        day.setData(solarDatas);


        float wattHours = 0;
        float consumedWattHours = 0;
        for (SolarData solarData : solarDatas) {
            wattHours += solarData.getChargeWatt()*solarData.getDurationTime()/3600.f;
            consumedWattHours += solarData.getDischargeWatt()*solarData.getDurationTime()/3600.f;
        }
        day.setProducedWattHours(wattHours);
        day.setConsumedWattHours(consumedWattHours);
        day.setDate(start);

        dayRepository.save(day);
        return true;
    }
}
