// Pre-launch Compliance Checklist — Physical merchants (filtered)
// Source: playe / src/components/wizard/timing/PreLaunchChecklist.tsx
//
// Read-only summary card that validates every compliance signal collected by
// the UK Compliance accordion + T&Cs builder. Show "X / N passed" badge and
// gate the Publish button behind allPassed if desired.
//
// This is the PHYSICAL-MERCHANT-ONLY variant — CPG and Ecommerce branches
// from the original have been removed.

import { Check, X, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWizard } from "@/context/WizardContext";
import { cn } from "@/lib/utils";

interface CheckItem {
  label: string;
  passed: boolean;
  detail?: string;
}

const PreLaunchChecklist = () => {
  const { campaignData } = useWizard();

  const requiresFER = campaignData.campaignStyle === "Fixed-Pool";
  const ferOk =
    !!campaignData.freeEntryRoute &&
    campaignData.freeEntryRoute !== "none" &&
    (campaignData.freeEntryRoute === "skill" ||
      (campaignData.freeEntryDetails ?? "").trim() !== "");

  const minSpend = campaignData.minimumSpend ?? 0;
  const requiresMinSpendDisclosure = minSpend > 0;
  const termsLower = (campaignData.termsAndConditions ?? "").toLowerCase();
  const minSpendDisclosed =
    termsLower.includes("minimum") &&
    (termsLower.includes("spend") || termsLower.includes("qualifying"));

  const items: CheckItem[] = [
    ...(requiresFER
      ? [{
          label: "Free Entry Route configured",
          passed: ferOk,
          detail: "Required for Fixed-Pool draws under the UK Gambling Act 2005.",
        }]
      : []),
    ...(requiresMinSpendDisclosure
      ? [{
          label: "Minimum-spend disclosure included in T&Cs",
          passed: minSpendDisclosed,
          detail: "CAP §8.17 — significant conditions must be stated up-front.",
        }]
      : []),
    {
      label: "Age gate set",
      passed: !!campaignData.ageGate,
    },
    {
      label: "Promoter legal name & address",
      passed:
        !!campaignData.promoterName?.trim() &&
        !!campaignData.promoterAddress?.trim(),
      detail: "Mandatory under CAP Code §8.17.",
    },
    {
      label: "Terms & Conditions present",
      passed: (campaignData.termsAndConditions ?? "").trim().length > 100,
      detail: "Use the guided builder to cover all CAP-mandated fields.",
    },
    {
      label: "Marketing opt-in surfaced (unbundled)",
      passed: !!campaignData.marketingOptInOffered,
      detail: "Required by UK GDPR + PECR.",
    },
    {
      label: "PECR consent for device fingerprinting",
      passed:
        !campaignData.deviceFingerprinting || !!campaignData.pecrAcknowledged,
    },
    {
      label: "Location data lawful basis (EXIF)",
      passed: !campaignData.exifScan || !!campaignData.locationDataAcknowledged,
    },
    {
      label: "Winner notification window",
      passed:
        !!campaignData.winnerNotificationDays &&
        campaignData.winnerNotificationDays > 0,
    },
    {
      label: "Prize delivery SLA ≤ 30 days",
      passed:
        !!campaignData.prizeDeliveryDays && campaignData.prizeDeliveryDays <= 30,
      detail: "CAP recommendation.",
    },
  ];

  const passedCount = items.filter((i) => i.passed).length;
  const allPassed = passedCount === items.length;

  return (
    <Card className="p-4 space-y-3 bg-card border-border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Pre-launch compliance checklist</h3>
          <p className="text-xs text-foreground/60">
            All items should pass before publishing.
          </p>
        </div>
        <Badge
          variant={allPassed ? "default" : "destructive"}
          className={cn(allPassed && "bg-green-600 hover:bg-green-600")}
        >
          {passedCount}/{items.length}
        </Badge>
      </div>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li
            key={it.label}
            className="flex items-start gap-2 text-xs"
          >
            <span
              className={cn(
                "mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full flex-shrink-0",
                it.passed
                  ? "bg-green-600 text-white"
                  : "bg-destructive text-destructive-foreground"
              )}
            >
              {it.passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </span>
            <div className="flex-1">
              <span
                className={cn(
                  "text-foreground",
                  !it.passed && "text-destructive font-medium"
                )}
              >
                {it.label}
              </span>
              {it.detail && !it.passed && (
                <p className="text-foreground/60 mt-0.5 flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {it.detail}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default PreLaunchChecklist;
