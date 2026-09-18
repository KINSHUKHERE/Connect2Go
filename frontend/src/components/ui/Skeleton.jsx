import React from 'react';

export function ActivitySkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-4 shadow-soft animate-pulse">
      <div className="h-40 bg-slate-100 rounded-xl w-full" />
      <div className="flex items-center justify-between">
        <div className="h-5 bg-slate-200 rounded-full w-24" />
        <div className="h-4 bg-slate-100 rounded-full w-16" />
      </div>
      <div className="h-5 bg-slate-200 rounded-md w-3/4" />
      <div className="h-3.5 bg-slate-100 rounded-md w-full" />
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200" />
          <div className="h-3.5 bg-slate-200 rounded-md w-20" />
        </div>
        <div className="h-8 bg-slate-200 rounded-md w-20" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 space-y-6 max-w-2xl mx-auto animate-pulse">
      <div className="flex items-center gap-4 pb-6 border-b border-border/80">
        <div className="w-20 h-20 rounded-full bg-slate-200 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-slate-200 rounded-md w-44" />
          <div className="h-4 bg-slate-100 rounded-md w-28" />
          <div className="h-3 bg-slate-100 rounded-md w-36" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
        <div className="h-10 bg-slate-200 rounded-md" />
        <div className="h-10 bg-slate-200 rounded-md" />
        <div className="h-10 bg-slate-200 rounded-md" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded-md w-24" />
        <div className="h-14 bg-slate-100 rounded-md w-full" />
      </div>
    </div>
  );
}

export function UserTableSkeleton({ rows = 5 }) {
  return (
    <div className="divide-y divide-border/80 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 bg-slate-200 rounded-md w-32" />
              <div className="h-3 bg-slate-100 rounded-md w-44" />
            </div>
          </div>
          <div className="h-5 bg-slate-200 rounded-full w-16 hidden sm:block" />
          <div className="h-4 bg-slate-100 rounded-md w-24 hidden md:block" />
          <div className="h-7 bg-slate-200 rounded-md w-16" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-36 bg-white rounded-2xl border border-border p-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <ActivitySkeleton />
        <ActivitySkeleton />
        <ActivitySkeleton />
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-full bg-slate-200" />
        <div className="h-10 bg-slate-100 rounded-2xl rounded-tl-none w-48" />
      </div>
      <div className="flex items-start gap-2.5 justify-end">
        <div className="h-12 bg-brand-100 rounded-2xl rounded-tr-none w-56" />
        <div className="w-7 h-7 rounded-full bg-slate-200" />
      </div>
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-full bg-slate-200" />
        <div className="h-8 bg-slate-100 rounded-2xl rounded-tl-none w-36" />
      </div>
    </div>
  );
}
