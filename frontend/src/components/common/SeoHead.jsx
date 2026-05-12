import { useEffect } from "react";

const upsertMeta = (attr, key, content) => {
  let element = document.head.querySelector(`meta[${attr}="${key}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

const upsertLink = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
};

const SeoHead = ({
  title,
  description,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogUrl,
  ogImage,
  twitterTitle,
  twitterDescription,
  twitterImage,
  robots = "index, follow",
  structuredData,
}) => {
  useEffect(() => {
    document.title = title;

    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", robots);
    upsertLink("canonical", canonicalUrl);

    upsertMeta("property", "og:title", ogTitle);
    upsertMeta("property", "og:description", ogDescription);
    upsertMeta("property", "og:url", ogUrl);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", "TikTrades");
    upsertMeta("property", "og:image", ogImage);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", twitterTitle);
    upsertMeta("name", "twitter:description", twitterDescription);
    upsertMeta("name", "twitter:image", twitterImage);

    if (structuredData) {
      let script = document.head.querySelector('script[data-seo-structured-data="true"]');

      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.dataset.seoStructuredData = "true";
        document.head.appendChild(script);
      }

      script.textContent = JSON.stringify(structuredData);
    }
  }, [
    canonicalUrl,
    description,
    ogImage,
    ogDescription,
    ogTitle,
    ogUrl,
    robots,
    structuredData,
    title,
    twitterDescription,
    twitterImage,
    twitterTitle,
  ]);

  return null;
};

export default SeoHead;
