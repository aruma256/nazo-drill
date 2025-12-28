interface SectionHeaderProps {
  children: React.ReactNode
}

/**
 * ページ内のセクション見出しコンポーネント
 * 左側に縦線のアクセント付きの見出しを表示
 */
export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <h2 className="mb-3 flex items-center text-lg font-bold text-drill-primary-dark">
      <span className="mr-2 h-5 w-1 rounded bg-drill-primary"></span>
      {children}
    </h2>
  )
}
