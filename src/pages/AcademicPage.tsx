import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, FileText, BookOpen, Clock, PenLine } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { MetricDisplay } from "@/components/dashboard/MetricDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DocumentList } from "@/components/academic/DocumentList";
import { TagsOverview } from "@/components/academic/TagsOverview";
import { DateRangeSelector, DateRange, getDefaultDateRange } from "@/components/ui/date-range-selector";

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
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange(7));
  const [documents, setDocuments] = useState<AcademicDocument[]>([]);
  const [tagCounts, setTagCounts] = useState<TagCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmptyData = () => {
      setDocuments([]);
      setTagCounts([]);
      setLoading(false);
    };

    loadEmptyData();
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
          variant="default"
          icon={<FileText className="h-5 w-5" />}
        />
        <MetricDisplay
          label="Com resumo"
          value={withSummary}
          variant="default"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <MetricDisplay
          label="Matérias ativas"
          value={tagCounts.length}
          variant="default"
          icon={<PenLine className="h-5 w-5" />}
        />
        <MetricDisplay
          label="Última atualização"
          value="-"
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
          <h3 className="mb-4 text-lg font-semibold">Por matéria</h3>
          <TagsOverview data={tagCounts} />
        </motion.div>

        <motion.div
          className="rounded-xl border bg-card p-6 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="mb-4 text-lg font-semibold">Documentos recentes</h3>
          <DocumentList documents={documents} onRefresh={() => {}} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}