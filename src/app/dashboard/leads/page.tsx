'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthState } from 'react-firebase-hooks/auth'
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { MapPin, Plus, ArrowDown, ArrowUp } from 'lucide-react'

const TAG_OPTIONS = ['Urgent', 'Prep', 'Follow-up', 'High Priority', 'Customer Call']

type Jobsite = {
  id: string
  address: string
  suburb: string
  createdAt?: { seconds: number }
  profiling?: boolean
  roadBase?: boolean
  bitumen?: boolean
  asphalt?: boolean
  tags?: string[]
}

type Lead = {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  inquiryMethod: string
  jobsites?: Jobsite[]
}

const updateJobsiteTags = async (
  leadId: string,
  jobsiteId: string,
  tags: string[]
) => {
  const ref = doc(db, 'leads', leadId, 'jobsites', jobsiteId)
  await updateDoc(ref, { tags })
}

export default function LeadsPage() {
  const router = useRouter()
  const [user] = useAuthState(auth)
  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days'>('all')
  const [sortAsc, setSortAsc] = useState(false)
  const [editingTags, setEditingTags] = useState<{ [jobId: string]: boolean }>({})
  const [updatingTag, setUpdatingTag] = useState('')

  useEffect(() => {
    const fetchLeadsAndJobs = async () => {
      const leadSnap = await getDocs(collection(db, 'leads'))
      const rawLeads = leadSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Lead[]

      const leadsWithJobs: Lead[] = await Promise.all(
        rawLeads.map(async (lead) => {
          const jobsiteSnap = await getDocs(collection(db, 'leads', lead.id, 'jobsites'))
          const jobsites = jobsiteSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Jobsite[]
          return { ...lead, jobsites }
        })
      )

      setLeads(leadsWithJobs)
    }

    fetchLeadsAndJobs()
  }, [])

  const toggleTag = async (leadId: string, job: Jobsite, tag: string) => {
    const tags = new Set(job.tags ?? [])
    tags.has(tag) ? tags.delete(tag) : tags.add(tag)
    setUpdatingTag(job.id)
    await updateJobsiteTags(leadId, job.id, Array.from(tags))
    setUpdatingTag('')
  }

  const filterAndSortJobsites = (jobsites: Jobsite[] = []) => {
    return jobsites
      .filter((job) => {
        if (!job.createdAt || dateFilter === 'all') return true
        const jobDate = new Date(job.createdAt.seconds * 1000)
        const now = new Date()
        const diffDays = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24)
        if (dateFilter === '7days') return diffDays <= 7
        if (dateFilter === '30days') return diffDays <= 30
        return true
      })
      .sort((a, b) => {
        const aTime = a.createdAt?.seconds ?? 0
        const bTime = b.createdAt?.seconds ?? 0
        return sortAsc ? aTime - bTime : bTime - aTime
      })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2 items-center">
          <Select onValueChange={(val) => setDateFilter(val as any)} defaultValue="all">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => setSortAsc((s) => !s)}>
            {sortAsc ? <><ArrowUp className="w-4 h-4 mr-1" /> Oldest</> : <><ArrowDown className="w-4 h-4 mr-1" /> Newest</>}
          </Button>

          <Button onClick={() => router.push('/dashboard/jobsite/new')}>
            <Plus className="w-4 h-4 mr-2" /> New Lead
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Jobsites</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads
            .filter((lead) => `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(search.toLowerCase()))
            .map((lead) => {
              const jobs = filterAndSortJobsites(lead.jobsites)
              return (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.firstName} {lead.lastName}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {jobs.length === 0 && <div className="text-sm text-muted-foreground">No jobsites</div>}
                      {jobs.length > 0 && (
                        <>
                          <JobsiteCard
                            job={jobs[0]}
                            leadId={lead.id}
                            editingTags={editingTags}
                            setEditingTags={setEditingTags}
                            updatingTag={updatingTag}
                            toggleTag={toggleTag}
                          />
                          {jobs.length > 1 && (
                            <Accordion type="single" collapsible>
                              <AccordionItem value="more">
                                <AccordionTrigger className="text-xs text-muted-foreground">
                                  + {jobs.length - 1} more jobsite{jobs.length - 1 > 1 ? 's' : ''}
                                </AccordionTrigger>
                                <AccordionContent className="space-y-2 mt-2">
                                  {jobs.slice(1).map((job) => (
                                    <JobsiteCard
                                      key={job.id}
                                      job={job}
                                      leadId={lead.id}
                                      editingTags={editingTags}
                                      setEditingTags={setEditingTags}
                                      updatingTag={updatingTag}
                                      toggleTag={toggleTag}
                                    />
                                  ))}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/jobsite/new?leadId=${lead.id}`)}
                    >
                      <MapPin className="w-4 h-4 mr-1" /> Add Job Site
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </div>
  )
}

function JobsiteCard({
  job,
  leadId,
  editingTags,
  setEditingTags,
  updatingTag,
  toggleTag,
}: {
  job: Jobsite
  leadId: string
  editingTags: { [id: string]: boolean }
  setEditingTags: React.Dispatch<React.SetStateAction<{ [id: string]: boolean }>>
  updatingTag: string
  toggleTag: (leadId: string, job: Jobsite, tag: string) => Promise<void>
}) {
  const createdAt = job.createdAt ? new Date(job.createdAt.seconds * 1000) : null
  const isNew = createdAt && Date.now() - createdAt.getTime() < 7 * 86400000

  return (
    <div className="border rounded-md p-2 bg-muted text-muted-foreground">
      <div className="font-medium">{job.address}</div>
      <div className="text-xs">{job.suburb}</div>
      <div className="text-xs space-x-2">
        {job.profiling && <span>Profiling</span>}
        {job.roadBase && <span>Road Base</span>}
        {job.bitumen && <span>Bitumen</span>}
        {job.asphalt && <span>Asphalt</span>}
      </div>
      {createdAt && (
        <div className="text-xs mt-1">
          Added: {createdAt.toLocaleDateString()}
          {isNew && (
            <span className="ml-2 text-green-600 bg-green-100 px-2 py-0.5 rounded-full text-xs">New</span>
          )}
        </div>
      )}
      {job.tags?.length > 0 && (
        <div className="text-xs mt-1 flex flex-wrap gap-1">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-[11px]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <Popover
        open={editingTags[job.id] || false}
        onOpenChange={(open) => {
          setEditingTags((prev) => ({ ...prev, [job.id]: open }))
        }}
      >
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="px-1 text-xs text-blue-600">
            Edit Tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              {TAG_OPTIONS.map((tag) => {
                const isChecked = job.tags?.includes(tag)
                return (
                  <CommandItem key={tag} className="p-2">
                    <label className="flex items-center gap-2 w-full cursor-pointer">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleTag(leadId, job, tag)}
                        disabled={updatingTag === job.id}
                      />
                      <span>{tag}</span>
                    </label>
                  </CommandItem>
                )
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}