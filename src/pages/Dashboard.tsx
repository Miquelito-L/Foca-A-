import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
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
  const [loading, setLoading] = useState(true);
  
  const [summary, setSummary] = useState<DashboardSummary>({
    finances: { balance: 0, income: 0, expenses: 0 },
    expensesByCategory: [],
    recentTransactions: [],
    health: { waterToday: 0, lastSleep: null },
    academic: { totalDocs: 0, tagCounts: [] },
    schedule: { upcomingEvents: 0, syncedEvents: 0, nextEvents: [] },
    userName: null,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  useEffect(() => {
    // Simula uma busca de dados que retorna "vazio"
    const loadEmptyData = () => {
      setSummary({
        finances: { 
          balance: 0, 
          income: 0, 
          expenses: 0 
        },
        expensesByCategory: [],
        recentTransactions: [],
        health: { 
          waterToday: 0, 
          lastSleep: null 
        },
        academic: { 
          totalDocs: 0, 
          tagCounts: [] 
        },
        schedule: { 
          upcomingEvents: 0, 
          syncedEvents: 0, 
          nextEvents: [] 
        },
        userName: "Usuário", // Nome genérico
      });
      setLoading(false);
    };

    loadEmptyData();
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
      <motion.div
        className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold">
            {getGreeting()}, {summary.userName}! 👋
          </h1>
          <p className="text-muted-foreground capitalize mt-1">{todayFormatted}</p>
        </div>
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </motion.div>

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

      <section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <HealthSummaryCard
            waterToday={summary.health.waterToday}
            lastSleep={summary.health.lastSleep}
            waterGoal={2500}
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