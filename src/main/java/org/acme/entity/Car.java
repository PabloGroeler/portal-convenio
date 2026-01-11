package org.acme.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Represents a car with an ID, VIN, model, make, and transmission type.
 * This class is used as an entity in the NoSQL database.
 *
 * <p>Eclipse JNoSQL supports Java Records as entities, but you can
 * use regular classes as well. The choice depends on your
 * application's requirements and design preferences.</p>
 *
 * <p>Note: The &#64Id annotation is used to specify which field
 * should be used as the identifier for the entity, and the
 * &#64Column annotation is used to specify that the fields
 * should be mapped to columns in the NoSQL database.</p>
 *
 * @param id
 * @param vin
 * @param model
 * @param make
 * @param transmission
 */
@Entity
@Table(name = "cars")
public class Car {

    @Id
    public String id;

    public String vin;
    public String model;
    public String make;
    public String transmission;

    public Car() {
    }

    public Car(String id, String vin, String model, String make, String transmission) {
        this.id = id;
        this.vin = vin;
        this.model = model;
        this.make = make;
        this.transmission = transmission;
    }
}
