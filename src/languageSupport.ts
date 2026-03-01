import { SUPPORTED_LANGUAGE_IDS } from './constants';
export { SUPPORTED_LANGUAGE_IDS };

export type SupportedLanguageId = (typeof SUPPORTED_LANGUAGE_IDS)[number];

export function isSupportedLanguageId(languageId: string): languageId is SupportedLanguageId {
  return SUPPORTED_LANGUAGE_IDS.includes(languageId as SupportedLanguageId);
}

export function supportedLanguageLabel(): string {
  return SUPPORTED_LANGUAGE_IDS.join(', ');
}
