// Minimum campaign-state shape required to back the UK Compliance accordion,
// Terms & Conditions generator, and Pre-launch Checklist.
//
// In the source project these live on a larger CampaignData type exposed
// through a useWizard() React context. You can either:
//   (a) Add these fields to your existing campaign/draft model and expose a
//       hook with the same shape, OR
//   (b) Create a dedicated ComplianceContext that wraps just these fields.
//
// The three components import `useWizard` from "@/context/WizardContext" and
// expect `campaignData`, `updateCampaignData`, and `merchantType` on it.

export type CampaignStyle =
  | "Single Win"      // skill-based — single winner
  | "Fixed-Pool"      // chance draw from a finite pool — THIS is the one that triggers FER
  | "Leaderboard"     // skill-based — ranked
  | "Reward for All"; // guaranteed gift-with-purchase

export type MerchantType = "physical" | "cpg" | "ecommerce";

export type AgeGate = "none" | "13+" | "16+" | "18+" | "21+";
export type FreeEntryRoute = "postal" | "web-form" | "sms" | "skill" | "none";
export type GeoRestriction = "uk" | "uk-ex-ni" | "eea" | "global";
export type RewardType = "E-voucher" | "Store Credit";
export type WinnerPublication = "full" | "anonymised" | "on-request";

export interface CampaignComplianceData {
  // --- Drives FER conditional logic ---
  campaignStyle: CampaignStyle | null;

  // --- Drives the EXIF / location ack panel (physical photo-entry feature) ---
  deviceFingerprinting?: boolean;
  exifScan?: boolean;

  // --- Drives "qualifying product" line in generated T&Cs ---
  lineItemMatch?: boolean;
  sku?: string;

  // --- UK Compliance accordion fields ---
  freeEntryRoute?: FreeEntryRoute;
  freeEntryDetails?: string;          // postal address / URL / shortcode
  ageGate?: AgeGate;
  geoRestriction?: GeoRestriction;
  marketingOptInOffered?: boolean;    // must be unbundled from entry
  pecrAcknowledged?: boolean;         // PECR ack when fingerprinting
  locationDataAcknowledged?: boolean; // UK GDPR ack when EXIF scan on

  // --- Terms & Conditions builder fields (CAP §8 mandated) ---
  termsBuilderEnabled?: boolean;
  promoterName?: string;
  promoterAddress?: string;
  whoCanEnter?: string;
  governingLaw?: string;
  dataProtectionStatement?: string;
  termsAndConditions?: string;        // generated/freeform body

  // --- Read by the generator + checklist ---
  minimumSpend?: number | null;
  prizeQuantity: number;
  prizeValue: number;
  rewardType: RewardType;
  winnerNotificationDays?: number;    // default 7
  prizeDeliveryDays?: number;         // default 28; CAP recommends ≤ 30
  winnerPublication?: WinnerPublication;
  prizeSubstitutionAllowed?: boolean;
  judgeName?: string;
  judgeRole?: string;

  // --- Drives the physical-merchant closing clause ---
  endDate?: Date;                     // becomes the long-stop for physical
}

// Defaults the source project initialises with — recommend matching these so
// the accordion renders in a sensible state on first load.
export const DEFAULT_COMPLIANCE_VALUES: Partial<CampaignComplianceData> = {
  freeEntryRoute: "none",
  freeEntryDetails: "",
  ageGate: "18+",
  geoRestriction: "uk",
  marketingOptInOffered: true,
  pecrAcknowledged: false,
  locationDataAcknowledged: false,
  termsBuilderEnabled: true,
  winnerNotificationDays: 7,
  prizeDeliveryDays: 28,
};
