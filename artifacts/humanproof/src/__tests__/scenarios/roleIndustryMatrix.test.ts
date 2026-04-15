import { describe, it, expect } from "vitest";
import {
  calculateLayoffScore,
  type ScoreInputs,
} from "../../services/layoffScoreEngine";
import { companyDatabase } from "../../data/companyDatabase";
import { industryRiskData } from "../../data/industryRiskData";

describe("Scenario Tests - Role/Industry/Experience Matrix", () => {
  describe("High-Risk Roles", () => {
    const highRiskRoles = [
      "Data Entry Specialist",
      "Telemarketer",
      "Customer Service Representative",
      "Recruiter",
    ];

    highRiskRoles.forEach((role) => {
      it(`${role} should result in elevated or high tier`, () => {
        const inputs: ScoreInputs = {
          companyData: companyDatabase.find((c) => c.name === "Google")!,
          industryData: industryRiskData["Technology"],
          roleTitle: role,
          department: "Administration",
          userFactors: {
            tenureYears: 2,
            isUniqueRole: false,
            performanceTier: "average",
            hasRecentPromotion: false,
            hasKeyRelationships: false,
          },
        };
        const result = calculateLayoffScore(inputs);
        expect(result.score).toBeGreaterThanOrEqual(35);
      });
    });
  });

  describe("Moderate-Risk Roles", () => {
    const moderateRiskRoles = [
      "Software Engineer",
      "Product Manager",
      "Data Analyst",
    ];

    moderateRiskRoles.forEach((role) => {
      it(`${role} should result in moderate to low tier for strong company`, () => {
        const apple = companyDatabase.find((c) => c.name === "Apple")!;
        const inputs: ScoreInputs = {
          companyData: apple,
          industryData: industryRiskData["Technology"],
          roleTitle: role,
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
        expect(result.score).toBeLessThan(60);
      });
    });
  });

  describe("Low-Risk Roles", () => {
    const lowRiskRoles = ["ML Engineer", "Cybersecurity Engineer", "Physician"];

    lowRiskRoles.forEach((role) => {
      it(`${role} should result in low or very low tier`, () => {
        const inputs: ScoreInputs = {
          companyData: companyDatabase.find((c) => c.name === "Apple")!,
          industryData: industryRiskData["Healthcare"],
          roleTitle: role,
          department: "Engineering",
          userFactors: {
            tenureYears: 10,
            isUniqueRole: true,
            performanceTier: "top",
            hasRecentPromotion: true,
            hasKeyRelationships: true,
          },
        };
        const result = calculateLayoffScore(inputs);
        expect(result.score).toBeLessThan(35);
      });
    });
  });

  describe("Industry Impact", () => {
    it("Technology industry with high AI adoption should increase risk", () => {
      const inputs: ScoreInputs = {
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
      };
      const techResult = calculateLayoffScore(inputs);

      const healthcareInputs: ScoreInputs = {
        ...inputs,
        industryData: industryRiskData["Healthcare"],
      };
      const healthResult = calculateLayoffScore(healthcareInputs);

      expect(techResult.score).toBeGreaterThanOrEqual(healthResult.score);
    });

    it("Media & Publishing should have higher baseline risk", () => {
      const inputs: ScoreInputs = {
        companyData: companyDatabase.find((c) => c.name === "Meta")!,
        industryData: industryRiskData["Media & Publishing"],
        roleTitle: "Content Writer",
        department: "Marketing",
        userFactors: {
          tenureYears: 3,
          isUniqueRole: false,
          performanceTier: "average",
          hasRecentPromotion: false,
          hasKeyRelationships: false,
        },
      };
      const result = calculateLayoffScore(inputs);
      expect(result.score).toBeGreaterThan(40);
    });
  });

  describe("Experience Level Impact", () => {
    it("Junior (0-2 years) should have higher risk than senior (10+ years)", () => {
      const company = companyDatabase.find((c) => c.name === "Google")!;
      const juniorInputs: ScoreInputs = {
        companyData: company,
        industryData: industryRiskData["Technology"],
        roleTitle: "Software Engineer",
        department: "Engineering",
        userFactors: {
          tenureYears: 1,
          isUniqueRole: false,
          performanceTier: "average",
          hasRecentPromotion: false,
          hasKeyRelationships: false,
        },
      };
      const juniorResult = calculateLayoffScore(juniorInputs);

      const seniorInputs: ScoreInputs = {
        ...juniorInputs,
        userFactors: {
          tenureYears: 12,
          isUniqueRole: true,
          performanceTier: "top",
          hasRecentPromotion: true,
          hasKeyRelationships: true,
        },
      };
      const seniorResult = calculateLayoffScore(seniorInputs);

      expect(juniorResult.score).toBeGreaterThan(seniorResult.score);
    });
  });

  describe("Performance Tier Impact", () => {
    it("Top performer should have lower risk than below average", () => {
      const company = companyDatabase.find((c) => c.name === "Google")!;
      const baseInputs: ScoreInputs = {
        companyData: company,
        industryData: industryRiskData["Technology"],
        roleTitle: "Software Engineer",
        department: "Engineering",
        userFactors: {
          tenureYears: 5,
          isUniqueRole: false,
          performanceTier: "below",
          hasRecentPromotion: false,
          hasKeyRelationships: false,
        },
      };
      const belowResult = calculateLayoffScore(baseInputs);

      const topInputs: ScoreInputs = {
        ...baseInputs,
        userFactors: {
          ...baseInputs.userFactors,
          performanceTier: "top",
          hasRecentPromotion: true,
          hasKeyRelationships: true,
        },
      };
      const topResult = calculateLayoffScore(topInputs);

      expect(topResult.score).toBeLessThan(belowResult.score);
    });
  });
});
