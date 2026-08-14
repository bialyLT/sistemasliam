import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test",
  robots: { index: false, follow: false },
};

export default async function TestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <div>Test: {slug}</div>;
}