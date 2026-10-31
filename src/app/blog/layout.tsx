// app/blog/layout.tsx
// Metadata base + canonical now come from the root layout (admin settings).
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
