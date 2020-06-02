package de.tostsoft;

import de.tostsoft.controller.MainController;
import de.tostsoft.dto.SolarInfoDTO;
import de.tostsoft.service.StatisticService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

@Service
public class CommandlineService implements CommandLineRunner {

    Logger logger = LoggerFactory.getLogger(CommandlineService.class);


    @Autowired
    private MainController mainController;

    @Autowired
    private StatisticService statisticService;

    @Value("${client.auth-token}")
    private String clientAuthToken;

    @Override
    public void run(String... args) {
        if (args.length > 0) {
            String all = "";
            for (String arg : args) {
                all += (arg + " ");
            }
            logger.info("Run program with arguments: " + all);
        }
        boolean debug = false;
        for (String arg : args) {
            if (arg.equals("calc")) {
                statisticService.recalculateDays();
            }
            if (arg.equals("debug")) {
                debug = true;
            }
        }
        if (debug) {
            Thread t = new Thread(() -> {
                while (true) {
                    try {
                        float rand = (float) Math.random();
                        rand = 10 + rand * 2;
                        Thread.sleep((int) (rand * 1000));

                        SolarInfoDTO solarData = new SolarInfoDTO();
                        solarData.setChargeVolt((float) (Math.random() * 60));
                        solarData.setChargeAmpere((float) (Math.random() * 8 + 0.2f));
                        solarData.setBatteryVoltage(10 + (float) (Math.random() * 5f));
                        solarData.setDischargeAmperes((float) (Math.random() * 2 + 0.2f));

                        solarData.setChargeVolt(solarData.getChargeVolt() * 100);
                        solarData.setChargeAmpere(solarData.getChargeAmpere() * 100);
                        solarData.setBatteryVoltage(solarData.getBatteryVoltage() * 100);
                        solarData.setDischargeVoltage(solarData.getBatteryVoltage());
                        solarData.setDischargeAmperes(solarData.getDischargeAmperes() * 100);

                        mainController.addData(solarData, clientAuthToken);
                    } catch (Exception ex) {
                        break;
                    }
                }
            });
            t.start();
        }
    }
}
