import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
}

const defaultSEO = {
  title: 'Job Tracker - Track Your Job Applications & Interviews | Free Forever',
  description: 'Organize and track your job applications across different stages with Job Tracker. Manage interviews, resumes, and application progress with a beautiful Kanban board. Free forever, no credit card required.',
  keywords: 'job tracker, job application tracker, interview scheduler, resume manager, job search, application management, career tracker, job board, kanban board, job hunting',
  image: 'https://jobtracker.app/og-image.png',
  type: 'website',
};

export default function SEO({
  title,
  description,
  keywords,
  image,
  type = 'website',
  noindex = false,
}: SEOProps) {
  const location = useLocation();
  const baseUrl = 'https://jobtracker.app';
  const currentUrl = `${baseUrl}${location.pathname}`;

  useEffect(() => {
    const finalTitle = title || defaultSEO.title;
    const finalDescription = description || defaultSEO.description;
    const finalKeywords = keywords || defaultSEO.keywords;
    const finalImage = image || defaultSEO.image;

    // Update title
    document.title = finalTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Primary meta tags
    updateMetaTag('title', finalTitle);
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph tags
    updateMetaTag('og:title', finalTitle, 'property');
    updateMetaTag('og:description', finalDescription, 'property');
    updateMetaTag('og:image', finalImage, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:url', currentUrl, 'property');

    // Twitter Card tags
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', finalImage);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl;
  }, [title, description, keywords, image, type, noindex, currentUrl, location.pathname]);

  return null;
}

