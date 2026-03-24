"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function SearchInput() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = (e) => {
        const params = new URLSearchParams(searchParams);
        if (e.target.value) {
            params.set('search', e.target.value);
        } else {
            params.delete('search');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-4 flex-1 max-w-2xl ml-8">
            <input
                onChange={handleSearch}
                defaultValue={searchParams.get('search')?.toString()}
                type="text"
                placeholder="Search by project, client, status..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
            />
        </div>
    );
}
