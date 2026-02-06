import Form from '@/app/ui/pays/edit-form';
import Breadcrumbs from '@/app/ui/pays/breadcrumbs';
import { fetchPayById } from '@/app/lib/data';
import { fetchContacts } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { PayForm } from '@/app/lib/definitions';

export default async function Page({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const [pay, contacts] = await Promise.all([
        fetchPayById(id),
        fetchContacts(),
    ]);

    if (!pay) {
        notFound();
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Pays', href: '/dashboard/pays' },
                    {
                        label: 'Edit Pay',
                        href: `/dashboard/pays/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            <Form pay={pay as PayForm} contacts={contacts} />
        </main>
    );
}

