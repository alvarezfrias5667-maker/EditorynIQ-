import {
  OperationStatus,
  OrderRecord,
  DeliveryRecord,
  RoyaltyRecord,
  SellerSettlementRecord,
} from './marketplaceTypes';

/**
 * Returns localized descriptions and badges for commerce operational statuses.
 */
export function getOperationStatusLabel(
  status: OperationStatus,
  lang: 'en' | 'es' | 'fr' = 'en'
): { label: string; badgeColor: string; description: string } {
  const map: Record<
    OperationStatus,
    { en: string; es: string; fr: string; descEn: string; descEs: string; descFr: string; color: string }
  > = {
    NOT_CONFIGURED: {
      en: 'Not Configured (PROM 7 Scope)',
      es: 'No Configurado (Alcance PROM 7)',
      fr: 'Non Configuré (Portée PROM 7)',
      descEn: 'Monetary checkout and payment processing are disabled until PROM 8.',
      descEs: 'El procesamiento de pagos y checkout monetario están desactivados hasta PROM 8.',
      descFr: 'Le paiement et le traitement monétaire sont désactivés jusqu’à PROM 8.',
      color: 'bg-slate-100 text-slate-700 border-slate-300',
    },
    PENDING_VERIFICATION: {
      en: 'Pending Verification',
      es: 'Pendiente de Verificación',
      fr: 'En Attente de Vérification',
      descEn: 'Transaction requires external provider webhook or receipt confirmation.',
      descEs: 'La transacción requiere confirmación del proveedor externo.',
      descFr: 'La transaction nécessite confirmation par le fournisseur externe.',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    VERIFIED: {
      en: 'Transaction Verified',
      es: 'Transacción Verificada',
      fr: 'Transaction Vérifiée',
      descEn: 'Cryptographic receipt or payment intent confirmed.',
      descEs: 'Recibo criptográfico o intención de pago confirmada.',
      descFr: 'Reçu cryptographique ou intention de paiement confirmée.',
      color: 'bg-blue-50 text-[#345CFF] border-blue-200',
    },
    DELIVERED: {
      en: 'Entitlement Delivered',
      es: 'Derecho de Acceso Entregado',
      fr: 'Droit d’Accès Délivré',
      descEn: 'Book file access token issued and recorded in buyer library.',
      descEs: 'Token de acceso al archivo emitido y registrado en la biblioteca.',
      descFr: 'Jeton d’accès au fichier émis et enregistré dans la bibliothèque.',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    FAILED: {
      en: 'Operation Failed',
      es: 'Operación Fallida',
      fr: 'Opération Échouée',
      descEn: 'Transaction failed validation or was rejected by external provider.',
      descEs: 'La transacción falló la validación o fue rechazada por el proveedor.',
      descFr: 'La transaction a échoué ou a été rejetée par le fournisseur.',
      color: 'bg-rose-50 text-rose-800 border-rose-200',
    },
  };

  const item = map[status] || map.NOT_CONFIGURED;
  return {
    label: lang === 'es' ? item.es : lang === 'fr' ? item.fr : item.en,
    description: lang === 'es' ? item.descEs : lang === 'fr' ? item.descFr : item.descEn,
    badgeColor: item.color,
  };
}

/**
 * Creates an immutable OrderRecord template without fabricating simulated financial transactions.
 */
export function createUnconfiguredOrderTemplate(listingId: string): OrderRecord {
  return {
    id: `ord_${Date.now()}_template`,
    listingId,
    buyerReference: 'UNAUTHENTICATED_GUEST',
    sellerReference: 'LOCAL_AUTHOR',
    currency: 'USD',
    grossAmountCents: 0,
    status: 'NOT_CONFIGURED',
    statusReason: 'Payment gateways (Stripe/PayPal/Direct) are scheduled for PROM 8 upon owner authorization.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
