import { Request, Response } from "express";
import db from "../firebase.js";
import { fetchAllServices } from "../firebase/accessDb.js";
import { Service } from "../types";
import { findNearestService } from "../utils/nearestPath.js";

const gridRows = 13;
const gridCols = 16;

const GetALL = async (req: Request, res: Response) => {
  try {
    const services = await fetchAllServices();
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
};

const Nearest = async (req: Request, res: Response) => {
  const { row, col, serviceType } = req.query;

  if (!row || !col || !serviceType) {
    res.status(400).send("Missing required parameters: row, col, serviceType");
  }

  const currentLocation = { row: Number(row), col: Number(col) };

  const servicesArray: Service[] = await fetchAllServices();

  // Filter hospital locations
  const hospitalLocations = servicesArray
    .filter(
      (service: Service) =>
        service.type === "hospital" &&
        service.location &&
        service.status === "open"
    ) // Ensure type is "hospital" and location exists
    .map((service: Service) => service.location);

  // Filter ambulance locations
  const ambulanceLocations = servicesArray
    .filter(
      (service: Service) =>
        service.type === "ambulance" &&
        service.location &&
        service.status === "open"
    ) // Ensure type is "ambulance" and location exists
    .map((service: Service) => service.location);

  // filter user locations
  const userLocations = servicesArray
    .filter(
      (service: Service) =>
        service.type === "user" && service.location && service.status === "open"
    ) // Ensure type is "user" and location exists
    .map((service: Service) => service.location);

  const reservedLocations =
    serviceType == "hospital"
      ? [...ambulanceLocations, ...userLocations]
      : [...hospitalLocations, ...userLocations];

  const targetLocations =
    serviceType == "hospital"
      ? [...hospitalLocations]
      : [...ambulanceLocations];

  if (targetLocations.length === 0) {
    res.status(404).json({ message: "No available service found." });
    return;
  }

  // Find the nearest services
  const nearestService = findNearestService(
    [gridRows, gridCols],
    currentLocation,
    targetLocations,
    reservedLocations
  );

  if (nearestService) {
    res.json({
      paths: nearestService.path,
      distance: nearestService.distance,
    });
  } else {
    res.status(404).json({ message: "No available service found." });
  }
};

const Status = async (req: Request, res: Response) => {
  const { serviceId } = req.query;

  if (!serviceId) {
    res.status(400).send("Missing required parameter: serviceId");
  }

  try {
    const snapshot = await db.ref(`services/${serviceId}`).once("value");
    const service = snapshot.val();

    if (service) {
      res.json({ status: service.status });
    } else {
      res.status(404).send("Service not found.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
};

const Create = async (req: Request, res: Response) => {
  const { location, type, status } = req.body;

  // Validate required fields
  if (!location || !location.row || !location.col || !type || !status) {
    res.status(400).json({
      error: "Missing required fields: type, status, or location (row, col).",
    });
  }

  try {
    // Use Firebase's push() method to generate a unique key
    const newServiceRef = db.ref("services").push();

    const newService = {
      id: newServiceRef.key, // Firebase-generated unique key
      type,
      location: { row: location.row, col: location.col },
      status,
    };

    // Save the new service
    await newServiceRef.set(newService);

    res.status(201).json({
      message: "Service created successfully.",
      service: newService,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
};

const Update = async (req: Request, res: Response) => {
  const { serviceId, status } = req.body;

  if (!serviceId || !status) {
    res.status(400).send("Missing required fields: serviceId, status");
  }

  try {
    const snapshot = await db.ref(`services/${serviceId}`).once("value");
    const service = snapshot.val();

    if (service) {
      await db.ref(`services/${serviceId}`).update({ status });
      res.json({ message: "Service status updated successfully." });
    } else {
      res.status(404).send("Service not found.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
};

export default {
  GetALL,
  Nearest,
  Status,
  Create,
  Update,
};
