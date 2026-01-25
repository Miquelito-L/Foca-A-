import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { MetricDisplay } from "@/components/dashboard/MetricDisplay";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EventsList } from "@/components/schedule/EventsList";
import { UpcomingEventsCard } from "@/components/schedule/UpcomingEventsCard";
import { DateRangeSelector, DateRange, getDefaultDateRange } from "@/components/ui/date-range-selector";

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

  useEffect(() => {
    const loadEmptyData = () => {
      setEvents([]);
      setLoading(false);
    };

    loadEmptyData();
  }, [user, dateRange]);

  const filteredEvents = events.filter((event) =>
    isSameDay(parseISO(event.start_time), selectedDate)
  );

  const upcomingEvents = events.filter(
    (e) => new Date(e.start_time) >= new Date()
  );
  
  const syncedCount = events.filter((e) => e.google_event_id).length;
  const pendingCount = events.filter((e) => !e.google_event_id).length;
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

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricDisplay
          label="Próximos eventos"
          value={upcomingEvents.length}
          variant="default"
          icon={<Clock className="h-5 w-5" />}
        />
        <MetricDisplay
          label="Sincronizados"
          value={syncedCount}
          variant="default"
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <MetricDisplay
          label="Pendentes"
          value={pendingCount}
          variant="default"
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      <div className="mb-6">
        <UpcomingEventsCard events={upcomingEvents} maxEvents={5} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
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
                fontWeight: "bold"
              },
            }}
            className="rounded-md flex justify-center"
          />
        </motion.div>

        <motion.div
          className="rounded-xl border bg-card p-6 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="mb-4 text-lg font-semibold">
            Eventos em {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h3>
          <EventsList events={filteredEvents} onRefresh={() => {}} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}