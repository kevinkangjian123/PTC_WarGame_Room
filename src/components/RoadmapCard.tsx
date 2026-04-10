import React from 'react';
import { RoadmapStep } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface Props {
  steps: RoadmapStep[];
  lang: 'zh' | 'en';
}

export const RoadmapCard: React.FC<Props> = ({ steps, lang }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-war-accent/10">
          <Clock className="w-5 h-5 text-war-accent" />
        </div>
        <h4 className="font-bold text-lg text-war-text tracking-tight">
          {lang === 'zh' ? '战略执行路线图' : 'Strategic Execution Roadmap'}
        </h4>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-war-border" />
        
        <div className="space-y-8 relative">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-6 group"
            >
              <div className="relative z-10">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white transition-all group-hover:scale-110",
                  step.priority === 'High' ? "border-war-danger text-war-danger" :
                  step.priority === 'Medium' ? "border-war-orange text-war-orange" :
                  "border-war-accent text-war-accent"
                )}>
                  {i + 1}
                </div>
              </div>

              <div className="flex-1 p-5 rounded-2xl bg-war-bg border border-war-border group-hover:border-war-accent/30 transition-all ptc-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-war-text-light">
                    {step.phase}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                    step.priority === 'High' ? "bg-war-danger/10 text-war-danger" :
                    step.priority === 'Medium' ? "bg-war-orange/10 text-war-orange" :
                    "bg-war-accent/10 text-war-accent"
                  )}>
                    {step.priority}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-war-text mb-2">{step.action}</h5>
                <div className="flex items-center gap-2 text-[10px] text-war-text-light font-mono">
                  <Clock className="w-3 h-3" />
                  {step.timeline}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
