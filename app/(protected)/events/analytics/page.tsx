import { Card, CardContent } from '@/components/ui/card'
import { EventTeamsAnalytics } from '@/components/events/EventTeamsAnalytics'
import { Users, CalendarDays, Trophy, UserCheck } from 'lucide-react'
import analyticsData from '@/data/event-teams-analytics.json'

export default function EventAnalyticsPage() {
  const { summary, leaderboard, events } = analyticsData

  const stats = [
    { label: 'Total Participations', value: summary.total_participations, icon: CalendarDays },
    { label: 'Volunteers', value: summary.unique_volunteers, icon: Users },
    { label: 'Linked to Members', value: summary.matched_to_members, icon: UserCheck },
    { label: 'Events Tracked', value: summary.total_events, icon: Trophy },
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Event Teams Analytics</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Volunteer participation across {summary.sheets.length} months of events
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent>
                <Icon className="h-4 w-4 text-muted-foreground mb-3" />
                <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{stat.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <EventTeamsAnalytics leaderboard={leaderboard} events={events} sheets={summary.sheets} />
    </div>
  )
}
