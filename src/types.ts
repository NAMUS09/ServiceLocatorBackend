export interface Location {
  row: number;
  col: number;
}

export interface Service {
  type: "ambulance" | "hospital" | "user";
  status: "open" | "closed";
  location: Location;
}

export interface ServiceUpdate {
  serviceId: string;
  status: "open" | "closed";
}
