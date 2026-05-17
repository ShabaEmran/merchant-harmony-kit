// UK Compliance Accordion — Physical merchants
// Source: playe / src/components/wizard/game-logic/ComplianceSection.tsx
//
// Renders as a single <AccordionItem> — must be a child of a shadcn
// <Accordion type="single" collapsible>. Reads/writes campaign state via the
// useWizard() hook (see types.ts for the field shape you need to back this).
//
// Behaviour summary (full rationale in DOCUMENTATION.md):
//   1. Free Entry Route (FER) block — only shown when campaignStyle === "Fixed-Pool"
//      (chance draw). Skill-based / guaranteed-reward styles do NOT require an FER.
//   2. Age gate (default 18+) and Geo restriction (default UK).
//   3. Marketing opt-in toggle — must be unbundled from entry (UK GDPR + PECR).
//   4. PECR consent ack — only shown when deviceFingerprinting is enabled.
//   5. EXIF / location data ack — only shown when exifScan is enabled
//      (physical-merchant only feature: photo-of-receipt entry capturing GPS).

import { ShieldAlert, Scale, Globe, UserCheck, Mail, MessageSquare } from "lucide-react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWizard } from "@/context/WizardContext";
import type { FreeEntryRoute, AgeGate, GeoRestriction } from "@/context/WizardContext";

