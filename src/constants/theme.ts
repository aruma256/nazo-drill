/**
 * 教科カラー（五教科に基づく）
 * - 国語: 赤
 * - 算数: 青
 * - 理科: 緑
 * - 社会: 橙
 * - 英語: 紫
 */
export const SUBJECT_COLORS = {
  japanese: '#e11d48', // 国語 - 赤
  math: '#0284c7', // 算数 - 青
  science: '#16a34a', // 理科 - 緑
  social: '#ea580c', // 社会 - 橙
  english: '#7c3aed', // 英語 - 紫
} as const

/**
 * 各ドリルのテーマ設定
 */
export const DRILL_THEMES = {
  '50on-pick': {
    primary: SUBJECT_COLORS.japanese,
    light: '#ffe4e6',
    accent: '#fda4af',
    icon: 'あ',
  },
  '123-abc': {
    primary: SUBJECT_COLORS.math,
    light: '#e0f2fe',
    accent: '#7dd3fc',
    icon: '123',
  },
  'abc-shift': {
    primary: SUBJECT_COLORS.english,
    light: '#ede9fe',
    accent: '#c4b5fd',
    icon: 'A→',
  },
  'prefecture-fill': {
    primary: SUBJECT_COLORS.social,
    light: '#fef3c7',
    accent: '#fcd34d',
    icon: '◯',
  },
} as const

export type DrillId = keyof typeof DRILL_THEMES
