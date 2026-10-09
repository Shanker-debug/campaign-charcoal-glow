import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowUpRight, ShieldCheck, CheckCircle2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Funding } from "@/components/launchly/campaign-card";
import { useAuth } from "@/components/launchly/auth";
import { supabase } from "@/integrations/supabase/client";
import { campaignsQuery, campaignImage, money, pageHead } from "@/lib/launchly";
export const Route = createFileRoute("/campaign/$id")({
  head: () =>
    pageHead(
      "Support a meaningful cause",
      "Read the campaign story, meet the organizer, and become a backer with a simulated contribution on LAUNCHLY.",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(campaignsQuery),
  pendingComponent: () => <div className="site-container loading-state">Loading this story…</div>,
  component: CampaignDetail,
});
function CampaignDetail() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(campaignsQuery);
  const campaign = data.find((c) => c.id === id);
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("500");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const request = useRef<string>("");
  async function contribute(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!campaign || busy) return;
    setError("");
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 1 || value > 1000000) {
      setError("Please enter an amount from ₹1 to ₹10,00,000.");
      return;
    }
    setBusy(true);
    if (!request.current) request.current = crypto.randomUUID();
    const { error } = await supabase.rpc("contribute", {
      target: campaign.id,
      contribution: value,
      idempotency_key: request.current,
    });
    if (error) setError(error.message);
    else {
      setSuccess(true);
      await qc.invalidateQueries({ queryKey: ["campaigns"] });
      await qc.invalidateQueries({ queryKey: ["donations"] });
    }
    setBusy(false);
  }
  if (!campaign)
    return (
      <div className="site-container empty-state">
        <h3>This campaign isn’t available.</h3>
        <p>It may be awaiting review or no longer public.</p>
        <Button variant="link" asChild>
          <Link to="/explore">Explore other causes</Link>
        </Button>
      </div>
    );
  return (
    <div className="site-container">
      <div className="detail-top">
        <Link to="/explore" className="text-link">
          <ArrowLeft size={14} />
          Back to all causes
        </Link>
      </div>
      <div className="detail-layout">
        <div>
          <img
            className="detail-image"
            src={campaignImage(campaign.image_url)}
            alt={campaign.title}
            width={1024}
            height={768}
          />
          <section className="detail-story">
            <h2>The story behind the cause</h2>
            <p>{campaign.description}</p>
            <p className="demo-note">
              Created {new Date(campaign.created_at).toLocaleDateString("en-IN")}
              {campaign.is_sample
                ? " · Fictional sample campaign, generated illustrative photography."
                : ""}
            </p>
          </section>
        </div>
        <section className="detail-funding">
          <div className="section-label">
            {campaign.category} {campaign.is_sample ? " / Sample campaign" : ""} / {campaign.status}
          </div>
          <h1>{campaign.title}</h1>
          <p>A small contribution can be the beginning of something extraordinary.</p>
          <Funding campaign={campaign} />
          <div className="organizer-line">
            <ShieldCheck size={24} />
            <div>
              <small>Organized by</small>
              {campaign.organizer_name || "Independent organizer"}
            </div>
          </div>
          {success ? (
            <div role="status" className="donation-success">
              <CheckCircle2 />
              <h3>Thank you for your kindness.</h3>
              <p>
                Your {money(Number(amount))} demo contribution has been recorded. No money was
                transferred.
              </p>
              <Button variant="link" asChild>
                <Link to="/dashboard">
                  See your contribution history <ArrowUpRight />
                </Link>
              </Button>
            </div>
          ) : open ? (
            <form onSubmit={contribute}>
              <h3>Your small act of kindness</h3>
              <div className="donation-options">
                {[100, 500, 1000].map((a) => (
                  <Button
                    key={a}
                    type="button"
                    variant={amount === String(a) ? "default" : "outline"}
                    onClick={() => {
                      setAmount(String(a));
                      request.current = "";
                    }}
                  >
                    {money(a)}
                  </Button>
                ))}
              </div>
              <div className="field">
                <label htmlFor="amount">Contribution amount (INR)</label>
                <input
                  id="amount"
                  type="number"
                  min={1}
                  max={1000000}
                  step={1}
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    request.current = "";
                  }}
                  required
                />
              </div>
              {error && (
                <div role="alert" className="form-message error-message">
                  {error}
                </div>
              )}
              <Button className="form-submit" disabled={busy}>
                {busy ? "Recording contribution…" : "Confirm demo contribution"}
                <Heart />
              </Button>
              <Button variant="link" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </form>
          ) : !user ? (
            <Button className="form-submit" asChild>
              <Link to="/login" search={{ next: `/campaign/${id}` }}>
                Log in to support this cause <ArrowUpRight />
              </Link>
            </Button>
          ) : profile?.role !== "donor" ? (
            <div className="form-message">Only donor accounts can contribute to a campaign.</div>
          ) : campaign.status !== "approved" ? (
            <div className="form-message">Contributions open after this campaign is approved.</div>
          ) : (
            <Button className="form-submit" onClick={() => setOpen(true)}>
              Support this cause <ArrowUpRight />
            </Button>
          )}
          <p className="demo-note">
            College demonstration: all contributions are simulated. No money is transferred, and no
            payment details are collected.
          </p>
        </section>
      </div>
    </div>
  );
}