const ComplianceSection = () => {
  const { campaignData, updateCampaignData } = useWizard();
  const fer = campaignData.freeEntryRoute ?? "none";
  // FER is only legally required for Fixed-Pool (chance draw, no skill barrier).
  // Single Win & Leaderboard = skill-based. Reward for All = guaranteed gift-with-purchase.
  // Retention Loops are guaranteed-prize gifts-with-purchase too — they do NOT trigger FER.
  const requiresFER = campaignData.campaignStyle === "Fixed-Pool";

  const ferDetailsLabel: Record<FreeEntryRoute, string> = {
    postal: "Postal entry address",
    "web-form": "Free entry web form URL",
    sms: "Free SMS short-code",
    skill: "Skill question / mechanic description",
    none: "",
  };

  const ferDetailsPlaceholder: Record<FreeEntryRoute, string> = {
    postal: "e.g. ACME Promotion, PO Box 1234, London, EC1A 1AA",
    "web-form": "https://yourbrand.com/free-entry",
    sms: "e.g. Text WIN to 80800 (free)",
    skill: "Describe the skill question or judging mechanic",
    none: "",
  };

  const detailsRequired = fer !== "none" && fer !== "skill";

  return (
    <AccordionItem value="compliance">
      <AccordionTrigger className="text-md font-medium">
        <span className="flex items-center gap-2">
          <Scale className="h-4 w-4" /> UK Compliance
          <Badge variant="destructive" className="text-[10px]">Required</Badge>
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-5 pt-2">
          {/* Free Entry Route — only shown when legally required */}
          {requiresFER && (
          <div className="space-y-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <Label className="font-medium">Free Entry Route (FER)</Label>
                <p className="text-xs text-foreground/70">
                  Required for Fixed-Pool draws under the UK Gambling Act 2005.
                  Skill-based styles (Single Win, Leaderboard) and guaranteed-reward
                  styles (Reward for All, Retention Loops) don't need an FER —
                  they're gifts-with-purchase, not lotteries.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <Label htmlFor="fer-type">Method</Label>
                <Select
                  value={fer}
                  onValueChange={(v) =>
                    updateCampaignData({ freeEntryRoute: v as FreeEntryRoute })
                  }
                >
                  <SelectTrigger id="fer-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Select —</SelectItem>
                    <SelectItem value="postal">Postal entry</SelectItem>
                    <SelectItem value="web-form">Free web form</SelectItem>
                    <SelectItem value="sms">Free SMS short-code</SelectItem>
                    <SelectItem value="skill">Skill-based (no FER needed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {detailsRequired && (
                <div className="space-y-1">
                  <Label htmlFor="fer-details">{ferDetailsLabel[fer]}</Label>
                  <Input
                    id="fer-details"
                    value={campaignData.freeEntryDetails ?? ""}
                    onChange={(e) =>
                      updateCampaignData({ freeEntryDetails: e.target.value })
                    }
                    placeholder={ferDetailsPlaceholder[fer]}
                  />
                </div>
              )}
            </div>
            {fer === "none" && (
              <p className="text-xs text-destructive pt-1">
                Required because Fixed-Pool draws are chance-based.
              </p>
            )}
          </div>
          )}

          {/* Age gate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="age-gate" className="font-medium flex items-center gap-1">
                <UserCheck className="h-4 w-4" /> Minimum age
              </Label>
              <Select
                value={campaignData.ageGate ?? "18+"}
                onValueChange={(v) => updateCampaignData({ ageGate: v as AgeGate })}
              >
                <SelectTrigger id="age-gate"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="13+">13+</SelectItem>
                  <SelectItem value="16+">16+</SelectItem>
                  <SelectItem value="18+">18+ (recommended)</SelectItem>
                  <SelectItem value="21+">21+</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-foreground/60">
                Use 18+ for alcohol prizes, gambling-adjacent draws, or high-value
                rewards.
              </p>
            </div>

            {/* Geo */}
            <div className="space-y-1">
              <Label htmlFor="geo" className="font-medium flex items-center gap-1">
                <Globe className="h-4 w-4" /> Geographic eligibility
              </Label>
              <Select
                value={campaignData.geoRestriction ?? "uk"}
                onValueChange={(v) =>
                  updateCampaignData({ geoRestriction: v as GeoRestriction })
                }
              >
                <SelectTrigger id="geo"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="uk-ex-ni">UK (excl. Northern Ireland)</SelectItem>
                  <SelectItem value="eea">UK + EEA</SelectItem>
                  <SelectItem value="global">Worldwide</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-foreground/60">
                NI has separate lottery rules — exclude if unsure.
              </p>
            </div>
          </div>

          {/* Marketing opt-in */}
          <div className="space-y-1 rounded-md border border-border/50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-foreground/70" />
                <Label htmlFor="marketing-optin" className="font-medium">
                  Surface marketing opt-in (unbundled)
                </Label>
              </div>
              <Switch
                id="marketing-optin"
                checked={!!campaignData.marketingOptInOffered}
                onCheckedChange={(v) => updateCampaignData({ marketingOptInOffered: v })}
              />
            </div>
            <p className="text-xs text-foreground/60 pl-7">
              UK GDPR + PECR require marketing consent to be a separate, optional
              tick — never a condition of entry.
            </p>
          </div>

          {/* PECR consent for fingerprinting */}
          {campaignData.deviceFingerprinting && (
            <div className="space-y-1 rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                  <Label htmlFor="pecr-ack" className="font-medium">
                    PECR consent will be collected
                  </Label>
                </div>
                <Switch
                  id="pecr-ack"
                  checked={!!campaignData.pecrAcknowledged}
                  onCheckedChange={(v) => updateCampaignData({ pecrAcknowledged: v })}
                />
              </div>
              <p className="text-xs text-foreground/70 pl-7">
                Device fingerprinting is non-essential tracking under PECR and
                requires informed consent before deployment.
              </p>
            </div>
          )}

          {/* EXIF GPS lawful basis (physical merchants: photo-of-receipt entry) */}
          {campaignData.exifScan && (
            <div className="space-y-1 rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-amber-500" />
                  <Label htmlFor="loc-ack" className="font-medium">
                    Location data lawful basis disclosed
                  </Label>
                </div>
                <Switch
                  id="loc-ack"
                  checked={!!campaignData.locationDataAcknowledged}
                  onCheckedChange={(v) =>
                    updateCampaignData({ locationDataAcknowledged: v })
                  }
                />
              </div>
              <p className="text-xs text-foreground/70 pl-7">
                EXIF metadata may include GPS coordinates — classified as
                location data under UK GDPR. Disclose the lawful basis in your
                privacy notice.
              </p>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ComplianceSection;
