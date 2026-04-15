import { describe, it, expect } from "vitest";
import {
  industryRiskData,
  type IndustryRisk,
} from "../../data/industryRiskData";

describe("Industry Risk Data", () => {
  describe("industryRiskData", () => {
    it("should have at least 25 industries", () => {
      expect(Object.keys(industryRiskData).length).toBeGreaterThanOrEqual(25);
    });

    it("should have valid baseline risk for each industry", () => {
      Object.entries(industryRiskData).forEach(([industry, data]) => {
        expect(data.baselineRisk).toBeGreaterThanOrEqual(0);
        expect(data.baselineRisk).toBeLessThanOrEqual(1);
      });
    });

    it("should have valid aiAdoptionRate for each industry", () => {
      Object.entries(industryRiskData).forEach(([industry, data]) => {
        expect(data.aiAdoptionRate).toBeGreaterThanOrEqual(0);
        expect(data.aiAdoptionRate).toBeLessThanOrEqual(1);
      });
    });

    it("should have valid growthOutlook for each industry", () => {
      const validOutlooks = ["growing", "stable", "volatile", "declining"];
      Object.entries(industryRiskData).forEach(([industry, data]) => {
        expect(validOutlooks).toContain(data.growthOutlook);
      });
    });

    it("should have valid avgLayoffRate2025 for each industry", () => {
      Object.entries(industryRiskData).forEach(([industry, data]) => {
        expect(data.avgLayoffRate2025).toBeGreaterThanOrEqual(0);
        expect(data.avgLayoffRate2025).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("Risk Hierarchy Validation", () => {
    it("Technology should have higher baseline risk than Healthcare", () => {
      const tech = industryRiskData["Technology"];
      const healthcare = industryRiskData["Healthcare"];
      expect(tech.baselineRisk).toBeGreaterThan(healthcare.baselineRisk);
    });

    it("Media & Publishing should have high baseline risk", () => {
      const media = industryRiskData["Media & Publishing"];
      expect(media.baselineRisk).toBeGreaterThan(0.6);
    });

    it("Cybersecurity should have low baseline risk", () => {
      const cyber = industryRiskData["Cybersecurity"];
      expect(cyber.baselineRisk).toBeLessThan(0.25);
    });

    it("Healthcare should have growing outlook", () => {
      const healthcare = industryRiskData["Healthcare"];
      expect(healthcare.growthOutlook).toBe("growing");
    });

    it("Startups should have volatile outlook", () => {
      const startup = industryRiskData["Startups (pre-seed)"];
      expect(startup.growthOutlook).toBe("volatile");
    });
  });

  describe("AI Adoption Rate Validation", () => {
    it("Technology should have high AI adoption", () => {
      const tech = industryRiskData["Technology"];
      expect(tech.aiAdoptionRate).toBeGreaterThan(0.7);
    });

    it("Healthcare should have moderate AI adoption", () => {
      const healthcare = industryRiskData["Healthcare"];
      expect(healthcare.aiAdoptionRate).toBeGreaterThan(0.3);
      expect(healthcare.aiAdoptionRate).toBeLessThan(0.6);
    });

    it("Construction should have low AI adoption", () => {
      const construction = industryRiskData["Construction"];
      expect(construction.aiAdoptionRate).toBeLessThan(0.3);
    });
  });
});
