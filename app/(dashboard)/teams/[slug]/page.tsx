import { TeamProfileView } from "@/components/teams/team-profile-view";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function TeamProfilePage({ params }: Props) {
  const { slug } = await params;
  const displayName =
    slug === "apex-vanguards"
      ? "Apex Vanguards"
      : slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return <TeamProfileView slug={slug} displayName={displayName} />;
}
