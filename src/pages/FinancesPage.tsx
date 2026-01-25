import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, PieChart, ArrowLeftRight, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { MetricDisplay } from "@/components/dashboard/MetricDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TransactionFlowChart } from "@/components/finances/TransactionFlowChart";
import { CategoryPieChart } from "@/components/finances/CategoryPieChart";
import { DateRangeSelector, DateRange, getDefaultDateRange } from "@/components/ui/date-range-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega dados vazios
    const loadEmptyData = () => {
      setTransactions([]);
      setData({ 
        balance: 0, 
        totalIncome: 0, 
        totalExpenses: 0, 
        categoryData: [], 
        dailyData: [] 
      });
      setLoading(false);
    };

    loadEmptyData();
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
          variant="default"
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

      {/* Charts Grid - Empty States should be handled by components */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
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
          {/* Se o componente não tiver Empty State interno, pode aparecer vazio, o que é esperado */}
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

      {/* Transactions List */}
      <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Histórico de Transações</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar..." className="pl-8 w-[200px]" />
                </div>
                <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                    Nenhuma transação encontrada.
                </div>
            ) : (
                <div className="space-y-4">
                  {/* Lista renderizada se houvesse dados */}
                </div>
            )}
          </CardContent>
        </Card>
    </DashboardLayout>
  );
}