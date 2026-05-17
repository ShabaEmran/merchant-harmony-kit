import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Store, ShieldCheck } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { WizardProvider, useWizard } from "@/context/WizardContext";
import type { CampaignStyle } from "@/lib/compliance/types";
import ComplianceSection from "@/components/compliance/ComplianceSection";
import TermsBuilder from "@/components/compliance/TermsBuilder";
import PreLaunchChecklist from "@/components/compliance/PreLaunchChecklist";
import { Markdown } from "@/components/compliance/Markdown";
import { DOCUMENTATION_MD } from "@/lib/compliance/documentation";

export const Route = createFileRoute("/")({
  component: () => (
    <WizardProvider>
      <Page />
    </WizardProvider>
  ),
  head: () => ({
    meta: [
      { title: "UK Compliance & T&Cs Builder — Physical Merchants" },
      {
        name: "description",
        content:
          "Reference implementation of the UK Compliance accordion and CAP §8 Terms & Conditions generator for physical merchant promotions.",
      },
    ],
  }),
});

function Page() {
  const { campaignData, updateCampaignData } = useWizard();
  const [docsOpen, setDocsOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                UK Compliance &amp; T&amp;Cs Builder
              </h1>
              <p className="text-xs text-muted-foreground">
                Physical merchant reference implementation
              </p>
            </div>
          </div>
          <Sheet open={docsOpen} onOpenChange={setDocsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Developer documentation
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
              <SheetHeader>
                <SheetTitle>Developer Documentation</SheetTitle>
                <SheetDescription>
                  Logic, compliance rationale &amp; integration notes for your developer.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <Markdown source={DOCUMENTATION_MD} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Campaign basics</h2>
              <Badge variant="secondary" className="text-[10px]">Physical merchant</Badge>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Campaign style</Label>
                <Select
                  value={campaignData.campaignStyle ?? "Fixed-Pool"}
                  onValueChange={(v) =>
                    updateCampaignData({ campaignStyle: v as CampaignStyle })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed-Pool">Fixed-Pool (chance draw)</SelectItem>
                    <SelectItem value="Single Win">Single Win (skill)</SelectItem>
                    <SelectItem value="Leaderboard">Leaderboard (skill)</SelectItem>
                    <SelectItem value="Reward for All">Reward for All</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Drives whether a Free Entry Route is required.
                </p>
              </div>
              <div className="space-y-1">
                <Label>Minimum spend (£)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={campaignData.minimumSpend ?? 0}
                  onChange={(e) =>
                    updateCampaignData({ minimumSpend: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Prize quantity</Label>
                <Input
                  type="number"
                  min={1}
                  value={campaignData.prizeQuantity}
                  onChange={(e) =>
                    updateCampaignData({ prizeQuantity: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Prize total value (£)</Label>
                <Input
                  type="number"
                  min={0}
                  value={campaignData.prizeValue}
                  onChange={(e) =>
                    updateCampaignData({ prizeValue: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/50 p-3 md:col-span-2">
                <div>
                  <Label className="font-medium">EXIF scan (photo-of-receipt entry)</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Toggling on surfaces the UK GDPR location-data acknowledgement.
                  </p>
                </div>
                <Switch
                  checked={!!campaignData.exifScan}
                  onCheckedChange={(v) => updateCampaignData({ exifScan: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/50 p-3 md:col-span-2">
                <div>
                  <Label className="font-medium">Device fingerprinting</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Toggling on surfaces the PECR consent acknowledgement.
                  </p>
                </div>
                <Switch
                  checked={!!campaignData.deviceFingerprinting}
                  onCheckedChange={(v) => updateCampaignData({ deviceFingerprinting: v })}
                />
              </div>
            </div>
          </Card>

          <Card className="p-2">
            <Accordion type="single" collapsible defaultValue="compliance" className="px-3">
              <ComplianceSection />
            </Accordion>
          </Card>

          <Card className="space-y-3 p-5">
            <h2 className="text-sm font-semibold">Terms &amp; Conditions generator</h2>
            <TermsBuilder />
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <PreLaunchChecklist />
        </aside>
      </div>
    </main>
  );
}
