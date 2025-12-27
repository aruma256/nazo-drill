/**
 * 教科テーマ（五教科に基づく配色）
 * - 国語: 赤
 * - 算数: 青
 * - 理科: 緑
 * - 社会: 橙
 * - 英語: 紫
 */
export const SUBJECT_THEMES = {
  japanese: {
    primary: '#e11d48',
    dark: '#be123c',
    light: '#ffe4e6',
    accent: '#fda4af',
  },
  math: {
    primary: '#0284c7',
    dark: '#0369a1',
    light: '#e0f2fe',
    accent: '#7dd3fc',
  },
  science: {
    primary: '#16a34a',
    dark: '#15803d',
    light: '#dcfce7',
    accent: '#86efac',
  },
  social: {
    primary: '#ea580c',
    dark: '#c2410c',
    light: '#fef3c7',
    accent: '#fcd34d',
  },
  english: {
    primary: '#7c3aed',
    dark: '#6d28d9',
    light: '#ede9fe',
    accent: '#c4b5fd',
  },
} as const

export type SubjectId = keyof typeof SUBJECT_THEMES

/**
 * 各ドリルの設定（教科とアイコン）
 */
export const DRILL_CONFIG = {
  '50on-pick': { subject: 'japanese', icon: 'あ' },
  '123-abc': { subject: 'english', icon: '1A' },
  'abc-shift': { subject: 'math', icon: 'A→' },
  'prefecture-fill': { subject: 'social', icon: '◯' },
} as const satisfies Record<string, { subject: SubjectId; icon: string }>

export type DrillId = keyof typeof DRILL_CONFIG

/**
 * 各ドリルのテーマ（SUBJECT_THEMES + DRILL_CONFIG から自動生成）
 */
export const DRILL_THEMES = Object.fromEntries(
  Object.entries(DRILL_CONFIG).map(([drillId, config]) => [
    drillId,
    {
      ...SUBJECT_THEMES[config.subject],
      icon: config.icon,
    },
  ]),
) as {
  [K in DrillId]: (typeof SUBJECT_THEMES)[(typeof DRILL_CONFIG)[K]['subject']] & {
    icon: (typeof DRILL_CONFIG)[K]['icon']
  }
}
