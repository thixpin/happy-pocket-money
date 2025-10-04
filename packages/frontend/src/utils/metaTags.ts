/**
 * Utility functions for managing dynamic meta tags for social media sharing
 */

interface MetaTagOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

/**
 * Update page title and meta tags for social media sharing
 */
export const updateMetaTags = (options: MetaTagOptions) => {
  const {
    title = 'Happy Pocket Money - Thadingyut Festival Giveaways',
    description = 'Join Thadingyut Festival pocket money giveaways! Share the joy and win amazing prizes. Create your own giveaway or participate in others.',
    image = 'https://pocket.thixpin.me/og-image.png',
    url = window.location.href
  } = options;

  // Update page title
  document.title = title;

  // Update or create meta tags
  updateMetaTag('property', 'og:title', title);
  updateMetaTag('property', 'og:description', description);
  updateMetaTag('property', 'og:image', image);
  updateMetaTag('property', 'og:url', url);
  
  updateMetaTag('name', 'twitter:title', title);
  updateMetaTag('name', 'twitter:description', description);
  updateMetaTag('name', 'twitter:image', image);
  updateMetaTag('name', 'twitter:url', url);
  
  updateMetaTag('name', 'description', description);
};

/**
 * Update or create a meta tag
 */
const updateMetaTag = (attribute: string, property: string, content: string) => {
  let meta = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, property);
    document.head.appendChild(meta);
  }
  
  meta.content = content;
};

/**
 * Generate dynamic meta tags for giveaway pages
 */
export const generateGiveawayMetaTags = (giveaway: any, baseUrl: string = window.location.origin) => {
  const title = `🎊 ${giveaway.budget?.toLocaleString()} MMK Giveaway by ${giveaway.giver?.name || 'Anonymous'}`;
  const description = `Join this Thadingyut Festival pocket money giveaway! ${giveaway.participantsCount || 0}/${giveaway.receiverCount} participants. ${giveaway.remainingSlots || 0} slots remaining!`;
  const url = `${baseUrl}/giveaway/${giveaway.hash}`;
  
  return {
    title,
    description,
    url,
    image: 'https://pocket.thixpin.me/og-image.png'
  };
};

/**
 * Generate dynamic meta tags for result pages
 */
export const generateResultMetaTags = (participant: any, giveaway: any, baseUrl: string = window.location.origin) => {
  const title = `🎉 I won ${participant.portion?.toLocaleString()} MMK in a Thadingyut Festival giveaway!`;
  const description = `I just won ${participant.portion?.toLocaleString()} MMK in ${giveaway.giver?.name || 'Anonymous'}'s pocket money giveaway! Join the fun and create your own giveaway!`;
  const url = `${baseUrl}/giveaway/${giveaway.hash}/result`;
  
  return {
    title,
    description,
    url,
    image: 'https://pocket.thixpin.me/og-image.png'
  };
};
