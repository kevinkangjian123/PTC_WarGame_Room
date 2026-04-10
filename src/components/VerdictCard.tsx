import React from 'react';
import { motion } from 'motion/react';
import { Factor, MMMBreakdown, Variance } from '../types';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown, Info, ShieldCheck, Zap, AlertCircle, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';

interface Props {
  winProbability: number;
  factors: Factor[];
  mmmBreakdown?: MMMBreakdown;
  variance?: Variance;
  lang: 'zh' | 'en';
}

export const VerdictCard: React.FC<Props> = ({ winProbability, factors, mmmBreakdown, variance, lang }) => {
  const isPositive = winProbability >= 50;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-war-border"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="44"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={276}
                initial={{ strokeDashoffset: 276 }}
                animate={{ strokeDashoffset: 276 - (276 * winProbability) / 100 }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className={isPositive ? "text-war-accent" : "text-war-danger"}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-war-text">{winProbability}%</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-war-text-light">Win Prob</span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-black text-war-text tracking-tight">
                {lang === 'zh' ? '战局结算报告' : 'Battle Verdict Report'}
              </h3>
              {variance && (
                <div className={cn(
                  "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold",
                  variance.delta >= 0 ? "bg-war-accent/10 text-war-accent" : "bg-war-danger/10 text-war-danger"
                )}>
                  {variance.delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(variance.delta)}%
                </div>
              )}
            </div>
            <p className="text-xs text-war-text-light font-medium">
              {lang === 'zh' 
                ? `基于 MMM 归因模型计算，当前胜率为 ${winProbability}%` 
                : `Calculated via MMM attribution, current win probability is ${winProbability}%`}
            </p>
            {variance && (
              <p className="text-[10px] text-war-accent font-medium mt-1 italic">
                {lang === 'zh' ? `方差分析: ${variance.reason}` : `Variance: ${variance.reason}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <div className={cn(
            "px-4 py-2 rounded-xl border flex items-center gap-2 ptc-shadow",
            isPositive ? "bg-war-accent/5 border-war-accent/20 text-war-accent" : "bg-war-danger/5 border-war-danger/10 text-war-danger"
          )}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-xs font-bold uppercase tracking-wider">
              {isPositive 
                ? (lang === 'zh' ? '建议进攻' : 'Aggressive') 
                : (lang === 'zh' ? '建议防御' : 'Defensive')}
            </span>
          </div>
        </div>
      </div>

      {/* MMM Attribution Breakdown */}
      {mmmBreakdown && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-war-border ptc-shadow">
            <div className="flex items-center gap-2 text-war-text-light mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'zh' ? '基础胜率' : 'Base Prob'}</span>
            </div>
            <div className="text-xl font-bold text-war-text">{mmmBreakdown.base}%</div>
            <div className="text-[9px] text-war-text-light mt-1">{lang === 'zh' ? '行业基准与产品力' : 'Industry benchmark & product fit'}</div>
          </div>
          
          <div className="p-4 rounded-2xl bg-war-accent/5 border border-war-accent/10 ptc-shadow">
            <div className="flex items-center gap-2 text-war-accent mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'zh' ? '政策加成' : 'Policy Uplift'}</span>
            </div>
            <div className="text-xl font-bold text-war-accent">+{mmmBreakdown.policyUplift}%</div>
            <div className="text-[9px] text-war-accent/70 mt-1">{lang === 'zh' ? '合规性与政策红利' : 'Compliance & policy tailwinds'}</div>
          </div>

          <div className="p-4 rounded-2xl bg-war-danger/5 border border-war-danger/10 ptc-shadow">
            <div className="flex items-center gap-2 text-war-danger mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'zh' ? '竞品阻力' : 'Comp Drag'}</span>
            </div>
            <div className="text-xl font-bold text-war-danger">-{mmmBreakdown.compDrag}%</div>
            <div className="text-[9px] text-war-danger/70 mt-1">{lang === 'zh' ? '对手动能与技术漏洞' : 'Competitor momentum & gaps'}</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-war-text-light">
          <Info className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {lang === 'zh' ? '关键影响因子归因' : 'Key Factor Attribution'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factors.map((factor, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-war-bg border border-war-border">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-war-text">{factor.name}</span>
                <span className="text-[10px] text-war-text-light">{factor.description}</span>
              </div>
              <div className={cn(
                "text-xs font-mono font-bold",
                factor.score >= 0 ? "text-war-accent" : "text-war-danger"
              )}>
                {factor.score >= 0 ? '+' : ''}{factor.score}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
