export default async function TestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <div>Test: {slug}</div>;
}