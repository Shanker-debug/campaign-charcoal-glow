import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { campaignImage, money, type Campaign } from "@/lib/launchly";
export function Funding({ campaign }: { campaign: Campaign }) {
  const percentage = Math.min(100, Math.round((campaign.raised / campaign.goal_amount) * 100));
  return (
    <>
      <div className="funding-amount">
        <strong>{money(campaign.raised)}</strong>
        <span>raised of {money(campaign.goal_amount)}</span>
      </div>
      <progress
        className="funding-progress"
        value={percentage}
        max={100}
        aria-label={`${percentage}% funded`}
      />
      <div className="funding-meta">
        <span>{campaign.backers} backers</span>
        <span>{percentage}% funded</span>
      </div>
    </>
  );
}
export function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <article className="campaign-card">
      <Link to="/campaign/$id" params={{ id: campaign.id }} className="campaign-image-link">
        <img
          src={campaignImage(campaign.image_url)}
          alt={campaign.title}
          width={1024}
          height={768}
          loading="lazy"
        />
        <span className="image-category">{campaign.category}</span>
        <span className="image-arrow">
          <ArrowUpRight size={20} />
        </span>
      </Link>
      <div className="campaign-card-body">
        <div className="campaign-byline">
          {campaign.organizer_name || "Independent organizer"}
          {campaign.is_sample && <span>Sample campaign</span>}
        </div>
        <Link to="/campaign/$id" params={{ id: campaign.id }}>
          <h3>{campaign.title}</h3>
        </Link>
        <p className="campaign-description">{campaign.description}</p>
        <Funding campaign={campaign} />
        <Button asChild variant="outline" className="card-support">
          <Link to="/campaign/$id" params={{ id: campaign.id }}>
            Support this cause <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </article>
  );
}
