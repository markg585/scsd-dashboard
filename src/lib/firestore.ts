import { db } from './firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'

import type { Customer, Quote, Invoice, JobSite } from '@/types/firestore'

// 🔗 Collection references
const customersRef = collection(db, 'customers')
const quotesRef = collection(db, 'quotes')
const invoicesRef = collection(db, 'invoices')
const jobSitesRef = collection(db, 'jobSites')

/* ------------------ Customers ------------------ */

export async function addCustomer(data: Omit<Customer, 'id'>) {
  const docRef = await addDoc(customersRef, {
    ...data,
    createdAt: Timestamp.now(),
  })
  return { id: docRef.id }
}

export async function updateCustomer(id: string, data: Partial<Customer>) {
  const ref = doc(customersRef, id)
  await updateDoc(ref, data)
}

export async function deleteCustomer(id: string) {
  const ref = doc(customersRef, id)
  await deleteDoc(ref)
}

export async function getAllCustomers(): Promise<Customer[]> {
  const snapshot = await getDocs(customersRef)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Customer[]
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const ref = doc(customersRef, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Customer
}

/* ------------------ Quotes ------------------ */

export async function addQuote(data: Omit<Quote, 'id' | 'createdAt'>) {
  const docRef = await addDoc(quotesRef, {
    ...data,
    createdAt: Timestamp.now(),
  })
  await updateCustomer(data.customerId, { quoteId: docRef.id })
  return docRef.id
}

export async function getAllQuotes(): Promise<Quote[]> {
  const snapshot = await getDocs(quotesRef)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Quote[]
}

export async function getCustomerQuotes(customerId: string): Promise<Quote[]> {
  const q = query(quotesRef, where('customerId', '==', customerId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Quote[]
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  const ref = doc(quotesRef, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return {
    id: snap.id,
    ...snap.data(),
  } as Quote
}

/* ------------------ Job Sites ------------------ */

export async function addJobSite(data: Omit<JobSite, 'id' | 'createdAt'>) {
  const docRef = await addDoc(jobSitesRef, {
    ...data,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

export async function getJobSitesForCustomer(customerId: string): Promise<JobSite[]> {
  if (!customerId) return []
  const q = query(jobSitesRef, where('customerId', '==', customerId))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as JobSite[]
}

export async function updateJobSite(id: string, data: Partial<JobSite>) {
  const ref = doc(jobSitesRef, id)
  await updateDoc(ref, data)
}

export async function deleteJobSite(id: string) {
  const ref = doc(jobSitesRef, id)
  await deleteDoc(ref)
}

/* ------------------ Invoices (placeholder) ------------------ */

// export async function addInvoice(...) {}
// export async function getInvoiceByQuote(...) {}
