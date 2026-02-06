'use server'

import { z } from 'zod'
import { getDb } from './db';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    contactId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
    note: z.string().optional(),
});

const CreatePay = FormSchema.omit({ id: true });
export async function createPay(formData: FormData) {
    const statusValue = formData.get('status');
    const { contactId, amount, status, date, note } = CreatePay.parse({
        contactId: formData.get('contactId'),
        amount: formData.get('amount'),
        status: statusValue || 'pending', // Default to 'pending' if not provided
        date: formData.get('date') || new Date().toISOString().split('T')[0],
        note: formData.get('note') || undefined,
    });

    const amountInCents = Math.round(amount * 100); // Convert to cents
    const id = randomUUID();

    try {
        const db = getDb();
        db.prepare(`
            INSERT INTO pays (id, contact_id, amount, status, date, note)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, contactId, amountInCents, status, date, note || null);

        revalidatePath('/dashboard/pays');
        revalidatePath('/dashboard');
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to create pay.');
    }

    // redirect() throws a special error that Next.js handles - don't catch it
    redirect('/dashboard/pays');
}

const UpdatePay = FormSchema;
export async function updatePay(id: string, formData: FormData) {
    const { contactId, amount, status, date, note } = UpdatePay.parse({
        id,
        contactId: formData.get('contactId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
        date: formData.get('date'),
        note: formData.get('note') || undefined,
    });

    const amountInCents = Math.round(amount * 100); // Convert to cents

    try {
        const db = getDb();
        db.prepare(`
            UPDATE pays
            SET contact_id = ?, amount = ?, status = ?, date = ?, note = ?
            WHERE id = ?
        `).run(contactId, amountInCents, status, date, note || null, id);

        revalidatePath('/dashboard/pays');
        revalidatePath('/dashboard');
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to update pay.');
    }

    // redirect() throws a special error that Next.js handles - don't catch it
    redirect('/dashboard/pays');
}

export async function deletePay(id: string) {
    try {
        const db = getDb();
        db.prepare('DELETE FROM pays WHERE id = ?').run(id);

        revalidatePath('/dashboard/pays');
        revalidatePath('/dashboard');
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to delete pay.');
    }

    // redirect() throws a special error that Next.js handles - don't catch it
    redirect('/dashboard/pays');
}
