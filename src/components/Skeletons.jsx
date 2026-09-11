import React from 'react';
import { Flex, Skeleton } from 'antd';

export const OverviewSkeleton = () => (
  <div className="zgeo-overview-tab space-y-7 animate-in fade-in duration-300">
    {/* 1. Header Skeleton */}
    <Flex justify="space-between" align="center" wrap="wrap" gap="middle" className="zgeo-section-header">
      <div className="space-y-2">
        <div className="zgeo-skeleton-box w-56 h-7" />
        <div className="zgeo-skeleton-box w-80 h-4" />
      </div>
      <Flex align="center" gap="small">
        <div className="zgeo-skeleton-box w-48 h-8 rounded-lg" />
        <div className="zgeo-skeleton-box w-28 h-8 rounded-lg" />
        <div className="zgeo-skeleton-box w-8 h-8 rounded-lg" />
      </Flex>
    </Flex>

    {/* 2. Spotlight Banner Skeleton */}
    <div className="zgeo-skeleton-card p-6 border border-slate-100">
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <Flex align="center" gap="middle">
          <div className="zgeo-skeleton-box w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <div className="zgeo-skeleton-box w-44 h-5" />
            <div className="zgeo-skeleton-box w-64 h-3.5" />
          </div>
        </Flex>
        <div className="zgeo-skeleton-box w-32 h-8 rounded-lg" />
      </Flex>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-100">
        <div className="zgeo-skeleton-box h-20 rounded-xl" />
        <div className="zgeo-skeleton-box h-20 rounded-xl" />
        <div className="zgeo-skeleton-box h-20 rounded-xl" />
      </div>
    </div>

    {/* 3. 4 Top KPI Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(k => (
        <div key={k} className="zgeo-skeleton-card p-5 border border-slate-100 space-y-4">
          <Flex justify="space-between" align="center">
            <div className="zgeo-skeleton-box w-28 h-4" />
            <div className="zgeo-skeleton-box w-8 h-8 rounded-lg" />
          </Flex>
          <div className="zgeo-skeleton-box w-20 h-7" />
          <div className="zgeo-skeleton-box w-36 h-4 rounded-full" />
        </div>
      ))}
    </div>

    {/* 4. Mid Section (Radar + Chart) Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="zgeo-skeleton-card p-6 border border-slate-100 space-y-4">
        <div className="zgeo-skeleton-box w-40 h-5" />
        <div className="zgeo-skeleton-box w-full h-44 rounded-xl" />
        <div className="space-y-2 pt-2">
          <div className="zgeo-skeleton-box w-full h-3 rounded" />
          <div className="zgeo-skeleton-box w-full h-3 rounded" />
          <div className="zgeo-skeleton-box w-3/4 h-3 rounded" />
        </div>
      </div>
      <div className="lg:col-span-2 zgeo-skeleton-card p-6 border border-slate-100 space-y-4">
        <Flex justify="space-between" align="center">
          <div className="zgeo-skeleton-box w-48 h-5" />
          <div className="zgeo-skeleton-box w-24 h-6 rounded-lg" />
        </Flex>
        <div className="zgeo-skeleton-box w-full h-56 rounded-xl" />
      </div>
    </div>

    {/* 5. Bottom Section (Attribution + Hits Stream) */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 zgeo-skeleton-card p-6 border border-slate-100 space-y-4">
        <div className="zgeo-skeleton-box w-44 h-5" />
        <div className="zgeo-skeleton-box w-full h-32 rounded-xl" />
      </div>
      <div className="zgeo-skeleton-card p-6 border border-slate-100 space-y-3">
        <div className="zgeo-skeleton-box w-36 h-5 mb-4" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-50">
            <div className="zgeo-skeleton-box w-7 h-7 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="zgeo-skeleton-box w-3/4 h-3.5" />
              <div className="zgeo-skeleton-box w-1/2 h-2.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const GeoHealthSkeleton = () => (
  <div className="zgeo-products-tab space-y-7 animate-in fade-in duration-300">
    {/* Header Skeleton */}
    <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
      <div className="space-y-2">
        <div className="zgeo-skeleton-box w-64 h-7" />
        <div className="zgeo-skeleton-box w-96 h-4" />
      </div>
      <div className="zgeo-skeleton-box w-36 h-9 rounded-xl" />
    </Flex>

    {/* Legend Grid Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="zgeo-skeleton-card p-4 flex items-center gap-3">
          <div className="zgeo-skeleton-box w-8 h-8 rounded-full flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="zgeo-skeleton-box w-28 h-4" />
            <div className="zgeo-skeleton-box w-36 h-3" />
          </div>
        </div>
      ))}
    </div>

    {/* Filter Toolbar & Table Skeleton */}
    <div className="zgeo-skeleton-card p-0 border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center gap-4">
        <div className="zgeo-skeleton-box w-72 h-9 rounded-lg" />
        <div className="zgeo-skeleton-box w-48 h-9 rounded-lg" />
      </div>
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex items-center justify-between gap-4 p-3 border-b border-slate-50">
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <div className="zgeo-skeleton-box w-11 h-11 rounded-lg flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="zgeo-skeleton-box w-48 h-4" />
                <div className="zgeo-skeleton-box w-24 h-3" />
              </div>
            </div>
            <div className="zgeo-skeleton-box w-16 h-4 hidden sm:block" />
            <div className="zgeo-skeleton-box w-24 h-6 rounded-full" />
            <div className="zgeo-skeleton-box w-20 h-4 hidden md:block" />
            <div className="zgeo-skeleton-box w-24 h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const CrawlerLogsSkeleton = () => (
  <div className="space-y-7 animate-in fade-in duration-300">
    {/* Header Skeleton */}
    <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
      <div className="space-y-2">
        <div className="zgeo-skeleton-box w-56 h-7" />
        <div className="zgeo-skeleton-box w-80 h-4" />
      </div>
      <Flex align="center" gap="small">
        <div className="zgeo-skeleton-box w-28 h-8 rounded-lg" />
        <div className="zgeo-skeleton-box w-28 h-8 rounded-lg" />
        <div className="zgeo-skeleton-box w-24 h-8 rounded-lg" />
      </Flex>
    </Flex>

    {/* Table Card Skeleton */}
    <div className="zgeo-skeleton-card p-0 border border-slate-100 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="zgeo-skeleton-box w-full sm:w-72 h-9 rounded-lg" />
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="zgeo-skeleton-box w-36 h-9 rounded-lg" />
          <div className="zgeo-skeleton-box w-32 h-9 rounded-lg" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex items-center justify-between gap-4 p-3 border-b border-slate-50">
            <div className="flex items-center gap-2.5 min-w-[140px]">
              <div className="zgeo-skeleton-box w-2.5 h-2.5 rounded-full flex-shrink-0" />
              <div className="space-y-1">
                <div className="zgeo-skeleton-box w-24 h-3.5" />
                <div className="zgeo-skeleton-box w-16 h-2.5" />
              </div>
            </div>
            <div className="space-y-1 flex-1 max-w-[200px] hidden sm:block">
              <div className="zgeo-skeleton-box w-full h-3" />
              <div className="zgeo-skeleton-box w-20 h-2.5" />
            </div>
            <div className="space-y-1 flex-1 max-w-[200px] hidden md:block">
              <div className="zgeo-skeleton-box w-full h-3" />
              <div className="zgeo-skeleton-box w-16 h-2.5" />
            </div>
            <div className="zgeo-skeleton-box w-24 h-6 rounded-lg" />
            <div className="zgeo-skeleton-box w-16 h-3 text-right" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const GenericTabSkeleton = ({ title = 'Loading...' }) => (
  <div className="space-y-7 animate-in fade-in duration-300">
    <div className="space-y-2">
      <div className="zgeo-skeleton-box w-60 h-7" />
      <div className="zgeo-skeleton-box w-80 h-4" />
    </div>
    <div className="zgeo-skeleton-card p-6 border border-slate-100 space-y-4">
      <Skeleton active paragraph={{ rows: 6 }} />
    </div>
  </div>
);
