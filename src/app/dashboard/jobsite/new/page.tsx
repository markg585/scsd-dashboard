'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
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
import { cn } from '@/lib/utils'

const TAG_OPTIONS = ['Urgent', 'Prep', 'Follow-up', 'High Priority', 'Customer Call']

const jobsiteSchema = z.object({
  address: z.string().min(1),
  suburb: z.string().min(1),
  notes: z.string().optional(),
  profiling: z.boolean(),
  roadBase: z.boolean(),
  bitumen: z.boolean(),
  asphalt: z.boolean(),
  tags: z.array(z.string()).optional(),
})

type Jobsite = z.infer<typeof jobsiteSchema>

export default function NewJobsitePage() {
  const params = useSearchParams()
  const leadId = params.get('leadId')
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Jobsite>({ resolver: zodResolver(jobsiteSchema) })

  const selectedTags = watch('tags') ?? []

  const onSubmit = async (data: Jobsite) => {
    if (!leadId) return

    await addDoc(collection(db, 'leads', leadId as string, 'jobsites'), {
      ...data,
      createdAt: serverTimestamp(),
    })

    toast.success('Job site added')
    router.push(`/dashboard/leads/${leadId}`)
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Add Job Site</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input placeholder="Address" {...register('address')} />
        <Input placeholder="Suburb" {...register('suburb')} />
        <Input placeholder="Notes (optional)" {...register('notes')} />

        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" {...register('profiling')} className="mr-2" />
            Profiling
          </label>
          <label className="flex items-center">
            <input type="checkbox" {...register('roadBase')} className="mr-2" />
            Road Base
          </label>
          <label className="flex items-center">
            <input type="checkbox" {...register('bitumen')} className="mr-2" />
            Bitumen
          </label>
          <label className="flex items-center">
            <input type="checkbox" {...register('asphalt')} className="mr-2" />
            Asphalt
          </label>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Tags</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {selectedTags.length > 0 ? selectedTags.join(', ') : 'Select tags'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search tags..." />
                <CommandList>
                  {TAG_OPTIONS.map((tag) => (
                    <CommandItem key={tag} className="p-2">
                      <label className="flex items-center gap-2 w-full cursor-pointer">
                        <Checkbox
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => {
                            const updated = selectedTags.includes(tag)
                              ? selectedTags.filter((t) => t !== tag)
                              : [...selectedTags, tag]
                            setValue('tags', updated, { shouldValidate: true })
                          }}
                        />
                        <span>{tag}</span>
                      </label>
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <Button type="submit" className="w-full">Save Job Site</Button>
      </form>
    </div>
  )
}