import { createContext, useContext, useState, type ReactNode } from "react";
import type { CampaignComplianceData, MerchantType } from "@/lib/compliance/types";
import { DEFAULT_COMPLIANCE_VALUES } from "@/lib/compliance/types";

// Re-export types the compliance components import from this module
export type {
  CampaignStyle,
  MerchantType,
  AgeGate,
  FreeEntryRoute,
  GeoRestriction,
  RewardType,
  WinnerPublication,
  CampaignComplianceData,
} from "@/lib/compliance/types";

interface WizardContextValue {
  campaignData: CampaignComplianceData;
  updateCampaignData: (patch: Partial<CampaignComplianceData>) => void;
  merchantType: MerchantType;
  setMerchantType: (m: MerchantType) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

const INITIAL: CampaignComplianceData = {
  campaignStyle: "Fixed-Pool",
  deviceFingerprinting: false,
  exifScan: true,
  lineItemMatch: false,
  prizeQuantity: 10,
  prizeValue: 250,
  rewardType: "E-voucher",
  winnerPublication: "anonymised",
  prizeSubstitutionAllowed: true,
  governingLaw: "England & Wales",
  whoCanEnter: "Open to UK residents aged 18+ at the time of entry.",
  dataProtectionStatement:
    "Personal data will be processed under UK GDPR for promotion administration only and retained for no longer than 12 months after the promotion closes.",
  ...DEFAULT_COMPLIANCE_VALUES,
};

export function WizardProvider({ children }: { children: ReactNode }) {
  const [campaignData, setCampaignData] = useState<CampaignComplianceData>(INITIAL);
  const [merchantType, setMerchantType] = useState<MerchantType>("physical");

  const updateCampaignData = (patch: Partial<CampaignComplianceData>) =>
    setCampaignData((prev) => ({ ...prev, ...patch }));

  return (
    <WizardContext.Provider
      value={{ campaignData, updateCampaignData, merchantType, setMerchantType }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}
