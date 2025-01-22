import db from "../firebase.js";
import { Service } from "../types";

export const fetchAllServices = async () => {
  try {
    const snapshot = await db.ref("services").once("value");

    const services = snapshot.val();

    return Object.values(services) as Service[];
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
};
