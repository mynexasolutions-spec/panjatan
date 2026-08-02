import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'

export type SiteSettings = {
  id: string
  site_name: string
  tagline: string
  support_email: string
  support_phone: string
  whatsapp_number: string
  whatsapp_message: string
  business_hours: string
  address: string
  announcement_text: string
  shop_banner_title: string
  shop_banner_description: string
  facebook_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  default_seo_title: string
  default_seo_description: string
}

export type NavigationLink = {
  id?: string
  location: 'header' | 'footer' | 'legal'
  label: string
  href: string
  is_external: boolean
  is_visible: boolean
  display_order: number
}

export type ContentBlock = {
  heading?: string
  body: string
  items?: string[]
}

export type ContentPage = {
  id?: string
  slug: string
  title: string
  eyebrow: string
  summary: string
  blocks: ContentBlock[]
  seo_title: string
  seo_description: string
  is_published: boolean
}

export type HomepageSection = {
  id: string
  section_key: string
  heading: string
  subheading: string
  body: string
  image_url: string | null
  link_label: string | null
  link_url: string | null
  is_visible: boolean
  display_order: number
  homepage_section_items?: HomepageSectionItem[]
}

export type HomepageSectionItem = {
  id: string
  section_id: string
  title: string
  subtitle: string
  body: string
  image_url: string | null
  link_url: string | null
  metadata: Record<string, unknown>
  is_visible: boolean
  display_order: number
}

export type StorefrontShell = {
  settings: SiteSettings
  headerLinks: NavigationLink[]
  footerLinks: NavigationLink[]
  legalLinks: NavigationLink[]
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'global',
  site_name: 'Panjatan Ayurveda',
  tagline: 'Pure Ayurvedic Medicines for a Healthy Today & Better Tomorrow',
  support_email: 'care@panjatanayurveda.com',
  support_phone: '+91 73000 70707',
  whatsapp_number: '917300070707',
  whatsapp_message: 'Hi Panjatan Ayurveda! I would like to inquire about your Ayurvedic products.',
  business_hours: 'Mon - Sat: 10:00 AM - 6:00 PM',
  address: 'India',
  announcement_text: 'Free Delivery on orders above ₹499',
  shop_banner_title: 'Explore Ayurvedic Wellness',
  shop_banner_description: 'Discover safe, effective and natural formulations for everyday health.',
  facebook_url: 'https://facebook.com',
  instagram_url: 'https://instagram.com',
  youtube_url: 'https://youtube.com',
  default_seo_title: 'Panjatan Ayurveda | Pure Ayurvedic Medicines for Healthy Living',
  default_seo_description: 'Safe, effective, and 100% natural Ayurvedic health products and herbal medicines.',
}

const DEFAULT_NAVIGATION: NavigationLink[] = [
  { location: 'header', label: 'Home', href: '/', is_external: false, is_visible: true, display_order: 0 },
  { location: 'header', label: 'Products', href: '/shop', is_external: false, is_visible: true, display_order: 10 },
  { location: 'header', label: 'Categories', href: '/#categories', is_external: false, is_visible: true, display_order: 20 },
  { location: 'header', label: 'Herbs', href: '/herbs', is_external: false, is_visible: true, display_order: 25 },
  { location: 'header', label: 'About Us', href: '/about', is_external: false, is_visible: true, display_order: 30 },
  { location: 'header', label: 'Contact', href: '/contact', is_external: false, is_visible: true, display_order: 40 },
  { location: 'footer', label: 'Home', href: '/', is_external: false, is_visible: true, display_order: 0 },
  { location: 'footer', label: 'Products', href: '/shop', is_external: false, is_visible: true, display_order: 10 },
  { location: 'footer', label: 'About Us', href: '/about', is_external: false, is_visible: true, display_order: 20 },
  { location: 'footer', label: 'Contact Us', href: '/contact', is_external: false, is_visible: true, display_order: 30 },
  { location: 'legal', label: 'Privacy Policy', href: '/policies/privacy', is_external: false, is_visible: true, display_order: 0 },
  { location: 'legal', label: 'Terms & Conditions', href: '/policies/terms', is_external: false, is_visible: true, display_order: 10 },
  { location: 'legal', label: 'Returns & Refunds', href: '/policies/refund', is_external: false, is_visible: true, display_order: 20 },
]

