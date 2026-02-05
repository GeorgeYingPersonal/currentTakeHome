import {
    ArrowsRightLeftIcon,
  WalletIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import {fetchCardData} from "@/app/lib/data";

const iconMap = {
  collected: WalletIcon,
  contacts: UserGroupIcon,
  pending: ClockIcon,
  pays: ArrowsRightLeftIcon,
};

export default async function CardWrapper() {
    const {
        numberOfPays,
        numberOfContacts,
        totalPaidPays,
        totalPendingPays,
    } = await fetchCardData();

  return (
    <>
      {/* NOTE: Uncomment this code in Chapter 9 */}

      <Card title="Received" value={totalPaidPays} type="collected" />
      <Card title="Pending" value={totalPendingPays} type="pending" />
      <Card title="Total Pays" value={numberOfPays} type="pays" />
      <Card
        title="Total Contacts"
        value={numberOfContacts}
        type="contacts"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'pays' | 'contacts' | 'pending' | 'collected';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
