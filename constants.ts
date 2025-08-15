
export interface Language {
    name: string;
    code: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
    { name: 'English', code: 'en-US' },
    { name: 'Spanish', code: 'es-ES' },
    { name: 'French', code: 'fr-FR' },
    { name: 'German', code: 'de-DE' },
    { name: 'Italian', code: 'it-IT' },
    { name: 'Portuguese', code: 'pt-PT' },
    { name: 'Russian', code: 'ru-RU' },
    { name: 'Japanese', code: 'ja-JP' },
    { name: 'Korean', code: 'ko-KR' },
    { name: 'Chinese (Mandarin)', code: 'cmn-Hans-CN' },
    { name: 'Hindi', code: 'hi-IN' },
    { name: 'Arabic', code: 'ar-SA' },
    { name: 'Dutch', code: 'nl-NL' },
    { name: 'Polish', code: 'pl-PL' },
    { name: 'Turkish', code: 'tr-TR' },
    { name: 'Indonesian', code: 'id-ID' },
];