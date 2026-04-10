import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Intelligence } from '../types';

interface Props {
  data: Intelligence;
}

export const IntelligenceCard: React.FC<Props> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/10">
        <div className="flex items-center gap-2 text-war-danger mb-4">
          <ShieldAlert className="w-4 h-4" />
          <h5 className="text-xs font-bold uppercase tracking-wider">{data.redForce.title}</h5>
        </div>
        <ul className="space-y-3">
          {data.redForce.items.map((item, i) => (
            <li key={i} className="text-sm text-war-text-light flex gap-2 leading-relaxed">
              <span className="text-war-danger/30 font-bold">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/10">
        <div className="flex items-center gap-2 text-war-blue mb-4">
          <ShieldCheck className="w-4 h-4" />
          <h5 className="text-xs font-bold uppercase tracking-wider">{data.blueForce.title}</h5>
        </div>
        <ul className="space-y-3">
          {data.blueForce.items.map((item, i) => (
            <li key={i} className="text-sm text-war-text-light flex gap-2 leading-relaxed">
              <span className="text-war-blue/30 font-bold">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
