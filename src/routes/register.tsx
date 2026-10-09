import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/launchly/auth";
import { pageHead } from "@/lib/launchly";
export const Route = createFileRoute("/register")({
  head: () =>
    pageHead(
      "Join a world of possibility",
      "Create a LAUNCHLY donor or organizer account and become part of meaningful change.",
    ),
  component: Register,
});
function Register() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [type, setType] = useState("donor");
  const { reload } = useAuth();
  const navigate = useNavigate();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const full_name = String(f.get("name")).trim();
    if (full_name.length < 2) {
      setError("Please enter your full name.");
      setBusy(false);
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: String(f.get("email")).trim(),
      password: String(f.get("password")),
      options: {
        data: { full_name, account_type: type },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) setError(error.message);
    else if (data.session) {
      await reload();
      void navigate({ to: "/dashboard" });
    } else setSuccess(true);
    setBusy(false);
  }
  return (
    <div className="site-container">
      <div className="auth-layout">
        <div className="section-label">Every good story starts somewhere</div>
        <h1>Be part of something good.</h1>
        <p>Small acts from people like you make lasting change possible.</p>
        {success ? (
          <div className="form-message" role="status">
            Check your email to confirm your account, then log in.{" "}
            {type === "organizer" &&
              "Your organizer account will need approval before you can submit a campaign."}
          </div>
        ) : (
          <form onSubmit={submit}>
            {error && (
              <div role="alert" className="form-message error-message">
                {error}
              </div>
            )}
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                minLength={2}
                maxLength={100}
                required
                placeholder="Your full name"
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="At least 8 characters"
              />
            </div>
            <div className="field">
              <label htmlFor="type">I’d like to</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="donor">Support causes — Donor</option>
                <option value="organizer">Start a campaign — Organizer</option>
              </select>
            </div>
            {type === "organizer" && (
              <div className="demo-note mb-5">
                Organizer accounts are reviewed before campaign submission is enabled.
              </div>
            )}
            <Button className="form-submit" disabled={busy}>
              {busy ? "Creating your account…" : "Create an account"}
              <ArrowRight />
            </Button>
          </form>
        )}
        <div className="auth-switch">
          Already part of LAUNCHLY? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
