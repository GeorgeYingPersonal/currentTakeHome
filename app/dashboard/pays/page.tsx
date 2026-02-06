import Pagination from '@/app/ui/pays/pagination';
import { fetchPaysPages } from "@/app/lib/data";
import Search from '@/app/ui/search';
import Table from '@/app/ui/pays/table';
import Filters from '@/app/ui/pays/filters';
import { CreatePay, CreateGroupPay } from '@/app/ui/pays/buttons';
import { lusitana } from '@/app/ui/fonts';
import { PaysTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';

export default async function Page({
    searchParams,
}: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
        status?: string;
        flow?: string;
        dateFrom?: string;
        dateTo?: string;
    }> | {
        query?: string;
        page?: string;
        status?: string;
        flow?: string;
        dateFrom?: string;
        dateTo?: string;
    }
}) {
    const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : searchParams;
    const query = resolvedSearchParams?.query || '';
    const status = resolvedSearchParams?.status;
    const flow = resolvedSearchParams?.flow;
    const dateFrom = resolvedSearchParams?.dateFrom;
    const dateTo = resolvedSearchParams?.dateTo;
    const currentPage = Number(resolvedSearchParams?.page) || 1;

    const totalPages = await fetchPaysPages(query, status, flow, dateFrom, dateTo);

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Pays</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search pays..." />
                <div className="flex gap-2">
                    <CreatePay />
                    <CreateGroupPay />
                </div>
            </div>
            <Filters />
            <Suspense key={`${query}-${currentPage}-${status || 'all'}-${flow || 'all'}-${dateFrom || ''}-${dateTo || ''}`} fallback={<PaysTableSkeleton />}>
                <Table query={query} currentPage={currentPage} status={status} flow={flow} dateFrom={dateFrom} dateTo={dateTo} />
            </Suspense>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    );
}