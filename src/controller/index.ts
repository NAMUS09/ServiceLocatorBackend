import { Request, Response } from "express";
import db from "../firebase";
import { calculateDistance } from "../utils";
import { findNearestService } from "../utils/nearestPath";

const gridRows = 13;
const gridCols = 16;

// Define hospital location(s)
const hospitalLocations: [number, number][] = [
  [5, 5],
  [12, 6],
];

// Define ambulance location(s)
const ambulanceLocations: [number, number][] = [
  [10, 10],
  [3, 7],
];

const NearestTemp = async (req: Request, res: Response) => {
  const { row, col, serviceType } = req.query;

  if (!row || !col || !serviceType) {
    return res
      .status(400)
      .send("Missing required parameters: row, col, serviceType");
  }

  const currentLocation = { row: Number(row), col: Number(col) };

  // Find the nearest services
  const nearestService = findNearestService(
    [gridRows, gridCols],
    currentLocation,
    serviceType.toString(),
    hospitalLocations.map((ele) => ({ row: ele[0], col: ele[1] })),
    ambulanceLocations.map((ele) => ({ row: ele[0], col: ele[1] }))
  );

  if (nearestService) {
    return res.json({
      nearestService: {
        row: nearestService.path[0].row,
        col: nearestService.path[0].col,
      },
      distance: nearestService.distance,
    });
  } else {
    return res.status(404).json({ message: "No available service found." });
  }
};

const Nearest = async (req: Request, res: Response) => {
  console.log(req.query);
  const { row, col, serviceType } = req.query;

  if (!row || !col || !serviceType) {
    return res
      .status(400)
      .send("Missing required parameters: row, col, serviceType");
  }

  try {
    const snapshot = await db.ref("services").once("value");
    const services = snapshot.val();

    let nearestService = null;
    let minDistance = Infinity;

    for (const key in services) {
      if (
        services[key].type === serviceType &&
        services[key].status === "open"
      ) {
        const distance = calculateDistance(
          { row: Number(row), col: Number(col) },
          services[key].location
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestService = services[key];
        }
      }
    }

    if (nearestService) {
      return res.json({ nearestService, distance: minDistance });
    } else {
      return res.status(404).json({ message: "No available service found." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error.");
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
  NearestTemp,
  Nearest,
  Status,
  Update,
};
