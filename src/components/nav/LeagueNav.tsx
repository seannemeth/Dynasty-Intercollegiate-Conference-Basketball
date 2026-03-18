'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Target, ArrowUpDown, DollarSign, BarChart2, Trophy, Settings, ChevronLeft } from 'lucide-react';

interface Props {
  leagueId: string;
  leagueName: string;
  teamName: string | null;
  phase: string;
  week: number;
  season: number;
  isCommish: boolean;
  hasTeam: boolean;
}

const navItems = (leagueId: string, isCommish: boolean, hasTeam: boolean) => [
  { href: `/league/${leagueId}`,              label: 'Hub',        icon: Home,         always: true },
  { href: `/league/${leagueId}/team`,         label: 'My Team',    icon: Users,        always: false, requiresTeam: true },
  { href: `/league/${leagueId}/recruiting`,   label: 'Recruiting', icon: Target,       always: false, requiresTeam: true },
  { href: `/league/${leagueId}/portal`,       label: 'Portal',     icon: ArrowUpDown,  always: false, requiresTeam: true },
  { href: `/league/${leagueId}/nil-ad`,       label: 'NIL / AD',   icon: DollarSign,   always: false, requiresTeam: true },
  { href: `/league/${leagueId}/results`,      label: 'Results',    icon: BarChart2,    always: true },
  { href: `/league/${leagueId}/standings`,    label: 'Standings',  icon: Trophy,       always: true },
  { href: `/league/${leagueId}/commissioner`, label: 'Commish',    icon: Settings,     always: false, requiresCommish: true },
].filter(item => {
  if (item.requiresTeam && !hasTeam) return false;
  if (item.requiresCommish && !isCommish) return false;
  return true;
});

const BOTTOM_NAV_ITEMS = (leagueId: string, isCommish: boolean, hasTeam: boolean) =>
  navItems(leagueId, isCommish, hasTeam).slice(0, 5);

export default function LeagueNav({ leagueId, leagueName, teamName, phase, week, season, isCommish, hasTeam }: Props) {
  const pathname = usePathname();

  const items = navItems(leagueId, isCommish, hasTeam);
  const bottomItems = BOTTOM_NAV_ITEMS(leagueId, isCommish, hasTeam);

  const phaseLabel = {
    setup: 'Setup',
    preseason: 'Preseason',
    regular_season: `Week ${week}`,
    conf_tournament: 'Conf Tournament',
    nat_tournament: 'National Tournament',
    offseason: 'Offseason',
  }[phase] || phase;

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-56 bg-[#161b27] border-r border-[#2d3748] z-40">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-[#2d3748]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🏀</span>
            <span className="font-bold text-[#e2e8f0] text-sm truncate">{leagueName}</span>
          </div>
          <div className="text-xs text-[#64748b]">Season {season} · {phaseLabel}</div>
          {teamName && (
            <div className="mt-1.5 text-xs font-medium text-[#3b82f6]">{teamName}</div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`nav-item ${isActive ? 'active' : ''}`}>
                  <Icon size={16} className="shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Back to dashboard */}
        <div className="px-2 py-3 border-t border-[#2d3748]">
          <Link href="/dashboard">
            <div className="nav-item text-[#64748b]">
              <ChevronLeft size={16} />
              <span>All Leagues</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 bg-[#161b27] border-b border-[#2d3748] px-4 py-2.5 flex items-center justify-between safe-top">
        <Link href="/dashboard" className="text-[#64748b] p-1">
          <ChevronLeft size={20} />
        </Link>
        <div className="text-center">
          <div className="text-sm font-semibold text-[#e2e8f0] truncate max-w-[160px]">{leagueName}</div>
          <div className="text-xs text-[#64748b]">{phaseLabel}</div>
        </div>
        {teamName ? (
          <span className="text-xs text-[#3b82f6] font-medium max-w-[70px] truncate">{teamName}</span>
        ) : (
          <div className="w-16" />
        )}
      </header>

      {/* ── Mobile top spacer ── */}
      <div className="md:hidden h-14" />

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#161b27] border-t border-[#2d3748] flex safe-bottom">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={20} />
                <span className="text-[10px] leading-tight">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
