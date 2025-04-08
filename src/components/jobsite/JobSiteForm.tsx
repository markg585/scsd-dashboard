"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import SectionCard from "@/components/jobsite/SectionCard";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const jobSiteSchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  notes: z.string().optional(),
  options: z.array(
    z.object({
      label: z.string(),
      sections: z.array(
        z.object({
          label: z.string().optional(),
          length: z.number(),
          width: z.number(),
          area: z.number(),
          profiled: z.boolean(),
          roadBase: z.boolean(),
          asphalt: z.boolean(),
          bitumen: z.boolean(),
        })
      )
    })
  )
});

const defaultSection = {
  label: "",
  length: 0,
  width: 0,
  area: 0,
  profiled: false,
  roadBase: false,
  asphalt: false,
  bitumen: false,
};

const getTotalArea = (sections: any[]) => {
  return sections.reduce((sum, s) => sum + (s.area || 0), 0);
};

const getMaterialArea = (sections: any[], material: string) => {
  return sections.reduce((sum, s) => (s[material] ? sum + s.area : sum), 0);
};

export default function JobSiteFormComponent({ leadId, onSuccess }: { leadId: string; onSuccess: () => void }) {
  const [options, setOptions] = useState([
    { label: "Option A", sections: [{ ...defaultSection }] }
  ]);
  const [activeOption, setActiveOption] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(jobSiteSchema),
    defaultValues: {
      options: [],
    },
  });

  const handleSectionUpdate = (optIdx: number, sectionIdx: number, data: any) => {
    const updated = [...options];
    updated[optIdx].sections[sectionIdx] = data;
    setOptions(updated);
  };

  const handleSectionDelete = (optIdx: number, sectionIdx: number) => {
    const updated = [...options];
    updated[optIdx].sections.splice(sectionIdx, 1);
    setOptions(updated);
  };

  const addSection = (optIdx: number) => {
    const updated = [...options];
    updated[optIdx].sections.push({ ...defaultSection });
    setOptions(updated);
  };

  const addOption = () => {
    const newIdx = options.length;
    setOptions([
      ...options,
      {
        label: `Option ${String.fromCharCode(65 + newIdx)}`,
        sections: [{ ...defaultSection }],
      },
    ]);
    setActiveOption(String(newIdx));
  };

  const onSubmit = async (formData: any) => {
    console.log("✅ Form is valid. Submitting with data:", formData);
    try {
      const jobSiteData = {
        address: formData.address,
        city: formData.city,
        notes: formData.notes,
        options,
      };
      await addDoc(collection(db, "leads", leadId, "jobSites"), jobSiteData);
      onSuccess();
    } catch (err) {
      console.error("❌ Firestore error:", err);
      setError("Failed to save job site.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, (errors) => console.log("FORM ERRORS", errors))} className="space-y-6">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <Input placeholder="123 Example St" {...register("address")} />
          {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <Input placeholder="City" {...register("city")} />
          {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <Textarea placeholder="Access, materials, etc..." {...register("notes")} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Quote Options</h2>
        <Button type="button" variant="outline" onClick={addOption}>+ Add Option</Button>
      </div>

      <Tabs value={activeOption} onValueChange={setActiveOption} className="w-full">
        <TabsList className="mb-4">
          {options.map((opt, i) => (
            <TabsTrigger key={i} value={String(i)}>{opt.label}</TabsTrigger>
          ))}
        </TabsList>

        {options.map((opt, optIdx) => (
          <TabsContent key={optIdx} value={String(optIdx)} className="space-y-4">
            {opt.sections.map((section, secIdx) => (
              <SectionCard
                key={secIdx}
                section={section}
                onUpdate={(data) => handleSectionUpdate(optIdx, secIdx, data)}
                onDelete={() => handleSectionDelete(optIdx, secIdx)}
              />
            ))}
            <Button type="button" variant="outline" onClick={() => addSection(optIdx)}>+ Add Section</Button>

            <div className="border-t pt-4 text-sm text-muted-foreground">
              <p className="font-semibold">Summary:</p>
              <ul className="list-disc list-inside">
                <li>Total Area: {getTotalArea(opt.sections)} m²</li>
                <li>Profiled: {getMaterialArea(opt.sections, 'profiled')} m²</li>
                <li>Road Base: {getMaterialArea(opt.sections, 'roadBase')} m²</li>
                <li>Asphalt: {getMaterialArea(opt.sections, 'asphalt')} m²</li>
                <li>Bitumen: {getMaterialArea(opt.sections, 'bitumen')} m²</li>
              </ul>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="pt-4">
        <Button type="submit">Save Job Site</Button>
      </div>
    </form>
  );
}
