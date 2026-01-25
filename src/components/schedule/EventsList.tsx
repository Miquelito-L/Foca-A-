import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Trash2, Cloud, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  google_event_id: string | null;
  lembrete_1h_enviado: boolean;
}

interface EventsListProps {
  events: ScheduleEvent[];
  onRefresh: () => void;
}

export function EventsList({ events, onRefresh }: EventsListProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  if (events.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
        <Calendar className="mb-2 h-10 w-10" />
        <p>Nenhum evento neste dia</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("agendamento")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({ title: "Evento removido" });
      onRefresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {events.map((event) => {
        const startTime = parseISO(event.start_time);
        const endTime = parseISO(event.end_time);
        const isSynced = !!event.google_event_id;

        return (
          <div
            key={event.id}
            className={cn(
              "group flex items-start gap-4 rounded-lg border p-4 transition-colors",
              "bg-schedule-light/30 border-l-4 border-l-schedule hover:bg-schedule-light/50"
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-schedule text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate font-medium">{event.title}</h4>
                <span
                  className={cn(
                    "status-badge",
                    isSynced ? "status-synced" : "status-pending"
                  )}
                >
                  {isSynced ? (
                    <>
                      <Cloud className="h-3 w-3" />
                      Sincronizado
                    </>
                  ) : (
                    <>
                      <CloudOff className="h-3 w-3" />
                      Pendente
                    </>
                  )}
                </span>
              </div>
              {event.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {event.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {format(startTime, "HH:mm", { locale: ptBR })} - {format(endTime, "HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDelete(event.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
