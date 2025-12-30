// Floating decorative shapes (site-wide background decoration)
export function DecorativeElements() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Large circle - top right */}
      <div
        className="animate-float-slow absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-30"
        style={{
          background:
            'radial-gradient(circle, var(--drill-primary-light) 0%, transparent 70%)',
        }}
      />

      {/* Medium circle - bottom left */}
      <div
        className="animate-float-reverse absolute -bottom-16 -left-16 h-48 w-48 rounded-full opacity-40"
        style={{
          background:
            'radial-gradient(circle, var(--drill-accent) 0%, transparent 70%)',
        }}
      />

      {/* Small floating shapes */}
      <div
        className="animate-float absolute left-[10%] top-[20%] h-8 w-8 rotate-45 rounded-lg opacity-20"
        style={{ backgroundColor: 'var(--drill-primary)' }}
      />
      <div
        className="animate-float-reverse absolute right-[15%] top-[60%] h-6 w-6 rounded-full opacity-25"
        style={{ backgroundColor: 'var(--drill-accent)' }}
      />
      <div
        className="animate-float-slow absolute bottom-[30%] left-[20%] h-10 w-10 rounded-full opacity-15"
        style={{ backgroundColor: 'var(--drill-primary)' }}
      />

      {/* Triangle shapes */}
      <div
        className="animate-float absolute right-[25%] top-[15%] opacity-20"
        style={{
          width: 0,
          height: 0,
          borderLeft: '20px solid transparent',
          borderRight: '20px solid transparent',
          borderBottom: '35px solid var(--drill-primary)',
        }}
      />
      <div
        className="animate-float-reverse absolute bottom-[20%] right-[10%] opacity-15"
        style={{
          width: 0,
          height: 0,
          borderLeft: '15px solid transparent',
          borderRight: '15px solid transparent',
          borderBottom: '26px solid var(--drill-accent)',
        }}
      />

      {/* Star shape */}
      <div className="animate-float absolute left-[5%] top-[50%]">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="var(--drill-primary)"
          className="opacity-25"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    </div>
  )
}
