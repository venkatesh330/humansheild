import { describe, it, expect } from "vitest";
import {
  calculateLayoffScore,
  calculateCompanyHealthScore,
  calculateLayoffHistoryScore,
  calculateEmployeeFactorsScore,
  type ScoreInputs,
} from "../../services/layoffScoreEngine";
import { companyDatabase } from "../../data/companyDatabase";
import { industryRiskData } from "../../data/industryRiskData";

describe("Integration Tests - Full Calculation Flow", () => {
  const createBaseInputs = (overrides?: Partial<ScoreInputs>): ScoreInputs => ({
    companyData: companyDatabase.find((c) => c.name === "Google")!,
    industryData: industryRiskData["Technology"],
    roleTitle: "Software Engineer",
    department: "Engineering",
    userFactors: {
      tenureYears: 5,
      isUniqueRole: false,
      performanceTier: "average",
      hasRecentPromotion: false,
      hasKeyRelationships: true,
    },
    ...overrides,
  });

  describe("End-to-End Score Calculation", () => {
    it("should produce valid result for Google Software Engineer", () => {
      const inputs = createBaseInputs();
      const result = calculateLayoffScore(inputs);
      expect(result.score).toBeDefined();
      expect(result.tier).toBeDefined();
      expect(result.confidence).toBeDefined();
      expect(result.breakdown).toBeDefined();
    });

    it("should include all layer scores in breakdown", () => {
      const inputs = createBaseInputs();
      const result = calculateLayoffScore(inputs);
      expect(result.breakdown.L1).toBeDefined();
      expect(result.breakdown.L2).toBeDefined();
      expect(result.breakdown.L3).toBeDefined();
      expect(result.breakdown.L4).toBeDefined();
      expect(result.breakdown.L5).toBeDefined();
    });

    it("should have calculatedAt timestamp", () => {
      const inputs = createBaseInputs();
      const result = calculateLayoffScore(inputs);
      expect(result.calculatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should have nextUpdateDue in future", () => {
      const inputs = createBaseInputs();
      const result = calculateLayoffScore(inputs);
      const nextUpdate = new Date(result.nextUpdateDue);
      const now = new Date();
      expect(nextUpdate.getTime()).toBeGreaterThan(now.getTime());
    });

    it("should include disclaimer", () => {
      const inputs = createBaseInputs();
      const result = calculateLayoffScore(inputs);
      expect(result.disclaimer).toContain("risk estimation");
    });
  });

  describe("Tier Classification", () => {
    it('should return "Very low risk" for very strong profiles', () => {
      const strongCompany = {
        name: "Test Company",
        isPublic: true,
        industry: "Technology",
        region: "US" as const,
        employeeCount: 100000,
        revenueGrowthYoY: 25,
        revenuePerEmployee: 500000,
        stock90DayChange: 15,
        layoffsLast24Months: [],
        layoffRounds: 0,
        lastLayoffPercent: null,
        aiInvestmentSignal: "high" as const,
        source: "Test",
        lastUpdated: "2026-04-01",
      };
      const inputs: ScoreInputs = {
        companyData: strongCompany,
        industryData: industryRiskData["Technology"],
        roleTitle: "ML Engineer",
        department: "Engineering",
        userFactors: {
          tenureYears: 15,
          isUniqueRole: true,
          performanceTier: "top",
          hasRecentPromotion: true,
          hasKeyRelationships: true,
        },
      };
      const result = calculateLayoffScore(inputs);
      expect(result.tier.label).toMatch(/Very low risk|Low risk/);
    });

    it('should return "Low risk" for scores 15-34', () => {
      const inputs = createBaseInputs({
        userFactors: {
          tenureYears: 10,
          isUniqueRole: true,
          performanceTier: "top",
          hasRecentPromotion: true,
          hasKeyRelationships: true,
        },
      });
      const result = calculateLayoffScore(inputs);
      expect(result.tier.label).toMatch(/Low risk|Very low risk/);
    });

    it('should return "Elevated risk" for scores 55-74', () => {
      const inputs: ScoreInputs = {
        companyData: {
          ...companyDatabase.find((c) => c.name === "Google")!,
          revenueGrowthYoY: -5,
          stock90DayChange: -10,
          layoffsLast24Months: [{ date: "2025-06-01", percentCut: 5 }],
          layoffRounds: 1,
        },
        industryData: industryRiskData["Media & Publishing"],
        roleTitle: "Content Writer",
        department: "Marketing",
        userFactors: {
          tenureYears: 2,
          isUniqueRole: false,
          performanceTier: "average",
          hasRecentPromotion: false,
          hasKeyRelationships: false,
        },
      };
      const result = calculateLayoffScore(inputs);
      expect(result.tier.label).toMatch(/Elevated risk|High risk/);
    });
  });

  describe("Weight Distribution Validation", () => {
    it("should sum weights to 1.0 (30+25+25+5+15)", () => {
      const inputs = createBaseInputs();
      const result = calculateLayoffScore(inputs);
      const { L1, L2, L3, L4, L5 } = result.breakdown;
      const totalWeight = 0.3 + 0.25 + 0.25 + 0.05 + 0.15;
      expect(totalWeight).toBe(1.0);
    });
  });

  describe("Data Source Integration", () => {
    it("should work with Oracle data (Apr 2026 benchmark)", () => {
      const oracle = companyDatabase.find((c) => c.name === "Oracle")!;
      const inputs: ScoreInputs = {
        companyData: oracle,
        industryData: industryRiskData["Technology"],
        roleTitle: "Software Engineer",
        department: "Engineering",
        userFactors: {
          tenureYears: 3,
          isUniqueRole: false,
          performanceTier: "average",
          hasRecentPromotion: false,
          hasKeyRelationships: true,
        },
      };
      const result = calculateLayoffScore(inputs);
      expect(result.score).toBeGreaterThan(40);
    });

    it("should work with TCS data (India benchmark)", () => {
      const tcs = companyDatabase.find(
        (c) => c.name === "Tata Consultancy Services",
      )!;
      const inputs: ScoreInputs = {
        companyData: tcs,
        industryData: industryRiskData["Technology"],
        roleTitle: "Software Engineer",
        department: "Engineering",
        userFactors: {
          tenureYears: 5,
          isUniqueRole: false,
          performanceTier: "average",
          hasRecentPromotion: false,
          hasKeyRelationships: true,
        },
      };
      const result = calculateLayoffScore(inputs);
      expect(result.score).toBeLessThan(40);
    });

    it("should apply region-based PPP adjustments", () => {
      const usCompany = {
        ...companyDatabase[0],
        region: "US" as const,
        revenuePerEmployee: 100000,
      };
      const inCompany = {
        ...companyDatabase[0],
        region: "IN" as const,
        revenuePerEmployee: 100000,
      };
      const usScore = calculateCompanyHealthScore(usCompany);
      const inScore = calculateCompanyHealthScore(inCompany);
      expect(usScore).not.toBe(inScore);
    });
  });
});
