import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Section = {
  label?: string;
  length: number;
  width: number;
  area: number;
  profiled: boolean;
  roadBase: boolean;
  asphalt: boolean;
  bitumen: boolean;
};

export default function SectionCard({
  section,
  onUpdate,
  onDelete,
}: {
  section: Section;
  onUpdate: (data: Section) => void;
  onDelete?: () => void;
}) {
  const [localSection, setLocalSection] = useState<Section>({
    label: section.label || "",
    length: section.length || 0,
    width: section.width || 0,
    area: section.area || 0,
    profiled: section.profiled || false,
    roadBase: section.roadBase || false,
    asphalt: section.asphalt || false,
    bitumen: section.bitumen || false,
  });

  useEffect(() => {
    const area = localSection.length * localSection.width;
    onUpdate({ ...localSection, area });
  }, [localSection.length, localSection.width, localSection.profiled, localSection.roadBase, localSection.asphalt, localSection.bitumen, localSection.label]);

  const updateField = (key: keyof Section, value: any) => {
    setLocalSection((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Label className="text-sm">Section Label</Label>
            <Input
              placeholder="e.g. Front Driveway"
              value={localSection.label}
              onChange={(e) => updateField("label", e.target.value)}
            />
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-muted-foreground hover:text-red-500 mt-1"
              title="Delete section"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-4 items-end">
          <div>
            <Label>Length (m)</Label>
            <Input
              type="number"
              value={localSection.length}
              onChange={(e) => updateField("length", Number(e.target.value))}
              min={0}
            />
          </div>
          <div>
            <Label>Width (m)</Label>
            <Input
              type="number"
              value={localSection.width}
              onChange={(e) => updateField("width", Number(e.target.value))}
              min={0}
            />
          </div>
          <div className="ml-auto text-sm font-medium">
            Area: {localSection.length * localSection.width} m²
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {["profiled", "roadBase", "asphalt", "bitumen"].map((key) => (
            <label key={key} className="flex items-center gap-2 capitalize">
              <Checkbox
                checked={localSection[key as keyof Section] as boolean}
                onCheckedChange={() =>
                  updateField(key as keyof Section, !localSection[key as keyof Section])
                }
              />
              {key}
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
