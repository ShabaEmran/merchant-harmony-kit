// Terms & Conditions Generator — Physical merchants
// Source: playe / src/components/wizard/timing/TermsBuilder.tsx
//
// A guided form that captures CAP Code §8-mandated fields and produces a
// pre-formatted T&C body in campaignData.termsAndConditions. The merchant
// can toggle the builder off and write free-form terms instead.
//
// Physical-merchant-specific behaviour:
//   The closing clause in §3 PROMOTION PERIOD switches based on merchantType:
//   physical campaigns close on PARTICIPANT-POOL EXHAUSTION (event-based
//   terminus under CAP §8.17.1(b)), with the endDate acting only as a
//   long-stop. Non-physical campaigns close on the calendar endDate.
//
// Wrap this in an Accordion item in your Step 4 (Timing & Visibility) screen.

import { FileText, Building2, MapPin, Users, Scale, Shield, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWizard } from "@/context/WizardContext";
import { format } from "date-fns";

const TermsBuilder = () => {
  const { campaignData, updateCampaignData, merchantType } = useWizard();
  const enabled = campaignData.termsBuilderEnabled !== false;
  const minSpend = campaignData.minimumSpend ?? 0;
  const hasMinSpend = minSpend > 0;

  const generateTerms = () => {
    const closingDate = campaignData.endDate
      ? format(campaignData.endDate, "PPP")
      : "[end date]";
    const requiresFER = campaignData.campaignStyle === "Fixed-Pool";
    const fer = (() => {
      switch (campaignData.freeEntryRoute) {
        case "postal":
          return `Free postal entry: send your name and contact details to ${campaignData.freeEntryDetails || "[address]"}.`;
        case "web-form":
          return `Free entry online at ${campaignData.freeEntryDetails || "[url]"}.`;
        case "sms":
          return `Free SMS entry: ${campaignData.freeEntryDetails || "[shortcode]"}.`;
        case "skill":
          return `Skill-based entry: ${campaignData.freeEntryDetails || "[mechanic]"}.`;
        default:
          return "No free entry route required for this promotion type.";
      }
    })();

    const significantConditions: string[] = [];
    if (hasMinSpend) {
      significantConditions.push(
        `Minimum qualifying spend of £${minSpend.toFixed(2)} per transaction is required to participate.`
      );
    }
    if (campaignData.campaignStyle === "Reward for All") {
      significantConditions.push(
        "Every qualifying entrant receives the stated reward — this is a guaranteed gift-with-purchase, not a prize draw."
      );
    }

    const isPhysical = merchantType === "physical";
    const longStop = campaignData.endDate
      ? format(campaignData.endDate, "PPP")
      : "[long-stop date]";
    const closingClause = isPhysical
      ? `This promotion closes when the finite pool of participant numbers has been fully activated. A long-stop date of ${longStop} applies; any participant numbers not activated by that date are void. A "campaign closed" notice will be published within 24 hours of pool exhaustion.`
      : `The promotion closes on ${closingDate}. Entries received after this date will not be considered.`;

    const selectionMethod = (() => {
      switch (campaignData.campaignStyle) {
        case "Fixed-Pool":
          return "Winners are selected by random draw from all valid entries.";
        case "Single Win":
          return "The winner is selected by skill-based judgment against the published criteria.";
        case "Leaderboard":
          return "Winners are determined by score ranking on the published leaderboard at close of the promotion.";
        case "Reward for All":
          return "Every qualifying entrant receives the stated reward; no winner-selection process applies.";
        default:
          return "Winners are selected in accordance with the published mechanic.";
      }
    })();

    const paidRoute = campaignData.lineItemMatch
      ? `Paid route: purchase the qualifying product (${campaignData.sku}) and follow the on-screen instructions.`
      : "Paid route: follow the on-screen instructions to enter.";
    const howToEnter = requiresFER
      ? `${paidRoute}\nFree route: ${fer}`
      : paidRoute;

    const winnerSection = campaignData.campaignStyle === "Reward for All"
      ? `Rewards are issued automatically to every qualifying entrant by email immediately upon qualification. Digital fulfilment is handled via Tremendous and delivered to the entrant's registered email address.`
      : `${selectionMethod} Winners are notified immediately upon the promotion closing (i.e. as soon as the participant pool is exhausted). Prizes are delivered electronically by email via Tremendous at the moment of winner selection — no postal or physical fulfilment applies.`;

    const text = `1. PROMOTER
${campaignData.promoterName || "[Promoter name]"}, ${campaignData.promoterAddress || "[Registered address]"}.

2. ELIGIBILITY
${campaignData.whoCanEnter || "Open to UK residents aged 18+."} Minimum age: ${campaignData.ageGate || "18+"}. Geographic eligibility: ${campaignData.geoRestriction || "UK"}.

3. PROMOTION PERIOD
${closingClause}

4. HOW TO ENTER
${howToEnter}
${significantConditions.length ? `\n4a. SIGNIFICANT CONDITIONS\n${significantConditions.map((c, i) => `(${i + 1}) ${c}`).join("\n")}\n` : ""}

5. PRIZE
${campaignData.prizeQuantity} prize(s) with a total value of £${campaignData.prizeValue.toFixed(2)}. Reward type: ${campaignData.rewardType}.

6. WINNER SELECTION & NOTIFICATION
${winnerSection}
${campaignData.judgeName ? `Independent judge: ${campaignData.judgeName} (${campaignData.judgeRole || "Judge"}).` : ""}

7. PRIZE SUBSTITUTION
${
      campaignData.prizeSubstitutionAllowed
        ? "The promoter reserves the right to substitute any prize for one of equal or greater value."
        : "Prizes are non-transferable and no substitution will be offered."
    }

8. WINNER PUBLICATION
${
      campaignData.winnerPublication === "full"
        ? "Winners' names and counties will be published."
        : campaignData.winnerPublication === "anonymised"
        ? "Anonymised winner details will be published."
        : "Winner details will be made available on written request to the promoter."
    }

9. DATA PROTECTION
${campaignData.dataProtectionStatement || "Personal data will be processed under UK GDPR for promotion administration only."}

10. GOVERNING LAW
These terms are governed by the laws of ${campaignData.governingLaw || "England & Wales"}.

By entering, entrants agree to be bound by these terms.`;

    updateCampaignData({ termsAndConditions: text });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Use guided T&Cs builder
            <Badge variant="secondary" className="text-[10px]">CAP §8 compliant</Badge>
          </Label>
          <p className="text-xs text-foreground/60">
            Captures the mandatory fields. Toggle off to write free-form terms.
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(v) => updateCampaignData({ termsBuilderEnabled: v })}
        />
      </div>

      {enabled && (
        <div className="space-y-4 rounded-md border border-border/50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="promoter-name" className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" /> Promoter legal name *
              </Label>
              <Input
                id="promoter-name"
                value={campaignData.promoterName ?? ""}
                onChange={(e) => updateCampaignData({ promoterName: e.target.value })}
                placeholder="ACME Promotions Ltd"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="promoter-address" className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Registered address *
              </Label>
              <Input
                id="promoter-address"
                value={campaignData.promoterAddress ?? ""}
                onChange={(e) => updateCampaignData({ promoterAddress: e.target.value })}
                placeholder="1 High Street, London, EC1A 1AA"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="who-can-enter" className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Who can enter
            </Label>
            <Textarea
              id="who-can-enter"
              value={campaignData.whoCanEnter ?? ""}
              onChange={(e) => updateCampaignData({ whoCanEnter: e.target.value })}
              className="min-h-[60px]"
            />
          </div>

          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-1">
            <Label className="font-medium text-sm flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              Winner notification &amp; prize delivery
              <Badge variant="outline" className="text-[10px]">Instant via Tremendous</Badge>
            </Label>
            <p className="text-xs text-foreground/70">
              Winners are notified <strong>immediately</strong> the moment the
              participant pool is exhausted. Prizes are delivered electronically
              by email via <strong>Tremendous</strong> at the same instant — no
              SLA window applies because there is no postal or physical
              fulfilment step. This will be reflected in clause 6 of the
              generated T&amp;Cs.
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="data-protection" className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" /> Data protection statement
            </Label>
            <Textarea
              id="data-protection"
              value={campaignData.dataProtectionStatement ?? ""}
              onChange={(e) =>
                updateCampaignData({ dataProtectionStatement: e.target.value })
              }
              className="min-h-[60px]"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="governing-law" className="flex items-center gap-1">
              <Scale className="h-3.5 w-3.5" /> Governing law
            </Label>
            <Input
              id="governing-law"
              value={campaignData.governingLaw ?? ""}
              onChange={(e) => updateCampaignData({ governingLaw: e.target.value })}
            />
          </div>

          {hasMinSpend && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">
              <Label className="font-medium text-sm flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-amber-500" />
                Significant condition: minimum spend
                <Badge variant="outline" className="text-[10px]">CAP §8.17</Badge>
              </Label>
              <p className="text-xs text-foreground/70">
                Your campaign requires a minimum qualifying spend of{" "}
                <strong>£{minSpend.toFixed(2)}</strong>. This will be auto-included
                in the generated T&Cs as a significant condition that must be
                stated up-front.
              </p>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateTerms}
            className="gap-2"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate T&Cs from these fields
          </Button>
        </div>
      )}

      <div>
        <Label htmlFor="terms" className="font-medium">Final Terms & Conditions</Label>
        <Textarea
          id="terms"
          placeholder="Generated terms will appear here, or write your own."
          value={campaignData.termsAndConditions ?? ""}
          onChange={(e) => updateCampaignData({ termsAndConditions: e.target.value })}
          className="min-h-[200px] w-full text-sm font-mono mt-2"
        />
      </div>
    </div>
  );
};

export default TermsBuilder;