const defaultPage = (
  slug: string,
  title: string,
  eyebrow: string,
  summary: string,
  blocks: ContentBlock[],
): ContentPage => ({
  slug,
  title,
  eyebrow,
  summary,
  blocks,
  seo_title: `${title} | Panjatan Ayurveda`,
  seo_description: summary,
  is_published: true,
})

const DEFAULT_CONTENT_PAGES: Record<string, ContentPage> = {
  about: defaultPage('about', 'About Panjatan Ayurveda', 'Our Heritage', 'Natural healthcare rooted in the timeless wisdom of Ayurveda.', [
    { heading: 'Our Story', body: 'Panjatan Ayurveda provides safe, effective and natural healthcare through authentic Ayurveda and modern quality standards.' },
    { heading: 'Our Promise', body: 'Our formulations are made in GMP and ISO certified facilities using carefully selected ingredients.' },
  ]),
  contact: defaultPage('contact', 'Contact Us', 'Here to Help', 'Have a product or order question? Our care team will be happy to assist you.', [
    { heading: 'Customer Care', body: 'Contact us by email, phone or WhatsApp during business hours.' },
  ]),
  privacy: defaultPage('privacy', 'Privacy Policy', '', 'How Panjatan Ayurveda collects, uses and protects personal information.', [
    { heading: 'Information We Collect', body: 'We collect information needed to provide the storefront, respond to support requests and fulfil orders.' },
    { heading: 'How We Use Information', body: 'We use information to provide services, communicate with you, prevent fraud and meet legal obligations.' },
  ]),
  refund: defaultPage('refund', 'Refund & Cancellation Policy', '', 'Cancellation, return and refund information for Panjatan Ayurveda orders.', [
    { heading: 'Cancellations', body: 'Contact our support team as soon as possible if you need to cancel an order.' },
    { heading: 'Returns and Refunds', body: 'Eligible unopened and unused products may be returned under the terms shown for the order.' },
  ]),
  shipping: defaultPage('shipping', 'Shipping & Delivery Policy', '', 'Processing, dispatch, delivery and tracking information.', [
    { heading: 'Processing Time', body: 'Standard orders are prepared for dispatch within 2-3 business days.' },
    { heading: 'Delivery and Tracking', body: 'Delivery timelines vary by destination. Tracking details are shared after dispatch.' },
  ]),
  terms: defaultPage('terms', 'Terms & Conditions', '', 'Terms that apply when using the Panjatan Ayurveda website.', [
    { heading: 'Online Store Terms', body: 'Use this website only for lawful purposes and provide accurate account and order information.' },
    { heading: 'Products and Orders', body: 'Availability, descriptions and prices may change. Orders may be declined for stock, security or legal reasons.' },
  ]),
}

function mockItem(sectionId: string, index: number, title: string, subtitle = '', body = '', metadata: Record<string, unknown> = {}): HomepageSectionItem {
  return {
    id: `${sectionId}-item-${index}`,
    section_id: sectionId,
    title,
    subtitle,
    body,
    image_url: null,
    link_url: null,
    metadata,
    is_visible: true,
    display_order: index * 10,
  }
}

