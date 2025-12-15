

export interface TechnicianBonus {
  id: number | null; // Long in Java maps to number in TypeScript
  technicianId: number;
  monthYear: string; // ISO format: "YYYY-MM-DD"
  totalPoints: number;
  totalBonus: string; // Using string to preserve precision for BigDecimal
  interventionsCount: number;
  lastUpdated: string; // ISO format: "YYYY-MM-DDTHH:mm:ss"
}
