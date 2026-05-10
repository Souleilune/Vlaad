"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export function AchievementPopup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="fixed bottom-6 right-6 z-50 hidden max-w-sm xl:block"
    >
      <Card className="border-retroYellow/60 bg-retroYellow/80">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-slate-900 p-3 text-retroYellow">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg text-slate-900">Trusted Contributor</p>
            <p className="mt-2 text-sm text-slate-700">
              You just unlocked a faster verification lane thanks to your clean reporting streak.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
