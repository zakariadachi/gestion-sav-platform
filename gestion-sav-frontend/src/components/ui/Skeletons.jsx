/**
 * src/components/ui/Skeletons.jsx
 *
 * Reusable skeleton loader components.
 * All use Tailwind animate-pulse with neutral colors that
 * blend with the existing slate/zinc palette in light and dark mode.
 */

/* ─── Base atom ─────────────────────────────────────────────────── */
export function Skeleton({ className = '' }) {
    return (
        <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-zinc-700/60 ${className}`} />
    );
}

/* ─── CardSkeleton ──────────────────────────────────────────────── */
/**
 * Mimics a stat/metric card (icon + big number + label).
 * Used in Dashboard.jsx to replace the loading spinner grid.
 */
export function CardSkeleton() {
    return (
        <div className="dc-stat-card" style={{ height: '108px', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px' }}>
            {/* icon placeholder */}
            <div className="animate-pulse rounded-xl bg-slate-200 dark:bg-zinc-700/60 shrink-0" style={{ width: 44, height: 44 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* value */}
                <div className="animate-pulse rounded-md bg-slate-200 dark:bg-zinc-700/60" style={{ height: 24, width: '45%' }} />
                {/* label */}
                <div className="animate-pulse rounded-md bg-slate-200 dark:bg-zinc-700/60" style={{ height: 10, width: '65%' }} />
            </div>
        </div>
    );
}

/* ─── TableSkeleton ─────────────────────────────────────────────── */
/**
 * Renders `rows` pulsing table rows that mimic the real ticket table.
 * Column widths match: ID | Title | Client | Technician | Priority | Status | Date
 */
const COL_WIDTHS = [32, 180, 100, 120, 80, 110, 80];

export function TableRowSkeleton() {
    return (
        <tr>
            {COL_WIDTHS.map((w, i) => (
                <td key={i} className="tk-td" style={{ padding: '14px 16px' }}>
                    {i === 1 ? (
                        /* Title column: two lines */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div className="animate-pulse rounded-md bg-slate-200 dark:bg-zinc-700/60" style={{ height: 12, width: w }} />
                            <div className="animate-pulse rounded-md bg-slate-200 dark:bg-zinc-700/60" style={{ height: 9, width: w * 0.6 }} />
                        </div>
                    ) : i === 3 ? (
                        /* Technician column: avatar + name */
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="animate-pulse rounded-full bg-slate-200 dark:bg-zinc-700/60" style={{ width: 28, height: 28, flexShrink: 0 }} />
                            <div className="animate-pulse rounded-md bg-slate-200 dark:bg-zinc-700/60" style={{ height: 11, width: 80 }} />
                        </div>
                    ) : i === 5 ? (
                        /* Status column: pill shape */
                        <div className="animate-pulse rounded-full bg-slate-200 dark:bg-zinc-700/60" style={{ height: 22, width: w }} />
                    ) : (
                        <div className="animate-pulse rounded-md bg-slate-200 dark:bg-zinc-700/60" style={{ height: 12, width: w }} />
                    )}
                </td>
            ))}
        </tr>
    );
}

export function TableSkeleton({ rows = 6 }) {
    return (
        <>
            {Array.from({ length: rows }, (_, i) => <TableRowSkeleton key={i} />)}
        </>
    );
}

/* ─── TicketDetailSkeleton ──────────────────────────────────────── */
/**
 * Full-page skeleton for TicketDetail.jsx.
 * Mimics: hero card → description card → timeline card → chat panel → info sidebar.
 */
export function TicketDetailSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full flex flex-col gap-6" style={{ marginTop: '20px' }}>

            {/* Hero card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80 shadow-sm overflow-hidden">
                <div className="h-1 animate-pulse bg-slate-200 dark:bg-zinc-700/60" />
                <div className="p-6 md:px-8 md:py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col gap-3 flex-1">
                        {/* badge row */}
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-6 w-28 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        {/* title */}
                        <Skeleton className="h-7 w-3/4" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                    <Skeleton className="h-9 w-36 rounded-xl shrink-0" />
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* Left column */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Description card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded-md" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <div className="p-6 flex flex-col gap-2.5">
                            <Skeleton className="h-3.5 w-full" />
                            <Skeleton className="h-3.5 w-5/6" />
                            <Skeleton className="h-3.5 w-4/6" />
                            <Skeleton className="h-3.5 w-full" />
                            <Skeleton className="h-3.5 w-3/4" />
                        </div>
                    </div>

                    {/* Timeline card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded-md" />
                            <Skeleton className="h-4 w-44" />
                        </div>
                        <div className="p-6 md:p-8 flex flex-col gap-0">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="flex gap-4 relative">
                                    {i < 2 && (
                                        <div className="absolute left-[15px] top-[32px] bottom-[-8px] w-0.5 bg-slate-100 dark:bg-zinc-800 z-0" />
                                    )}
                                    <Skeleton className="w-8 h-8 rounded-full shrink-0 z-10" />
                                    <div className={`flex-1 flex flex-col gap-2 ${i < 2 ? 'pb-6' : ''}`}>
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-3 w-64" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat panel */}
                    <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                        {/* header */}
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-5 w-8 rounded-full ml-auto" />
                        </div>
                        {/* messages */}
                        <div className="p-4 flex flex-col gap-3 min-h-[180px]">
                            {[
                                { align: 'left',  widths: [200, 140] },
                                { align: 'right', widths: [160, 100] },
                                { align: 'left',  widths: [220, 80]  },
                            ].map(({ align, widths }, i) => (
                                <div key={i} className={`flex gap-2 items-end ${align === 'right' ? 'flex-row-reverse' : ''}`}>
                                    {align === 'left' && <Skeleton className="w-6 h-6 rounded-full shrink-0" />}
                                    <div className="flex flex-col gap-1.5">
                                        {widths.map((w, j) => (
                                            <Skeleton key={j} className="h-3 rounded-lg" style={{ width: w }} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* input bar */}
                        <div className="px-3 py-3 border-t border-slate-100 dark:border-zinc-800 flex gap-2">
                            <Skeleton className="flex-1 h-9 rounded-xl" />
                            <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                        </div>
                    </div>
                </div>

                {/* Right column — info sidebar */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-zinc-800/80">
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            {[140, 100, 120, 130, 110, 100].map((w, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <Skeleton className="h-2.5 w-16" />
                                        <Skeleton className="h-3.5" style={{ width: w }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Skeleton className="h-40 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
