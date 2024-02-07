package com.example.demo.student;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StudentConfig {

    @Bean
    CommandLineRunner commandLineRunner(StudentRepository repository) {
        return args -> {
            Student harry = new Student("Harry", "harryliu1995@gmail.com", LocalDate.of(1995, Month.MARCH, 1));
            Student gary = new Student("Gary", "garyliu1995@@gmail.com", LocalDate.of(1994, Month.MARCH, 1));

            repository.saveAll(List.of(harry, gary));
        };

    }
}
