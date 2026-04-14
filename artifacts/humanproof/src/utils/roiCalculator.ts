import { parseDurationToHours } from "./riskCalculations";

export interface ROICalculation {
  totalInvestmentHours: number;
  totalCost: number;
  estimatedSalaryIncrease: number;
  roiPercentage: number;
  paybackMonths: number;
  riskReduction: number;
}

export interface Course {
  title: string;
  price: string;
  duration: string;
  skillImpact?: string;
}

export function calculateCourseROI(
  courses: Course[],
  currentSalary: number = 50000,
  skillRiskScore: number = 50,
): ROICalculation {
  const totalInvestmentHours = courses.reduce(
    (sum, c) => sum + parseDurationToHours(c.duration),
    0,
  );

  const totalCost = courses.reduce((sum, c) => {
    const priceStr = c.price.replace(/[$,]/g, "").toLowerCase();
    if (priceStr === "free" || priceStr === "$0") return sum;
    const price = parseFloat(priceStr);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  const hourlyRate = currentSalary / 2080;
  const opportunityCost = totalInvestmentHours * hourlyRate * 0.3;
  const totalInvestment = totalCost + opportunityCost;

  const baseRisk = skillRiskScore;
  const afterSkillIncrease = Math.max(20, baseRisk - 15);
  const riskReduction = baseRisk - afterSkillIncrease;

  const salaryIncreasePercent = ((100 - afterSkillIncrease) / 100) * 30;
  const estimatedSalaryIncrease = currentSalary * (salaryIncreasePercent / 100);

  const roiPercentage =
    totalInvestment > 0
      ? Math.round(
          ((estimatedSalaryIncrease - totalInvestment) / totalInvestment) * 100,
        )
      : 0;

  const monthlySalary = currentSalary / 12;
  const paybackMonths =
    estimatedSalaryIncrease > 0
      ? Math.ceil(totalInvestment / (estimatedSalaryIncrease / 12))
      : 0;

  return {
    totalInvestmentHours,
    totalCost: Math.round(totalInvestment),
    estimatedSalaryIncrease: Math.round(estimatedSalaryIncrease),
    roiPercentage,
    paybackMonths: Math.max(1, paybackMonths),
    riskReduction,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getROILabel(roi: number): { label: string; color: string } {
  if (roi >= 100) return { label: "Excellent Investment", color: "#10b981" };
  if (roi >= 50) return { label: "Good Investment", color: "#3b82f6" };
  if (roi >= 0) return { label: "Positive ROI", color: "#f59e0b" };
  return { label: "Low Immediate Return", color: "#ef4444" };
}

export function getPaybackLabel(months: number): {
  label: string;
  color: string;
} {
  if (months <= 6) return { label: "Quick Payback", color: "#10b981" };
  if (months <= 12) return { label: "Moderate Payback", color: "#3b82f6" };
  if (months <= 24) return { label: "Long-term Investment", color: "#f59e0b" };
  return { label: "Career Investment", color: "#8b5cf6" };
}
