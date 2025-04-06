"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LucideList, LucideLayoutGrid, Plus, MoreVertical, MapPin } from "lucide-react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const leadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email(),
  inquiryMethod: z.enum(["phone", "email", "referral"]),
});

const jobSiteSchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  notes: z.string().optional(),
});

type InquiryMethod = z.infer<typeof leadSchema>["inquiryMethod"];
type Lead = z.infer<typeof leadSchema> & { id?: string };
type JobSite = z.infer<typeof jobSiteSchema> & { id?: string };

export default function LeadsPage() {
  const router = useRouter();
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(leadSchema) });

  const fetchLeads = async () => {
    const snapshot = await getDocs(collection(db, "leads"));
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
    setLeads(results);
  };

  const onSubmit = async (data: Lead) => {
    if (selectedLead) {
      await updateDoc(doc(db, "leads", selectedLead.id!), data);
    } else {
      await addDoc(collection(db, "leads"), data);
    }
    reset();
    setSelectedLead(null);
    setOpen(false);
    await fetchLeads();
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setOpen(true);
    setValue("firstName", lead.firstName);
    setValue("lastName", lead.lastName);
    setValue("phone", lead.phone);
    setValue("email", lead.email);
    setValue("inquiryMethod", lead.inquiryMethod);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "leads", id));
    await fetchLeads();
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <ToggleGroup type="single" value={view} onValueChange={(val) => val && setView(val)}>
            <ToggleGroupItem value="table" aria-label="Table view">
              <LucideList className="w-4 h-4 mr-2" /> Table
            </ToggleGroupItem>
            <ToggleGroupItem value="card" aria-label="Card view">
              <LucideLayoutGrid className="w-4 h-4 mr-2" /> Cards
            </ToggleGroupItem>
          </ToggleGroup>

          <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) { reset(); setSelectedLead(null); } }}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedLead(null)}>
                <Plus className="w-4 h-4 mr-2" /> New Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedLead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input placeholder="First name" {...register("firstName")} />
                <Input placeholder="Last name" {...register("lastName")} />
                <Input placeholder="Phone" {...register("phone")} />
                <Input placeholder="Email" {...register("email")} />
                <Select onValueChange={(val: InquiryMethod) => setValue("inquiryMethod", val, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Inquiry method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" className="w-full">{selectedLead ? "Update Lead" : "Save Lead"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {view === "table" ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Inquiry</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>{lead.firstName} {lead.lastName}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell className="capitalize">{lead.inquiryMethod}</TableCell>
                <TableCell className="text-right flex justify-end gap-1">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/jobsite/new?leadId=${lead.id}`)}>
                    <MapPin className="w-4 h-4 mr-1" /> Add Job Site
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(lead)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(lead.id!)} className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredLeads.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="p-4 space-y-1 relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(lead)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(lead.id!)} className="text-red-600">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="font-semibold">{lead.firstName} {lead.lastName}</div>
                <div className="text-sm text-muted-foreground">{lead.phone}</div>
                <div className="text-sm text-muted-foreground">{lead.email}</div>
                <div className="text-sm capitalize">Inquiry: {lead.inquiryMethod}</div>
                <Button onClick={() => router.push(`/dashboard/jobsite/new?leadId=${lead.id}`)} variant="outline" size="sm" className="mt-2">
                  <MapPin className="w-4 h-4 mr-1" /> Add Job Site
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}