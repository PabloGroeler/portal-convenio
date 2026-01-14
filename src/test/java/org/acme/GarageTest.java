//package org.acme;
//
//import io.quarkus.test.junit.QuarkusTest;
//import io.quarkus.test.common.QuarkusTestResource;
//import jakarta.inject.Inject;
//import io.quarkus.panache.common.Sort;
//import jakarta.transaction.Transactional;
//import net.datafaker.Faker;
//import org.acme.entity.Car;
//import org.acme.entity.Garage;
//import org.junit.jupiter.api.AfterEach;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//
//import java.util.List;
//import java.util.UUID;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatCode;
//
///**
// * <p>GarageTest is a test class for testing the Garage operations including parking, unparking,
// * and paginated car retrieval.</p>
// *
// * <p>It uses Quarkus Test framework and Faker library to generate random data for testing.</p>
// */
//@QuarkusTest
//@QuarkusTestResource(MongoDbTestResource.class)
//
//public class GarageTest {
//
//    @Inject
//    Garage garage;
//
//    Faker faker = new Faker();
//
//    @BeforeEach
//    @AfterEach
//    @Transactional
//    void resetDatabase() {
//        // Clear the garage database before each test
//        garage.findAll().list().forEach(garage::delete);
//    }
//
//    // Factory method to create a Car instance
//    private Car ramdomCar(String transmission) {
//        var vehicle = faker.vehicle();
//        return new Car(
//                UUID.randomUUID().toString(),
//                vehicle.vin(),
//                vehicle.model(),
//                vehicle.make(),
//                transmission);
//    }
//
//    @Test
//    @DisplayName("Test garage operations including parking, unparking, and paginated car retrieval")
//    @Transactional
//    void testGarageOperations() {
//
//        assertThat(garage.findAll().list())
//                .as("If no car are parked in, any request should return an empty list.")
//                .isEmpty();
//
//        assertThat(garage.findByTransmission("Automatic", 0, 2, Sort.by("make")).list())
//                .as("Any request for %s cars should return an page instance.", "Automatic")
//                .isNotNull()
//                .as("If no car are parked in, any request for %s cars should return an empty list.", "Automatic")
//                .isEmpty();
//
//        var car1 = ramdomCar("Automatic");
//        var car2 = ramdomCar("Manual");
//        var car3 = ramdomCar("Automatic");
//        var car4 = ramdomCar("Automatic");
//
//        var cars = List.of(car1, car2, car3, car4);
//
//        assertThat(garage.parking(car1))
//                .as("%s should have been parked", car1)
//                .isEqualTo(car1);
//
//        assertThat(garage.parking(car2))
//                .as("%s should have been parked", car2)
//                .isEqualTo(car2);
//
//        assertThat(garage.parking(car3))
//                .as("%s should have been parked", car3)
//                .isEqualTo(car3);
//
//        assertThat(garage.parking(car4))
//                .as("%s should have been parked", car3)
//                .isEqualTo(car4);
//
//        var page1 = garage.findByTransmission(car1.transmission, 0, 2, Sort.by("make")).list();
//        assertThat(page1)
//                .as("Given a paginated request for page %d with %d items per page, should return a page with %s cars",
//                        0,
//                        2,
//                        car1.transmission)
//                .hasSize(2)
//                .containsAnyOf(car1, car3, car4);
//
//        var page2 = garage.findByTransmission(car1.transmission, 1, 2, Sort.by("make")).list();
//        assertThat(page2)
//                .as("Given a paginated request for page %d with %d items per page, should return a page with %s cars",
//                        1,
//                        2,
//                        car1.transmission)
//                .isNotEmpty()
//                .doesNotContainAnyElementsOf(page1);
//
//        var page3 = garage.findByTransmission(car1.transmission, 2, 2, Sort.by("make")).list();
//        assertThat(page3)
//                .as("Given a paginated request for page %d with %d items per page, should return an empty page.",
//                        2,
//                        2,
//                        car1.transmission)
//                .isEmpty();
//
//        assertThat(garage.findByTransmission(car2.transmission, 0, 10, Sort.by("make")).list())
//                .as("should return a page with %s cars", car2.transmission)
//                .containsExactly(car2);
//
//        assertThat(garage.findByTransmission(car3.transmission, 0, 10, Sort.by("make")).list())
//                .as("should return a page with %s cars", car3.transmission)
//                .containsExactlyInAnyOrder(car1, car3, car4);
//
//        assertThatCode(() -> garage.unpark(car4))
//                .as("%s should have exited the parking lot.", car4)
//                .doesNotThrowAnyException();
//
//        assertThat(garage.findByTransmission(car3.transmission, 0, 10, Sort.by("make")).list())
//                .as("should return a page with %s cars", car3.transmission)
//                .containsExactlyInAnyOrder(car1, car3);
//
//    }
//
//}
