'use server'

import { z } from 'zod'

const FormSchema = z.object({
    id: z.string(),
    contactId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreatePay = FormSchema.omit({ id: true, date: true });
export async function createPay(formData: FormData) {
    const { contactId, amount, status } = CreatePay.parse({
        contactId: formData.get('contactId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0]
}