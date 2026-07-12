import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBan,
  FaBell,
  FaChartColumn,
  FaCircle,
  FaCircleUser,
  FaEnvelope,
  FaFlag,
  FaHouse,
  FaImage,
  FaMagnifyingGlass,
  FaMessage,
  FaShieldHalved,
  FaSpinner,
  FaTrash,
  FaUser,
  FaUsers,
} from "react-icons/fa6";
import { db } from "../services/database";
import { fetchAdminTableRows } from "../services/adminService";
import { useAuth } from "../context/UseAuth";
import brandPlaceholder from "../assets/brand.png";

const navigationItems = [
  {
    id: "overview",
    label: "Overview",
    icon: FaChartColumn,
    accent: "from-cyan-500 to-blue-500",
  },
  {
    id: "users",
    label: "Users",
    icon: FaUsers,
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    id: "properties",
    label: "Properties",
    icon: FaHouse,
    accent: "from-emerald-500 to-lime-500",
  },
  {
    id: "reports",
    label: "Reports",
    icon: FaFlag,
    accent: "from-amber-500 to-orange-500",
  },
  {
    id: "support",
    label: "Support",
    icon: FaMessage,
    accent: "from-rose-500 to-pink-500",
  },
  {
    id: "profile",
    label: "Profile",
    icon: FaCircleUser,
    accent: "from-slate-500 to-slate-700",
  },
];

const defaultStats = [
  {
    label: "Active users",
    value: "0",
    detail: "Live activity",
    tone: "from-cyan-500 to-blue-500",
  },
  {
    label: "Listings",
    value: "0",
    detail: "Platform entries",
    tone: "from-emerald-500 to-lime-500",
  },
  {
    label: "Open reports",
    value: "0",
    detail: "Pending review",
    tone: "from-amber-500 to-orange-500",
  },
];

