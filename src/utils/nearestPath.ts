type Cell = { row: number; col: number };

// Heuristic function (Manhattan distance)
const heuristic = (a: Cell, b: Cell): number =>
  Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

// Get valid neighbors of a cell
const getNeighbors = (
  cell: Cell,
  rows: number,
  cols: number,
  reservedLocations: Set<string>
): Cell[] => {
  const { row, col } = cell;
  const neighbors: Cell[] = [];

  const potentialNeighbors = [
    { row: row - 1, col }, // Up
    { row: row + 1, col }, // Down
    { row, col: col - 1 }, // Left
    { row, col: col + 1 }, // Right
  ];

  for (const neighbor of potentialNeighbors) {
    const key = `${neighbor.row},${neighbor.col}`;
    if (
      neighbor.row >= 0 &&
      neighbor.row < rows &&
      neighbor.col >= 0 &&
      neighbor.col < cols &&
      !reservedLocations.has(key) // Ensure it's not reserved
    ) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
};

// Reconstruct the path from the cameFrom map
const reconstructPath = (
  cameFrom: Record<string, Cell | null>,
  current: Cell
): Cell[] => {
  const path: Cell[] = [current];
  let key = `${current.row},${current.col}`;

  while (cameFrom[key]) {
    const prev = cameFrom[key]!;
    path.unshift(prev);
    key = `${prev.row},${prev.col}`;
  }

  return path;
};

// A* algorithm to find the nearest service for a single user
export const findNearestService = (
  gridSize: [number, number], // [rows, cols]
  userLocation: Cell, // Single user location
  targetLocations: Cell[], // Locations of hospitals/ambulances
  reservedLocations: Cell[] // All reserved locations (users, hospitals, ambulances)
): { path: Cell[]; distance: number } | null => {
  const [rows, cols] = gridSize;

  const openSet: Cell[] = [userLocation];
  const cameFrom: Record<string, Cell | null> = {};

  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};

  // Convert reserved locations to a set for quick lookup
  const reservedSet = new Set(
    reservedLocations.map((loc) => `${loc.row},${loc.col}`)
  );

  // Initialize gScore and fScore for each cell
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r},${c}`;
      gScore[key] = Infinity;
      fScore[key] = Infinity;
    }
  }

  const startKey = `${userLocation.row},${userLocation.col}`;
  gScore[startKey] = 0;
  fScore[startKey] = heuristic(userLocation, userLocation);

  while (openSet.length > 0) {
    // Sort openSet by fScore to get the cell with the lowest fScore
    openSet.sort(
      (a, b) => fScore[`${a.row},${a.col}`] - fScore[`${b.row},${b.col}`]
    );
    const current = openSet.shift()!;

    // Check if the current cell is a target location
    if (
      targetLocations.some(
        (loc) => loc.row === current.row && loc.col === current.col
      )
    ) {
      const path = reconstructPath(cameFrom, current);
      return { path, distance: gScore[`${current.row},${current.col}`] };
    }

    const neighbors = getNeighbors(current, rows, cols, reservedSet);
    for (const neighbor of neighbors) {
      const key = `${neighbor.row},${neighbor.col}`;
      const tentativeGScore = gScore[`${current.row},${current.col}`] + 1;

      if (tentativeGScore < gScore[key]) {
        cameFrom[key] = current;
        gScore[key] = tentativeGScore;
        fScore[key] = gScore[key] + heuristic(neighbor, userLocation);

        if (
          !openSet.find(
            (cell) => cell.row === neighbor.row && cell.col === neighbor.col
          )
        ) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return null; // No path found
};
