import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  tone = "default",
}: {
  title: string;
  value: number;
  tone?: "default" | "danger" | "success" | "warning";
}) {
  const toneClasses = {
    default: "from-slate-400/20 to-slate-500/10",
    danger: "from-rose-400/30 to-rose-500/10",
    success: "from-emerald-400/30 to-emerald-500/10",
    warning: "from-amber-400/30 to-amber-500/10",
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        className={`rounded-2xl border-white/10 bg-gradient-to-br ${toneClasses[tone]} py-0`}
      >
        <CardContent className="p-5">
          <p className="text-sm text-slate-300">{title}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
