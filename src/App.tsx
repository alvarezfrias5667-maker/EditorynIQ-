import React, { useState, useEffect } from 'react';
import { PublicLayout } from './components/layout/PublicLayout';
import { HomePage } from './pages/HomePage';
import { PricingPage } from './pages/PricingPage';
import { StartPage } from './pages/StartPage';
import { StudioPage } from './pages/StudioPage';
import { LocalBookProjectPage } from './pages/LocalBookProjectPage';
import { BookResearchPage } from './pages/BookResearchPage';
import { BookBlueprintPage } from './pages/BookBlueprintPage';
import { BookMemoryPage } from './pages/BookMemoryPage';
import { ManuscriptStudioPage } from './pages/ManuscriptStudioPage';
import { ManuscriptChapterPage } from './pages/ManuscriptChapterPage';
import { BookTranslationPage } from './pages/BookTranslationPage';
import { VisualProductionPage } from './pages/VisualProductionPage';
import { BookCoverStudioPage } from './pages/BookCoverStudioPage';
import { IllustrationStudioPage } from './pages/IllustrationStudioPage';
import { DiagramStudioPage } from './pages/DiagramStudioPage';
import { ChartStudioPage } from './pages/ChartStudioPage';
import { InfographicStudioPage } from './pages/InfographicStudioPage';
import { VisualAssetLibraryPage } from './pages/VisualAssetLibraryPage';
import { EditorialProductionPage } from './pages/EditorialProductionPage';
import { EditorialLayoutPage } from './pages/EditorialLayoutPage';
import { BookPreviewPage } from './pages/BookPreviewPage';
import { BookExportPage } from './pages/BookExportPage';
import { EditorialQualityPage } from './pages/EditorialQualityPage';
import { BookAccessibilityPage } from './pages/BookAccessibilityPage';
import { PublishingHubPage } from './pages/publishing/PublishingHubPage';
import { EditionsPage } from './pages/publishing/EditionsPage';
import { MetadataPage } from './pages/publishing/MetadataPage';
import { ChannelsPage } from './pages/publishing/ChannelsPage';
import { PackagesPage } from './pages/publishing/PackagesPage';
import { HistoryPage } from './pages/publishing/HistoryPage';
import { MarketplaceCatalogPage } from './pages/marketplace/MarketplaceCatalogPage';
import { BookProductDetailPage } from './pages/marketplace/BookProductDetailPage';
import { AuthorDirectoryPage } from './pages/marketplace/AuthorDirectoryPage';
import { AuthorProfilePage } from './pages/marketplace/AuthorProfilePage';
import { SellerWorkspacePage } from './pages/marketplace/SellerWorkspacePage';
import { ListingManagementPage } from './pages/marketplace/ListingManagementPage';
import { BuyerLibraryPage } from './pages/marketplace/BuyerLibraryPage';
import { CommerceOperationsPage } from './pages/marketplace/CommerceOperationsPage';
import { OperationsHubPage } from './pages/operations/OperationsHubPage';
import { ProductionReadinessPage } from './pages/operations/ProductionReadinessPage';
import { LocalDeliveryPage } from './pages/operations/LocalDeliveryPage';
import { RecoveryEvidencePage } from './pages/operations/RecoveryEvidencePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { CookiesPage } from './pages/CookiesPage';
import { CopyrightPage } from './pages/CopyrightPage';
import { AcceptableUsePage } from './pages/AcceptableUsePage';
import { RefundPolicyPage } from './pages/RefundPolicyPage';
import { AuthorTermsPage } from './pages/AuthorTermsPage';
import { MarketplaceProtectionPage } from './pages/MarketplaceProtectionPage';
import { AccessibilityPage } from './pages/AccessibilityPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProductionMode } from './domain/bookProjectTypes';

