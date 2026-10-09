import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowUpRight, MapPin, ShieldCheck, Heart, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/launchly/campaign-card";
import { campaignsQuery, categories, pageHead } from "@/lib/launchly";
import hero from "@/assets/education-hero.jpg";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Small acts. Lasting impact.",
      "Discover inspiring causes and give good ideas a way to grow. A thoughtful crowdfunding platform for meaningful change.",
    ),
  component: Index,
});
function Index() {
  const { data, isPending, error, refetch } = useQuery(campaignsQuery);
  const [category, setCategory] = useState("All causes");
  const campaigns = (data ?? [])
    .filter(
      (c) => c.status === "approved" && (category === "All causes" || c.category === category),
    )
    .slice(0, 3);
  return (
    <>
      <section className="hero">
        <img
          className="hero-photo"
          src={hero}
          alt="Teachers and schoolchildren walking through the hills of rural India"
          width={1920}
          height={1024}
        />
        <div className="site-container hero-content reveal">
          <div className="eyebrow">
            <span className="eyebrow-line" />A little generosity. A world of possibility.
          </div>
          <h1>
            Give good ideas
            <br />a way to grow.
          </h1>
          <p className="hero-copy">
            Behind every better tomorrow is someone who cares today. Discover meaningful causes. Be
            part of their story.
          </p>
          <div className="hero-buttons">
            <Button asChild>
              <Link to="/explore">
                Explore campaigns <ArrowUpRight />
              </Link>
            </Button>
            <Button asChild variant="outline" className="hero-outline">
              <Link to="/create">
                Start a campaign <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
        <div className="site-container hero-bottom">
          <span className="hero-location">
            <MapPin size={13} />
            Small acts. Lasting impact.
          </span>
          <span className="hero-index">
            01 <i /> A brighter tomorrow
          </span>
        </div>
      </section>
      <div className="trust-strip">
        <div className="site-container trust-inner">
          <div className="trust-item">
            <ShieldCheck />
            Reviewed causes. Real purpose.
          </div>
          <div className="trust-item">
            <Heart />
            Every contribution counts.
          </div>
          <div className="trust-item">
            <Globe2 />
            Together, we go further.
          </div>
        </div>
      </div>
      <section className="section site-container">
        <div className="section-header">
          <div>
            <div className="section-label">Find your reason to give</div>
            <h2>Small beginnings. Big possibilities.</h2>
            <p>Meet the people turning your kindness into lasting change.</p>
          </div>
          <Link className="text-link" to="/explore">
            View all campaigns <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="category-row" aria-label="Filter featured campaigns">
          {["All causes", ...categories].map((c) => (
            <Button
              key={c}
              variant={c === category ? "default" : "ghost"}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>
        <div className="campaign-grid">
          {isPending ? (
            [1, 2, 3].map((n) => <div key={n} className="skeleton-card" />)
          ) : error ? (
            <div className="empty-state">
              <p>We couldn’t load the campaigns.</p>
              <Button variant="link" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : campaigns.length ? (
            campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)
          ) : (
            <div className="empty-state">
              <h3>Good things are on their way.</h3>
              <p>No approved campaigns in this category yet.</p>
            </div>
          )}
        </div>
      </section>
      <section className="steps-band">
        <div className="site-container">
          <div className="section-header">
            <div>
              <div className="section-label">Goodness, made simple</div>
              <h2>A small act is all it takes.</h2>
            </div>
            <Link className="text-link" to="/how-it-works">
              How it works <ArrowUpRight size={16} />
            </Link>
          </div>
          <Steps />
        </div>
      </section>
      <section className="closing-section site-container">
        <div>
          <div className="section-label">The next chapter starts with you</div>
          <h2>
            Somewhere, your kindness
            <br />
            is someone’s new beginning.
          </h2>
          <p>A cause you believe in. A change we can make together.</p>
        </div>
        <Button asChild className="h-12 px-6">
          <Link to="/explore">
            Find a cause that moves you <ArrowUpRight />
          </Link>
        </Button>
      </section>
    </>
  );
}
export function Steps() {
  return (
    <div className="steps-grid">
      {[
        [
          "01",
          "Discover a cause",
          "Find a story that speaks to you. Explore reviewed campaigns from people making a difference.",
        ],
        [
          "02",
          "Make it possible",
          "Give what feels right. Every small act of generosity helps a good idea move forward.",
        ],
        [
          "03",
          "Be part of the change",
          "See your contribution become part of something bigger. Follow the causes you help grow.",
        ],
      ].map(([n, title, copy]) => (
        <div key={n}>
          <div className="step-number">{n} /</div>
          <h3>{title}</h3>
          <p>{copy}</p>
        </div>
      ))}
    </div>
  );
}
