"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

const jobSiteSchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  notes: z.string().optional(),
  measurements: z.string().optional(),
});

type JobSiteForm = z.infer<typeof jobSiteSchema>;

type Lead = {
  firstName: string;
  lastName: string;
};

export default function NewJobSitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");

  const [error, setError] = useState<string | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobSiteForm>({ resolver: zodResolver(jobSiteSchema) });

  const onSubmit = async (data: JobSiteForm) => {
    if (!leadId) return setError("Missing lead ID");
    try {
      await addDoc(collection(db, "leads", leadId, "jobSites"), data);
      router.push("/dashboard/leads");
    } catch (err) {
      setError("Failed to create job site.");
      console.error(err);
    }
  };

  useEffect(() => {
    if (!leadId) return setError("Missing lead ID");

    const fetchLead = async () => {
      const docSnap = await getDoc(doc(db, "leads", leadId));
      if (docSnap.exists()) {
        const data = docSnap.data() as Lead;
        setLead(data);
      }
    };

    fetchLead();
  }, [leadId]);

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">New Job Site</h1>
      {lead && <p className="text-muted-foreground">For lead: {lead.firstName} {lead.lastName}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input placeholder="Address" {...register("address")} />
          {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
        </div>

        <div>
          <Input placeholder="City" {...register("city")} />
          {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
        </div>

        <div>
          <Textarea placeholder="Notes (optional)" {...register("notes")} />
        </div>

        <div>
          <Textarea placeholder="Measurements (optional)" {...register("measurements")} />
        </div>

        <Button type="submit" className="w-full">Save Job Site</Button>
      </form>
    </div>
  );
}