export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  { id: 'hero', section_key: 'hero', heading: 'Heal Naturally with Panjatan Ayurveda', subheading: DEFAULT_SITE_SETTINGS.tagline, body: 'Authentic Ayurveda supported by modern quality standards.', image_url: null, link_label: 'Shop Now', link_url: '/shop', is_visible: true, display_order: 0 },
  { id: 'feature-bar', section_key: 'feature-bar', heading: '', subheading: '', body: '', image_url: null, link_label: null, link_url: null, is_visible: true, display_order: 10, homepage_section_items: [
    mockItem('feature-bar', 0, 'Organic Herbs', 'Carefully Sourced'),
    mockItem('feature-bar', 1, 'Expert Formulated', 'Ayurvedic Experts'),
    mockItem('feature-bar', 2, 'Safe & Natural', 'No Harmful Chemicals'),
    mockItem('feature-bar', 3, 'Fast Delivery', 'Pan India'),
  ] },
  { id: 'story', section_key: 'story', heading: 'About Panjatan Ayurveda', subheading: 'Authentic Formulations', body: 'Safe, effective and natural healthcare through the timeless wisdom of Ayurveda.', image_url: null, link_label: 'Know More About Us', link_url: '/about', is_visible: true, display_order: 20 },
  { id: 'categories', section_key: 'categories', heading: 'Shop by Health Category', subheading: '', body: '', image_url: null, link_label: null, link_url: null, is_visible: true, display_order: 30 },
  { id: 'featured-products', section_key: 'featured-products', heading: 'Featured Products', subheading: 'Ayurvedic wellness selected for everyday care.', body: '', image_url: null, link_label: null, link_url: null, is_visible: true, display_order: 35 },
  { id: 'why-us', section_key: 'why-us', heading: 'Why Choose Panjatan Ayurveda?', subheading: '', body: 'Natural ingredients, responsible manufacturing and quality you can trust.', image_url: null, link_label: null, link_url: null, is_visible: true, display_order: 40, homepage_section_items: [
    mockItem('why-us', 0, '100% Ayurvedic', 'Natural formulations'),
    mockItem('why-us', 1, 'GMP Certified', 'Quality manufacturing'),
    mockItem('why-us', 2, 'ISO Certified', 'Verified systems'),
  ] },
  { id: 'goodness-of-nature', section_key: 'goodness-of-nature', heading: 'Goodness of Nature in Every Product', subheading: '', body: '', image_url: null, link_label: 'Explore Ingredients', link_url: '/shop', is_visible: true, display_order: 50, homepage_section_items: ['Amla', 'Giloy', 'Ashwagandha', 'Kalmegh', 'Tulsi', 'Neem', 'Harad'].map((name, index) => mockItem('goodness-of-nature', index, name)) },
  { id: 'testimonials', section_key: 'testimonials', heading: 'What Our Customers Say', subheading: '', body: 'Experiences shared by the Panjatan Ayurveda community.', image_url: null, link_label: null, link_url: null, is_visible: true, display_order: 60, homepage_section_items: [
    mockItem('testimonials', 0, 'Rahul Sharma', '', 'Pachan Plus has been a helpful addition to my daily wellness routine.', { rating: 5 }),
    mockItem('testimonials', 1, 'Neha Verma', '', 'Natural products, clear information and a smooth ordering experience.', { rating: 5 }),
    mockItem('testimonials', 2, 'Mohd. Imran', '', 'The product quality and customer support have been dependable.', { rating: 5 }),
  ] },
  { id: 'certifications', section_key: 'certifications', heading: 'Our Certifications', subheading: '', body: 'Manufactured with strict quality and safety standards.', image_url: null, link_label: null, link_url: null, is_visible: true, display_order: 70, homepage_section_items: ['GMP Certified', 'ISO Company', 'AYUSH', 'Make in India', '100% Ayurvedic'].map((name, index) => mockItem('certifications', index, name)) },
]

function allowDevelopmentMocks() {
  return process.env.NODE_ENV !== 'production' && process.env.CMS_DEV_MOCKS === 'true'
}

function publicCmsClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

function configurationError() {
  return new Error(
    'Storefront CMS is unavailable. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'For local UI development only, set CMS_DEV_MOCKS=true.'
  )
}

function developmentShell(): StorefrontShell {
  return {
    settings: DEFAULT_SITE_SETTINGS,
    headerLinks: DEFAULT_NAVIGATION.filter((link) => link.location === 'header'),
    footerLinks: DEFAULT_NAVIGATION.filter((link) => link.location === 'footer'),
    legalLinks: DEFAULT_NAVIGATION.filter((link) => link.location === 'legal'),
  }
}

