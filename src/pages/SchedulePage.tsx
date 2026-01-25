import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { MetricDisplay } from "@/components/dashboard/MetricDisplay";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EventsList } from "@/components/schedule/EventsList";
import { UpcomingEventsCard } from "@/components/schedule/UpcomingEventsCard";
import { DateRangeSelector, DateRange, getDefaultDateRange } from "@/components/ui/date-range-selector";
import { isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  google_event_id: string | null;
  lembrete_1h_enviado: boolean;
}

export default function SchedulePage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange(7));
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    if (!user) return;

    try {
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");

      const { data } = await supabase
        .from("agendamento")
        .select("*")
        .eq("user_id", user.id)
        .gte("start_time", startDate)
        .lte("start_time", endDate + "T23:59:59")
        .order("start_time", { ascending: true });

      if (data) {
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user, dateRange]);

  const filteredEvents = events.filter((event) =>
    isSameDay(parseISO(event.start_time), selectedDate)
  );

  const upcomingEvents = events.filter(
    (e) => new Date(e.start_time) >= new Date()
  );
  const syncedCount = events.filter((e) => e.google_event_id).length;
  const pendingCount = events.filter((e) => !e.google_event_id).length;

  // Get dates with events for calendar highlighting
  const eventDates = events.map((e) => parseISO(e.start_time));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Agenda"
        description="Gerencie seus compromissos"
        icon={<CalendarIcon className="h-6 w-6" />}
        actions={<DateRangeSelector value={dateRange} onChange={setDateRange} />}
      />

      {/* Metrics Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricDisplay
          label="Próximos eventos"
          value={upcomingEvents.length}
          variant="schedule"
          icon={<Clock className="h-5 w-5" />}
        />
        <MetricDisplay
          label="Sincronizados"
          value={syncedCount}
          variant="health"
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <MetricDisplay
          label="Pendentes"
          value={pendingCount}
          variant="training"
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      {/* Upcoming Events Card */}
      <div className="mb-6">
        <UpcomingEventsCard events={upcomingEvents} maxEvents={5} />
      </div>

      {/* Calendar and Events Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <motion.div
          className="rounded-xl border bg-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={ptBR}
            modifiers={{ hasEvent: eventDates }}
            modifiersStyles={{
              hasEvent: {
                backgroundColor: "hsl(var(--primary) / 0.2)",
                borderRadius: "50%",
              },
            }}
            className="rounded-md"
          />
        </motion.div>

        {/* Events List */}
        <motion.div
          className="rounded-xl border bg-card p-6 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="mb-4 text-lg font-semibold">
            Eventos em {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h3>
          <EventsList events={filteredEvents} onRefresh={fetchEvents} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
