import { db } from "../lib/db/src/index";
import { safeCareers } from "../lib/db/src/schema/live_signals";
import { eq } from "drizzle-orm";

const SME_ROLES = [
  {
    roleKey: "fractional_cfo",
    roleTitle: "Fractional CFO / Small Biz Controller",
    industryKey: "finance",
    industryLabel: "Finance & Accounting",
    riskScore: 12,
    growthProjection: 18.5,
    medianSalaryUsd: 145000,
    remoteViable: "yes",
    educationRequired: "master",
    automationD1: 8,
    augmentationD3: 65,
    isSmeStable: 1,
    smeStabilityReason: "High-context strategic decision making for resource-constrained businesses requires human intuition and empathy.",
    safetyReason: "Relies on complex human relationships and idiosyncratic business data that AI cannot synthesize reliably."
  },
  {
    roleKey: "msp_engineer",
    roleTitle: "Managed Service Provider (MSP) Engineer",
    industryKey: "technology",
    industryLabel: "Information Technology",
    riskScore: 15,
    growthProjection: 12.0,
    medianSalaryUsd: 85000,
    remoteViable: "partial",
    educationRequired: "associate",
    automationD1: 12,
    augmentationD3: 40,
    isSmeStable: 1,
    smeStabilityReason: "Physical hardware troubleshooting and local 'trust-based' IT support remain resilient to remote AI automation.",
    safetyReason: "Combines physical presence with varied, unpredictable problem-solving in non-standardized environments."
  },
  {
    roleKey: "sme_ops_lead",
    roleTitle: "SME Operations & Efficiency Lead",
    industryKey: "operations",
    industryLabel: "General Operations",
    riskScore: 18,
    growthProjection: 9.2,
    medianSalaryUsd: 92000,
    remoteViable: "partial",
    educationRequired: "bachelor",
    automationD1: 15,
    augmentationD3: 55,
    isSmeStable: 1,
    smeStabilityReason: "Small teams require 'jack-of-all-trades' adaptability; AI is currently too specialized for SME multi-tasking.",
    safetyReason: "Requires cross-functional coordination across unorganized data and legacy physical processes."
  },
  {
    roleKey: "smb_sales_consultant",
    roleTitle: "SMB Sales & Growth Consultant",
    industryKey: "sales",
    industryLabel: "Sales & Marketing",
    riskScore: 22,
    growthProjection: 7.5,
    medianSalaryUsd: 78000,
    remoteViable: "yes",
    educationRequired: "bachelor",
    automationD1: 20,
    augmentationD3: 70,
    isSmeStable: 1,
    smeStabilityReason: "Small business owners buy based on personal trust and localized industry knowledge, not generic AI outreach.",
    safetyReason: "Deeply embedded in local networking and relationship-based commerce models."
  },
  {
    roleKey: "hvac_tech_manager",
    roleTitle: "HVAC Technical Service Manager (SME)",
    industryKey: "skilled_trades",
    industryLabel: "Skilled Trades",
    riskScore: 5,
    growthProjection: 14.2,
    medianSalaryUsd: 72000,
    remoteViable: "no",
    educationRequired: "high_school",
    automationD1: 2,
    augmentationD3: 15,
    isSmeStable: 1,
    smeStabilityReason: "Critical physical infrastructure for local businesses; impossible to automate physical repair at SME scale.",
    safetyReason: "High dexterity, physical presence, and diagnostic variability in non-uniform buildings."
  }
];

async function seedSMERoles() {
  console.log("🚀 Seeding SME-Stable roles...");
  
  for (const role of SME_ROLES) {
    try {
      await db.insert(safeCareers).values(role).onConflictDoUpdate({
        target: safeCareers.roleKey,
        set: role
      });
      console.log(`✅ Seeded/Updated: ${role.roleTitle}`);
    } catch (e) {
      console.error(`❌ Failed to seed ${role.roleKey}:`, e);
    }
  }
  
  console.log("✨ SME Role seeding complete.");
  process.exit(0);
}

seedSMERoles();