const formatRelativeTime = (value) => {
  if (!value) return "recently";

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "recently";

  const diff = Date.now() - time;
  const minutes = Math.round(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const normalizeImageUrl = (value) => {
  if (!value || typeof value !== "string") return brandPlaceholder;
  if (value.startsWith("http")) return value;

  const { data } = db.storage.from("listing-images").getPublicUrl(value);
  return data?.publicUrl || brandPlaceholder;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
  const [activityFeed, setActivityFeed] = useState([]);
  const [overviewStats, setOverviewStats] = useState(defaultStats);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [propertySearch, setPropertySearch] = useState("");
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyActionLoading, setPropertyActionLoading] = useState(false);
  const [propertyImageIndex, setPropertyImageIndex] = useState(0);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportSearch, setReportSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSearch, setSupportSearch] = useState("");
  const [selectedSupport, setSelectedSupport] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const handleExit = async () => {
    try {
      await db.auth.signOut();
    } catch (error) {
      console.warn("Unable to sign out cleanly", error);
    }

    navigate("/auth", { replace: true });
  };

  const loadDashboardData = async () => {
    setUsersLoading(true);
    setPropertiesLoading(true);
    setReportsLoading(true);
    setSupportLoading(true);
    setProfileLoading(true);

    try {
      const [profileRows, propertyRows, reportRows, supportRows] =
        await Promise.all([
          fetchAdminTableRows("profiles"),
          fetchAdminTableRows("property"),
          fetchAdminTableRows("property_reports"),
          fetchAdminTableRows("support_messages"),
        ]);

      const normalizedUsers = profileRows.map((profile) => {
        const fullName = profile.full_name || profile.name || "";
        const firstName = profile.first_name || "";
        const lastName = profile.last_name || "";
        const displayName =
          fullName ||
          [firstName, lastName].filter(Boolean).join(" ") ||
          profile.username ||
          "Unnamed user";
        const email = profile.email || profile.user_email || "No email";
        const role = profile.role || "member";
        const createdAt = profile.created_at || profile.createdAt;
        const lastSeen =
          profile.last_seen_at ||
          profile.updated_at ||
          profile.last_seen ||
          createdAt;
        const isBanned = Boolean(
          profile.is_banned ??
          profile.banned ??
          profile.status === "banned" ??
          profile.is_blocked,
        );
        const diffMinutes = lastSeen
          ? Math.round((Date.now() - new Date(lastSeen).getTime()) / 60000)
          : 999;
        const isOnline = Number.isFinite(diffMinutes) && diffMinutes < 10;

        return {
          id: profile.id,
          name: displayName,
          email,
          role: role.toUpperCase(),
          createdAt,
          lastSeen,
          isBanned,
          isOnline,
          avatar: profile.avatar_url || profile.avatar || null,
        };
      });

      const profileById = new Map(
        profileRows
          .filter(Boolean)
          .map((profile) => [String(profile.id), profile]),
      );
      const profileByEmail = new Map(
        profileRows
          .filter(Boolean)
          .map((profile) => [
            String(profile.email || profile.user_email || "").toLowerCase(),
            profile,
          ])
          .filter((entry) => entry[0]),
      );

      const normalizedProperties = [];
      const propertyTitleById = {};

      for (const property of propertyRows) {
        let imageRows = [];

        try {
          const { data, error } = await db
            .from("property_images")
            .select("storage_key")
            .eq("prop_id", property.id)
            .order("id", { ascending: true });

          if (!error) {
            imageRows = data || [];
          }
        } catch (error) {
          console.warn("Unable to enrich property details", error);
        }

        const imageUrls = imageRows
          .map((image) => image.storage_key)
          .filter(Boolean)
          .map((imageKey) => normalizeImageUrl(imageKey));

        const ownerProfile =
          profileById.get(String(property.user_id)) ||
          profileByEmail.get(
            String(property.owner_email || "").toLowerCase(),
          ) ||
          profileByEmail.get(String(property.email || "").toLowerCase()) ||
          null;

        propertyTitleById[property.id] = property.title || "Untitled listing";

        normalizedProperties.push({
          id: property.id,
          title: property.title || "Untitled listing",
          location: property.location || property.address || "Location pending",
          price: property.price ? `${property.price} FCFA` : "Price not set",
          status: String(property.status || "pending").toLowerCase(),
          description: property.description || "No description available",
          createdAt: property.created_at,
          ownerName:
            property.owner_name ||
            ownerProfile?.full_name ||
            ownerProfile?.username ||
            property.full_name ||
            property.name ||
            property.owner ||
            property.username ||
            "Owner pending",
          ownerEmail:
            property.owner_email ||
            property.email ||
            ownerProfile?.email ||
            null,
          ownerPhone:
            property.contact_number ||
            property.phone ||
            property.owner_phone ||
            ownerProfile?.phone ||
            null,
          ownerAvatar: ownerProfile?.avatar_url || property.avatar_url || null,
          imageUrls,
        });
      }

      const normalizedReports = reportRows.map((report) => {
        const propertyId = report.property_id || report.prop_id || null;

        return {
          id: report.id,
          reason: report.report_reason || report.reason || "General issue",
          details:
            report.details || report.description || "No additional details",
          status: String(report.status || "pending").toLowerCase(),
          createdAt: report.created_at,
          propertyId,
          propertyTitle: propertyTitleById[propertyId] || null,
        };
      });

      const normalizedSupportMessages = supportRows.map((item) => {
        const senderProfile =
          profileById.get(String(item.sender_id)) ||
          profileByEmail.get(String(item.sender_email || "").toLowerCase()) ||
          profileByEmail.get(String(item.email || "").toLowerCase()) ||
          null;

        return {
          id: item.id,
          subject: item.subject || "Support request",
          message: item.message || "No details were provided",
          senderId: item.sender_id || null,
          senderName:
            item.sender_name ||
            item.name ||
            senderProfile?.full_name ||
            senderProfile?.username ||
            "Unknown sender",
          senderEmail:
            item.sender_email || item.email || senderProfile?.email || null,
          createdAt: item.created_at,
          status: String(item.status || "new").toLowerCase(),
        };
      });

      const matchedProfile =
        profileRows.find((profile) => profile.id === user?.id) ||
        profileRows.find(
          (profile) =>
            profile.email === user?.email || profile.user_email === user?.email,
        ) ||
        null;

      const normalizedProfile = {
        id: matchedProfile?.id || user?.id || "admin",
        name:
          matchedProfile?.full_name ||
          matchedProfile?.name ||
          user?.user_metadata?.username ||
          user?.email ||
          "Admin",
        email:
          matchedProfile?.email ||
          matchedProfile?.user_email ||
          user?.email ||
          "No email",
        role: (
          matchedProfile?.role ||
          user?.user_metadata?.role ||
          "admin"
        ).toUpperCase(),
        phone:
          matchedProfile?.phone ||
          matchedProfile?.contact_number ||
          "Not provided",
        location: matchedProfile?.location || "Not provided",
        bio: matchedProfile?.bio || "Moderation and platform oversight",
        createdAt:
          matchedProfile?.created_at || matchedProfile?.createdAt || null,
        lastSeen:
          matchedProfile?.updated_at || matchedProfile?.last_seen_at || null,
      };

      setUsers(normalizedUsers);
      setProperties(normalizedProperties);
      setReports(normalizedReports);
      setSupportMessages(normalizedSupportMessages);
      setAdminProfile(normalizedProfile);

      if (!selectedUser && normalizedUsers.length) {
        setSelectedUser(normalizedUsers[0]);
      }
      setSelectedProperty((currentSelection) => {
        if (!normalizedProperties.length) {
          return null;
        }

        return (
          normalizedProperties.find(
            (item) => item.id === currentSelection?.id,
          ) || normalizedProperties[0]
        );
      });
      if (!selectedReport && normalizedReports.length) {
        setSelectedReport(normalizedReports[0]);
      }
      if (!selectedSupport && normalizedSupportMessages.length) {
        setSelectedSupport(normalizedSupportMessages[0]);
      }

      const activeUsers = normalizedUsers.filter(
        (user) => user.isOnline,
      ).length;
      const openReports = normalizedReports.filter((report) => {
        return !["resolved", "closed", "dismissed"].includes(report.status);
      }).length;

      setOverviewStats([
        {
          label: "Active users",
          value: activeUsers.toString(),
          detail: `${normalizedUsers.length} total members`,
          tone: "from-cyan-500 to-blue-500",
        },
        {
          label: "Listings",
          value: normalizedProperties.length.toString(),
          detail: `${normalizedProperties.filter((item) => item.status === "active" || item.status === "available").length} active`,
          tone: "from-emerald-500 to-lime-500",
        },
        {
          label: "Open reports",
          value: openReports.toString(),
          detail: `${normalizedReports.length} total reports`,
          tone: "from-amber-500 to-orange-500",
        },
      ]);

      const activityItems = [
        ...normalizedUsers.slice(0, 2).map((user) => ({
          title: `${user.name} joined the platform`,
          meta: `${user.role} • ${formatRelativeTime(user.createdAt)}`,
          badge: user.isBanned ? "Restricted" : "Active",
        })),
        ...normalizedProperties.slice(0, 2).map((property) => ({
          title: `${property.title} was published`,
          meta: `${property.status} • ${formatRelativeTime(property.createdAt)}`,
          badge: "Listing",
        })),
        ...normalizedReports.slice(0, 2).map((report) => ({
          title: "New report submitted",
          meta: `${report.reason} • ${formatRelativeTime(report.createdAt)}`,
          badge: "Needs review",
        })),
      ];

      setActivityFeed(activityItems.slice(0, 6));
    } catch (error) {
      console.error("Admin dashboard data load failed", error);
      setUsers([]);
      setProperties([]);
      setReports([]);
      setSupportMessages([]);
      setAdminProfile(null);
      setActivityFeed([]);
      setOverviewStats(defaultStats);
    } finally {
      setUsersLoading(false);
      setPropertiesLoading(false);
      setReportsLoading(false);
      setSupportLoading(false);
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleBanToggle = async (userId, isBanned) => {
    setStatusLoadingId(userId);

    try {
      const candidateColumns = ["is_banned", "banned", "status"];
      let lastError = null;

      for (const column of candidateColumns) {
        const payload =
          column === "status"
            ? { status: isBanned ? "banned" : "active" }
            : { [column]: isBanned };
        const { error } = await db
          .from("profiles")
          .update(payload)
          .eq("id", userId);

        if (!error) {
          lastError = null;
          break;
        }

        lastError = error;
      }

      if (lastError) throw lastError;

      setUsers((current) =>
        current.map((item) =>
          item.id === userId ? { ...item, isBanned } : item,
        ),
      );
      setMessageStatus(
        isBanned ? "User restricted successfully." : "User access restored.",
      );
    } catch (error) {
      console.error("Unable to update user status", error);
      setMessageStatus("Unable to update user status right now.");
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleSendMessage = () => {
    if (!selectedUser) {
      setMessageStatus("Select a user before sending a message.");
      return;
    }

    if (!messageDraft.trim()) {
      setMessageStatus("Write a short message to send.");
      return;
    }

    setMessageStatus(`Message queued for ${selectedUser.name}`);
    setMessageDraft("");
  };

  const reviewProperty = async (propertyId) => {
    if (!propertyId) {
      throw new Error("A valid property id is required");
    }

    const candidateColumns = ["status", "approval_status", "review_status"];
    let lastError = null;

    for (const column of candidateColumns) {
      const payload =
        column === "status" ? { status: "reviewed" } : { [column]: "reviewed" };
      const { error } = await db
        .from("property")
        .update(payload)
        .eq("id", propertyId);

      if (!error) {
        lastError = null;
        break;
      }

      lastError = error;
    }

    if (lastError) {
      throw lastError;
    }
  };

  const deleteProperty = async (propertyId) => {
    if (!propertyId) {
      throw new Error("A valid property id is required");
    }

    const { error: imageError } = await db
      .from("property_images")
      .delete()
      .eq("prop_id", propertyId);

    if (imageError) {
      console.warn("Unable to delete property images", imageError);
    }

    const { error: propertyError } = await db
      .from("property")
      .delete()
      .eq("id", propertyId);

    if (propertyError) {
      throw propertyError;
    }
  };

  const handlePropertyAction = async (action) => {
    if (!selectedProperty) {
      setMessageStatus("Select a property before taking action.");
      return;
    }

    setPropertyActionLoading(true);

    try {
      if (action === "delete") {
        await deleteProperty(selectedProperty.id);
        setProperties((current) =>
          current.filter((item) => item.id !== selectedProperty.id),
        );
        setSelectedProperty((currentSelection) => {
          if (currentSelection?.id !== selectedProperty.id) {
            return currentSelection;
          }

          const remaining = properties.filter(
            (item) => item.id !== selectedProperty.id,
          );
          return remaining[0] || null;
        });
        setPropertyImageIndex(0);
        setMessageStatus(`Deleted listing ${selectedProperty.title}.`);
      } else {
        await reviewProperty(selectedProperty.id);
        setProperties((current) =>
          current.map((item) =>
            item.id === selectedProperty.id
              ? { ...item, status: "reviewed" }
              : item,
          ),
        );
        setSelectedProperty((currentSelection) =>
          currentSelection?.id === selectedProperty.id
            ? { ...currentSelection, status: "reviewed" }
            : currentSelection,
        );
        setMessageStatus(`Marked ${selectedProperty.title} as reviewed.`);
      }
    } catch (error) {
      console.error("Unable to update property", error);
      setMessageStatus("Unable to complete that property action right now.");
    } finally {
      setPropertyActionLoading(false);
    }
  };

  const handleReportAction = (label) => {
    if (!selectedReport) {
      setMessageStatus("Select a report before taking action.");
      return;
    }

    setMessageStatus(`${label} queued for report #${selectedReport.id}`);
  };

  const filteredUsers = users.filter((user) => {
    const haystack = `${user.name} ${user.email} ${user.role}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const filteredProperties = properties.filter((property) => {
    const haystack =
      `${property.title} ${property.location} ${property.status} ${property.ownerName || ""} ${property.description || ""} ${property.id || ""}`.toLowerCase();
    return haystack.includes(propertySearch.toLowerCase());
  });

  const filteredReports = reports.filter((report) => {
    const haystack =
      `${report.reason} ${report.details} ${report.status}`.toLowerCase();
    return haystack.includes(reportSearch.toLowerCase());
  });

  const filteredSupportMessages = supportMessages.filter((message) => {
    const haystack =
      `${message.subject} ${message.message} ${message.status} ${message.senderName || ""} ${message.senderEmail || ""}`.toLowerCase();
    return haystack.includes(supportSearch.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:px-8 lg:py-8">
        <aside className="w-full rounded-[2rem] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur-xl lg:w-72">
          <div className="flex items-center gap-3 rounded-[1.5rem] border border-cyan-500/20 bg-slate-950/70 p-3">
            <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-300">
              <FaShieldHalved className="text-xl" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">
                Admin hub
              </p>
              <h2 className="text-lg font-semibold text-white">Zilo Home</h2>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${isActive ? "bg-white text-slate-950 shadow-lg shadow-cyan-500/10" : "bg-slate-950/60 text-slate-300 hover:bg-slate-800/80"}`}
                >
                  <div
                    className={`rounded-xl bg-gradient-to-r ${item.accent} p-2 text-white`}
                  >
                    <Icon className="text-sm" />
                  </div>
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
            <p className="text-sm font-semibold text-white">System status</p>
            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-300">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              All services healthy
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Realtime monitoring and moderation tools are ready.
            </p>
            <button
              type="button"
              onClick={handleExit}
              className="mt-4 w-full rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
            >
              Exit
            </button>
          </div>
        </aside>

        <main className="flex-1 rounded-[2rem] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Control center
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                {activeTab === "users"
                  ? "User management"
                  : activeTab === "properties"
                    ? "Property management"
                    : activeTab === "reports"
                      ? "Reports center"
                      : activeTab === "support"
                        ? "Support inbox"
                        : activeTab === "profile"
                          ? "Admin profile"
                          : "Operations overview"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                A responsive admin workspace for reviewing activity, moderating
                content, and keeping operations on track.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">
              <FaBell />3 new alerts
            </div>
          </div>

          {activeTab === "overview" ? (
            <>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {overviewStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4"
                  >
                    <div
                      className={`inline-flex rounded-2xl bg-gradient-to-r ${item.tone} p-3 text-white`}
                    >
                      <FaChartColumn />
                    </div>
                    <p className="mt-4 text-3xl font-semibold text-white">
                      {item.value}
                    </p>
                    <p className="mt-1 font-semibold text-slate-100">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-cyan-300">
                        Live workspace
                      </p>
                      <h3 className="text-lg font-semibold text-white">
                        Platform activity
                      </h3>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800">
                      View all
                      <FaArrowRight />
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {activityFeed.length ? (
                      activityFeed.map((activity, index) => (
                        <div
                          key={`${activity.title}-${index}`}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-3"
                        >
                          <div>
                            <p className="font-semibold text-white">
                              {activity.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              {activity.meta}
                            </p>
                          </div>
                          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                            {activity.badge}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-2xl border border-dashed border-white/10 bg-slate-900/70 p-4 text-sm text-slate-400">
                        No activity recorded yet.
                      </p>
                    )}
                  </div>
                </section>

                <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <FaMagnifyingGlass />
                    <h3 className="text-lg font-semibold text-white">
                      Quick search
                    </h3>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-400">
                    Search users, properties, and reports from the main
                    workspace.
                  </div>
                  <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-gradient-to-br from-cyan-500/15 to-blue-500/10 p-4">
                    <p className="text-sm font-semibold text-cyan-300">
                      Live data is now connected
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      The overview section now surfaces recent platform activity
                      and live statistics.
                    </p>
                  </div>
                </section>
              </div>
            </>
          ) : activeTab === "users" ? (
            <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-violet-300">
                      Members
                    </p>
                    <h3 className="text-lg font-semibold text-white">
                      All users
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
                    <FaMagnifyingGlass />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search users"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                {usersLoading ? (
                  <div className="mt-5 flex items-center justify-center rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/70 p-8 text-slate-400">
                    <FaSpinner className="mr-2 animate-spin" />
                    Loading users...
                  </div>
                ) : filteredUsers.length ? (
                  <div className="mt-5 space-y-3">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`flex w-full items-center justify-between rounded-[1.25rem] border px-3 py-3 text-left transition ${selectedUser?.id === user.id ? "border-cyan-400/40 bg-cyan-500/10" : "border-white/10 bg-slate-900/70 hover:bg-slate-800/80"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
                            {user.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {user.name}
                            </p>
                            <p className="text-sm text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${user.isOnline ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-700/80 text-slate-300"}`}
                          >
                            <FaCircle className="text-[7px]" />
                            {user.isOnline ? "Online" : "Offline"}
                          </span>
                          <span className="text-xs text-slate-500">
                            {user.role}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/70 p-6 text-sm text-slate-400">
                    No users match this search yet.
                  </div>
                )}
              </section>

              <section className="space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                {selectedUser ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-violet-300">
                          Selected account
                        </p>
                        <h3 className="text-lg font-semibold text-white">
                          {selectedUser.name}
                        </h3>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-sm ${selectedUser.isBanned ? "bg-rose-500/10 text-rose-300" : "bg-emerald-500/10 text-emerald-300"}`}
                      >
                        {selectedUser.isBanned ? "Restricted" : "Active"}
                      </span>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                      <p className="text-sm text-slate-400">Email</p>
                      <p className="mt-1 font-medium text-white">
                        {selectedUser.email}
                      </p>
                      <p className="mt-4 text-sm text-slate-400">Role</p>
                      <p className="mt-1 font-medium text-white">
                        {selectedUser.role}
                      </p>
                      <p className="mt-4 text-sm text-slate-400">
                        Last activity
                      </p>
                      <p className="mt-1 font-medium text-white">
                        {formatRelativeTime(selectedUser.lastSeen)}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                      <p className="text-sm font-semibold text-white">
                        User activity
                      </p>
                      <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-sm text-slate-300">
                        Joined{" "}
                        {selectedUser.createdAt
                          ? formatRelativeTime(selectedUser.createdAt)
                          : "recently"}{" "}
                        •{" "}
                        {selectedUser.isOnline
                          ? "Currently active"
                          : "Last seen recently"}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() =>
                          handleBanToggle(
                            selectedUser.id,
                            !selectedUser.isBanned,
                          )
                        }
                        disabled={statusLoadingId === selectedUser.id}
                        className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition ${selectedUser.isBanned ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20" : "bg-rose-500/15 text-rose-300 hover:bg-rose-500/20"}`}
                      >
                        {statusLoadingId === selectedUser.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaBan />
                        )}
                        {selectedUser.isBanned ? "Unban user" : "Ban user"}
                      </button>
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">
                        <FaEnvelope />
                        Message ready
                      </div>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                      <p className="text-sm font-semibold text-white">
                        Send message
                      </p>
                      <textarea
                        value={messageDraft}
                        onChange={(event) =>
                          setMessageDraft(event.target.value)
                        }
                        rows="3"
                        placeholder={`Send a note to ${selectedUser.name}`}
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 outline-none"
                      />
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-sm text-slate-400">
                          {messageStatus ||
                            "Drafts are saved locally until you connect a delivery service."}
                        </p>
                        <button
                          onClick={handleSendMessage}
                          className="rounded-2xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/70 p-6 text-sm text-slate-400">
                    Select a user to view their details and moderation tools.
                  </div>
                )}
              </section>
            </div>
          ) : activeTab === "properties" ? (
            <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">
                      Listings
                    </p>
                    <h3 className="text-lg font-semibold text-white">
                      Property review
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
                    <FaMagnifyingGlass />
                    <input
                      value={propertySearch}
                      onChange={(event) =>
                        setPropertySearch(event.target.value)
                      }
                      placeholder="Search by title, location, owner or ID"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                {propertiesLoading ? (
                  <div className="mt-5 flex items-center justify-center rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/70 p-8 text-slate-400">
                    <FaSpinner className="mr-2 animate-spin" />
                    Loading properties...
                  </div>
                ) : filteredProperties.length ? (
                  <div className="mt-5 space-y-3">
                    {filteredProperties.map((property) => (
                      <button
                        key={property.id}
                        onClick={() => setSelectedProperty(property)}
                        className={`w-full rounded-[1.25rem] border px-3 py-3 text-left transition ${selectedProperty?.id === property.id ? "border-emerald-400/40 bg-emerald-500/10" : "border-white/10 bg-slate-900/70 hover:bg-slate-800/80"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">
                              {property.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              {property.location}
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
                            {property.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
                          <span>{property.price}</span>
                          <span>{formatRelativeTime(property.createdAt)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/70 p-6 text-sm text-slate-400">
                    No properties match this search yet.
                  </div>
                )}
              </section>

              <section className="space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                {selectedProperty ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-emerald-300">
                          Selected listing
                        </p>
                        <h3 className="text-lg font-semibold text-white">
                          {selectedProperty.title}
                        </h3>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                        {selectedProperty.status}
                      </span>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                      <div className="overflow-hidden rounded-[1rem] border border-white/10 bg-slate-950/70">
                        <img
                          src={
                            selectedProperty.imageUrls?.[propertyImageIndex] ||
                            brandPlaceholder
                          }
                          alt={selectedProperty.title}
                          className="h-56 w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = brandPlaceholder;
                          }}
                        />
                      </div>

                      {selectedProperty.imageUrls?.length ? (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {selectedProperty.imageUrls.map((imageUrl, index) => (
                            <button
                              key={`${selectedProperty.id}-${index}`}
                              type="button"
                              onClick={() => setPropertyImageIndex(index)}
                              className={`overflow-hidden rounded-xl border ${propertyImageIndex === index ? "border-cyan-400" : "border-white/10"}`}
                            >
                              <img
                                src={imageUrl}
                                alt={`${selectedProperty.title} ${index + 1}`}
                                className="h-20 w-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.src = brandPlaceholder;
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-slate-950/70 p-3 text-sm text-slate-400">
                          <FaImage />
                          No images were attached to this listing.
                        </div>
                      )}
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-400">Location</p>
                          <p className="mt-1 font-medium text-white">
                            {selectedProperty.location}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                          {selectedProperty.status}
                        </span>
                      </div>
                      <p className="mt-4 text-sm text-slate-400">Price</p>
                      <p className="mt-1 font-medium text-white">
                        {selectedProperty.price}
                      </p>
                      <p className="mt-4 text-sm text-slate-400">Description</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {selectedProperty.description}
                      </p>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-cyan-300" />
                        <p className="text-sm font-semibold text-white">
                          Owner
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                          {selectedProperty.ownerAvatar ? (
                            <img
                              src={normalizeImageUrl(
                                selectedProperty.ownerAvatar,
                              )}
                              alt={selectedProperty.ownerName}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.src = brandPlaceholder;
                              }}
                            />
                          ) : (
                            <FaUser />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {selectedProperty.ownerName}
                          </p>
                          <p className="text-sm text-slate-400">
                            {selectedProperty.ownerEmail ||
                              "No owner email provided"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                          <p className="text-slate-400">Phone</p>
                          <p className="mt-1 font-medium">
                            {selectedProperty.ownerPhone || "No phone listed"}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                          <p className="text-slate-400">Posted</p>
                          <p className="mt-1 font-medium">
                            {formatRelativeTime(selectedProperty.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handlePropertyAction("review")}
                        disabled={propertyActionLoading}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
                      >
                        {propertyActionLoading ? (
                          <FaSpinner className="animate-spin" />
                        ) : null}
                        Review listing
                      </button>
                      <button
                        onClick={() => handlePropertyAction("delete")}
                        disabled={propertyActionLoading}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
                      >
                        {propertyActionLoading ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTrash />
                        )}
                        Delete listing
                      </button>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-400">
                      {messageStatus ||
                        "Review or remove the listing directly from the admin queue."}
                    </div>
                  </>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/70 p-6 text-sm text-slate-400">
                    Select a property to review details and actions.
                  </div>
                )}
              </section>
            </div>
          ) : activeTab === "reports" ? (
            <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-300">
                      Moderation
                    </p>
                    <h3 className="text-lg font-semibold text-white">
                      Reports inbox
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
                    <FaMagnifyingGlass />
                    <input
                      value={reportSearch}
                      onChange={(event) => setReportSearch(event.target.value)}
                      placeholder="Search reports"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                {reportsLoading ? (
                  <div className="mt-5 flex items-center justify-center rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/70 p-8 text-slate-400">
                    <FaSpinner className="mr-2 animate-spin" />
                    Loading reports...
                  </div>
                ) : filteredReports.length ? (
                  <div className="mt-5 space-y-3">
                    {filteredReports.map((report) => (
                      <button
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className={`w-full rounded-[1.25rem] border px-3 py-3 text-left transition ${selectedReport?.id === report.id ? "border-amber-400/40 bg-amber-500/10" : "border-white/10 bg-slate-900/70 hover:bg-slate-800/80"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">
                              {report.reason}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              {report.details}
                            </p>
                          </div>
                          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300">
                            {report.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
                          <span>
                            {report.propertyTitle
                              ? `Property: ${report.propertyTitle}`
                              : `Property #${report.propertyId || "unknown"}`}
                          </span>
                          <span>{formatRelativeTime(report.createdAt)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/70 p-6 text-sm text-slate-400">
                    No reports match this search yet.
                  </div>
                )}
              </section>

              <section className="space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                {selectedReport ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-amber-300">
                          Selected report
                        </p>
                        <h3 className="text-lg font-semibold text-white">
                          {selectedReport.reason}
                        </h3>
                      </div>
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-300">
                        {selectedReport.status}
                      </span>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                      <p className="text-sm text-slate-400">Report details</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {selectedReport.details}
                      </p>
                      <p className="mt-4 text-sm text-slate-400">
                        Related property
                      </p>
                      <p className="mt-1 font-medium text-white">
                        {selectedReport.propertyTitle
                          ? selectedReport.propertyTitle
                          : `Property #${selectedReport.propertyId || "unknown"}`}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleReportAction("Reviewed")}
                        className="rounded-2xl bg-amber-500/15 px-3 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20"
                      >
                        Mark reviewed
                      </button>
                      <button
                        onClick={() => handleReportAction("Closed")}
                        className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                      >
                        Close report
                      </button>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-400">
                      {messageStatus ||
                        "Use the actions above to move the report through your moderation flow."}
                    </div>
                  </>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/70 p-6 text-sm text-slate-400">
                    Select a report to inspect the issue and available actions.
                  </div>
                )}
              </section>
            </div>
          ) : activeTab === "support" ? (
            <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-rose-300">
                      Support
                    </p>
                    <h3 className="text-lg font-semibold text-white">
                      User support inbox
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
                    <FaMagnifyingGlass />
                    <input
                      value={supportSearch}
                      onChange={(event) => setSupportSearch(event.target.value)}
                      placeholder="Search support requests"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                {supportLoading ? (
                  <div className="mt-5 flex items-center justify-center rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/70 p-8 text-slate-400">
                    <FaSpinner className="mr-2 animate-spin" />
                    Loading support messages...
                  </div>
                ) : filteredSupportMessages.length ? (
                  <div className="mt-5 space-y-3">
                    {filteredSupportMessages.map((message) => (
                      <button
                        key={message.id}
                        onClick={() => setSelectedSupport(message)}
                        className={`w-full rounded-[1.25rem] border px-3 py-3 text-left transition ${selectedSupport?.id === message.id ? "border-rose-400/40 bg-rose-500/10" : "border-white/10 bg-slate-900/70 hover:bg-slate-800/80"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">
                              {message.subject}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              {message.message}
                            </p>
                          </div>
                          <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs text-rose-300">
                            {message.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
                          <span>{message.senderName || "Unknown sender"}</span>
                          <span>{formatRelativeTime(message.createdAt)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/70 p-6 text-sm text-slate-400">
                    No support messages match this search yet.
                  </div>
                )}
              </section>

              <section className="space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                {selectedSupport ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-rose-300">
                          Selected request
                        </p>
                        <h3 className="text-lg font-semibold text-white">
                          {selectedSupport.subject}
                        </h3>
                      </div>
                      <span className="rounded-full bg-rose-500/10 px-3 py-1 text-sm text-rose-300">
                        {selectedSupport.status}
                      </span>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                      <p className="text-sm text-slate-400">Message</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {selectedSupport.message}
                      </p>
                      <p className="mt-4 text-sm text-slate-400">Sender</p>
                      <div className="mt-1">
                        <p className="font-medium text-white">
                          {selectedSupport.senderName || "Unknown sender"}
                        </p>
                        {selectedSupport.senderEmail ? (
                          <p className="mt-1 text-sm text-slate-400">
                            {selectedSupport.senderEmail}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button className="rounded-2xl bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20">
                        Reply later
                      </button>
                      <button className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20">
                        Mark handled
                      </button>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-400">
                      Support requests are ready for your follow-up workflow.
                    </div>
                  </>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/70 p-6 text-sm text-slate-400">
                    Select a support request to review the details.
                  </div>
                )}
              </section>
            </div>
          ) : activeTab === "profile" ? (
            <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-300">
                      Administrator
                    </p>
                    <h3 className="text-lg font-semibold text-white">
                      Profile overview
                    </h3>
                  </div>
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
                    {adminProfile?.role || "ADMIN"}
                  </span>
                </div>

                {profileLoading ? (
                  <div className="mt-5 flex items-center justify-center rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/70 p-8 text-slate-400">
                    <FaSpinner className="mr-2 animate-spin" />
                    Loading profile...
                  </div>
                ) : adminProfile ? (
                  <div className="mt-5 space-y-4">
                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-lg font-semibold text-white">
                          {adminProfile.name?.charAt(0) || "A"}
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {adminProfile.name}
                          </p>
                          <p className="text-sm text-slate-400">
                            {adminProfile.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                        <p className="text-sm text-slate-400">Phone</p>
                        <p className="mt-1 font-medium text-white">
                          {adminProfile.phone}
                        </p>
                      </div>
                      <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                        <p className="text-sm text-slate-400">Location</p>
                        <p className="mt-1 font-medium text-white">
                          {adminProfile.location}
                        </p>
                      </div>
                      <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                        <p className="text-sm text-slate-400">Member since</p>
                        <p className="mt-1 font-medium text-white">
                          {adminProfile.createdAt
                            ? formatRelativeTime(adminProfile.createdAt)
                            : "Recently added"}
                        </p>
                      </div>
                      <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                        <p className="text-sm text-slate-400">Last updated</p>
                        <p className="mt-1 font-medium text-white">
                          {adminProfile.lastSeen
                            ? formatRelativeTime(adminProfile.lastSeen)
                            : "Recently updated"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4">
                      <p className="text-sm text-slate-400">Bio</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {adminProfile.bio}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.25rem] border border-dashed border-white/10 bg-slate-900/70 p-6 text-sm text-slate-400">
                    No profile details were found for the current admin account.
                  </div>
                )}
              </section>

              <section className="space-y-4 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
                <div>
                  <p className="text-sm font-semibold text-slate-300">
                    Quick access
                  </p>
                  <h3 className="text-lg font-semibold text-white">
                    Admin tools
                  </h3>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      title: "Review account",
                      description:
                        "Inspect personal details and current permissions.",
                    },
                    {
                      title: "Support workflow",
                      description:
                        "Jump back into the support inbox for follow-up.",
                    },
                    {
                      title: "Moderation center",
                      description:
                        "Open reports and listing reviews from one place.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[1.25rem] border border-white/10 bg-slate-900/70 p-4"
                    >
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-400">
              This workspace is ready for the next admin section.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
