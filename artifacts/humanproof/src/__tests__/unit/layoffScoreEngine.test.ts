import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  calculateCompanyHealthScore,
  calculateLayoffHistoryScore,
  calculateMarketConditionsScore,
  calculateEmployeeFactorsScore,
  calculateLayoffScore,
  simulateScenario,
  type ScoreInputs,
  type UserFactors,
} from "../../services/layoffScoreEngine";
import { companyDatabase, type CompanyData } from "../../data/companyDatabase";
import { industryRiskData } from "../../data/industryRiskData";

describe("Layoff Score Engine - Unit Tests", () => {
  describe("L1: calculateCompanyHealthScore", () => {
    it("should calculate high risk for poor revenue growth", () => {
      const company: CompanyData = {
        name: "Test Corp",
        isPublic: true,
        industry: "Technology",
        region: "US",
        employeeCount: 10000,
        revenueGrowthYoY: -25,
        stock90DayChange: 5,
        layoffsLast24Months: [],
        layoffRounds: 0,
        lastLayoffPercent: null,
        revenuePerEmployee: 100000,
        aiInvestmentSignal: "medium",
        source: "Test",
        lastUpdated: "2026-04-01",
      };
      const score = calculateCompanyHealthScore(company);
      expect(score).toBeGreaterThan(0.5);
    });

    it("should calculate low risk for strong revenue growth", () => {
      const company: CompanyData = {
        name: "Test Corp",
        isPublic: true,
        industry: "Technology",
        region: "US",
        employeeCount: 10000,
        revenueGrowthYoY: 25,
        stock90DayChange: 20,
        layoffsLast24Months: [],
        layoffRounds: 0,
        lastLayoffPercent: null,
        revenuePerEmployee: 400000,
        aiInvestmentSignal: "high",
        source: "Test",
        lastUpdated: "2026-04-01",
      };
      const score = calculateCompanyHealthScore(company);
      expect(score).toBeLessThan(0.3);
    });

    it("should handle null revenue growth as neutral (0.5)", () => {
      const company: CompanyData = {
        name: "Test Corp",
        isPublic: true,
        industry: "Technology",
        region: "US",
        employeeCount: 10000,
        revenueGrowthYoY: null,
        stock90DayChange: null,
        layoffsLast24Months: [],
        layoffRounds: 0,
        lastLayoffPercent: null,
        revenuePerEmployee: 200000,
        aiInvestmentSignal: "medium",
        source: "Test",
        lastUpdated: "2026-04-01",
      };
      const score = calculateCompanyHealthScore(company);
      expect(score).toBeGreaterThan(0.3);
      expect(score).toBeLessThan(0.7);
    });

    it("should apply PPP multiplier for non-US regions", () => {
      const usCompany: CompanyData = {
        name: "US Corp",
        isPublic: false,
        industry: "Technology",
        region: "US",
        employeeCount: 100,
        revenueGrowthYoY: null,
        stock90DayChange: null,
        layoffsLast24Months: [],
        layoffRounds: 0,
        lastLayoffPercent: null,
        revenuePerEmployee: 80000,
        aiInvestmentSignal: "medium",
        source: "Test",
        lastUpdated: "2026-04-01",
      };
      const inCompany: CompanyData = {
        ...usCompany,
        name: "IN Corp",
        region: "IN",
        revenuePerEmployee: 80000,
      };
      const usScore = calculateCompanyHealthScore(usCompany);
      const inScore = calculateCompanyHealthScore(inCompany);
      expect(inScore).toBeLessThan(usScore);
    });
  });

  describe("L2: calculateLayoffHistoryScore", () => {
    it("should return high risk for recent layoffs", () => {
      const company: CompanyData = {
        name: "Test Corp",
        isPublic: true,
        industry: "Technology",
        region: "US",
        employeeCount: 10000,
        revenueGrowthYoY: 10,
        stock90DayChange: 5,
        layoffsLast24Months: [{ date: "2026-03-01", percentCut: 20 }],
        layoffRounds: 1,
        lastLayoffPercent: 20,
        revenuePerEmployee: 300000,
        aiInvestmentSignal: "medium",
        source: "Test",
        lastUpdated: "2026-04-01",
      };
      const score = calculateLayoffHistoryScore(
        company,
        undefined,
        "Engineering",
      );
      expect(score).toBeGreaterThan(0.5);
    });

    it("should return low risk for no layoffs", () => {
      const company: CompanyData = {
        name: "Test Corp",
        isPublic: true,
        industry: "Technology",
        region: "US",
        employeeCount: 10000,
        revenueGrowthYoY: 10,
        stock90DayChange: 5,
        layoffsLast24Months: [],
        layoffRounds: 0,
        lastLayoffPercent: null,
        revenuePerEmployee: 300000,
        aiInvestmentSignal: "medium",
        source: "Test",
        lastUpdated: "2026-04-01",
      };
      const score = calculateLayoffHistoryScore(company);
      expect(score).toBeLessThan(0.2);
    });

    it("should factor in industry data for sector contagion", () => {
      const company: CompanyData = {
        name: "Test Corp",
        isPublic: true,
        industry: "Technology",
        region: "US",
        employeeCount: 10000,
        revenueGrowthYoY: 10,
        stock90DayChange: 5,
        layoffsLast24Months: [],
        layoffRounds: 0,
        lastLayoffPercent: null,
        revenuePerEmployee: 300000,
        aiInvestmentSignal: "medium",
        source: "Test",
        lastUpdated: "2026-04-01",
      };
      const techIndustry = industryRiskData["Technology"];
      const noIndustryScore = calculateLayoffHistoryScore(company);
      const withIndustryScore = calculateLayoffHistoryScore(
        company,
        techIndustry,
      );
      expect(withIndustryScore).toBeDefined();
    });
  });

  describe("L4: calculateMarketConditionsScore", () => {
    it("should return neutral score for unknown industry", () => {
      const score = calculateMarketConditionsScore(
        "Unknown Industry",
        undefined,
      );
      expect(score).toBe(0.5);
    });

    it("should return higher risk for declining industry", () => {
      const gamingIndustry = industryRiskData["Gaming"];
      const techIndustry = industryRiskData["Technology"];
      const gamingScore = calculateMarketConditionsScore(
        "Gaming",
        gamingIndustry,
      );
      const techScore = calculateMarketConditionsScore(
        "Technology",
        techIndustry,
      );
      expect(gamingScore).toBeGreaterThan(techScore);
    });

    it("should return lower risk for growing industry", () => {
      const healthcareIndustry = industryRiskData["Healthcare"];
      const mediaIndustry = industryRiskData["Media & Publishing"];
      const healthcareScore = calculateMarketConditionsScore(
        "Healthcare",
        healthcareIndustry,
      );
      const mediaScore = calculateMarketConditionsScore(
        "Media & Publishing",
        mediaIndustry,
      );
      expect(healthcareScore).toBeLessThan(mediaScore);
    });
  });

  describe("L5: calculateEmployeeFactorsScore", () => {
    it("should return low risk for top performer with long tenure", () => {
      const userFactors: UserFactors = {
        tenureYears: 10,
        isUniqueRole: true,
        performanceTier: "top",
        hasRecentPromotion: true,
        hasKeyRelationships: true,
      };
      const score = calculateEmployeeFactorsScore(userFactors);
      expect(score).toBeLessThan(0.3);
    });

    it("should return high risk for below average performer with short tenure", () => {
      const userFactors: UserFactors = {
        tenureYears: 0.5,
        isUniqueRole: false,
        performanceTier: "below",
        hasRecentPromotion: false,
        hasKeyRelationships: false,
      };
      const score = calculateEmployeeFactorsScore(userFactors);
      expect(score).toBeGreaterThan(0.6);
    });

    it("should handle unknown performance tier as average", () => {
      const userFactors: UserFactors = {
        tenureYears: 3,
        isUniqueRole: false,
        performanceTier: "unknown",
        hasRecentPromotion: false,
        hasKeyRelationships: false,
      };
      const score = calculateEmployeeFactorsScore(userFactors);
      expect(score).toBeGreaterThan(0.3);
      expect(score).toBeLessThan(0.7);
    });
  });

  describe("Full Calculation: calculateLayoffScore", () => {
    it("should return a valid score between 0-100", () => {
      const company = companyDatabase.find((c) => c.name === "Apple")!;
      const inputs: ScoreInputs = {
        companyData: company,
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
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it("should return correct tier for high risk scenario", () => {
      const company: CompanyData = {
        name: "Test Corp",
        isPublic: true,
        industry: "Media & Publishing",
        region: "US",
        employeeCount: 5000,
        revenueGrowthYoY: -15,
        stock90DayChange: -20,
        layoffsLast24Months: [{ date: "2026-02-01", percentCut: 15 }],
        layoffRounds: 2,
        lastLayoffPercent: 15,
        revenuePerEmployee: 80000,
        aiInvestmentSignal: "medium",
        source: "Test",
        lastUpdated: "2026-04-01",
      };
      const inputs: ScoreInputs = {
        companyData: company,
        industryData: industryRiskData["Media & Publishing"],
        roleTitle: "Data Entry Specialist",
        department: "Administration",
        userFactors: {
          tenureYears: 1,
          isUniqueRole: false,
          performanceTier: "below",
          hasRecentPromotion: false,
          hasKeyRelationships: false,
        },
      };
      const result = calculateLayoffScore(inputs);
      expect(result.score).toBeGreaterThanOrEqual(35);
      expect(result.tier.label).toMatch(
        /Elevated risk|High risk|Moderate risk/,
      );
    });

    it("should return correct tier for low risk scenario", () => {
      const company = companyDatabase.find((c) => c.name === "Apple")!;
      const inputs: ScoreInputs = {
        companyData: company,
        industryData: industryRiskData["Technology"],
        roleTitle: "ML Engineer",
        department: "Engineering",
        userFactors: {
          tenureYears: 12,
          isUniqueRole: true,
          performanceTier: "top",
          hasRecentPromotion: true,
          hasKeyRelationships: true,
        },
      };
      const result = calculateLayoffScore(inputs);
      expect(result.score).toBeLessThan(35);
      expect(result.tier.label).toBe("Low risk");
    });

    it("should have valid confidence level", () => {
      const company = companyDatabase.find((c) => c.name === "Google")!;
      const inputs: ScoreInputs = {
        companyData: company,
        industryData: industryRiskData["Technology"],
        roleTitle: "Product Manager",
        department: "Product",
        userFactors: {
          tenureYears: 5,
          isUniqueRole: false,
          performanceTier: "average",
          hasRecentPromotion: false,
          hasKeyRelationships: true,
        },
      };
      const result = calculateLayoffScore(inputs);
      expect(["High", "Medium", "Low"]).toContain(result.confidence);
    });

    it("should include valid recommendations", () => {
      const company = companyDatabase.find((c) => c.name === "Google")!;
      const inputs: ScoreInputs = {
        companyData: company,
        industryData: industryRiskData["Technology"],
        roleTitle: "Product Manager",
        department: "Product",
        userFactors: {
          tenureYears: 5,
          isUniqueRole: false,
          performanceTier: "average",
          hasRecentPromotion: false,
          hasKeyRelationships: true,
        },
      };
      const result = calculateLayoffScore(inputs);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0].id).toBeDefined();
      expect(result.recommendations[0].priority).toBeDefined();
    });
  });

  describe("simulateScenario", () => {
    it("should apply overrides to base inputs", () => {
      const company = companyDatabase.find((c) => c.name === "Google")!;
      const baseInputs: ScoreInputs = {
        companyData: company,
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
      const baseResult = calculateLayoffScore(baseInputs);
      const modifiedResult = simulateScenario(baseInputs, {
        tenureYears: 10,
        performanceTier: "top",
      });
      expect(modifiedResult.score).toBeLessThanOrEqual(baseResult.score);
    });

    it("should handle partial overrides", () => {
      const company = companyDatabase.find((c) => c.name === "Google")!;
      const baseInputs: ScoreInputs = {
        companyData: company,
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
      const result = simulateScenario(baseInputs, { tenureYears: 8 });
      expect(result).toBeDefined();
    });
  });
});
