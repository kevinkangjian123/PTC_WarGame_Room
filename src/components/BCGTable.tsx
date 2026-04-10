import React from 'react';
import { BCGPoint } from '../types';

interface Props {
  points: BCGPoint[];
  lang: 'zh' | 'en';
}

export const BCGTable: React.FC<Props> = ({ points, lang }) => {
  const t = {
    zh: {
      type: '赛道类型',
      name: '行业名称',
      share: '市场份额',
      growth: '增长率',
      judgment: '战略判断',
      star: '明星赛道',
      horse: '潜力黑马',
      cow: '现金基座',
      dog: '边际赛道',
    },
    en: {
      type: 'Type',
      name: 'Industry',
      share: 'Share',
      growth: 'Growth',
      judgment: 'Judgment',
      star: 'Star',
      horse: 'Dark Horse',
      cow: 'Cash Cow',
      dog: 'Marginal',
    }
  }[lang];

  const getCategory = (p: BCGPoint) => {
    if (p.x > 0.5 && p.y > 0.5) return { text: t.star, color: 'text-war-accent', bg: 'bg-war-accent/10' };
    if (p.x <= 0.5 && p.y > 0.5) return { text: t.horse, color: 'text-war-blue', bg: 'bg-war-blue/10' };
    if (p.x > 0.5 && p.y <= 0.5) return { text: t.cow, color: 'text-war-orange', bg: 'bg-war-orange/10' };
    return { text: t.dog, color: 'text-war-text-light', bg: 'bg-zinc-100' };
  };

  return (
    <div className="overflow-hidden rounded-xl border border-war-border">
      <table className="w-full text-sm">
        <thead className="bg-war-bg border-b border-war-border">
          <tr>
            <th className="px-4 py-2 text-left font-bold text-war-text-light">{t.type}</th>
            <th className="px-4 py-2 text-left font-bold text-war-text-light">{t.name}</th>
            <th className="px-4 py-2 text-right font-bold text-war-text-light">{t.share}</th>
            <th className="px-4 py-2 text-right font-bold text-war-text-light">{t.growth}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-war-border">
          {points.map((p, i) => {
            const cat = getCategory(p);
            return (
              <tr key={i} className="hover:bg-war-bg/50 transition-colors">
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cat.bg} ${cat.color}`}>
                    {cat.text}
                  </span>
                </td>
                <td className="px-4 py-3 text-war-text font-medium">{p.name}</td>
                <td className="px-4 py-3 text-right text-war-text-light">{(p.x * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-right text-war-text-light">{(p.y * 100).toFixed(0)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
