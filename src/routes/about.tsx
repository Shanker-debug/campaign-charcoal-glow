import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/launchly";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/about")({
  head: () =>
    pageHead(
      "About our purpose",
      "LAUNCHLY is an impact-focused college crowdfunding project built around transparent fundraising and meaningful causes.",
    ),
  component: About,
});
function About() {
  return (
    <div className="site-container">
      <div className="prose-page">
        <div className="section-label">The reason behind LAUNCHLY</div>
        <h1>
          Good ideas deserve
          <br />a chance to grow.
        </h1>
        <p>
          We believe generosity doesn’t need to be grand to be meaningful. LAUNCHLY connects people
          who care with community-led causes that need a little help moving forward.
        </p>
        <h2>Purpose first. Transparency always.</h2>
        <p>
          Organizers must be approved before submitting campaigns. Each campaign is reviewed
          separately before publication. Funding totals come from contribution records, and backer
          counts represent unique supporters.
        </p>
        <h2>A demonstration with real foundations.</h2>
        <p>
          LAUNCHLY is a college full-stack project. Accounts, reviews, campaigns, and contribution
          histories are stored securely. All donations are simulated: no money changes hands.
          Campaigns marked “Sample campaign” are fictional examples, with generated illustrative
          photographs.
        </p>
        <div className="hero-buttons">
          <Button asChild>
            <Link to="/explore">Explore meaningful causes</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