function getInitialPath(): string {
  if (typeof window === 'undefined') return '/';
  const hash = window.location.hash.slice(1);
  if (hash) return hash;
  return window.location.pathname + window.location.search;
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(getInitialPath());

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getInitialPath());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (pathWithQuery: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', pathWithQuery);
      window.location.hash = pathWithQuery;
      setCurrentPath(pathWithQuery);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Parse path & query params
  const [pathOnly, searchOnly] = currentPath.split('?');
  const queryParams = new URLSearchParams(searchOnly || '');
  const modeParam = (queryParams.get('mode') as ProductionMode) || 'idea';

  // Match studio project route: /studio/:id or #/studio/:id
  const isStudioProjectRoute = pathOnly.startsWith('/studio/') && pathOnly.length > 8;
  const studioProjectId = isStudioProjectRoute ? pathOnly.substring(8) : null;

  // Match E1 routes: /books/:id/research, /books/:id/blueprint, /books/:id/memory
  const researchMatch = pathOnly.match(/^\/books\/([^/]+)\/research$/);
  const blueprintMatch = pathOnly.match(/^\/books\/([^/]+)\/blueprint$/);
  const memoryMatch = pathOnly.match(/^\/books\/([^/]+)\/memory$/);

  // Match E2 routes: /books/:id/manuscript, /books/:id/manuscript/:chapterId, /books/:id/translation
  const manuscriptMatch = pathOnly.match(/^\/books\/([^/]+)\/manuscript$/);
  const chapterMatch = pathOnly.match(/^\/books\/([^/]+)\/manuscript\/([^/]+)$/);
  const translationMatch = pathOnly.match(/^\/books\/([^/]+)\/translation$/);

  // Match E3 routes: /books/:id/visual, /books/:id/visual/covers, /books/:id/visual/illustrations, /books/:id/visual/diagrams, /books/:id/visual/charts, /books/:id/visual/infographics, /books/:id/visual/library
  const visualMatch = pathOnly.match(/^\/books\/([^/]+)\/visual$/);
  const coversMatch = pathOnly.match(/^\/books\/([^/]+)\/visual\/covers$/);
  const illustrationsMatch = pathOnly.match(/^\/books\/([^/]+)\/visual\/illustrations$/);
  const diagramsMatch = pathOnly.match(/^\/books\/([^/]+)\/visual\/diagrams$/);
  const chartsMatch = pathOnly.match(/^\/books\/([^/]+)\/visual\/charts$/);
  const infographicsMatch = pathOnly.match(/^\/books\/([^/]+)\/visual\/infographics$/);
  const libraryMatch = pathOnly.match(/^\/books\/([^/]+)\/visual\/library$/);

  // Match E4 routes: /books/:id/editorial, /books/:id/editorial/layout, /books/:id/editorial/preview, /books/:id/editorial/exports, /books/:id/editorial/quality, /books/:id/editorial/accessibility
  const editorialMatch = pathOnly.match(/^\/books\/([^/]+)\/editorial$/);
  const editorialLayoutMatch = pathOnly.match(/^\/books\/([^/]+)\/editorial\/layout$/);
  const editorialPreviewMatch = pathOnly.match(/^\/books\/([^/]+)\/editorial\/preview$/);
  const editorialExportsMatch = pathOnly.match(/^\/books\/([^/]+)\/editorial\/exports$/);
  const editorialQualityMatch = pathOnly.match(/^\/books\/([^/]+)\/editorial\/quality$/);
  const editorialAccessibilityMatch = pathOnly.match(/^\/books\/([^/]+)\/editorial\/accessibility$/);

  // Match E5 routes: /books/:id/publishing, /books/:id/publishing/editions, /books/:id/publishing/metadata, /books/:id/publishing/channels, /books/:id/publishing/packages, /books/:id/publishing/history
  const publishingMatch = pathOnly.match(/^\/books\/([^/]+)\/publishing$/);
  const publishingEditionsMatch = pathOnly.match(/^\/books\/([^/]+)\/publishing\/editions$/);
  const publishingMetadataMatch = pathOnly.match(/^\/books\/([^/]+)\/publishing\/metadata$/);
  const publishingChannelsMatch = pathOnly.match(/^\/books\/([^/]+)\/publishing\/channels$/);
  const publishingPackagesMatch = pathOnly.match(/^\/books\/([^/]+)\/publishing\/packages$/);
  const publishingHistoryMatch = pathOnly.match(/^\/books\/([^/]+)\/publishing\/history$/);

  // Match PROM 9 Operations routes: /books/:id/operations, /books/:id/operations/readiness, /books/:id/operations/delivery, /books/:id/operations/recovery
  const operationsMatch = pathOnly.match(/^\/books\/([^/]+)\/operations$/);
  const operationsReadinessMatch = pathOnly.match(/^\/books\/([^/]+)\/operations\/readiness$/);
  const operationsDeliveryMatch = pathOnly.match(/^\/books\/([^/]+)\/operations\/delivery$/);
  const operationsRecoveryMatch = pathOnly.match(/^\/books\/([^/]+)\/operations\/recovery$/);

  // Match E6 routes
  const marketplaceBookMatch = pathOnly.match(/^\/marketplace\/(?:books|book)\/([^/]+)$/);
  const marketplaceAuthorMatch = pathOnly.match(/^\/marketplace\/(?:authors|author)\/([^/]+)$/);

  const renderContent = () => {
    if (pathOnly === '/' || pathOnly === '') {
      return <HomePage onNavigate={navigate} />;
    }

    if (pathOnly === '/pricing') {
      return <PricingPage onNavigate={navigate} />;
    }

    if (pathOnly === '/start') {
      return <StartPage initialMode={modeParam} onNavigate={navigate} />;
    }

    if (pathOnly === '/studio') {
      return <StudioPage onNavigate={navigate} />;
    }

    if (isStudioProjectRoute && studioProjectId) {
      return <LocalBookProjectPage projectId={studioProjectId} onNavigate={navigate} />;
    }

    if (researchMatch) {
      return <BookResearchPage projectId={researchMatch[1]} onNavigate={navigate} />;
    }

    if (blueprintMatch) {
      return <BookBlueprintPage projectId={blueprintMatch[1]} onNavigate={navigate} />;
    }

    if (memoryMatch) {
      return <BookMemoryPage projectId={memoryMatch[1]} onNavigate={navigate} />;
    }

    if (manuscriptMatch) {
      return <ManuscriptStudioPage projectId={manuscriptMatch[1]} onNavigate={navigate} />;
    }

    if (chapterMatch) {
      return <ManuscriptChapterPage projectId={chapterMatch[1]} chapterId={chapterMatch[2]} onNavigate={navigate} />;
    }

    if (translationMatch) {
      return <BookTranslationPage projectId={translationMatch[1]} onNavigate={navigate} />;
    }

    if (visualMatch) {
      return <VisualProductionPage projectId={visualMatch[1]} onNavigate={navigate} />;
    }

    if (coversMatch) {
      return <BookCoverStudioPage projectId={coversMatch[1]} onNavigate={navigate} />;
    }

    if (illustrationsMatch) {
      return <IllustrationStudioPage projectId={illustrationsMatch[1]} onNavigate={navigate} />;
    }

    if (diagramsMatch) {
      return <DiagramStudioPage projectId={diagramsMatch[1]} onNavigate={navigate} />;
    }

    if (chartsMatch) {
      return <ChartStudioPage projectId={chartsMatch[1]} onNavigate={navigate} />;
    }

    if (infographicsMatch) {
      return <InfographicStudioPage projectId={infographicsMatch[1]} onNavigate={navigate} />;
    }

    if (libraryMatch) {
      return <VisualAssetLibraryPage projectId={libraryMatch[1]} onNavigate={navigate} />;
    }

    if (editorialMatch) {
      return <EditorialProductionPage projectId={editorialMatch[1]} onNavigate={navigate} />;
    }

    if (editorialLayoutMatch) {
      return <EditorialLayoutPage projectId={editorialLayoutMatch[1]} onNavigate={navigate} />;
    }

    if (editorialPreviewMatch) {
      return <BookPreviewPage projectId={editorialPreviewMatch[1]} onNavigate={navigate} />;
    }

    if (editorialExportsMatch) {
      return <BookExportPage projectId={editorialExportsMatch[1]} onNavigate={navigate} />;
    }

    if (editorialQualityMatch) {
      return <EditorialQualityPage projectId={editorialQualityMatch[1]} onNavigate={navigate} />;
    }

    if (editorialAccessibilityMatch) {
      return <BookAccessibilityPage projectId={editorialAccessibilityMatch[1]} onNavigate={navigate} />;
    }

    if (publishingMatch) {
      return <PublishingHubPage projectId={publishingMatch[1]} onNavigate={navigate} />;
    }

    if (publishingEditionsMatch) {
      return <EditionsPage projectId={publishingEditionsMatch[1]} onNavigate={navigate} />;
    }

    if (publishingMetadataMatch) {
      return <MetadataPage projectId={publishingMetadataMatch[1]} onNavigate={navigate} />;
    }

    if (publishingChannelsMatch) {
      return <ChannelsPage projectId={publishingChannelsMatch[1]} onNavigate={navigate} />;
    }

    if (publishingPackagesMatch) {
      return <PackagesPage projectId={publishingPackagesMatch[1]} onNavigate={navigate} />;
    }

    if (publishingHistoryMatch) {
      return <HistoryPage projectId={publishingHistoryMatch[1]} onNavigate={navigate} />;
    }

    // PROM 9 Operations & Delivery Routes
    if (operationsMatch) {
      return <OperationsHubPage projectId={operationsMatch[1]} onNavigate={navigate} />;
    }

    if (operationsReadinessMatch) {
      return <ProductionReadinessPage projectId={operationsReadinessMatch[1]} onNavigate={navigate} />;
    }

    if (operationsDeliveryMatch) {
      return <LocalDeliveryPage projectId={operationsDeliveryMatch[1]} onNavigate={navigate} />;
    }

    if (operationsRecoveryMatch) {
      return <RecoveryEvidencePage projectId={operationsRecoveryMatch[1]} onNavigate={navigate} />;
    }

    // E6 Marketplace Routes
    if (pathOnly === '/marketplace') {
      return <MarketplaceCatalogPage onNavigate={navigate} />;
    }

    if (marketplaceBookMatch) {
      return <BookProductDetailPage listingId={marketplaceBookMatch[1]} onNavigate={navigate} />;
    }

    if (pathOnly === '/marketplace/authors') {
      return <AuthorDirectoryPage onNavigate={navigate} />;
    }

    if (marketplaceAuthorMatch) {
      return <AuthorProfilePage authorId={marketplaceAuthorMatch[1]} onNavigate={navigate} />;
    }

    if (pathOnly === '/marketplace/seller/listings') {
      return <ListingManagementPage onNavigate={navigate} />;
    }

    if (pathOnly === '/marketplace/seller') {
      return <SellerWorkspacePage onNavigate={navigate} />;
    }

    if (pathOnly === '/marketplace/library') {
      return <BuyerLibraryPage onNavigate={navigate} />;
    }

    if (pathOnly === '/marketplace/operations') {
      return <CommerceOperationsPage onNavigate={navigate} />;
    }

    if (pathOnly === '/how-it-works') {
      return <HowItWorksPage onNavigate={navigate} />;
    }

    if (pathOnly === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }

    if (pathOnly === '/contact') {
      return <ContactPage onNavigate={navigate} />;
    }

    if (pathOnly === '/privacy') {
      return <PrivacyPage />;
    }

    if (pathOnly === '/terms') {
      return <TermsPage />;
    }

    if (pathOnly === '/cookies') {
      return <CookiesPage />;
    }

    if (pathOnly === '/copyright') {
      return <CopyrightPage />;
    }

    if (pathOnly === '/acceptable-use') {
      return <AcceptableUsePage />;
    }

    if (pathOnly === '/refund-policy') {
      return <RefundPolicyPage />;
    }

    if (pathOnly === '/author-terms') {
      return <AuthorTermsPage />;
    }

    if (pathOnly === '/marketplace-protection') {
      return <MarketplaceProtectionPage />;
    }

    if (pathOnly === '/accessibility') {
      return <AccessibilityPage />;
    }

    return <NotFoundPage onNavigate={navigate} />;
  };

  return (
    <PublicLayout currentPath={pathOnly} onNavigate={navigate}>
      {renderContent()}
    </PublicLayout>
  );
}
