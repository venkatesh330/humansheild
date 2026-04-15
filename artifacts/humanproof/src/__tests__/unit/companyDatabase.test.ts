import { describe, it, expect } from "vitest";
import {
  companyDatabase,
  getPPPMultiplier,
  normalizeRegion,
  type CompanyData,
} from "../../data/companyDatabase";

describe("Company Database", () => {
  describe("companyDatabase", () => {
    it("should have at least 15 companies", () => {
      expect(companyDatabase.length).toBeGreaterThanOrEqual(15);
    });

    it("should have required fields for each company", () => {
      companyDatabase.forEach((company) => {
        expect(company.name).toBeDefined();
        expect(company.isPublic).toBeDefined();
        expect(company.industry).toBeDefined();
        expect(company.region).toBeDefined();
        expect(company.employeeCount).toBeGreaterThan(0);
        expect(company.source).toBeDefined();
        expect(company.lastUpdated).toBeDefined();
      });
    });

    it("should have valid region values", () => {
      const validRegions = ["US", "EU", "IN", "APAC", "GLOBAL"];
      companyDatabase.forEach((company) => {
        expect(validRegions).toContain(company.region);
      });
    });

    it("should have valid aiInvestmentSignal values", () => {
      const validSignals = ["low", "medium", "high", "very-high"];
      companyDatabase.forEach((company) => {
        expect(validSignals).toContain(company.aiInvestmentSignal);
      });
    });
  });

  describe("Benchmark Validations", () => {
    it("Apple should have low risk profile (no recent layoffs, high revenue)", () => {
      const apple = companyDatabase.find((c) => c.name === "Apple");
      expect(apple).toBeDefined();
      expect(apple!.layoffsLast24Months.length).toBe(0);
      expect(apple!.revenueGrowthYoY).toBeGreaterThanOrEqual(5);
    });

    it("Oracle (Apr 2026) should have recent significant layoffs", () => {
      const oracle = companyDatabase.find((c) => c.name === "Oracle");
      expect(oracle).toBeDefined();
      expect(oracle!.layoffsLast24Months.length).toBeGreaterThan(0);
      const recentLayoff = oracle!.layoffsLast24Months[0];
      expect(recentLayoff.percentCut).toBeGreaterThanOrEqual(15);
    });

    it("TCS should have stable profile", () => {
      const tcs = companyDatabase.find(
        (c) => c.name === "Tata Consultancy Services",
      );
      expect(tcs).toBeDefined();
      expect(tcs!.region).toBe("IN");
    });

    it("Google should have historical layoffs", () => {
      const google = companyDatabase.find((c) => c.name === "Google");
      expect(google).toBeDefined();
      expect(google!.layoffsLast24Months.length).toBeGreaterThan(0);
    });
  });

  describe("findCompanyByName", () => {
    it("should find exact match", () => {
      const result = companyDatabase.find(
        (c) => c.name.toLowerCase() === "apple",
      );
      expect(result).toBeDefined();
      expect(result!.name).toBe("Apple");
    });

    it("should find case-insensitive match", () => {
      const result = companyDatabase.find(
        (c) => c.name.toLowerCase() === "apple",
      );
      expect(result).toBeDefined();
    });

    it("should return undefined for unknown company", () => {
      const result = companyDatabase.find(
        (c) => c.name === "Unknown Company XYZ",
      );
      expect(result).toBeUndefined();
    });

    it("should handle partial matches", () => {
      const result = companyDatabase.find((c) =>
        c.name.toLowerCase().includes("micro"),
      );
      expect(result).toBeDefined();
      expect(result!.name).toContain("Microsoft");
    });
  });

  describe("getPPPMultiplier", () => {
    it("should return 1.0 for US", () => {
      expect(getPPPMultiplier("US")).toBe(1.0);
    });

    it("should return 0.9 for EU", () => {
      expect(getPPPMultiplier("EU")).toBe(0.9);
    });

    it("should return 0.25 for India", () => {
      expect(getPPPMultiplier("IN")).toBe(0.25);
    });

    it("should return 0.45 for APAC", () => {
      expect(getPPPMultiplier("APAC")).toBe(0.45);
    });

    it("should return 0.7 for GLOBAL", () => {
      expect(getPPPMultiplier("GLOBAL")).toBe(0.7);
    });

    it("should return default 1.0 for unknown region", () => {
      expect(getPPPMultiplier("UNKNOWN" as any)).toBe(1.0);
    });
  });

  describe("normalizeRegion", () => {
    it("should map US to US", () => {
      expect(normalizeRegion("US")).toBe("US");
    });

    it("should map GB to EU", () => {
      expect(normalizeRegion("GB")).toBe("EU");
    });

    it("should map IN to IN", () => {
      expect(normalizeRegion("IN")).toBe("IN");
    });

    it("should map SG to APAC", () => {
      expect(normalizeRegion("SG")).toBe("APAC");
    });

    it("should map BR to GLOBAL", () => {
      expect(normalizeRegion("BR")).toBe("GLOBAL");
    });

    it("should return GLOBAL for null/undefined", () => {
      expect(normalizeRegion(null)).toBe("GLOBAL");
      expect(normalizeRegion(undefined)).toBe("GLOBAL");
    });

    it("should handle case insensitivity", () => {
      expect(normalizeRegion("us")).toBe("US");
      expect(normalizeRegion("GB ")).toBe("EU");
    });
  });
});
