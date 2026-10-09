import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import classroom from "@/assets/classroom.jpg";
import forest from "@/assets/forest.jpg";
import healthcare from "@/assets/healthcare.jpg";
export const categories = [
  "Education",
  "Healthcare",
  "Environment",
  "Hunger Relief",
  "Animal Welfare",
  "Community Development",
];
export type Campaign = {
  id: string;
  title: string;
  description: string;
  category: string;
  goal_amount: number;
  image_url: string | null;
  organizer_name: string;
  organizer_id: string | null;
  status: string;
  is_sample: boolean;
  created_at: string;
  raised: number;
  backers: number;
};
export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
export const campaignImage = (image: string | null) =>
  image === "forest"
    ? forest
    : image === "healthcare"
      ? healthcare
      : image && /^https:\/\//.test(image)
        ? image
        : classroom;
export const campaignsQuery = queryOptions({
  queryKey: ["campaigns"],
  queryFn: async (): Promise<Campaign[]> => {
    const [campaigns, totals] = await Promise.all([
      supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
      supabase.rpc("campaign_totals"),
    ]);
    if (campaigns.error) throw campaigns.error;
    if (totals.error) throw totals.error;
    return (campaigns.data ?? []).map((c) => {
      const total = totals.data?.find((t) => t.campaign_id === c.id);
      return { ...c, raised: Number(total?.raised ?? 0), backers: Number(total?.backers ?? 0) };
    });
  },
});
export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — LAUNCHLY` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — LAUNCHLY` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
