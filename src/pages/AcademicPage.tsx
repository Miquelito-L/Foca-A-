import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, FileText, BookOpen, Clock, PenLine } from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { MetricDisplay } from "@/components/dashboard/MetricDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DocumentList } from "@/components/academic/DocumentList";
import { TagsOverview } from "@/components/academic/TagsOverview";
import { DateRangeSelector, DateRange, getDefaultDateRange } from "@/components/ui/date-range-selector";
import { ptBR } from "date-fns/locale";
import { sql } from "@/lib/neon"; // Conexão Neon

interface AcademicDocument {
  id: string;
  doc_name: string;
  summary: string | null;
  tags: string;
  created_at: string;
}

interface TagCount {
  tag: string;
  count: number;
}

export default function AcademicPage() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange(30));
  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [tagCounts, setTagCounts] = useState<TagCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");

      // QUERY SQL NEON
      const data = await sql`
        SELECT * FROM academic 
        WHERE user_id = ${user.id} 
        AND created_at >= ${startDate} 
        AND created_at <= ${endDate} 
        ORDER BY created_at DESC
      `;

      // Formatar datas para string (Neon retorna objeto Date)
      const formattedDocs = data.map((doc: any) => ({
          ...doc,
          id: String(doc.id),
          created_at: new Date(doc.created_at).toISOString()
      }));

      setDocuments(formattedDocs);

      // Contar Tags
      const tagMap = new Map<string, number>();
      formattedDocs.forEach((doc: any) => {
        const count = tagMap.get(doc.tags) || 0;
        tagMap.set(doc.tags, count + 1);
      });
      setTagCounts(
        Array.from(tagMap.entries()).map(([tag, count]) => ({ tag, count }))
      );
      
    } catch (error) {
      console.error("Error fetching academic data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, dateRange]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const totalDocs = documents.length;
  const withSummary = documents.filter((d) => d.summary).length;
  const studyDocs = documents.filter((d) => d.tags === "estudo").length;

  return (
    <DashboardLayout>
      <PageHeader
        title="Acadêmico"
        description="Gerencie seus estudos e resumos"
        icon={<GraduationCap className="h-6 w-6" />}
        actions={<DateRangeSelector value={dateRange} onChange={setDateRange} />}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <MetricDisplay
          label="Total de documentos"
          value={totalDocs}
          variant="training"
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricDisplay
          label="Com resumo"
          value={withSummary}
          variant="health"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <MetricDisplay
          label="Horas de estudo"
          value={studyDocs}
          variant="schedule"
          icon={<PenLine className="h-5 w-5" />}
        />
        <MetricDisplay
          label="Última atualização"
          value={documents[0] ? format(new Date(documents[0].created_at), "dd/MM", { locale: ptBR }) : "-"}
          variant="default"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          className="rounded-xl border bg-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="mb-4 text-lg font-semibold">Por categoria</h3>
          <TagsOverview data={tagCounts} />
        </motion.div>

        <motion.div
          className="rounded-xl border bg-card p-6 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="mb-4 text-lg font-semibold">Documentos recentes</h3>
          {/* Passamos fetchData para o onRefresh para permitir deletar */}
          <DocumentList documents={documents} onRefresh={fetchData} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}