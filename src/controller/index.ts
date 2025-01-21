import { Request, Response } from "express";
import db from "../firebase";
import { fetchAllServices } from "../firebase/accessDb";
import { Service } from "../types";
import { findNearestService } from "../utils/nearestPath";

const gridRows = 13;
const gridCols = 16;

const GetALL = async (req: Request, res: Response) => {
  try {
    const services = await fetchAllServices();
    return res.json(services);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error.");
  }
};

const Nearest = async (req: Request, res: Response) => {
  const { row, col, serviceType } = req.query;

  if (!row || !col || !serviceType) {
    return res
      .status(400)
      .send("Missing required parameters: row, col, serviceType");
  }

  const currentLocation = { row: Number(row), col: Number(col) };

  const servicesArray: Service[] = await fetchAllServices();

  // Filter hospital locations
  const hospitalLocations = servicesArray
    .filter(
      (service: Service) => service.type === "hospital" && service.location
    ) // Ensure type is "hospital" and location exists
    .map((service: Service) => service.location);

  // Filter ambulance locations
  const ambulanceLocations = servicesArray
    .filter(
      (service: Service) => service.type === "ambulance" && service.location
    ) // Ensure type is "ambulance" and location exists
    .map((service: Service) => service.location);

  // Find the nearest services
  const nearestService = findNearestService(
    [gridRows, gridCols],
    currentLocation,
    serviceType.toString(),
    hospitalLocations,
    ambulanceLocations
  );

  if (nearestService) {
    return res.json({
      paths: nearestService.path,
      distance: nearestService.distance,
    });
  } else {
    return res.status(404).json({ message: "No available service found." });
  }
};

const Status = async (req: Request, res: Response) => {
  const { serviceId } = req.query;

  if (!serviceId) {
    return res.status(400).send("Missing required parameter: serviceId");
  }

  try {
    const snapshot = await db.ref(`services/${serviceId}`).once("value");
    const service = snapshot.val();

    if (service) {
      return res.json({ status: service.status });
    } else {
      return res.status(404).send("Service not found.");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error.");
  }
};

const Create = async (req: Request, res: Response) => {
  const { location, type, status } = req.body;

  // Validate required fields
  if (!location || !location.row || !location.col || !type || !status) {
    return res.status(400).json({
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

    return res.status(201).json({
      message: "Service created successfully.",
      service: newService,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    return res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
};

const Update = async (req: Request, res: Response) => {
  const { serviceId, status } = req.body;

  if (!serviceId || !status) {
    return res.status(400).send("Missing required fields: serviceId, status");
  }

  try {
    const snapshot = await db.ref(`services/${serviceId}`).once("value");
    const service = snapshot.val();

    if (service) {
      await db.ref(`services/${serviceId}`).update({ status });
      return res.json({ message: "Service status updated successfully." });
    } else {
      return res.status(404).send("Service not found.");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error.");
  }
};

export default {
  GetALL,
  Nearest,
  Status,
  Create,
  Update,
};
