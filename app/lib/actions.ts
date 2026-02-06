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
    status: z.enum(['pending', 'received']),
    flow: z.enum(['request', 'pay']),
    date: z.string(),
    note: z.string().optional(),
});

const CreatePay = FormSchema.omit({ id: true });
export async function createPay(formData: FormData) {
    const statusValue = formData.get('status');
    const flowValue = formData.get('flow');
    const { contactId, amount, status, flow, date, note } = CreatePay.parse({
        contactId: formData.get('contactId'),
        amount: formData.get('amount'),
        status: statusValue || 'pending', // Default to 'pending' if not provided
        flow: flowValue || 'pay', // Default to 'pay' if not provided
        date: formData.get('date') || new Date().toISOString().split('T')[0],
        note: formData.get('note') || undefined,
    });

    const amountInCents = Math.round(amount * 100); // Convert to cents
    const id = randomUUID();

    try {
        const db = getDb();
        db.prepare(`
            INSERT INTO pays (id, contact_id, amount, status, flow, date, note)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, contactId, amountInCents, status, flow, date, note || null);

        revalidatePath('/dashboard/pays');
        revalidatePath('/dashboard');
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to create pay.');
    }

    // redirect() throws a special error that Next.js handles - don't catch it
    redirect('/dashboard/pays');
}

const CreateGroupPaySchema = z.object({
    contactIds: z.array(z.string()).min(1, 'At least one contact is required'),
    amount: z.coerce.number().positive('Amount must be positive'),
    status: z.enum(['pending', 'received']),
    flow: z.enum(['request', 'pay']),
    date: z.string(),
    note: z.string().optional(),
});

export async function createGroupPay(formData: FormData) {
    const statusValue = formData.get('status');
    const flowValue = formData.get('flow');
    const contactIdsRaw = formData.getAll('contactIds');
    const contactIds = contactIdsRaw.map(id => String(id));

    const { amount, status, flow, date, note } = CreateGroupPaySchema.parse({
        contactIds,
        amount: formData.get('amount'),
        status: statusValue || 'pending',
        flow: flowValue || 'pay',
        date: formData.get('date') || new Date().toISOString().split('T')[0],
        note: formData.get('note') || undefined,
    });

    if (contactIds.length === 0) {
        throw new Error('At least one contact is required');
    }

    // Split amount evenly among all contacts
    const amountPerContact = amount / contactIds.length;
    const amountPerContactInCents = Math.round(amountPerContact * 100);

    try {
        const db = getDb();
        const insertPay = db.prepare(`
            INSERT INTO pays (id, contact_id, amount, status, flow, date, note)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        // Use a transaction to ensure all pays are created or none
        const transaction = db.transaction((contacts: string[]) => {
            for (const contactId of contacts) {
                const id = randomUUID();
                insertPay.run(id, contactId, amountPerContactInCents, status, flow, date, note || null);
            }
        });

        transaction(contactIds);

        revalidatePath('/dashboard/pays');
        revalidatePath('/dashboard');
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to create group pay.');
    }

    // redirect() throws a special error that Next.js handles - don't catch it
    redirect('/dashboard/pays');
}

const UpdatePay = FormSchema;
export async function updatePay(id: string, formData: FormData) {
    const { contactId, amount, status, flow, date, note } = UpdatePay.parse({
        id,
        contactId: formData.get('contactId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
        flow: formData.get('flow'),
        date: formData.get('date'),
        note: formData.get('note') || undefined,
    });

    const amountInCents = Math.round(amount * 100); // Convert to cents

    try {
        const db = getDb();
        db.prepare(`
            UPDATE pays
            SET contact_id = ?, amount = ?, status = ?, flow = ?, date = ?, note = ?
            WHERE id = ?
        `).run(contactId, amountInCents, status, flow, date, note || null, id);

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
