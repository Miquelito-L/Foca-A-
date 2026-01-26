import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
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
import { sql } from "@/lib/neon";

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
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange(30));
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchEvents = async (isBackgroundUpdate = false) => {
    if (!user) return;

    try {
      if (!isBackgroundUpdate) setLoading(true);
      
      // Busca todos os eventos (REMOVIDO ::integer)
      const data = await sql`
        SELECT * FROM agendamento 
        WHERE user_id = ${user.id} 
        ORDER BY start_time ASC
      `;

      const formattedEvents = data.map((e: any) => ({
          ...e,
          id: String(e.id),
          start_time: new Date(e.start_time).toISOString(),
          end_time: e.end_time ? new Date(e.end_time).toISOString() : null
      }));

      setEvents(formattedEvents);
      setLastUpdated(new Date());

    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      if (!isBackgroundUpdate) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    // Atualização em tempo real a cada 5 segundos
    const interval = setInterval(() => {
      fetchEvents(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [user, dateRange]);

  const filteredEvents = events.filter((event) =>
    isSameDay(parseISO(event.start_time), selectedDate)
  );

  const upcomingEvents = events; 
  
  const syncedCount = events.filter((e) => e.google_event_id).length;
  const pendingCount = events.filter((e) => !e.google_event_id).length;
  const eventDates = events.map((e) => parseISO(e.start_time));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center flex-col gap-4">
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
        actions={
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Atualizado às {format(lastUpdated, "HH:mm:ss")}
                </div>
                <DateRangeSelector value={dateRange} onChange={setDateRange} />
            </div>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricDisplay
          label="Total de Eventos"
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

      <div className="mb-6">
        {upcomingEvents.length > 0 ? (
            <UpcomingEventsCard events={upcomingEvents} maxEvents={10} />
        ) : (
            <div className="p-6 border rounded-lg bg-card text-center text-muted-foreground">
                <p>Nenhum evento encontrado.</p>
            </div>
        )}
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
                fontWeight: "bold",
                color: "hsl(var(--primary))"
              },
            }}
            className="rounded-md"
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
          <EventsList events={filteredEvents} onRefresh={() => fetchEvents(false)} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}