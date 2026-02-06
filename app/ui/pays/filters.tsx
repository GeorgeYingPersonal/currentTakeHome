'use client';

import { FunnelIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function Filters() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (status && status !== 'all') {
            params.set('status', status);
        } else {
            params.delete('status');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const handleFlowChange = (flow: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (flow && flow !== 'all') {
            params.set('flow', flow);
        } else {
            params.delete('flow');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const handleDateFromChange = useDebouncedCallback((date: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (date) {
            params.set('dateFrom', date);
        } else {
            params.delete('dateFrom');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleDateToChange = useDebouncedCallback((date: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (date) {
            params.set('dateTo', date);
        } else {
            params.delete('dateTo');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams);
        params.delete('status');
        params.delete('flow');
        params.delete('dateFrom');
        params.delete('dateTo');
        params.set('page', '1');
        replace(`${pathname}?${params.toString()}`);
    };

    const hasActiveFilters = searchParams.get('status') ||
        searchParams.get('flow') ||
        searchParams.get('dateFrom') ||
        searchParams.get('dateTo');

    return (
        <div className="rounded-lg bg-gray-50 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
                <FunnelIcon className="h-5 w-5 text-gray-500" />
                <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="ml-auto text-xs text-blue-600 hover:text-blue-800"
                    >
                        Clear all
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Status Filter */}
                <div>
                    <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-700">
                        Status
                    </label>
                    <select
                        id="status"
                        key={searchParams.get('status') || 'all'}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        value={searchParams.get('status') || 'all'}
                        className="block w-full rounded-md border border-gray-200 py-2 pl-3 pr-10 text-sm outline-2 placeholder:text-gray-500"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="received">Received</option>
                    </select>
                </div>

                {/* Flow Filter */}
                <div>
                    <label htmlFor="flow" className="mb-1 block text-xs font-medium text-gray-700">
                        Flow
                    </label>
                    <select
                        id="flow"
                        key={searchParams.get('flow') || 'all'}
                        onChange={(e) => handleFlowChange(e.target.value)}
                        value={searchParams.get('flow') || 'all'}
                        className="block w-full rounded-md border border-gray-200 py-2 pl-3 pr-10 text-sm outline-2 placeholder:text-gray-500"
                    >
                        <option value="all">All Flow</option>
                        <option value="request">Request</option>
                        <option value="pay">Pay</option>
                    </select>
                </div>

                {/* Date From Filter */}
                <div>
                    <label htmlFor="dateFrom" className="mb-1 block text-xs font-medium text-gray-700">
                        From Date
                    </label>
                    <div className="relative">
                        <input
                            id="dateFrom"
                            type="date"
                            onChange={(e) => handleDateFromChange(e.target.value)}
                            defaultValue={searchParams.get('dateFrom') || ''}
                            className="block w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm outline-2 placeholder:text-gray-500"
                        />
                        <CalendarIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                </div>

                {/* Date To Filter */}
                <div>
                    <label htmlFor="dateTo" className="mb-1 block text-xs font-medium text-gray-700">
                        To Date
                    </label>
                    <div className="relative">
                        <input
                            id="dateTo"
                            type="date"
                            onChange={(e) => handleDateToChange(e.target.value)}
                            defaultValue={searchParams.get('dateTo') || ''}
                            className="block w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm outline-2 placeholder:text-gray-500"
                        />
                        <CalendarIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}

