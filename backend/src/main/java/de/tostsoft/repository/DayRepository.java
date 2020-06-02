package de.tostsoft.repository;

import de.tostsoft.model.Day;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;

public interface DayRepository extends MongoRepository<Day, String>{
    Day findDayByDate(LocalDate localDate);

    @Query(value = "{date:?0}",fields ="{'data':0}")
    Day findDayByDateAndEmpty(LocalDate localDate);
}
