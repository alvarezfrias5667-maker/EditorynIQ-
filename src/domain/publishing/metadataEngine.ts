import {
  PublicationMetadataRecord,
  CanonicalMetadata,
  EditionMetadata,
  ChannelMetadataOverride,
  ChannelId,
  EditionRecord,
} from './publishingTypes';
import { BookProject } from '../bookProjectTypes';
import { E1BookPackage } from '../intelligence/bookIntelligenceTypes';
import { EditorialEdition } from '../editorial/editorialTypes';

/**
 * Builds a PublicationMetadataRecord maintaining clean separation between
 * CANONICAL_METADATA, EDITION_METADATA, and CHANNEL_METADATA.
 */
export function buildPublicationMetadata(
  project: BookProject,
  edition: EditionRecord,
  e1Package?: E1BookPackage | null,
  editorialEdition?: EditorialEdition | null
): PublicationMetadataRecord {
  const canonical: CanonicalMetadata = {
    bookId: project.id,
    title: project.title,
    subtitle: project.authorNotes || '',
    author: edition.authorName || 'Original Author',
    originalLanguage: (project.productionLanguage as 'en' | 'es') || 'en',
    category: project.category,
    centralConcept: project.description,
    totalChapters: editorialEdition?.chapters.length || e1Package?.blueprint.chapters.length || 0,
    targetPages: project.targetPageCount,
    coverAssetId: editorialEdition?.visualAssetIds?.find((id) => id.includes('cover')),
    e1PackageStatus: e1Package?.status,
  };

  const editionMeta: EditionMetadata = {
    editionId: edition.id,
    editionTitle: edition.editionName,
    editionType: edition.editionType,
    publisherImprint: edition.publisherImprint,
    publicationDate: new Date().toISOString().split('T')[0],
    synopsis: project.description,
    keywords: [project.category, project.targetAudience, project.lengthClass],
    bisacCategories: [getCategoryBisacMapping(project.category)],
    seriesName: '',
    seriesNumber: '',
    copyrightNotice: `© ${new Date().getFullYear()} ${edition.authorName || 'Author'}. All rights reserved under ${edition.rightsStatus}.`,
    editionLanguage: edition.productionLanguage,
  };

  const channelOverrides: Record<string, ChannelMetadataOverride> = {
    kdp: {
      channelId: 'kdp',
      drmEnabled: true,
      priceCents: 999, // $9.99 reference
      currency: 'USD',
      adultContent: false,
    },
    draft2digital: {
      channelId: 'draft2digital',
      drmEnabled: false,
      priceCents: 999,
      currency: 'USD',
      adultContent: false,
    },
    ingramspark: {
      channelId: 'ingramspark',
      priceCents: 1999, // $19.99 print reference
      currency: 'USD',
      adultContent: false,
    },
    lulu: {
      channelId: 'lulu',
      priceCents: 1899,
      currency: 'USD',
      adultContent: false,
    },
    publishdrive: {
      channelId: 'publishdrive',
      drmEnabled: false,
      priceCents: 999,
      currency: 'USD',
      adultContent: false,
    },
    direct_distribution: {
      channelId: 'direct_distribution',
      drmEnabled: false,
      priceCents: 1499,
      currency: 'USD',
      adultContent: false,
    },
  };

  return {
    bookId: project.id,
    editionId: edition.id,
    canonical,
    edition: editionMeta,
    channelOverrides,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Standard mapping of EditorynIQ categories to industry standard BISAC codes.
 */
export function getCategoryBisacMapping(cat: string): string {
  const map: Record<string, string> = {
    technical: 'COM051000 - COMPUTERS / Software Development & Engineering',
    business: 'BUS000000 - BUSINESS & ECONOMICS / General',
    academic: 'EDU000000 - EDUCATION / General',
    fiction: 'FIC000000 - FICTION / General',
    'non-fiction': 'BIO000000 - BIOGRAPHY & AUTOBIOGRAPHY / General',
    'self-help': 'SEL000000 - SELF-HELP / General',
    children: 'JUV000000 - JUVENILE FICTION / General',
    'mind-philosophy': 'PHI000000 - PHILOSOPHY / General',
    'art-design': 'ART000000 - ART / General',
    poetry: 'POE000000 - POETRY / General',
  };

  return map[cat.toLowerCase()] || 'GEN000000 - GENERAL LITERATURE';
}

/**
 * Compiles a structured ONIX 3.0-compatible JSON metadata object.
 */
export function generateOnixJsonMetadata(record: PublicationMetadataRecord): any {
  return {
    $schema: 'https://ns.editeur.org/onix/3.0/reference',
    header: {
      sender: {
        senderName: record.edition.publisherImprint || 'EditorynIQ Publishing System',
        contactName: 'Editorial Master Desk',
      },
      sentDateTime: new Date().toISOString(),
      defaultCurrency: 'USD',
    },
    product: {
      recordReference: `editoryniq_${record.bookId}_${record.editionId}`,
      notificationType: '03', // Advanced notification of confirmed edition
      productIdentifier: {
        productIDType: '15', // ISBN-13
        idValue: record.edition.editionId,
      },
      descriptiveDetail: {
        productComposition: '00', // Single-component retail product
        productForm: 'DG', // Digital / electronic book
        titleDetail: {
          titleType: '01', // Distinctive title
          titleElement: {
            titleElementLevel: '01',
            titleText: record.canonical.title,
            subtitle: record.canonical.subtitle || undefined,
          },
        },
        contributor: [
          {
            sequenceNumber: '1',
            contributorRole: 'A01', // By (author)
            personName: record.canonical.author,
          },
        ],
        language: [
          {
            languageRole: '01', // Language of text
            languageCode: record.edition.editionLanguage === 'es' ? 'spa' : 'eng',
          },
        ],
        extent: [
          {
            extentType: '00', // Main content page count
            extentValue: record.canonical.targetPages.toString(),
            extentUnit: '03', // Pages
          },
        ],
        subject: record.edition.bisacCategories.map((c) => ({
          subjectSchemeIdentifier: '10', // BISAC
          subjectCode: c.split(' - ')[0],
          subjectHeadingText: c,
        })),
        audience: {
          audienceCodeType: '01',
          audienceCodeValue: '01', // General adult / professional
        },
      },
      collateralDetail: {
        textContent: [
          {
            textType: '03', // Description / synopsis
            text: record.edition.synopsis,
          },
        ],
      },
      publishingDetail: {
        imprint: {
          imprintName: record.edition.publisherImprint,
        },
        publishingDate: [
          {
            publishingDateRole: '01', // Publication date
            date: record.edition.publicationDate.replace(/-/g, ''),
          },
        ],
        copyrightStatement: {
          copyrightYear: new Date().getFullYear().toString(),
          copyrightOwner: {
            corporateName: record.edition.publisherImprint,
          },
        },
      },
    },
  };
}

/**
 * Escapes characters for safe XML output in ONIX 3.0 message.
 */
function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface OnixXmlExportResult {
  xmlContent: string;
  status: 'ONIX_NOT_VERIFIED';
  specification: 'ONIX for Books Release 3.0 (EDItEUR)';
  validationNotice: string;
}

/**
 * Generates an authentic ONIX 3.0 Release 3 XML document.
 * Explicitly classified as ONIX_NOT_VERIFIED until validated by an external EDItEUR XSD parser.
 */
export function generateOnix3Xml(record: PublicationMetadataRecord): OnixXmlExportResult {
  const sentDateTime = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const pubDateFormatted = record.edition.publicationDate.replace(/-/g, '');
  const langCode = record.edition.editionLanguage === 'es' ? 'spa' : 'eng';
  const isbn = record.edition.editionId.replace(/[^0-9]/g, '');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<ONIXMessage release="3.0" xmlns="http://ns.editeur.org/onix/3.0/reference">
  <Header>
    <Sender>
      <SenderName>${escapeXml(record.edition.publisherImprint || 'EditorynIQ Publishing')}</SenderName>
      <ContactName>Editorial Master Desk</ContactName>
    </Sender>
    <SentDateTime>${sentDateTime}</SentDateTime>
    <DefaultCurrencyCode>USD</DefaultCurrencyCode>
  </Header>
  <Product>
    <RecordReference>editoryniq_${escapeXml(record.bookId)}_${escapeXml(record.editionId)}</RecordReference>
    <NotificationType>03</NotificationType>
    <RecordSourceType>01</RecordSourceType>
    <ProductIdentifier>
      <ProductIDType>15</ProductIDType>
      <IDValue>${escapeXml(isbn || '9780000000000')}</IDValue>
    </ProductIdentifier>
    <DescriptiveDetail>
      <ProductComposition>00</ProductComposition>
      <ProductForm>DG</ProductForm>
      <ProductFormDetail>E101</ProductFormDetail>
      <TitleDetail>
        <TitleType>01</TitleType>
        <TitleElement>
          <TitleElementLevel>01</TitleElementLevel>
          <TitleText>${escapeXml(record.canonical.title)}</TitleText>
          ${record.canonical.subtitle ? `<Subtitle>${escapeXml(record.canonical.subtitle)}</Subtitle>` : ''}
        </TitleElement>
      </TitleDetail>
      <Contributor>
        <SequenceNumber>1</SequenceNumber>
        <ContributorRole>A01</ContributorRole>
        <PersonName>${escapeXml(record.canonical.author)}</PersonName>
      </Contributor>
      <Language>
        <LanguageRole>01</LanguageRole>
        <LanguageCode>${langCode}</LanguageCode>
      </Language>
      <Extent>
        <ExtentType>00</ExtentType>
        <ExtentValue>${record.canonical.targetPages || 250}</ExtentValue>
        <ExtentUnit>03</ExtentUnit>
      </Extent>
      ${record.edition.bisacCategories
        .map(
          (cat) => `
      <Subject>
        <SubjectSchemeIdentifier>10</SubjectSchemeIdentifier>
        <SubjectCode>${escapeXml(cat.split(' - ')[0])}</SubjectCode>
        <SubjectHeadingText>${escapeXml(cat)}</SubjectHeadingText>
      </Subject>`
        )
        .join('')}
      <Audience>
        <AudienceCodeType>01</AudienceCodeType>
        <AudienceCodeValue>01</AudienceCodeValue>
      </Audience>
    </DescriptiveDetail>
    <CollateralDetail>
      <TextContent>
        <TextType>03</TextType>
        <ContentAudience>00</ContentAudience>
        <Text textformat="05">${escapeXml(record.edition.synopsis)}</Text>
      </TextContent>
    </CollateralDetail>
    <PublishingDetail>
      <Imprint>
        <ImprintName>${escapeXml(record.edition.publisherImprint)}</ImprintName>
      </Imprint>
      <Publisher>
        <PublishingRole>01</PublishingRole>
        <PublisherName>${escapeXml(record.edition.publisherImprint)}</PublisherName>
      </Publisher>
      <PublishingDate>
        <PublishingDateRole>01</PublishingDateRole>
        <Date dateformat="00">${pubDateFormatted}</Date>
      </PublishingDate>
      <CopyrightStatement>
        <CopyrightYear>${new Date().getFullYear()}</CopyrightYear>
        <CopyrightOwner>
          <CorporateName>${escapeXml(record.edition.publisherImprint)}</CorporateName>
        </CopyrightOwner>
      </CopyrightStatement>
    </PublishingDetail>
  </Product>
</ONIXMessage>`;

  return {
    xmlContent,
    status: 'ONIX_NOT_VERIFIED',
    specification: 'ONIX for Books Release 3.0 (EDItEUR)',
    validationNotice:
      'ONIX 3.0 XML generated in well-formed syntax. Status is ONIX_NOT_VERIFIED because schema validation requires an external EDItEUR XSD validator.',
  };
}

