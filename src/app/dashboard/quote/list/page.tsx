"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth"; // ✅ Auth hook
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase"; // ✅ Auth + DB

import Header from "@/components/layout/Header"; // ✅ Your existing header
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { LucideLayoutGrid, LucideList } from "lucide-react";

interface JobSite {
  id: string;
  address: string;
  city: string;
  notes?: string;
  leadId: string;
  leadName: string;
}

export default function JobSiteListPage() {
  const [user] = useAuthState(auth); // ✅ Grab user
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("__all__");
  const [leadFilter, setLeadFilter] = useState("__all__");
  const router = useRouter();

  useEffect(() => {
    const fetchAllJobSites = async () => {
      const leadsSnap = await getDocs(collection(db, "leads"));
      const jobSites: JobSite[] = [];

      for (const leadDoc of leadsSnap.docs) {
        const leadId = leadDoc.id;
        const leadData = leadDoc.data();
        const leadName = `${leadData.firstName} ${leadData.lastName}`;

        const jobSiteSnap = await getDocs(collection(db, "leads", leadId, "jobSites"));
        jobSiteSnap.forEach((doc) => {
          const data = doc.data();
          jobSites.push({
            id: doc.id,
            address: data.address,
            city: data.city,
            notes: data.notes,
            leadId,
            leadName,
          });
        });
      }

      setJobSites(jobSites);
    };

    fetchAllJobSites();
  }, []);

  const cities = Array.from(new Set(jobSites.map(site => site.city))).sort();
  const leads = Array.from(new Set(jobSites.map(site => site.leadName))).sort();

  const filtered = jobSites.filter((site) => {
    const q = search.toLowerCase();
    const matchesSearch =
      site.address.toLowerCase().includes(q) ||
      site.city.toLowerCase().includes(q) ||
      site.leadName.toLowerCase().includes(q);
    const matchesCity = cityFilter !== "__all__" ? site.city === cityFilter : true;
    const matchesLead = leadFilter !== "__all__" ? site.leadName === leadFilter : true;
    return matchesSearch && matchesCity && matchesLead;
  });

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <Header userEmail={user?.email || "User"} /> {/* ✅ Works with your Header.tsx */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Input
          placeholder="Search job sites..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <ToggleGroup type="single" value={view} onValueChange={(val) => val && setView(val)}>
          <ToggleGroupItem value="table">
            <LucideList className="w-4 h-4 mr-2" /> Table
          </ToggleGroupItem>
          <ToggleGroupItem value="card">
            <LucideLayoutGrid className="w-4 h-4 mr-2" /> Cards
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select onValueChange={setCityFilter} value={cityFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setLeadFilter} value={leadFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Lead" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Leads</SelectItem>
            {leads.map((lead) => (
              <SelectItem key={lead} value={lead}>{lead}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No job sites found.</p>
      ) : view === "table" ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((site) => (
              <TableRow
                key={site.id}
                className="cursor-pointer hover:bg-muted"
                onClick={() => router.push(`/dashboard/jobsite/${site.id}?leadId=${site.leadId}`)}
              >
                <TableCell>{site.address}</TableCell>
                <TableCell>{site.city}</TableCell>
                <TableCell>{site.leadName}</TableCell>
                <TableCell>{site.notes || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((site) => (
            <Card
              key={site.id}
              className="cursor-pointer hover:shadow-md"
              onClick={() => router.push(`/dashboard/jobsite/${site.id}?leadId=${site.leadId}`)}
            >
              <CardContent className="p-4 space-y-1">
                <div className="font-semibold">{site.address}, {site.city}</div>
                <div className="text-sm text-muted-foreground">{site.leadName}</div>
                {site.notes && <div className="text-sm text-muted-foreground">{site.notes}</div>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
