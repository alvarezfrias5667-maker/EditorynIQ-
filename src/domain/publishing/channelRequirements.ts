import { ChannelProfile, ChannelId, ChannelRequirement } from './publishingTypes';

export const DISTRIBUTION_CHANNELS: Record<ChannelId, ChannelProfile> = {
  kdp: {
    id: 'kdp',
    displayName: 'Amazon Kindle Direct Publishing (KDP)',
    description:
      'Direct distribution to Amazon Kindle store worldwide. Supports Kindle eBooks (EPUB/KPF) and Print-on-Demand paperback/hardcover (PDF).',
    supportedFormats: ['PDF', 'EPUB'],
    isbnRequirement: 'FREE_ASSIGNMENT_POSSIBLE',
    status: 'MANUAL_EXPORT_AVAILABLE',
    statusReason:
      'Direct API integration requires Amazon Vendor credentials (reserved for PROM 8). Complete manual upload package with manifest and validated files is available.',
    officialPortalUrl: 'https://kdp.amazon.com',
    submissionGuide:
      '1. Export the KDP Package ZIP. 2. Log into KDP Console. 3. Upload the Master PDF (Print) or EPUB (Kindle). 4. Paste verified metadata from ONIX/Metadata JSON. 5. Launch KDP Online Previewer.',
    requirements: [
      {
        id: 'kdp_file_format',
        name: 'File Format Specification',
        category: 'FILE_FORMAT',
        rule: 'PDF 1.4+ for Print interior; EPUB 3 reflowable or fixed-layout for Kindle eBook.',
        isMandatory: true,
      },
      {
        id: 'kdp_page_bleed',
        name: 'Print Bleed & Margins',
        category: 'FILE_FORMAT',
        rule: 'Interior PDF requires minimum 0.25" (6.35mm) outside margin and calculated gutter for spine thickness.',
        isMandatory: true,
      },
      {
        id: 'kdp_cover',
        name: 'Cover Artwork Specification',
        category: 'COVER',
        rule: 'Print wrap cover must include front, back, spine calculation, and barcode area (minimum 300 DPI).',
        isMandatory: true,
      },
      {
        id: 'kdp_rights',
        name: 'Publishing Rights Declaration',
        category: 'RIGHTS',
        rule: 'Author must verify either public domain status or holding necessary commercial distribution rights.',
        isMandatory: true,
      },
      {
        id: 'kdp_isbn',
        name: 'ISBN Identification',
        category: 'ISBN',
        rule: 'Optional for eBook (ASIN assigned). Mandatory for Print (free KDP ISBN or author-owned ISBN-13).',
        isMandatory: false,
      },
    ],
  },

  draft2digital: {
    id: 'draft2digital',
    displayName: 'Draft2Digital (D2D)',
    description:
      'Aggregated distribution to Apple Books, Barnes & Noble, Kobo, Smashwords, Tolino, Vivlio, and public libraries worldwide.',
    supportedFormats: ['EPUB', 'DOCX'],
    isbnRequirement: 'FREE_ASSIGNMENT_POSSIBLE',
    status: 'MANUAL_EXPORT_AVAILABLE',
    statusReason:
      'API transmission requires OAuth publisher token (scheduled for PROM 8). Manual EPUB/DOCX bundle can be uploaded directly to D2D dashboard.',
    officialPortalUrl: 'https://www.draft2digital.com',
    submissionGuide:
      '1. Export Publication Package. 2. Upload EPUB 3.3 or structured DOCX to Draft2Digital. 3. D2D converts and distributes across multi-retailer catalog.',
    requirements: [
      {
        id: 'd2d_epub_valid',
        name: 'EPUB / DOCX Structure',
        category: 'FILE_FORMAT',
        rule: 'Standard EPUB 3.3 or structured DOCX with native Heading 1/2 styles without manual page breaks in headings.',
        isMandatory: true,
      },
      {
        id: 'd2d_no_cover_interior',
        name: 'Clean Interior Files',
        category: 'COVER',
        rule: 'Do not embed the book cover inside the manuscript interior file; D2D injects cover during compilation.',
        isMandatory: true,
      },
      {
        id: 'd2d_metadata',
        name: 'Title & Contributor Consistency',
        category: 'METADATA',
        rule: 'Interior title and author names must exactly match dashboard metadata without mismatched pseudonyms.',
        isMandatory: true,
      },
      {
        id: 'd2d_rights',
        name: 'Digital Distribution Territory Rights',
        category: 'RIGHTS',
        rule: 'Must declare worldwide distribution rights or select specific allowed retailer territories.',
        isMandatory: true,
      },
    ],
  },

  ingramspark: {
    id: 'ingramspark',
    displayName: 'IngramSpark Global Distribution',
    description:
      'Premier wholesale global book distribution to over 40,000 independent bookstores, Barnes & Noble, Amazon, and university libraries.',
    supportedFormats: ['PDF', 'EPUB'],
    isbnRequirement: 'MANDATORY',
    status: 'MANUAL_EXPORT_AVAILABLE',
    statusReason:
      'Direct CoreSource EDI connection requires enterprise account credentials (scheduled for PROM 8). Fully compliant PDF/X-1a and EPUB 3 packages are prepared.',
    officialPortalUrl: 'https://www.ingramspark.com',
    submissionGuide:
      '1. Verify author-owned ISBN-13 (IngramSpark does not provide free ISBNs for all global distribution channels). 2. Export Master PDF and Cover PDF. 3. Upload to IngramSpark title management.',
    requirements: [
      {
        id: 'ingram_pdf_press',
        name: 'PDF/X-1a or PDF/X-3 Specification',
        category: 'FILE_FORMAT',
        rule: 'Interior files must be high-resolution PDF (minimum 300 DPI images, CMYK or Grayscale, all fonts fully embedded).',
        isMandatory: true,
      },
      {
        id: 'ingram_isbn_mandatory',
        name: 'Author-Owned ISBN-13',
        category: 'ISBN',
        rule: 'A valid, registered 13-digit ISBN is strictly mandatory for both Print and eBook distribution.',
        isMandatory: true,
      },
      {
        id: 'ingram_page_even',
        name: 'Even Page Count Requirement',
        category: 'FILE_FORMAT',
        rule: 'Total page count must be an even number divisible by 2 for proper press signature imposition.',
        isMandatory: true,
      },
      {
        id: 'ingram_spine_calc',
        name: 'Precise Spine Width Geometry',
        category: 'COVER',
        rule: 'Cover spread must account for exact PPI paper stock thickness (White 50lb vs Crème 50lb).',
        isMandatory: true,
      },
    ],
  },

  lulu: {
    id: 'lulu',
    displayName: 'Lulu Direct & Global',
    description:
      'On-demand publishing, custom book bindings (saddle stitch, coil, case wrap), and direct e-commerce integration with Shopify/WooCommerce.',
    supportedFormats: ['PDF', 'EPUB'],
    isbnRequirement: 'OPTIONAL',
    status: 'MANUAL_EXPORT_AVAILABLE',
    statusReason:
      'API credentials are not configured in this environment. Ready-to-upload PDF and EPUB master packages are available for manual dashboard fulfillment.',
    officialPortalUrl: 'https://www.lulu.com',
    submissionGuide:
      '1. Export the PDF Master and EPUB. 2. Choose binding type and interior paper on Lulu. 3. Upload interior and cover. 4. Order proof copy.',
    requirements: [
      {
        id: 'lulu_pdf',
        name: 'PDF Interior & Cover',
        category: 'FILE_FORMAT',
        rule: 'Single-page PDF interior (not spreads) and separate two-page or full spread cover PDF.',
        isMandatory: true,
      },
      {
        id: 'lulu_rgb_support',
        name: 'Color Space Consistency',
        category: 'FILE_FORMAT',
        rule: 'Accepts sRGB for digital color print profiles; neutral grayscale for standard black/white interior.',
        isMandatory: true,
      },
      {
        id: 'lulu_safety_margins',
        name: '0.5" Safety Margin',
        category: 'FILE_FORMAT',
        rule: 'All text and essential graphic elements must sit 0.5" (12.7mm) away from trim line.',
        isMandatory: true,
      },
    ],
  },

  lulu_direct: {
    id: 'lulu_direct',
    displayName: 'Lulu Direct (eCommerce & Shopify/WooCommerce)',
    description:
      'Direct-to-consumer print fulfillment connected to external storefronts. Requires active Lulu developer application credentials.',
    supportedFormats: ['PDF', 'EPUB'],
    isbnRequirement: 'OPTIONAL',
    status: 'NOT_CONFIGURED',
    statusReason:
      'Lulu Direct developer client ID & secret are not configured. Manual submission package available via Lulu standard publishing.',
    officialPortalUrl: 'https://www.lulu.com/direct',
    submissionGuide:
      '1. Create Lulu developer app. 2. Configure OAuth client credentials. 3. Map SKUs to verified publication packages.',
    requirements: [
      {
        id: 'lulu_direct_api_cred',
        name: 'Lulu Developer Client Credentials',
        category: 'RIGHTS',
        rule: 'Valid Client ID and Client Secret generated in Lulu Developer Portal.',
        isMandatory: true,
      },
      {
        id: 'lulu_direct_pdf',
        name: 'Single Page Print PDF Interior',
        category: 'FILE_FORMAT',
        rule: 'High-resolution PDF interior without spreads with trim box specifications.',
        isMandatory: true,
      },
    ],
  },

  lulu_print_api: {
    id: 'lulu_print_api',
    displayName: 'Lulu Enterprise Print API',
    description:
      'Programmatic print-on-demand API for automated production, batch drop-shipping, and webhook status tracking.',
    supportedFormats: ['PDF'],
    isbnRequirement: 'OPTIONAL',
    status: 'NOT_CONFIGURED',
    statusReason:
      'Enterprise Print API token is not configured. Operates under manual package export mode.',
    officialPortalUrl: 'https://developer.lulu.com',
    submissionGuide:
      '1. Generate Bearer token via /oauth/token. 2. Post print job payload with authenticated interior and cover URLs.',
    requirements: [
      {
        id: 'lulu_print_api_token',
        name: 'Bearer Authorization Token',
        category: 'RIGHTS',
        rule: 'Valid enterprise Bearer token with print_job:create scope.',
        isMandatory: true,
      },
      {
        id: 'lulu_print_pdf_spec',
        name: 'PDF/X Compliant Print Stream',
        category: 'FILE_FORMAT',
        rule: 'Single-file PDF with embedded fonts, 300 DPI graphics, and exact trim dimensions.',
        isMandatory: true,
      },
    ],
  },

  publishdrive: {
    id: 'publishdrive',
    displayName: 'PublishDrive Global Subscription',
    description:
      'Aggregator covering Amazon, Apple, Google Play Books, Kobo, OverDrive, Dangdang, and over 400 global digital stores and library networks.',
    supportedFormats: ['EPUB', 'PDF'],
    isbnRequirement: 'OPTIONAL',
    status: 'MANUAL_EXPORT_AVAILABLE',
    statusReason:
      'Enterprise catalog integration will connect in PROM 8. Manual catalog upload is fully supported with our ONIX metadata and EPUB 3.3 package.',
    officialPortalUrl: 'https://publishdrive.com',
    submissionGuide:
      '1. Download Package ZIP containing ONIX 3.0 metadata JSON and EPUB 3.3. 2. Log into PublishDrive. 3. Import title and assign royalty splits.',
    requirements: [
      {
        id: 'pd_epub_check',
        name: 'EPUB 3.3 Compliance',
        category: 'FILE_FORMAT',
        rule: 'Must comply with IDPF/W3C EPUB standards with valid navigation table and semantic HTML5.',
        isMandatory: true,
      },
      {
        id: 'pd_onix_metadata',
        name: 'Rich Categorization & BISAC',
        category: 'METADATA',
        rule: 'At least one primary BISAC subject code and complete synopsis of at least 150 characters.',
        isMandatory: true,
      },
      {
        id: 'pd_rights',
        name: 'Global Digital Rights Declaration',
        category: 'RIGHTS',
        rule: 'Confirmation that title does not infringe trademarked characters or proprietary code.',
        isMandatory: true,
      },
    ],
  },

  direct_distribution: {
    id: 'direct_distribution',
    displayName: 'Direct Author Distribution (Self-Hosted / Direct Sale)',
    description:
      'Author-controlled direct sales via personal landing pages, reader funnels, digital downloads, and print-on-demand fulfillment.',
    supportedFormats: ['PDF', 'EPUB', 'DOCX'],
    isbnRequirement: 'OPTIONAL',
    status: 'MANUAL_EXPORT_AVAILABLE',
    statusReason:
      'Full package ZIP ready for immediate self-hosting, distribution to beta readers, advance review copies (ARCs), or personal website sales.',
    officialPortalUrl: '',
    submissionGuide:
      '1. Download complete Publication Package ZIP. 2. Extract verified PDF, EPUB 3.3, and DOCX files. 3. Distribute directly to readers, patrons, or hosting platforms.',
    requirements: [
      {
        id: 'direct_files',
        name: 'Master Artifact Availability',
        category: 'FILE_FORMAT',
        rule: 'Ensure at least one reader-ready format (PDF or EPUB) is compiled and verified with SHA-256.',
        isMandatory: true,
      },
      {
        id: 'direct_rights',
        name: 'Author Ownership Statement',
        category: 'RIGHTS',
        rule: 'Clear author copyright notice and license terms embedded in preliminary front matter.',
        isMandatory: true,
      },
    ],
  },
};
