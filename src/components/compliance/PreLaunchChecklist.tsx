// Pre-launch Compliance Checklist — Physical merchants (filtered)
// Source: playe / src/components/wizard/timing/PreLaunchChecklist.tsx
//
// Redesigned card-stack layout (dark) inspired by Figma's design QA checklist:
// each item is its own rounded card with a left-side checkbox, a small
// category tag, and a primary statement. Optional sub-items render as
// nested rows connected by a vertical rail.
//
// Physical-merchant only — instant Tremendous email fulfilment, so the
// historical "winner notification window" and "prize delivery SLA" checks
// have been removed.

import { Check } from "lucide-react";
import { useWizard } from "@/context/WizardContext";
import { cn } from "@/lib/utils";

type Category = "COMPLIANCE" | "LEGAL" | "DATA" | "FULFILMENT";

interface SubItem {
  label: string;
  passed: boolean;
}

interface CheckGroup {
  category: Category;
  label: string;
  passed: boolean;
  detail?: string;
  subItems?: SubItem[];
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

  const promoterNameOk = !!campaignData.promoterName?.trim();
  const promoterAddressOk = !!campaignData.promoterAddress?.trim();
  const termsOk = (campaignData.termsAndConditions ?? "").trim().length > 100;

  const groups: CheckGroup[] = [
    ...(requiresFER
      ? [{
          category: "COMPLIANCE" as Category,
          label: "Free Entry Route is configured.",
          passed: ferOk,
          detail: "Required for Fixed-Pool draws under the UK Gambling Act 2005.",
        }]
      : []),
    {
      category: "LEGAL",
      label: "Promoter identity is complete.",
      passed: promoterNameOk && promoterAddressOk,
      subItems: [
        { label: "Promoter legal name is provided.", passed: promoterNameOk },
        { label: "Registered address is provided.", passed: promoterAddressOk },
      ],
    },
    {
      category: "LEGAL",
      label: "Terms & Conditions are published.",
      passed:
        termsOk &&
        (!requiresMinSpendDisclosure || minSpendDisclosed),
      subItems: [
        { label: "T&Cs body is present (>100 chars).", passed: termsOk },
        ...(requiresMinSpendDisclosure
          ? [{
              label: "Minimum-spend disclosure is included.",
              passed: minSpendDisclosed,
            }]
          : []),
      ],
    },
    {
      category: "COMPLIANCE",
      label: "Age & geographic gates are set.",
      passed: !!campaignData.ageGate && !!campaignData.geoRestriction,
      subItems: [
        { label: "Age gate selected.", passed: !!campaignData.ageGate },
        {
          label: "Geographic eligibility selected.",
          passed: !!campaignData.geoRestriction,
        },
      ],
    },
    {
      category: "DATA",
      label: "Privacy & consent obligations are met.",
      passed:
        !!campaignData.marketingOptInOffered &&
        (!campaignData.deviceFingerprinting || !!campaignData.pecrAcknowledged) &&
        (!campaignData.exifScan || !!campaignData.locationDataAcknowledged),
      subItems: [
        {
          label: "Marketing opt-in is surfaced unbundled.",
          passed: !!campaignData.marketingOptInOffered,
        },
        ...(campaignData.deviceFingerprinting
          ? [{
              label: "PECR consent acknowledged for fingerprinting.",
              passed: !!campaignData.pecrAcknowledged,
            }]
          : []),
        ...(campaignData.exifScan
          ? [{
              label: "Location-data lawful basis disclosed (EXIF).",
              passed: !!campaignData.locationDataAcknowledged,
            }]
          : []),
      ],
    },
    {
      category: "FULFILMENT",
      label: "Winner notification & prize delivery are instant.",
      passed: true,
      detail:
        "Winners are notified immediately on pool exhaustion and prizes are delivered by email via Tremendous at the moment of selection.",
    },
  ];

  const allItems = groups.flatMap((g) => [
    g,
    ...(g.subItems ?? []).map((s) => ({ passed: s.passed })),
  ]);
  const passedCount = allItems.filter((i) => i.passed).length;
  const total = allItems.length;
  const allPassed = passedCount === total;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Pre-launch checklist
          </h3>
          <p className="text-[11px] text-muted-foreground">
            All items should pass before publishing.
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
            allPassed
              ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
              : "bg-destructive/15 text-destructive ring-1 ring-destructive/30",
          )}
        >
          {passedCount}/{total}
        </span>
      </div>

      <div className="space-y-2.5">
        {groups.map((g) => (
          <div
            key={g.category + g.label}
            className="rounded-xl border border-border bg-card/60 p-4 shadow-sm backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <CheckBox passed={g.passed} />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground">
                  {g.category}
                </div>
                <div className="mt-0.5 text-sm leading-snug text-foreground">
                  {g.label}
                </div>
                {g.detail && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {g.detail}
                  </p>
                )}
              </div>
            </div>

            {g.subItems && g.subItems.length > 0 && (
              <div className="relative mt-3 ml-2 space-y-2 border-l border-border/70 pl-5">
                {g.subItems.map((s) => (
                  <div key={s.label} className="flex items-start gap-2.5">
                    <span className="absolute -left-px h-4 w-4" />
                    <CheckBox passed={s.passed} small />
                    <div className="pt-0.5 text-xs leading-snug text-foreground/85">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

function CheckBox({ passed, small = false }: { passed: boolean; small?: boolean }) {
  const size = small ? "h-4 w-4 rounded-[5px]" : "h-5 w-5 rounded-md";
  return (
    <span
      className={cn(
        "mt-0.5 inline-flex flex-shrink-0 items-center justify-center border transition-colors",
        size,
        passed
          ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-400"
          : "border-border bg-background/40 text-transparent",
      )}
    >
      <Check className={small ? "h-3 w-3" : "h-3.5 w-3.5"} strokeWidth={3} />
    </span>
  );
}

export default PreLaunchChecklist;
