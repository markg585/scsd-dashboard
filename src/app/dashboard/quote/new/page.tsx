"use client";

import { useSearchParams, useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import JobSiteForm from "@/components/jobsite/JobSiteForm";
import Header from "@/components/layout/Header";

export default function NewJobSitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");

  const [user, loadingAuth] = useAuthState(auth);
  const [lead, setLead] = useState<{ firstName: string; lastName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!leadId) {
      setError("Missing lead ID");
      return;
    }

    const fetchLead = async () => {
      try {
        const docRef = doc(db, "leads", leadId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLead(docSnap.data() as any);
        } else {
          setError("Lead not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching lead data.");
      }
    };

    fetchLead();
  }, [leadId]);

  if (loadingAuth) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Header userEmail={user?.email ?? ""} />

      <main className="flex-1 px-4 md:px-12 py-8 w-full max-w-6xl mx-auto">
        <div className="bg-white border shadow-md rounded-2xl p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-1">New Job Site</h1>

          {lead && (
            <p className="text-muted-foreground mb-6">
              For lead: {lead.firstName} {lead.lastName}
            </p>
          )}

          {leadId && !error && (
            <JobSiteForm
              leadId={leadId}
              onSuccess={() => router.push("/dashboard/jobsite/list")} // ✅ Optionally redirect to job site list
            />
          )}

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      </main>
    </div>
  );
}
