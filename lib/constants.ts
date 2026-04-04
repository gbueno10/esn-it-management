export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium',
  'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria', 'Cambodia', 'Cameroon',
  'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
  'Czech Republic', 'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
  'Estonia', 'Ethiopia', 'Finland', 'France', 'Georgia', 'Germany', 'Ghana', 'Greece',
  'Guatemala', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq',
  'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
  'Kosovo', 'Kuwait', 'Latvia', 'Lebanon', 'Libya', 'Lithuania', 'Luxembourg',
  'Malaysia', 'Malta', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro',
  'Morocco', 'Mozambique', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Nigeria',
  'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'Paraguay',
  'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia',
  'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Thailand', 'Tunisia', 'Turkey', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam',
]

export const NATIONALITIES = [
  'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan', 'Argentine',
  'Armenian', 'Australian', 'Austrian', 'Azerbaijani', 'Bahraini', 'Bangladeshi',
  'Belarusian', 'Belgian', 'Bolivian', 'Bosnian', 'Brazilian', 'British', 'Bulgarian',
  'Cambodian', 'Cameroonian', 'Canadian', 'Chilean', 'Chinese', 'Colombian',
  'Costa Rican', 'Croatian', 'Cuban', 'Cypriot', 'Czech', 'Danish', 'Dominican',
  'Dutch', 'Ecuadorian', 'Egyptian', 'Estonian', 'Ethiopian', 'Filipino', 'Finnish',
  'French', 'Georgian', 'German', 'Ghanaian', 'Greek', 'Guatemalan', 'Honduran',
  'Hungarian', 'Icelandic', 'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish',
  'Israeli', 'Italian', 'Jamaican', 'Japanese', 'Jordanian', 'Kazakh', 'Kenyan',
  'Kosovar', 'Kuwaiti', 'Latvian', 'Lebanese', 'Libyan', 'Lithuanian', 'Luxembourgish',
  'Malaysian', 'Maltese', 'Mexican', 'Moldovan', 'Mongolian', 'Montenegrin',
  'Moroccan', 'Mozambican', 'Nepalese', 'New Zealander', 'Nicaraguan', 'Nigerian',
  'North Macedonian', 'Norwegian', 'Omani', 'Pakistani', 'Palestinian', 'Panamanian',
  'Paraguayan', 'Peruvian', 'Polish', 'Portuguese', 'Qatari', 'Romanian', 'Russian',
  'Saudi', 'Senegalese', 'Serbian', 'Singaporean', 'Slovak', 'Slovenian',
  'South African', 'South Korean', 'Spanish', 'Sri Lankan', 'Swedish', 'Swiss',
  'Syrian', 'Taiwanese', 'Thai', 'Tunisian', 'Turkish', 'Ukrainian', 'Emirati',
  'Uruguayan', 'Uzbek', 'Venezuelan', 'Vietnamese',
]

export interface SocialPlatform {
  key: string
  label: string
  placeholder: string
  urlTemplate: string | null // null = no link (e.g. phone)
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { key: 'instagram', label: 'Instagram', placeholder: 'username (without @)', urlTemplate: 'https://instagram.com/{value}' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'profile slug (e.g. john-doe)', urlTemplate: 'https://linkedin.com/in/{value}' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'phone number with country code', urlTemplate: 'https://wa.me/{value}' },
  { key: 'telegram', label: 'Telegram', placeholder: 'username (without @)', urlTemplate: 'https://t.me/{value}' },
  { key: 'email', label: 'Email', placeholder: 'email address', urlTemplate: 'mailto:{value}' },
  { key: 'phone', label: 'Phone', placeholder: 'phone number', urlTemplate: 'tel:{value}' },
]

export function getSocialUrl(platform: string, value: string): string | null {
  const p = SOCIAL_PLATFORMS.find(s => s.key === platform)
  if (!p?.urlTemplate) return null
  return p.urlTemplate.replace('{value}', encodeURIComponent(value))
}
