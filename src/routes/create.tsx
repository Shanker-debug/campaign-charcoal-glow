import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/launchly/auth";
import { campaignsQuery, categories, pageHead } from "@/lib/launchly";
export const Route = createFileRoute("/create")({
  head: () =>
    pageHead(
      "Start a campaign",
      "Give your community-led cause a way to grow. Approved organizers can submit a LAUNCHLY campaign for review.",
    ),
  validateSearch: (search: Record<string, unknown>): { edit?: string } => ({
    edit: typeof search["edit"] === "string" ? search["edit"] : "",
  }),
  component: Create,
});
function Create() {
  const { profile, user, loading, error: authError, reload } = useAuth();
  const { edit } = Route.useSearch();
  const { data } = useQuery({ ...campaignsQuery, enabled: !!user });
  const existing = data?.find((c) => c.id === edit && c.organizer_id === user?.id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Education");
  const [goal, setGoal] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const qc = useQueryClient();
  const navigate = useNavigate();
  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description);
      setCategory(existing.category);
      setGoal(String(existing.goal_amount));
      setImage(
        existing.image_url && existing.image_url.startsWith("https://") ? existing.image_url : "",
      );
    }
  }, [existing]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || !profile || profile.role !== "organizer" || profile.approval_status !== "approved")
      return;
    setError("");
    if (title.trim().length < 5 || description.trim().length < 20 || Number(goal) <= 0) {
      setError(
        "Enter a title of at least 5 characters, a story of at least 20 characters, and a positive funding goal.",
      );
      return;
    }
    setBusy(true);
    const values = {
      title: title.trim(),
      description: description.trim(),
      category,
      goal_amount: Number(goal),
      image_url: image.trim() || null,
      status: "pending",
      organizer_id: profile.id,
      organizer_name: profile.full_name,
    };
    const result = existing
      ? await supabase.from("campaigns").update(values).eq("id", existing.id)
      : await supabase.from("campaigns").insert(values);
    if (result.error) setError(result.error.message);
    else {
      await qc.invalidateQueries({ queryKey: ["campaigns"] });
      void navigate({ to: "/dashboard" });
    }
    setBusy(false);
  }
  if (loading) return <div className="site-container loading-state">Loading your account…</div>;
  if (authError)
    return (
      <div className="site-container empty-state">
        <p>{authError}</p>
        <Button onClick={reload}>Try again</Button>
      </div>
    );
  if (!user)
    return (
      <div className="site-container">
        <div className="prose-page">
          <div className="section-label">Give your good idea a beginning</div>
          <h1>
            Change starts
            <br />
            with a story.
          </h1>
          <p>
            Create an organizer account to bring your cause to LAUNCHLY. We’ll review your account,
            then help your campaign find its community.
          </p>
          <div className="hero-buttons">
            <Button asChild>
              <Link to="/register">
                Become an organizer <ArrowUpRight />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login" search={{ next: "/create" }}>
                Already an organizer? Log in
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  if (profile?.role !== "organizer")
    return (
      <div className="site-container empty-state">
        <h3>Campaign creation is for organizers.</h3>
        <p>
          Your account is a {profile?.role ?? "member"} account. Register a separate organizer
          account to start a campaign.
        </p>
        <Button asChild variant="link">
          <Link to="/dashboard">Go to your workspace</Link>
        </Button>
      </div>
    );
  if (profile.approval_status !== "approved")
    return (
      <div className="site-container empty-state">
        <Clock3 className="mx-auto mb-5" />
        <h3>
          {profile.approval_status === "pending"
            ? "A good story is worth the wait."
            : "Your organizer application was not approved."}
        </h3>
        <p>
          {profile.approval_status === "pending"
            ? "Your organizer account is awaiting review. Campaign submission will open once you are approved."
            : "Campaign submission is unavailable for this account."}
        </p>
        <Button variant="link" onClick={reload}>
          Check approval status
        </Button>
      </div>
    );
  if (edit && (!existing || existing.status === "approved"))
    return (
      <div className="site-container empty-state">This campaign is not eligible for editing.</div>
    );
  return (
    <div className="site-container">
      <div className="page-heading">
        <div className="section-label">Your story. Our shared tomorrow.</div>
        <h1>{existing ? "Refine your campaign." : "Give your good idea a way to grow."}</h1>
        <p>Tell us about your cause. Every submission is reviewed before publication.</p>
      </div>
      <form className="campaign-form" onSubmit={submit}>
        {error && (
          <div role="alert" className="form-message error-message">
            {error}
          </div>
        )}
        <div className="field">
          <label htmlFor="title">Campaign title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={5}
            maxLength={150}
            required
            placeholder="A name that captures your cause"
          />
        </div>
        <div className="form-columns">
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="goal">Funding goal (INR)</label>
            <input
              id="goal"
              type="number"
              min={1}
              max={100000000}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
              placeholder="250000"
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="description">Your campaign story</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength={20}
            maxLength={20000}
            required
            placeholder="Who are you helping? What will their tomorrow look like?"
          />
        </div>
        <div className="field">
          <label htmlFor="image">Cover photo URL (optional, HTTPS)</label>
          <input
            id="image"
            type="url"
            pattern="https://.*"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <Button className="h-12 px-7" disabled={busy}>
          {busy ? "Submitting…" : "Submit for review"}
          <ArrowUpRight />
        </Button>
        <p className="demo-note">
          This is a college demonstration. All campaign contributions are simulated.
        </p>
      </form>
    </div>
  );
}
