package de.tostsoft.dto;

import lombok.*;

import javax.websocket.server.ServerEndpoint;
import java.time.Year;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class YearDTO{
    private double wattHours;
    private double consumedWattHours;

    private List<YearDayDTO> days;

    private Year year;
}
