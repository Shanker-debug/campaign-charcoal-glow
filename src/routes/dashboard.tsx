import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowUpRight, Clock3, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/launchly/auth";
import { campaignsQuery, money, pageHead } from "@/lib/launchly";
export const Route = createFileRoute("/dashboard")({
  head: () =>
    pageHead(
      "Your workspace",
      "Follow your contributions, manage your campaigns, or review organizer applications in your private LAUNCHLY workspace.",
    ),
  component: Dashboard,
});
function Dashboard() {
  const { user, profile, loading, error, reload } = useAuth();
  if (loading) return <div className="site-container loading-state">Loading your workspace…</div>;
  if (error)
    return (
      <div className="site-container empty-state">
        <p>{error}</p>
        <Button onClick={reload}>Try again</Button>
      </div>
    );
  if (!user || !profile)
    return (
      <div className="site-container empty-state">
        <h3>Your story continues here.</h3>
        <p>Log in to see your personal workspace.</p>
        <Button className="mt-5" asChild>
          <Link to="/login" search={{ next: "/dashboard" }}>
            Log in <ArrowUpRight />
          </Link>
        </Button>
      </div>
    );
  return (
    <div className="site-container page-bottom-space">
      <div className="page-heading">
        <div className="section-label">
          {profile.role === "admin"
            ? "Platform review"
            : profile.role === "organizer"
              ? "Your causes, your community"
              : "Your small acts of kindness"}
        </div>
        <h1>Welcome, {profile.full_name.split(" ")[0] || "friend"}.</h1>
        <p>
          {profile.role === "admin"
            ? "Keep meaningful change transparent and trustworthy."
            : profile.role === "organizer"
              ? "Bring your cause to life, one story at a time."
              : "Every contribution is part of a bigger story."}
        </p>
      </div>
      {profile.role === "admin" ? (
        <AdminWorkspace />
      ) : profile.role === "organizer" ? (
        <OrganizerWorkspace />
      ) : (
        <DonorWorkspace />
      )}
    </div>
  );
}
function DonorWorkspace() {
  const { user } = useAuth();
  const { data: campaigns } = useQuery(campaignsQuery);
  const {
    data: donations,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["donations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*, campaigns(title)")
        .eq("donor_id", user?.id ?? "")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  return (
    <>
      <div className="workspace-statistics">
        <div>
          <strong>
            {money((donations ?? []).reduce((total, d) => total + Number(d.amount), 0))}
          </strong>
          <span>Total demo contributions</span>
        </div>
        <div>
          <strong>{new Set(donations?.map((d) => d.campaign_id)).size}</strong>
          <span>Causes supported</span>
        </div>
        <div>
          <strong>{donations?.length ?? 0}</strong>
          <span>Small acts of kindness</span>
        </div>
      </div>
      <div className="section-header">
        <h2>Your contribution history</h2>
        <Link to="/explore" className="text-link">
          Find your next cause <ArrowUpRight size={16} />
        </Link>
      </div>
      {isPending ? (
        <p className="loading-state">Loading contributions…</p>
      ) : error ? (
        <div className="empty-state">
          <p>Your history couldn’t be loaded.</p>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      ) : donations?.length ? (
        donations.map((d) => (
          <div className="record" key={d.id}>
            <div>
              <Link to="/campaign/$id" params={{ id: d.campaign_id }}>
                <h3>
                  {d.campaigns?.title ??
                    campaigns?.find((c) => c.id === d.campaign_id)?.title ??
                    "Campaign"}
                </h3>
              </Link>
              <p>
                {new Date(d.created_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}{" "}
                · Simulated contribution
              </p>
            </div>
            <strong>{money(Number(d.amount))}</strong>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <h3>Your first small act is waiting.</h3>
          <p>Support a cause and your demo contribution will appear here.</p>
          <Button asChild variant="link">
            <Link to="/explore">
              Explore campaigns <ArrowUpRight />
            </Link>
          </Button>
        </div>
      )}
      <p className="demo-note">
        All contributions shown are simulated. No money has been transferred.
      </p>
    </>
  );
}
function OrganizerWorkspace() {
  const { profile, reload } = useAuth();
  const { data, isPending, error, refetch } = useQuery(campaignsQuery);
  const own = (data ?? []).filter((c) => c.organizer_id === profile?.id);
  if (profile?.approval_status !== "approved")
    return (
      <div className="empty-state">
        <Clock3 className="mx-auto mb-5" />
        <h3>
          {profile?.approval_status === "pending"
            ? "Your organizer application is under review."
            : "Your application was not approved."}
        </h3>
        <p>
          {profile?.approval_status === "pending"
            ? "Once approved, you can create campaigns and submit them for publication."
            : "Campaign submission is not available for your account."}
        </p>
        <p className="status">Status: {profile?.approval_status}</p>
        <Button onClick={reload} variant="link">
          Check approval status
        </Button>
      </div>
    );
  return (
    <>
      <div className="workspace-statistics">
        <div>
          <strong>{own.length}</strong>
          <span>Your campaigns</span>
        </div>
        <div>
          <strong>{money(own.reduce((a, c) => a + c.raised, 0))}</strong>
          <span>Total demo support</span>
        </div>
        <div>
          <strong>{own.filter((c) => c.status === "approved").length}</strong>
          <span>Published causes</span>
        </div>
      </div>
      <div className="section-header">
        <h2>Your campaigns</h2>
        <Button asChild>
          <Link to="/create">
            <Plus />
            Create a campaign
          </Link>
        </Button>
      </div>
      {isPending ? (
        <p className="loading-state">Loading campaigns…</p>
      ) : error ? (
        <div className="empty-state">
          <p>Your campaigns couldn’t be loaded.</p>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      ) : own.length ? (
        own.map((c) => (
          <div className="record" key={c.id}>
            <div>
              <h3>{c.title}</h3>
              <p>
                {money(c.raised)} of {money(c.goal_amount)} · {c.backers} unique backers ·{" "}
                <span className="status">{c.status}</span>
              </p>
              <p>Submitted {new Date(c.created_at).toLocaleDateString("en-IN")}</p>
            </div>
            <div className="record-actions">
              <Button asChild variant="outline">
                <Link to="/campaign/$id" params={{ id: c.id }}>
                  View <ArrowUpRight />
                </Link>
              </Button>
              {c.status !== "approved" && (
                <Button asChild variant="outline">
                  <Link to="/create" search={{ edit: c.id }}>
                    Edit
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="empty-state">
          <h3>Every campaign starts with a good idea.</h3>
          <p>Create your first campaign and submit it for review.</p>
        </div>
      )}
    </>
  );
}
function AdminWorkspace() {
  const qc = useQueryClient();
  const {
    data: campaigns,
    isPending: campaignsPending,
    error: campaignsError,
  } = useQuery(campaignsQuery);
  const [tab, setTab] = useState("Overview");
  const [action, setAction] = useState<{
    id: string;
    kind: string;
    decision: string;
    name: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const {
    data: organizers,
    isPending: organizersPending,
    error: organizersError,
  } = useQuery({
    queryKey: ["organizers"],
    queryFn: async () => {
      const [p, r] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);
      if (p.error) throw p.error;
      if (r.error) throw r.error;
      return p.data.filter((p) => r.data.some((r) => r.user_id === p.id && r.role === "organizer"));
    },
  });
  const { data: history } = useQuery({
    queryKey: ["moderation-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moderation_history")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  async function moderate() {
    if (!action || busy) return;
    setBusy(true);
    setActionError("");
    const { error } = await supabase.rpc("moderate", {
      target: action.id,
      kind: action.kind,
      decision: action.decision,
    });
    if (error) setActionError(error.message);
    else {
      setMessage(`${action.name} ${action.decision}.`);
      setAction(null);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["campaigns"] }),
        qc.invalidateQueries({ queryKey: ["organizers"] }),
        qc.invalidateQueries({ queryKey: ["moderation-history"] }),
      ]);
    }
    setBusy(false);
  }
  const tabs = [
    "Overview",
    "Organizer applications",
    "Approval history",
    "Pending campaigns",
    "Published campaigns",
    "Rejected submissions",
  ];
  const campaignRows = (campaigns ?? []).filter((c) =>
    tab === "Published campaigns"
      ? c.status === "approved"
      : tab === "Rejected submissions"
        ? c.status === "rejected"
        : c.status === "pending",
  );
  return (
    <>
      <div className="workspace-tabs">
        {tabs.map((t) => (
          <Button key={t} variant={tab === t ? "default" : "ghost"} onClick={() => setTab(t)}>
            {t}
          </Button>
        ))}
      </div>
      {message && (
        <div role="status" className="form-message">
          {message}
        </div>
      )}
      {campaignsPending || organizersPending ? (
        <p className="loading-state">Loading review queue…</p>
      ) : campaignsError || organizersError ? (
        <div className="empty-state">
          <p>Reviews couldn’t be loaded.</p>
          <Button onClick={() => qc.invalidateQueries()}>Try again</Button>
        </div>
      ) : (
        <>
          {tab === "Overview" && (
            <>
              <div className="workspace-statistics">
                <div>
                  <strong>
                    {organizers?.filter((p) => p.approval_status === "pending").length ?? 0}
                  </strong>
                  <span>Pending organizer applications</span>
                </div>
                <div>
                  <strong>{campaigns?.filter((c) => c.status === "pending").length ?? 0}</strong>
                  <span>Campaigns awaiting review</span>
                </div>
                <div>
                  <strong>{money((campaigns ?? []).reduce((a, c) => a + c.raised, 0))}</strong>
                  <span>Platform demo contributions</span>
                </div>
              </div>
              <div className="form-message">
                <ShieldCheck className="mb-3" />
                Review organizer applications before approving campaigns. Public visitors only see
                approved campaigns.
              </div>
            </>
          )}
          {tab === "Organizer applications" &&
            (organizers?.length ? (
              organizers.map((p) => (
                <div className="record" key={p.id}>
                  <div>
                    <h3>{p.full_name}</h3>
                    <p>
                      Applied {new Date(p.created_at).toLocaleDateString("en-IN")} ·{" "}
                      <span className="status">{p.approval_status}</span>
                    </p>
                  </div>
                  {p.approval_status === "pending" && (
                    <div className="record-actions">
                      <Button
                        onClick={() => {
                          setActionError("");
                          setAction({
                            id: p.id,
                            kind: "organizer",
                            decision: "approved",
                            name: p.full_name,
                          });
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActionError("");
                          setAction({
                            id: p.id,
                            kind: "organizer",
                            decision: "rejected",
                            name: p.full_name,
                          });
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">No organizer applications yet.</div>
            ))}
          {tab === "Approval history" &&
            (history?.length ? (
              history.map((h) => (
                <div className="record" key={h.id}>
                  <div>
                    <h3>
                      {h.target_type === "organizer"
                        ? organizers?.find((p) => p.id === h.target_id)?.full_name
                        : campaigns?.find((c) => c.id === h.target_id)?.title}
                    </h3>
                    <p>
                      {h.target_type} · {h.decision} ·{" "}
                      {new Date(h.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No review decisions yet.</div>
            ))}
          {["Pending campaigns", "Published campaigns", "Rejected submissions"].includes(tab) &&
            (campaignRows.length ? (
              campaignRows.map((c) => (
                <div className="record" key={c.id}>
                  <div>
                    <h3>{c.title}</h3>
                    <p>
                      {c.organizer_name} · {c.category} · {money(c.goal_amount)} · {c.status}
                    </p>
                    <p>Submitted {new Date(c.created_at).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="record-actions">
                    <Button asChild variant="outline">
                      <Link to="/campaign/$id" params={{ id: c.id }}>
                        Review story
                      </Link>
                    </Button>
                    {c.status === "pending" && (
                      <>
                        <Button
                          onClick={() => {
                            setActionError("");
                            setAction({
                              id: c.id,
                              kind: "campaign",
                              decision: "approved",
                              name: c.title,
                            });
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setActionError("");
                            setAction({
                              id: c.id,
                              kind: "campaign",
                              decision: "rejected",
                              name: c.title,
                            });
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No campaigns in this queue.</div>
            ))}
        </>
      )}
      <Dialog
        open={!!action}
        onOpenChange={(open) => {
          if (!open && !busy) setAction(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action?.decision === "approved" ? "Approve" : "Reject"} {action?.kind}?
            </DialogTitle>
            <DialogDescription>
              {action?.name}.{" "}
              {action?.kind === "campaign" && action.decision === "approved"
                ? "This campaign will become publicly visible."
                : "This decision changes the submission’s approval status."}
            </DialogDescription>
          </DialogHeader>
          {actionError && (
            <p role="alert" className="error-message">
              {actionError}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" disabled={busy} onClick={() => setAction(null)}>
              Cancel
            </Button>
            <Button disabled={busy} onClick={moderate}>
              {busy ? "Saving…" : "Confirm decision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
