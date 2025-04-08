'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const leadSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().min(6, 'Enter a valid number'),
  email: z.string().email('Enter a valid email'),
  inquiryMethod: z.string().min(1, 'Required'),
})

type LeadFormData = z.infer<typeof leadSchema>

export default function NewLeadForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      inquiryMethod: 'Phone',
    },
  })

  const onSubmit = async (data: LeadFormData) => {
    try {
      await addDoc(collection(db, 'leads'), {
        ...data,
        createdAt: serverTimestamp(),
      })
      toast.success('Lead created')
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      toast.error('Failed to create lead')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">New Lead</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>First Name</Label>
              <Input {...register('firstName')} />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
            </div>

            <div>
              <Label>Last Name</Label>
              <Input {...register('lastName')} />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
            </div>

            <div>
              <Label>Phone</Label>
              <Input type="tel" {...register('phone')} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>

            <div>
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <Label>Inquiry Method</Label>
              <Input placeholder="e.g. Phone, Web Form, SMS" {...register('inquiryMethod')} />
              {errors.inquiryMethod && <p className="text-sm text-red-500">{errors.inquiryMethod.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Lead'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}