import { AuthorRecord, AuthorIdentityStatus } from './marketplaceTypes';

/**
 * Creates an AuthorRecord ensuring honest identity status without pretending verified accounts.
 */
export function createAuthorRecord(
  declaredName: string,
  options?: Partial<AuthorRecord>
): AuthorRecord {
  const authorId = options?.id || `auth_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const identityStatus: AuthorIdentityStatus = options?.identityStatus || 'LOCAL_PROFILE';

  return {
    id: authorId,
    declaredName: declaredName.trim() || 'Anonymous Author',
    biography:
      options?.biography ||
      'Author registered in local workspace. Biography and credentials self-declared.',
    countryOrTerritory: options?.countryOrTerritory || '',
    languages: options?.languages || ['en'],
    linkedBookIds: options?.linkedBookIds || [],
    identityStatus,
    identityEvidenceNotes:
      options?.identityEvidenceNotes ||
      (identityStatus === 'LOCAL_PROFILE'
        ? 'Local workspace profile created by author. Identity unverified by external authority.'
        : ''),
    rightsDeclarations:
      options?.rightsDeclarations || [
        'Author declares full copyright ownership or authorization for linked works.',
      ],
    websiteUrl: options?.websiteUrl || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Returns localized label and status badge color for AuthorIdentityStatus.
 */
export function getAuthorIdentityStatusLabel(
  status: AuthorIdentityStatus,
  lang: 'en' | 'es' | 'fr' = 'en'
): { label: string; badgeColor: string; description: string } {
  const labels: Record<
    AuthorIdentityStatus,
    { en: string; es: string; fr: string; descEn: string; descEs: string; descFr: string; color: string }
  > = {
    LOCAL_PROFILE: {
      en: 'Local Workspace Profile',
      es: 'Perfil de Espacio Local',
      fr: 'Profil d’Espace Local',
      descEn: 'Author profile declared in local device repository without multi-user remote sync.',
      descEs: 'Perfil de autor declarado en el repositorio local sin sincronización remota multiusuario.',
      descFr: 'Profil d’auteur déclaré dans l’espace local sans synchronisation distante.',
      color: 'bg-blue-50 text-[#345CFF] border-blue-200',
    },
    IDENTITY_UNVERIFIED: {
      en: 'Identity Unverified',
      es: 'Identidad No Verificada',
      fr: 'Identité Non Vérifiée',
      descEn: 'Declared editorial name without official institutional ID verification.',
      descEs: 'Nombre editorial declarado sin verificación oficial de identidad institucional.',
      descFr: 'Nom éditorial déclaré sans vérification officielle d’identité.',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    VERIFIED: {
      en: 'Authentic Proof Verified',
      es: 'Comprobante Auténtico Verificado',
      fr: 'Preuve Authentique Vérifiée',
      descEn: 'Author verified via authenticated cryptographic token or verifiable credential.',
      descEs: 'Autor verificado mediante token criptográfico autenticado o credencial verificable.',
      descFr: 'Auteur vérifié par jeton cryptographique ou justificatif vérifiable.',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
  };

  const item = labels[status] || labels.LOCAL_PROFILE;
  return {
    label: lang === 'es' ? item.es : lang === 'fr' ? item.fr : item.en,
    description: lang === 'es' ? item.descEs : lang === 'fr' ? item.descFr : item.descEn,
    badgeColor: item.color,
  };
}
