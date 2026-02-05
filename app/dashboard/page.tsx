import CardWrapper, { Card } from '@/app/ui/dashboard/cards';
import ActivityChart from '@/app/ui/dashboard/activity-chart';
import LatestPays from '@/app/ui/dashboard/latest-pays';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from "react";
import {CardsSkeleton, LatestPaysSkeleton, ActivityChartSkeleton} from "@/app/ui/skeletons";

export default async function Page() {
    return (
        <main>
            <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
                Dashboard
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<CardsSkeleton />}>
                    <CardWrapper />
                </Suspense>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <Suspense fallback={<ActivityChartSkeleton />}>
                 <ActivityChart />
                </Suspense>
                <Suspense fallback={<LatestPaysSkeleton />}>
                 <LatestPays />
                </Suspense>
            </div>
        </main>
    );
}