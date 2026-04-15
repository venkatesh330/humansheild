import { describe, it, expect } from "vitest";
import {
  computeTrajectory,
  type TrajectoryEngineParams,
} from "../../services/DisplacementTrajectoryEngine";

describe("Displacement Trajectory Engine", () => {
  describe("computeTrajectory", () => {
    it("should return valid trajectory with 6 years", () => {
      const params: TrajectoryEngineParams = {
        currentScore: 30,
        oracleResult: null,
        roleKey: "sw_backend",
        experience: "5-10",
      };
      const result = computeTrajectory(params);
      expect(result.years.length).toBe(6);
    });

    it("should start from current score", () => {
      const params: TrajectoryEngineParams = {
        currentScore: 45,
        oracleResult: null,
        roleKey: "sw_backend",
        experience: "5-10",
      };
      const result = computeTrajectory(params);
      expect(result.years[0].base).toBeGreaterThanOrEqual(45);
      expect(result.years[0].base).toBeLessThanOrEqual(46);
    });

    it("should have increasing base scenario for growing risk roles", () => {
      const params: TrajectoryEngineParams = {
        currentScore: 30,
        oracleResult: null,
        roleKey: "bpo_data_entry",
        experience: "5-10",
      };
      const result = computeTrajectory(params);
      const lastYear = result.years[result.years.length - 1];
      expect(lastYear.base).toBeGreaterThan(30);
    });

    it("should have different trajectories for different scenarios", () => {
      const params: TrajectoryEngineParams = {
        currentScore: 40,
        oracleResult: null,
        roleKey: "sw_backend",
        experience: "5-10",
      };
      const result = computeTrajectory(params);
      expect(result.years[result.years.length - 1].pessimistic).toBeGreaterThan(
        result.years[0].base,
      );
    });

    it("should have higher pessimistic scenario than base", () => {
      const params: TrajectoryEngineParams = {
        currentScore: 30,
        oracleResult: null,
        roleKey: "sw_backend",
        experience: "5-10",
      };
      const result = computeTrajectory(params);
      const lastYear = result.years[result.years.length - 1];
      expect(lastYear.pessimistic).toBeGreaterThan(lastYear.base);
    });

    it("should apply experience modifier - juniors have faster growth", () => {
      const juniorParams: TrajectoryEngineParams = {
        currentScore: 30,
        oracleResult: null,
        roleKey: "sw_backend",
        experience: "0-2",
      };
      const seniorParams: TrajectoryEngineParams = {
        currentScore: 30,
        oracleResult: null,
        roleKey: "sw_backend",
        experience: "15+",
      };
      const juniorResult = computeTrajectory(juniorParams);
      const seniorResult = computeTrajectory(seniorParams);
      const juniorGrowth =
        juniorResult.years[juniorResult.years.length - 1].base - 30;
      const seniorGrowth =
        seniorResult.years[seniorResult.years.length - 1].base - 30;
      expect(juniorGrowth).toBeGreaterThan(seniorGrowth);
    });

    it("should handle unknown role key with generic profile", () => {
      const params: TrajectoryEngineParams = {
        currentScore: 30,
        oracleResult: null,
        roleKey: "unknown_role_xyz",
        experience: "5-10",
      };
      const result = computeTrajectory(params);
      expect(result.years.length).toBe(6);
    });

    it("should return valid interpretation", () => {
      const params: TrajectoryEngineParams = {
        currentScore: 30,
        oracleResult: null,
        roleKey: "sw_backend",
        experience: "5-10",
      };
      const result = computeTrajectory(params);
      const validInterpretations = [
        "stable",
        "safe_rising",
        "moderate_rising",
        "high_risk_imminent",
        "critical_now",
        "declining_risk",
      ];
      expect(validInterpretations).toContain(result.interpretation);
    });

    it("should include recommendations", () => {
      const params: TrajectoryEngineParams = {
        currentScore: 30,
        oracleResult: null,
        roleKey: "sw_backend",
        experience: "5-10",
      };
      const result = computeTrajectory(params);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0].type).toBeDefined();
      expect(result.recommendations[0].urgency).toBeDefined();
    });

    it("should set threshold at 65%", () => {
      const params: TrajectoryEngineParams = {
        currentScore: 30,
        oracleResult: null,
        roleKey: "sw_backend",
        experience: "5-10",
      };
      const result = computeTrajectory(params);
      expect(result.threshold).toBe(65);
    });

    it("should return growthPerYear value", () => {
      const params: TrajectoryEngineParams = {
        currentScore: 30,
        oracleResult: null,
        roleKey: "sw_backend",
        experience: "5-10",
      };
      const result = computeTrajectory(params);
      expect(result.growthPerYear).toBeDefined();
      expect(typeof result.growthPerYear).toBe("number");
    });

    it("should handle critical now interpretation for high current score", () => {
      const params: TrajectoryEngineParams = {
        currentScore: 75,
        oracleResult: null,
        roleKey: "bpo_data_entry",
        experience: "0-2",
      };
      const result = computeTrajectory(params);
      expect(result.interpretation).toBe("critical_now");
    });

    it("should handle declining risk for low-growth roles", () => {
      const params: TrajectoryEngineParams = {
        currentScore: 20,
        oracleResult: null,
        roleKey: "hc_surgeon",
        experience: "10-15",
      };
      const result = computeTrajectory(params);
      expect(result.interpretation).toMatch(/stable|declining_risk/);
    });
  });
});
