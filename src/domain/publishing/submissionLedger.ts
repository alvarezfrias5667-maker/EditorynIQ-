import {
  LedgerEvent,
  LedgerEventType,
  LedgerActor,
  ChannelId,
} from './publishingTypes';
import { computeSHA256 } from '../../services/localVisualRepository';

/**
 * Creates a validated ledger event ensuring strict provenance distinction
 * between System Evidence, User Declaration, and Provider Confirmation.
 */
export async function createLedgerEvent(
  bookId: string,
  editionId: string,
  channelId: ChannelId | 'universal',
  eventType: LedgerEventType,
  actor: LedgerActor,
  summary: string,
  metadata: Record<string, any> = {}
): Promise<LedgerEvent> {
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();

  // Create hash of the event payload as cryptographic proof
  const payloadString = JSON.stringify({ eventId, bookId, editionId, channelId, eventType, actor, timestamp, summary, metadata });
  const sha256Evidence = await computeSHA256(payloadString);

  return {
    eventId,
    bookId,
    editionId,
    channelId,
    eventType,
    actor,
    timestamp,
    summary,
    metadata,
    sha256Evidence,
  };
}

/**
 * Formats human-friendly labels for ledger events across languages.
 */
export function getLedgerEventLabel(
  type: LedgerEventType,
  lang: 'en' | 'es' | 'fr' = 'en'
): { label: string; desc: string; badgeColor: string } {
  const map: Record<LedgerEventType, { en: string; es: string; fr: string; descEn: string; descEs: string; descFr: string; color: string }> = {
    PACKAGE_PREPARED: {
      en: 'Publication Package Prepared',
      es: 'Paquete de Publicación Preparado',
      fr: 'Paquet de Publication Préparé',
      descEn: 'System compiled and verified publication package with cryptographic SHA-256 manifests.',
      descEs: 'El sistema compiló y verificó el paquete de publicación con manifiestos criptográficos SHA-256.',
      descFr: 'Le système a compilé et vérifié le paquet avec des manifestes cryptographiques SHA-256.',
      color: 'bg-blue-50 text-[#345CFF] border-blue-200',
    },
    MANUAL_EXPORT_COMPLETED: {
      en: 'Manual Export Downloaded',
      es: 'Exportación Manual Descargada',
      fr: 'Exportation Manuelle Téléchargée',
      descEn: 'Author downloaded package ZIP for manual submission to channel console.',
      descEs: 'El autor descargó el paquete ZIP para su carga manual en la consola del canal.',
      descFr: 'L’auteur a téléchargé le ZIP pour une soumission manuelle sur la console.',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    USER_REPORTED_SUBMISSION: {
      en: 'Author-Reported Submission',
      es: 'Presentación Declarada por el Autor',
      fr: 'Soumission Déclarée par l’Auteur',
      descEn: 'User documented manual upload to distribution channel (unverified by API).',
      descEs: 'El usuario documentó la carga manual al canal de distribución (no verificado por API).',
      descFr: 'L’utilisateur a documenté le téléversement manuel (non vérifié par API).',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    PROVIDER_CONFIRMED: {
      en: 'Provider Verified Receipt',
      es: 'Comprobante Confirmado del Proveedor',
      fr: 'Reçu Confirmé du Fournisseur',
      descEn: 'Third-party retailer or distributor confirmed ingestion receipt or status.',
      descEs: 'El distribuidor o minorista externo confirmó la recepción o estado.',
      descFr: 'Le distributeur tiers a confirmé la réception ou le statut.',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    },
  };

  const item = map[type];
  if (!item) {
    return {
      label: type,
      desc: 'System event',
      badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
    };
  }

  return {
    label: lang === 'es' ? item.es : lang === 'fr' ? item.fr : item.en,
    desc: lang === 'es' ? item.descEs : lang === 'fr' ? item.descFr : item.descEn,
    badgeColor: item.color,
  };
}
