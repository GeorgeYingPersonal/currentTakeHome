import Form from '@/app/ui/pays/create-form';
import Breadcrumbs from '@/app/ui/pays/breadcrumbs';
import { fetchContacts } from '@/app/lib/data';

export default async function Page() {
    const contacts = await fetchContacts();

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Pays', href: '/dashboard/pays' },
                    {
                        label: 'Create Pay',
                        href: '/dashboard/pays/create',
                        active: true,
                    },
                ]}
            />
            <Form contacts={contacts} />
        </main>
    );
}