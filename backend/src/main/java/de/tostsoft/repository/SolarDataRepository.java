package de.tostsoft.repository;

import de.tostsoft.model.SolarData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface SolarDataRepository extends MongoRepository<SolarData, String> {

    Page<SolarData> findAll(Pageable pageable);

    List<SolarData> findAllByCreationDateIsBetweenOrderByCreationDate(LocalDate start,LocalDate end);

    Page<SolarData> findAllByOrderByCreationDateAsc(Pageable pageable);

    Long countAllByCreationDateAfter(LocalDate date);
}
