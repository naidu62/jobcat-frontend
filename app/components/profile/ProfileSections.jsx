"use client";

import { useState } from "react";
import { GraduationCap, MapPin, Wrench, Briefcase, CalendarDays } from "lucide-react";

/**
 * Small stat/detail card used across profile sections.
 */
export function InfoCard({ icon = null, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
      {icon && (
        <span className="mt-0.5 text-blue-600 shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );
}

export function SkillBadge({ skill }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
      {skill}
    </span>
  );
}

export default function ProfileTabs({ about, education, skills, experience, location, memberSince }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <InfoCard icon={<CalendarDays size={16} />} label="Member since" value={memberSince} />
      <InfoCard icon={<Briefcase size={16} />} label="Experience" value={experience} />
      <InfoCard icon={<MapPin size={16} />} label="Location" value={location} />
      <InfoCard icon={<GraduationCap size={16} />} label="Education" value={education} />
      {skills?.length > 0 && (
        <div className="sm:col-span-2 flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
          <Wrench size={16} className="text-blue-600 mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Skills</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <SkillBadge key={s} skill={s} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