export async function getStorefrontShell(): Promise<StorefrontShell> {
  await connection()
  const client = publicCmsClient()
  if (!client) {
    if (!allowDevelopmentMocks()) throw configurationError()
    return developmentShell()
  }

  let settingsResult
  let linksResult
  try {
    ;[settingsResult, linksResult] = await Promise.all([
      client.from('site_settings').select('*').eq('id', 'global').single(),
      client.from('navigation_links').select('*').eq('is_visible', true).order('display_order'),
    ])
  } catch (error) {
    if (allowDevelopmentMocks()) return developmentShell()
    throw error
  }

  if (settingsResult.error || !settingsResult.data || linksResult.error) {
    if (allowDevelopmentMocks()) {
      return developmentShell()
    }
    throw new Error(`Unable to load storefront CMS: ${settingsResult.error?.message || linksResult.error?.message}`)
  }

  const links = (linksResult.data || []) as NavigationLink[]
  return {
    settings: settingsResult.data as SiteSettings,
    headerLinks: links.filter((link) => link.location === 'header'),
    footerLinks: links.filter((link) => link.location === 'footer'),
    legalLinks: links.filter((link) => link.location === 'legal'),
  }
}

export async function getHomepageSectionByKey(sectionKey: string): Promise<HomepageSection | null> {
  await connection()
  const client = publicCmsClient()
  if (!client) {
    if (allowDevelopmentMocks()) return DEFAULT_HOMEPAGE_SECTIONS.find((section) => section.section_key === sectionKey) || null
    throw configurationError()
  }
  let data
  let error
  try {
    const result = await client
      .from('homepage_sections')
      .select('*, homepage_section_items(*)')
      .eq('section_key', sectionKey)
      .maybeSingle()
    data = result.data
    error = result.error
  } catch (queryError) {
    if (allowDevelopmentMocks()) return DEFAULT_HOMEPAGE_SECTIONS.find((section) => section.section_key === sectionKey) || null
    throw queryError
  }
  if (error) {
    if (allowDevelopmentMocks()) return DEFAULT_HOMEPAGE_SECTIONS.find((section) => section.section_key === sectionKey) || null
    throw new Error(`Unable to load homepage section "${sectionKey}": ${error.message}`)
  }
  if (!data) return null
  const section = data as HomepageSection
  return {
    ...section,
    homepage_section_items: (section.homepage_section_items || [])
      .filter((item) => item.is_visible)
      .sort((a, b) => a.display_order - b.display_order),
  }
}

export async function getContentPage(slug: string): Promise<ContentPage | null> {
  await connection()
  const client = publicCmsClient()
  if (!client) {
    if (allowDevelopmentMocks()) return DEFAULT_CONTENT_PAGES[slug] || null
    throw configurationError()
  }
  let data
  let error
  try {
    const result = await client
      .from('content_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()
    data = result.data
    error = result.error
  } catch (queryError) {
    if (allowDevelopmentMocks()) return DEFAULT_CONTENT_PAGES[slug] || null
    throw queryError
  }
  if (error) {
    if (allowDevelopmentMocks()) return DEFAULT_CONTENT_PAGES[slug] || null
    throw new Error(`Unable to load content page "${slug}": ${error.message}`)
  }
  if (!data && allowDevelopmentMocks()) return DEFAULT_CONTENT_PAGES[slug] || null
  return data as ContentPage | null
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  await connection()
  const client = publicCmsClient()
  if (!client) {
    if (allowDevelopmentMocks()) return DEFAULT_HOMEPAGE_SECTIONS
    throw configurationError()
  }
  let data
  let error
  try {
    const result = await client
      .from('homepage_sections')
      .select('*, homepage_section_items(*)')
      .eq('is_visible', true)
      .order('display_order')
    data = result.data
    error = result.error
  } catch (queryError) {
    if (allowDevelopmentMocks()) return DEFAULT_HOMEPAGE_SECTIONS
    throw queryError
  }
  if (error) {
    if (allowDevelopmentMocks()) return DEFAULT_HOMEPAGE_SECTIONS
    throw new Error(`Unable to load homepage CMS: ${error.message}`)
  }
  return ((data || []) as HomepageSection[]).map((section) => ({
    ...section,
    homepage_section_items: (section.homepage_section_items || [])
      .filter((item) => item.is_visible)
      .sort((a, b) => a.display_order - b.display_order),
  }))
}
