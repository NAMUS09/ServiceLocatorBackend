import { Location } from "../types";

// Helper function to calculate Manhattan distance
export const calculateDistance = (
  userLocation: Location,
  serviceLocation: Location
): number => {
  return (
    Math.abs(userLocation.row - serviceLocation.row) +
    Math.abs(userLocation.col - serviceLocation.col)
  );
};
