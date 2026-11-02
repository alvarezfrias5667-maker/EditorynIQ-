import React from 'react';
import { E2ReadinessReport } from '../../domain/manuscript/manuscriptTypes';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Layers } from 'lucide-react';
import { useI18n } from '../../i18n';

interface E2ReadinessPanelProps {
  report: E2ReadinessReport;
  onProceedToE3?: () => void;
}

export const E2ReadinessPanel: React.FC<E2ReadinessPanelProps> = ({ report, onProceedToE3 }) => {
  const { lang } = useI18n();

  return (
    <div className="space-y-6">
      {/* Overview Status Card */}
      <div
        className={`p-6 rounded-2xl border ${
          report.isReadyForE3
            ? 'bg-emerald-950/40 border-emerald-500/40 text-white'
            : 'bg-amber-950/40 border-amber-500/40 text-white'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-2xl border ${
                report.isReadyForE3
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              {report.isReadyForE3 ? (
                <ShieldCheck className="w-8 h-8" />
              ) : (
                <AlertTriangle className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-slate-100">
                  {report.isReadyForE3
                    ? lang === 'es'
                      ? 'E2 Manuscript Factory™ Aprobado y Preparado para E3'
                      : 'E2 Manuscript Factory™ Approved & Ready for E3'
                    : lang === 'es'
                    ? 'Revisión Requerida para Aprobación E2'
                    : 'Review Required for E2 Approval'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-navy-950 border border-slate-700 text-amber-300">
                  {report.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                {report.isReadyForE3
                  ? lang === 'es'
                    ? 'El manuscrito cumple con todas las métricas de palabras, continuidad, glosario y revisión editorial. Está listo para pasar al Motor E3 (Diseño & Maquetación).'
                    : 'The manuscript satisfies all word target metrics, continuity checks, glossary, and editorial review. Ready for Motor E3 (Design & Layout).'
                  : lang === 'es'
                  ? 'Existen elementos pendientes en el manuscrito antes de habilitar la congelación de texto para maquetación editorial E3.'
                  : 'There are pending items in the manuscript before enabling text freeze for E3 layout design.'}
              </p>
            </div>
          </div>

          {report.isReadyForE3 && onProceedToE3 && (
            <button
              onClick={onProceedToE3}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2 shrink-0"
            >
              <span>{lang === 'es' ? 'Aprobar Manuscrito & Pasar a E3' : 'Approve Manuscript & Proceed to E3'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-2xs">
        <h4 className="text-xs font-bold text-[#081629] uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#345CFF]" />
          <span>{lang === 'es' ? 'Lista de Verificación de Integridad Editorial E2' : 'E2 Editorial Integrity Checklist'}</span>
        </h4>

        <div className="space-y-3">
          {report.checks.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3"
            >
              <div className="mt-0.5">
                {item.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{item.key.replace(/_/g, ' ').toUpperCase()}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      item.passed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {item.passed ? 'PASSED' : item.isBlocking ? 'BLOCKING' : 'PENDING'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{item.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
