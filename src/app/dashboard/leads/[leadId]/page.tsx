// src/app/dashboard/leads/[leadId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'

type Lead = {
  firstName: string
  lastName: string
}

type Jobsite = {
  id: string
  address: string
  suburb: string
  notes?: string
  profiling?: boolean
  roadBase?: boolean
  bitumen?: boolean
  asphalt?: boolean
}

export default function LeadDetailPage() {
  const { leadId } = useParams()
  const router = useRouter()

  const [lead, setLead] = useState<Lead | null>(null)
  const [jobsites, setJobsites] = useState<Jobsite[]>([])

  useEffect(() => {
    if (!leadId) return

    const fetchLeadAndJobsites = async () => {
      // Get lead info
      const leadSnap = await getDoc(doc(db, 'leads', leadId as string))
      if (leadSnap.exists()) {
        const data = leadSnap.data()
        setLead({ firstName: data.firstName, lastName: data.lastName })
      }

      // Get job sites
      const jobsiteSnap = await getDocs(
        collection(db, 'leads', leadId as string, 'jobsites')
      )

      const jobsiteList = jobsiteSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Jobsite[]

      setJobsites(jobsiteList)
    }

    fetchLeadAndJobsites()
  }, [leadId])

  if (!lead) {
    return <div className="p-6">Loading lead...</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {lead.firstName} {lead.lastName}
        </h2>
        <Button
          onClick={() => router.push(`/dashboard/jobsite/new?leadId=${leadId}`)}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Job Site
        </Button>
      </div>

      <div className="grid gap-4">
        {jobsites.length === 0 ? (
          <div className="text-muted-foreground">No job sites yet.</div>
        ) : (
          jobsites.map((job) => (
            <Card key={job.id} className="p-4 space-y-2">
              <div className="font-medium">{job.address}</div>
              <div className="text-sm text-muted-foreground">{job.suburb}</div>
              {job.notes && (
                <div className="text-sm text-muted-foreground">Note: {job.notes}</div>
              )}

              {/* Show the selected features */}
              <div className="space-x-2 text-sm text-muted-foreground">
                {job.profiling && <span>Profiling</span>}
                {job.roadBase && <span>Road Base</span>}
                {job.bitumen && <span>Bitumen</span>}
                {job.asphalt && <span>Asphalt</span>}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  router.push(
                    `/dashboard/quote/new?leadId=${leadId}&jobsiteId=${job.id}`
                  )
                }
              >
                Add Quote
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
