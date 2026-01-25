import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FinanceSummaryCard } from "@/components/dashboard/FinanceSummaryCard";
import { HealthSummaryCard } from "@/components/dashboard/HealthSummaryCard";
import { ExpensesPieChart } from "@/components/dashboard/ExpensesPieChart";
import { ScheduleSummaryCard } from "@/components/dashboard/ScheduleSummaryCard";
import { AcademicSummaryCard } from "@/components/dashboard/AcademicSummaryCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { DateRangeSelector, DateRange, getDefaultDateRange } from "@/components/ui/date-range-selector";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  category: string;
  transaction_date: string;
}

interface DashboardSummary {
  finances: {
    balance: number;
    income: number;
    expenses: number;
  };
  expensesByCategory: { name: string; value: number }[];
  recentTransactions: Transaction[];
  health: {
    waterToday: number;
    lastSleep: number | null;
  };
  academic: {
    totalDocs: number;
    tagCounts: { tag: string; count: number }[];
  };
  schedule: {
    upcomingEvents: number;
    syncedEvents: number;
    nextEvents: {
      id: string;
      title: string;
      start_time: string;
      google_event_id: string | null;
    }[];
  };
  userName: string | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange(7));
  const [summary, setSummary] = useState<DashboardSummary>({
    finances: { balance: 0, income: 0, expenses: 0 },
    expensesByCategory: [],
    recentTransactions: [],
    health: { waterToday: 0, lastSleep: null },
    academic: { totalDocs: 0, tagCounts: [] },
    schedule: { upcomingEvents: 0, syncedEvents: 0, nextEvents: [] },
    userName: null,
  });
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  useEffect(() => {
    async function fetchSummary() {
      if (!user) return;

      try {
        const startDate = format(dateRange.from, "yyyy-MM-dd");
        const endDate = format(dateRange.to, "yyyy-MM-dd");
        const today = new Date().toISOString().split("T")[0];

        // Fetch user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", user.id)
          .single();

        // Fetch finance summary for the period
        const { data: finances } = await supabase
          .from("finances")
          .select("id, type, amount, category, description, transaction_date")
          .eq("user_id", user.id)
          .gte("transaction_date", startDate)
          .lte("transaction_date", endDate)
          .order("transaction_date", { ascending: false });

        const income = finances?.filter(f => f.type === "income")
          .reduce((acc, f) => acc + Number(f.amount), 0) || 0;
        
        const expenses = finances?.filter(f => f.type === "expense")
          .reduce((acc, f) => acc + Number(f.amount), 0) || 0;

        const balance = income - expenses;

        // Expenses by category
        const categoryMap: Record<string, number> = {};
        finances?.filter(f => f.type === "expense").forEach(f => {
          categoryMap[f.category] = (categoryMap[f.category] || 0) + Number(f.amount);
        });
        const expensesByCategory = Object.entries(categoryMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        // Recent transactions
        const recentTransactions: Transaction[] = (finances || []).slice(0, 5).map(f => ({
          id: f.id,
          type: f.type as "income" | "expense",
          amount: Number(f.amount),
          description: f.description,
          category: f.category,
          transaction_date: f.transaction_date,
        }));

        // Fetch health summary - water today
        const { data: waterData } = await supabase
          .from("health")
          .select("value")
          .eq("user_id", user.id)
          .eq("category", "Agua")
          .gte("calendario", today);

        const waterToday = waterData?.reduce((acc, h) => acc + Number(h.value), 0) || 0;

        // Fetch last sleep
        const { data: sleepData } = await supabase
          .from("health")
          .select("value")
          .eq("user_id", user.id)
          .eq("category", "Sono")
          .order("calendario", { ascending: false })
          .limit(1);

        const lastSleep = sleepData?.[0]?.value ? Number(sleepData[0].value) : null;

        // Fetch academic summary
        const { data: academic, count: totalDocs } = await supabase
          .from("academic")
          .select("tags", { count: "exact" })
          .eq("user_id", user.id);

        // Count by tags
        const tagMap: Record<string, number> = {};
        academic?.forEach(a => {
          tagMap[a.tags] = (tagMap[a.tags] || 0) + 1;
        });
        const tagCounts = Object.entries(tagMap)
          .map(([tag, count]) => ({ tag, count }));

        // Fetch upcoming events
        const { data: events } = await supabase
          .from("agendamento")
          .select("id, title, start_time, google_event_id")
          .eq("user_id", user.id)
          .gte("start_time", new Date().toISOString())
          .lte("start_time", dateRange.to.toISOString())
          .order("start_time", { ascending: true })
          .limit(10);

        const upcomingEvents = events?.length || 0;
        const syncedEvents = events?.filter(e => e.google_event_id).length || 0;

        setSummary({
          finances: { balance, income, expenses },
          expensesByCategory,
          recentTransactions,
          health: { waterToday, lastSleep },
          academic: { totalDocs: totalDocs || 0, tagCounts },
          schedule: { 
            upcomingEvents, 
            syncedEvents, 
            nextEvents: events || [] 
          },
          userName: profile?.full_name || user.email?.split("@")[0] || null,
        });
      } catch (error) {
        console.error("Error fetching summary:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [user, dateRange]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header with greeting */}
      <motion.div
        className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold">
            {getGreeting()}, {summary.userName || "usuário"}! 👋
          </h1>
          <p className="text-muted-foreground capitalize mt-1">{todayFormatted}</p>
        </div>
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </motion.div>

      {/* Finance Section - Large at top */}
      <section className="mb-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <FinanceSummaryCard
            balance={summary.finances.balance}
            income={summary.finances.income}
            expenses={summary.finances.expenses}
          />
          <ExpensesPieChart
            data={summary.expensesByCategory}
            total={summary.finances.expenses}
          />
          <RecentTransactions
            transactions={summary.recentTransactions}
          />
        </div>
      </section>

      {/* Bottom Section - Health, Academic, Schedule */}
      <section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <HealthSummaryCard
            waterToday={summary.health.waterToday}
            lastSleep={summary.health.lastSleep}
            waterGoal={2000}
            sleepGoal={8}
          />
          <AcademicSummaryCard
            totalDocs={summary.academic.totalDocs}
            tagCounts={summary.academic.tagCounts}
          />
          <ScheduleSummaryCard
            upcomingEvents={summary.schedule.upcomingEvents}
            syncedEvents={summary.schedule.syncedEvents}
            nextEvents={summary.schedule.nextEvents}
          />
        </div>
      </section>
    </DashboardLayout>
  );
}
