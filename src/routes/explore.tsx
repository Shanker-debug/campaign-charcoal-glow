import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/launchly/campaign-card";
import { campaignsQuery, categories, pageHead } from "@/lib/launchly";
export const Route = createFileRoute("/explore")({
  head: () =>
    pageHead(
      "Explore meaningful causes",
      "Find education, healthcare, environmental and community campaigns that deserve your support.",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(campaignsQuery),
  pendingComponent: () => (
    <div className="site-container loading-state">Finding meaningful causes…</div>
  ),
  errorComponent: ({ reset }) => (
    <div className="site-container empty-state">
      <h3>Campaigns couldn’t be loaded.</h3>
      <Button onClick={reset}>Try again</Button>
    </div>
  ),
  component: Explore,
});
function Explore() {
  const { data } = useSuspenseQuery(campaignsQuery);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All causes");
  const visible = data.filter(
    (c) =>
      c.status === "approved" &&
      (category === "All causes" || c.category === category) &&
      `${c.title} ${c.description} ${c.organizer_name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="site-container page-bottom-space">
      <div className="page-heading">
        <div className="section-label">A cause for every kind of kindness</div>
        <h1>Find what moves you.</h1>
        <p>Good ideas, extraordinary people, and a little help from you.</p>
      </div>
      <label className="search-field">
        <Search size={18} />
        <input
          aria-label="Search campaigns"
          placeholder="Search causes, stories, or organizers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <div className="category-row">
        {["All causes", ...categories].map((c) => (
          <Button
            key={c}
            variant={category === c ? "default" : "ghost"}
            onClick={() => setCategory(c)}
          >
            {c}
          </Button>
        ))}
      </div>
      <div className="campaign-grid">
        {visible.length ? (
          visible.map((c) => <CampaignCard campaign={c} key={c.id} />)
        ) : (
          <div className="empty-state">
            <h3>No causes found just yet.</h3>
            <p>Try another search or explore a different category.</p>
            <Button
              variant="link"
              onClick={() => {
                setSearch("");
                setCategory("All causes");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
