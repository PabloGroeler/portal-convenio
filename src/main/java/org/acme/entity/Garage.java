package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

/**
 * <p>Garage is an interface for managing car parking.</p>
 *
 * <p>It's using the Jakarta Data Specification capabilities.</p>
 *
 * <p></p>
 * <p>To use it, you need to inject it in your application like below:</p>
 *
 * <pre>
 * // By field injection
 * &#64Inject
 * Garage garage;
 *
 * // By constructor injection
 * &#64Inject
 * SomeService(Garage garage) {
 * </pre>
 *
 * <p>Example usage:</p>
 * <pre>
 * &#64Inject
 * Garage garage;
 * ...
 * Car car=...
 * car = garage.parking(car);
 * ...
 * var cars = garage.findByTransmission("Automatic", PageRequest.ofPage(1).size(2));
 * ...
 * garage.unpark(car);
 * ...
 * </pre>
 */
@ApplicationScoped
public class Garage implements PanacheRepository<Car> {

    @Transactional
    public Car parking(Car car) {
        persist(car);
        return car;
    }

    @Transactional
    public void unpark(Car car) {
        delete(car);
    }

    public PanacheQuery<Car> findByTransmission(String transmission, int pageIndex, int pageSize, Sort sort) {
        PanacheQuery<Car> query = find("transmission", sort, transmission);
        return query.page(Page.of(pageIndex, pageSize));
    }
}
