import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, PieChart, ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { MetricDisplay } from "@/components/dashboard/MetricDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TransactionFlowChart } from "@/components/finances/TransactionFlowChart";
import { CategoryPieChart } from "@/components/finances/CategoryPieChart";
import { DateRangeSelector, DateRange, getDefaultDateRange } from "@/components/ui/date-range-selector";

interface FinanceData {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  categoryData: { name: string; value: number }[];
  dailyData: { date: string; income: number; expense: number }[];
}

export default function FinancesPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange(7));
  const [data, setData] = useState<FinanceData>({
    balance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    categoryData: [],
    dailyData: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    try {
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");

      const { data: finances } = await supabase
        .from("finances")
        .select("*")
        .eq("user_id", user.id)
        .gte("transaction_date", startDate)
        .lte("transaction_date", endDate)
        .order("transaction_date", { ascending: true });

      if (!finances) return;

      const totalIncome = finances
        .filter((f) => f.type === "income")
        .reduce((acc, f) => acc + Number(f.amount), 0);

      const totalExpenses = finances
        .filter((f) => f.type === "expense")
        .reduce((acc, f) => acc + Number(f.amount), 0);

      const balance = totalIncome - totalExpenses;

      // Category breakdown for expenses
      const categoryMap = new Map<string, number>();
      finances
        .filter((f) => f.type === "expense")
        .forEach((f) => {
          const current = categoryMap.get(f.category) || 0;
          categoryMap.set(f.category, current + Number(f.amount));
        });

      const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
      }));

      // Daily data for chart
      const dailyMap = new Map<string, { income: number; expense: number }>();
      finances.forEach((f) => {
        const date = f.transaction_date;
        const current = dailyMap.get(date) || { income: 0, expense: 0 };
        if (f.type === "income") {
          current.income += Number(f.amount);
        } else {
          current.expense += Number(f.amount);
        }
        dailyMap.set(date, current);
      });

      const dailyData = Array.from(dailyMap.entries())
        .map(([date, values]) => ({
          date,
          income: values.income,
          expense: values.expense,
        }));

      setData({ balance, totalIncome, totalExpenses, categoryData, dailyData });
    } catch (error) {
      console.error("Error fetching finances:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, dateRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

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
        title="Finanças"
        description="Gerencie seu fluxo de caixa"
        icon={<Wallet className="h-6 w-6" />}
        actions={<DateRangeSelector value={dateRange} onChange={setDateRange} />}
      />

      {/* Metrics Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricDisplay
          label="Saldo atual"
          value={formatCurrency(data.balance)}
          variant={data.balance >= 0 ? "health" : "default"}
          icon={<Wallet className="h-5 w-5" />}
        />
        <MetricDisplay
          label="Total de entradas"
          value={formatCurrency(data.totalIncome)}
          variant="health"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricDisplay
          label="Total de saídas"
          value={formatCurrency(data.totalExpenses)}
          variant="finance"
          icon={<TrendingDown className="h-5 w-5" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          className="rounded-xl border bg-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            Fluxo de Transação
          </h3>
          <TransactionFlowChart data={data.dailyData} />
        </motion.div>

        <motion.div
          className="rounded-xl border bg-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <PieChart className="h-5 w-5 text-primary" />
            Gastos por categoria
          </h3>
          <CategoryPieChart data={data.categoryData} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
