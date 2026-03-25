import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./LearnPanel.css";

const STATUS_META = {
  pending: { label: "Pending", tone: "muted" },
  in_progress: { label: "In Progress", tone: "active" },
  completed: { label: "Completed", tone: "done" },
};

function fmtDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getLearnFingerprint() {
  const key = "learn_fingerprint";
  let fingerprint = localStorage.getItem(key);
  if (!fingerprint) {
    fingerprint = [
      "learn",
      Date.now().toString(36),
      Math.random().toString(36).slice(2, 10),
    ].join("_");
    localStorage.setItem(key, fingerprint);
  }
  return fingerprint;
}

function buildTopicTree(topics) {
  const map = new Map();
  const roots = [];

  topics.forEach((topic) => {
    map.set(topic.id, { ...topic, children: [] });
  });

  map.forEach((topic) => {
    if (topic.parent_id && map.has(topic.parent_id)) {
      map.get(topic.parent_id).children.push(topic);
    } else {
      roots.push(topic);
    }
  });

  const sortNodes = (nodes) => {
    nodes.sort((a, b) => {
      if ((b.priority || 0) !== (a.priority || 0)) {
        return (b.priority || 0) - (a.priority || 0);
      }
      return a.id - b.id;
    });
    nodes.forEach((node) => sortNodes(node.children));
  };

  sortNodes(roots);
  return roots;
}

function flattenTopics(nodes, depth = 0, acc = []) {
  nodes.forEach((node) => {
    acc.push({ ...node, depth });
    flattenTopics(node.children || [], depth + 1, acc);
  });
  return acc;
}

function progressForTrack(topics, progressMap) {
  if (!topics.length) return 0;
  const completed = topics.filter(
    (topic) => progressMap[String(topic.id)] === "completed",
  ).length;
  return Math.round((completed / topics.length) * 100);
}

function countStatus(topics, progressMap, status) {
  return topics.filter((topic) => progressMap[String(topic.id)] === status).length;
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M11 11L14 14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LoginModal({ apiBase, onSuccess, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Enter username and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/blog-admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.token) {
        throw new Error(data.detail || "Invalid credentials");
      }
      onSuccess(data.token);
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="learn-modal-shell"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="learn-login-modal">
        <div className="learn-editor-head">
          <div>
            <span className="learn-editor-kicker">Secret Admin Area</span>
            <h3>Author Login</h3>
          </div>
          <button className="learn-ghost-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="learn-editor-grid">
          <label className="learn-field">
            <span>Username</span>
            <input
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && login()}
            />
          </label>
          <label className="learn-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && login()}
            />
          </label>
        </div>
        {error ? <p className="learn-editor-error">{error}</p> : null}
        <div className="learn-editor-actions">
          <button className="learn-primary-btn" disabled={loading} onClick={login}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentNode({ comment, onReply, depth = 0 }) {
  return (
    <div className="learn-comment-node" style={{ "--comment-depth": depth }}>
      <div className="learn-comment-card">
        <div className="learn-comment-head">
          <div>
            <strong>{comment.name}</strong>
            {comment.is_author ? <span className="learn-author-badge">Author</span> : null}
          </div>
          <span>{fmtDate(comment.created_at)}</span>
        </div>
        <p>{comment.body}</p>
        <button className="learn-inline-link" onClick={() => onReply(comment.id)}>
          Reply
        </button>
      </div>
      {comment.children?.length ? (
        <div className="learn-comment-children">
          {comment.children.map((child) => (
            <CommentNode
              key={child.id}
              comment={child}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AuthorBadge({ selectedTrack }) {
  const authorName = selectedTrack?.author_name || "Course Author";
  return (
    <div className="learn-author-line">
      <span className="learn-section-kicker">Written By</span>
      <strong>{authorName}</strong>
    </div>
  );
}

export default function LearnPanel({ apiBase }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [progressByTrack, setProgressByTrack] = useState({});
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [showInteraction, setShowInteraction] = useState(false);
  const [viewerName, setViewerName] = useState(
    () => localStorage.getItem("learn_viewer_name") || "",
  );
  const [adminToken, setAdminToken] = useState(
    () =>
      sessionStorage.getItem("learn_token") ||
      sessionStorage.getItem("blog_token") ||
      "",
  );
  const [loginOpen, setLoginOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("track");
  const [editingTrackId, setEditingTrackId] = useState(null);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [savingEditor, setSavingEditor] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [trackForm, setTrackForm] = useState({
    title: "",
    description: "",
    priority: 0,
    color: "",
    tags: "",
    kind: "course",
    is_news: false,
  });
  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    priority: 0,
    parent_id: "",
    tags: "",
    is_news: false,
    links: [{ label: "", url: "" }],
  });
  const [commentDraft, setCommentDraft] = useState("");

  const clickTimes = useRef([]);
  const fingerprint = useMemo(() => getLearnFingerprint(), []);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/learning/tracks`);
      const data = await response.json();
      const normalized = Array.isArray(data) ? data : [];
      setTracks(normalized);
      setSelectedTrackId((current) => {
        if (current && normalized.some((track) => track.id === current)) {
          return current;
        }
        return normalized[0]?.id || null;
      });
    } catch {
      setTracks([]);
      setSelectedTrackId(null);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const visibleTracks = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tracks.filter((track) => {
      if (!needle) return true;
      const haystack = [
        track.title,
        track.description,
        ...(track.tags || []),
        ...(track.topics || []).map((topic) => topic.title),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [search, tracks]);

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) || null,
    [selectedTrackId, tracks],
  );

  const topicTree = useMemo(
    () => buildTopicTree(selectedTrack?.topics || []),
    [selectedTrack],
  );

  const orderedTopics = useMemo(() => flattenTopics(topicTree), [topicTree]);

  useEffect(() => {
    if (!orderedTopics.length) {
      setSelectedTopicId(null);
      return;
    }
    setSelectedTopicId((current) => {
      if (current && orderedTopics.some((topic) => topic.id === current)) {
        return current;
      }
      return orderedTopics[0].id;
    });
  }, [orderedTopics]);

  useEffect(() => {
    setShowInteraction(false);
    setReplyTarget(null);
    setCommentDraft("");
  }, [selectedTrackId]);

  const selectedTopic = useMemo(
    () => orderedTopics.find((topic) => topic.id === selectedTopicId) || null,
    [orderedTopics, selectedTopicId],
  );

  const selectedProgress = selectedTopic
    ? progressMap[String(selectedTopic.id)] || "pending"
    : "pending";

  const trackProgress = selectedTrack
    ? progressForTrack(
        selectedTrack.topics || [],
        progressByTrack[selectedTrack.id] || progressMap,
      )
    : 0;

  const refreshProgress = useCallback(async () => {
    if (!selectedTrackId) return;
    try {
      const response = await fetch(
        `${apiBase}/learning/tracks/${selectedTrackId}/progress?fingerprint=${encodeURIComponent(fingerprint)}`,
      );
      const data = await response.json();
      setProgressMap(data || {});
      setProgressByTrack((current) => ({
        ...current,
        [selectedTrackId]: data || {},
      }));
    } catch {
      setProgressMap({});
    }
  }, [apiBase, fingerprint, selectedTrackId]);

  useEffect(() => {
    if (!tracks.length) return;
    let cancelled = false;

    const loadProgressMaps = async () => {
      const entries = await Promise.all(
        tracks.map(async (track) => {
          try {
            const response = await fetch(
              `${apiBase}/learning/tracks/${track.id}/progress?fingerprint=${encodeURIComponent(fingerprint)}`,
            );
            const data = await response.json();
            return [track.id, data || {}];
          } catch {
            return [track.id, {}];
          }
        }),
      );

      if (cancelled) return;
      setProgressByTrack(Object.fromEntries(entries));
    };

    loadProgressMaps();
    return () => {
      cancelled = true;
    };
  }, [apiBase, fingerprint, tracks]);

  const refreshComments = useCallback(async () => {
    if (!selectedTrackId) return;
    setCommentsLoading(true);
    try {
      const response = await fetch(
        `${apiBase}/learning/tracks/${selectedTrackId}/comments`,
      );
      const data = await response.json();
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [apiBase, selectedTrackId]);

  useEffect(() => {
    refreshProgress();
    refreshComments();
  }, [refreshComments, refreshProgress]);

  const handleSecretClick = useCallback(() => {
    const now = Date.now();
    clickTimes.current.push(now);
    clickTimes.current = clickTimes.current.filter((time) => now - time < 9000);
    if (clickTimes.current.length < 9) return;
    const recent = clickTimes.current.slice(-9);
    const allFast = recent.every(
      (time, index) => index === 0 || time - recent[index - 1] <= 1000,
    );
    if (allFast) {
      clickTimes.current = [];
      setLoginOpen(true);
    }
  }, []);

  const openTrackEditor = (track = null) => {
    setEditorError("");
    setEditorMode("track");
    setEditingTrackId(track?.id || null);
    setTrackForm({
      title: track?.title || "",
      description: track?.description || "",
      priority: track?.priority || 0,
      color: track?.color || "",
      tags: (track?.tags || []).join(", "),
      kind: track?.kind || "course",
      is_news: !!track?.is_news,
    });
    setEditorOpen(true);
  };

  const openTopicEditor = (topic = null) => {
    setEditorError("");
    setEditorMode("topic");
    setEditingTopicId(topic?.id || null);
    setTopicForm({
      title: topic?.title || "",
      description: topic?.description || "",
      priority: topic?.priority || 0,
      parent_id: topic?.parent_id || "",
      tags: (topic?.tags || []).join(", "),
      is_news: !!topic?.is_news,
      links:
        topic?.links?.length > 0
          ? topic.links.map((link) => ({
              label: link.label || "",
              url: link.url || "",
            }))
          : [{ label: "", url: "" }],
    });
    setEditorOpen(true);
  };

  const saveTrack = async () => {
    if (!trackForm.title.trim()) {
      setEditorError("Course title is required.");
      return;
    }
    setSavingEditor(true);
    setEditorError("");
    try {
      const payload = {
        title: trackForm.title.trim(),
        description: trackForm.description.trim(),
        priority: Number(trackForm.priority) || 0,
        color: trackForm.color.trim(),
        kind: trackForm.kind || "course",
        tags: trackForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        is_news: !!trackForm.is_news,
      };
      const endpoint = editingTrackId
        ? `${apiBase}/learning/tracks/${editingTrackId}`
        : `${apiBase}/learning/tracks`;
      const method = editingTrackId ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || "Failed to save course");
      }
      await fetchTracks();
      setSelectedTrackId(data.id || editingTrackId || selectedTrackId);
      setEditorOpen(false);
    } catch (error) {
      setEditorError(error.message || "Failed to save course");
    } finally {
      setSavingEditor(false);
    }
  };

  const saveTopic = async () => {
    if (!selectedTrack) {
      setEditorError("Choose a course first.");
      return;
    }
    if (!topicForm.title.trim()) {
      setEditorError("Topic title is required.");
      return;
    }

    const cleanedLinks = topicForm.links
      .map((link) => ({
        label: (link.label || "").trim(),
        url: (link.url || "").trim(),
      }))
      .filter((link) => link.label || link.url);

    setSavingEditor(true);
    setEditorError("");
    try {
      const payload = {
        track_id: selectedTrack.id,
        parent_id: topicForm.parent_id ? Number(topicForm.parent_id) : null,
        title: topicForm.title.trim(),
        description: topicForm.description.trim(),
        priority: Number(topicForm.priority) || 0,
        tags: topicForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        is_news: !!topicForm.is_news,
        links: cleanedLinks,
      };
      const endpoint = editingTopicId
        ? `${apiBase}/learning/topics/${editingTopicId}`
        : `${apiBase}/learning/topics`;
      const method = editingTopicId ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || "Failed to save topic");
      }
      await fetchTracks();
      setSelectedTopicId(data.id || editingTopicId || selectedTopicId);
      setEditorOpen(false);
    } catch (error) {
      setEditorError(error.message || "Failed to save topic");
    } finally {
      setSavingEditor(false);
    }
  };

  const deleteTrack = async (trackId) => {
    if (!confirm("Delete this course and all its topics?")) return;
    try {
      await fetch(`${apiBase}/learning/tracks/${trackId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      await fetchTracks();
    } catch {}
  };

  const deleteTopic = async (topicId) => {
    if (!confirm("Delete this topic?")) return;
    try {
      await fetch(`${apiBase}/learning/topics/${topicId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      await fetchTracks();
    } catch {}
  };

  const setTopicStatus = async (topicId, status) => {
    if (!selectedTrack) return;
    setProgressMap((current) => ({ ...current, [String(topicId)]: status }));
    setProgressByTrack((current) => ({
      ...current,
      [selectedTrack.id]: {
        ...(current[selectedTrack.id] || {}),
        [String(topicId)]: status,
      },
    }));
    try {
      await fetch(`${apiBase}/learning/tracks/${selectedTrack.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic_id: topicId,
          fingerprint,
          status,
        }),
      });
      refreshProgress();
    } catch {
      refreshProgress();
    }
  };

  const submitComment = async () => {
    if (!selectedTrack || !commentDraft.trim() || postingComment) return;
    if (!adminToken && !viewerName.trim()) return;
    setPostingComment(true);
    try {
      const response = await fetch(
        `${apiBase}/learning/tracks/${selectedTrack.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
          body: JSON.stringify({
            parent_id: replyTarget,
            name: adminToken ? "Course Author" : viewerName.trim(),
            body: commentDraft.trim(),
            fingerprint,
          }),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || "Failed to post message");
      }
      if (viewerName.trim()) {
        localStorage.setItem("learn_viewer_name", viewerName.trim());
      }
      setCommentDraft("");
      setReplyTarget(null);
      refreshComments();
    } catch (error) {
      alert(error.message || "Failed to post message");
    } finally {
      setPostingComment(false);
    }
  };

  const commentTree = useMemo(() => {
    const map = new Map();
    const roots = [];
    comments.forEach((comment) => {
      map.set(comment.id, { ...comment, children: [] });
    });
    map.forEach((comment) => {
      if (comment.parent_id && map.has(comment.parent_id)) {
        map.get(comment.parent_id).children.push(comment);
      } else {
        roots.push(comment);
      }
    });
    return roots;
  }, [comments]);

  return (
    <div className="learn-panel" onClick={handleSecretClick}>
      {loginOpen && (
        <LoginModal
          apiBase={apiBase}
          onSuccess={(token) => {
            setAdminToken(token);
            sessionStorage.setItem("learn_token", token);
            sessionStorage.setItem("blog_token", token);
            setLoginOpen(false);
          }}
          onClose={() => setLoginOpen(false)}
        />
      )}

      {editorOpen && (
        <div
          className="learn-modal-shell"
          onClick={(event) =>
            event.target === event.currentTarget && setEditorOpen(false)
          }
        >
          <div className="learn-editor">
            <div className="learn-editor-head">
              <div>
                <span className="learn-editor-kicker">
                  {editorMode === "track" ? "Course Setup" : "Topic Setup"}
                </span>
                <h3>
                  {editorMode === "track"
                    ? editingTrackId
                      ? "Edit Course"
                      : "Add Course"
                    : editingTopicId
                      ? "Edit Topic"
                      : "Add Topic"}
                </h3>
              </div>
              <button
                className="learn-ghost-btn"
                onClick={() => setEditorOpen(false)}
              >
                Close
              </button>
            </div>

            {editorMode === "track" ? (
              <div className="learn-editor-grid">
                <label className="learn-field">
                  <span>Course title</span>
                  <input
                    value={trackForm.title}
                    onChange={(event) =>
                      setTrackForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="JavaScript Foundations"
                  />
                </label>
                <label className="learn-field">
                  <span>Priority</span>
                  <input
                    type="number"
                    value={trackForm.priority}
                    onChange={(event) =>
                      setTrackForm((current) => ({
                        ...current,
                        priority: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="learn-field learn-field-wide">
                  <span>Description</span>
                  <textarea
                    rows={5}
                    value={trackForm.description}
                    onChange={(event) =>
                      setTrackForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="What the learner will understand after this course"
                  />
                </label>
                <label className="learn-field">
                  <span>Accent color</span>
                  <input
                    value={trackForm.color}
                    onChange={(event) =>
                      setTrackForm((current) => ({
                        ...current,
                        color: event.target.value,
                      }))
                    }
                    placeholder="#43c59e"
                  />
                </label>
                <label className="learn-field">
                  <span>Type</span>
                  <select
                    value={trackForm.kind}
                    onChange={(event) =>
                      setTrackForm((current) => ({
                        ...current,
                        kind: event.target.value,
                      }))
                    }
                  >
                    <option value="course">Course</option>
                    <option value="tree">Learning Tree</option>
                  </select>
                </label>
                <label className="learn-field learn-field-wide">
                  <span>Tags</span>
                  <input
                    value={trackForm.tags}
                    onChange={(event) =>
                      setTrackForm((current) => ({
                        ...current,
                        tags: event.target.value,
                      }))
                    }
                    placeholder="javascript, frontend, interviews"
                  />
                </label>
                <label className="learn-toggle">
                  <input
                    type="checkbox"
                    checked={trackForm.is_news}
                    onChange={(event) =>
                      setTrackForm((current) => ({
                        ...current,
                        is_news: event.target.checked,
                      }))
                    }
                  />
                  <span>Mark this course as news/highlighted</span>
                </label>
              </div>
            ) : (
              <div className="learn-editor-grid">
                <label className="learn-field">
                  <span>Topic title</span>
                  <input
                    value={topicForm.title}
                    onChange={(event) =>
                      setTopicForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Closures and scope"
                  />
                </label>
                <label className="learn-field">
                  <span>Priority</span>
                  <input
                    type="number"
                    value={topicForm.priority}
                    onChange={(event) =>
                      setTopicForm((current) => ({
                        ...current,
                        priority: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="learn-field">
                  <span>Parent topic</span>
                  <select
                    value={topicForm.parent_id}
                    onChange={(event) =>
                      setTopicForm((current) => ({
                        ...current,
                        parent_id: event.target.value,
                      }))
                    }
                  >
                    <option value="">Top level topic</option>
                    {(selectedTrack?.topics || [])
                      .filter((topic) => topic.id !== editingTopicId)
                      .map((topic) => (
                        <option key={topic.id} value={topic.id}>
                          {topic.title}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="learn-field learn-field-wide">
                  <span>Description</span>
                  <textarea
                    rows={6}
                    value={topicForm.description}
                    onChange={(event) =>
                      setTopicForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Explain the topic clearly and keep it learner-friendly"
                  />
                </label>
                <label className="learn-field learn-field-wide">
                  <span>Tags</span>
                  <input
                    value={topicForm.tags}
                    onChange={(event) =>
                      setTopicForm((current) => ({
                        ...current,
                        tags: event.target.value,
                      }))
                    }
                    placeholder="basics, important, practice"
                  />
                </label>
                <label className="learn-toggle">
                  <input
                    type="checkbox"
                    checked={topicForm.is_news}
                    onChange={(event) =>
                      setTopicForm((current) => ({
                        ...current,
                        is_news: event.target.checked,
                      }))
                    }
                  />
                  <span>Tag this topic as news/highlight</span>
                </label>

                <div className="learn-links-editor">
                  <div className="learn-links-head">
                    <span>Learning links</span>
                    <button
                      className="learn-ghost-btn"
                      onClick={() =>
                        setTopicForm((current) => ({
                          ...current,
                          links: [...current.links, { label: "", url: "" }],
                        }))
                      }
                    >
                      Add Link
                    </button>
                  </div>
                  {topicForm.links.map((link, index) => (
                    <div key={index} className="learn-link-row">
                      <input
                        value={link.label}
                        onChange={(event) =>
                          setTopicForm((current) => ({
                            ...current,
                            links: current.links.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, label: event.target.value }
                                : item,
                            ),
                          }))
                        }
                        placeholder="Link label"
                      />
                      <input
                        value={link.url}
                        onChange={(event) =>
                          setTopicForm((current) => ({
                            ...current,
                            links: current.links.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, url: event.target.value }
                                : item,
                            ),
                          }))
                        }
                        placeholder="https://..."
                      />
                      <button
                        className="learn-danger-btn"
                        onClick={() =>
                          setTopicForm((current) => ({
                            ...current,
                            links:
                              current.links.length === 1
                                ? [{ label: "", url: "" }]
                                : current.links.filter(
                                    (_, itemIndex) => itemIndex !== index,
                                  ),
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editorError && <p className="learn-editor-error">{editorError}</p>}

            <div className="learn-editor-actions">
              <button
                className="learn-primary-btn"
                onClick={editorMode === "track" ? saveTrack : saveTopic}
                disabled={savingEditor}
              >
                {savingEditor ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="learn-header">
        <div>
          <span className="learn-kicker">Learn With Me</span>
          <h2>Courses, branches, and clear next steps.</h2>
          <p>
            Explore each course like a guided learning tree, open any topic,
            and track your progress from pending to completed.
          </p>
        </div>
        <div className="learn-header-actions">
          <div className="learn-search">
            <SearchIcon />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses, topics, or tags"
            />
          </div>
          {adminToken && (
            <button className="learn-primary-btn" onClick={() => openTrackEditor()}>
              Add Course
            </button>
          )}
        </div>
      </div>

      <div className={`learn-body ${selectedTrack ? "detail-open" : ""}`}>
        {!selectedTrack ? (
          <section className="learn-catalog learn-catalog-full">
          <div className="learn-section-head">
            <div>
              <span className="learn-section-kicker">Course Library</span>
              <h3>Choose what you want to learn next</h3>
            </div>
            {adminToken && (
              <div className="learn-inline-actions">
                <button className="learn-ghost-btn" onClick={() => openTrackEditor()}>
                  Add Course
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="learn-course-grid">
              {[1, 2, 3].map((item) => (
                <div key={item} className="learn-course-card learn-skeleton-card" />
              ))}
            </div>
          ) : visibleTracks.length === 0 ? (
            <div className="learn-empty-state">
              <strong>No courses matched your search.</strong>
              <span>Try another keyword or add the first course from the admin view.</span>
            </div>
          ) : (
            <div className="learn-course-grid">
              {visibleTracks.map((track) => {
                const courseProgress = progressForTrack(
                  track.topics || [],
                  progressByTrack[track.id] || {},
                );
                return (
                  <button
                    key={track.id}
                    className={`learn-course-card ${
                      track.id === selectedTrackId ? "active" : ""
                    }`}
                    style={{
                      "--learn-accent": track.color || "var(--violet)",
                    }}
                    onClick={() => setSelectedTrackId(track.id)}
                  >
                    <div className="learn-course-card-top">
                      <span className="learn-course-kind">
                        {track.kind === "tree" ? "Learning Tree" : "Course"}
                      </span>
                      {track.is_news ? <span className="learn-news-pill">News</span> : null}
                    </div>
                    <h4>{track.title}</h4>
                    <p>{track.description || "Open the course to see the topic flow."}</p>
                    <div className="learn-tag-row">
                      {(track.tags || []).slice(0, 4).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <div className="learn-card-meta">
                      <strong>{track.topics?.length || 0} topics</strong>
                      <span>{courseProgress}% done</span>
                    </div>
                    <div className="learn-mini-progress">
                      <div style={{ width: `${courseProgress}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          </section>
        ) : (
          <section className="learn-detail learn-detail-full">
            <>
              <div className="learn-detail-topbar">
                <button className="learn-ghost-btn" onClick={() => setSelectedTrackId(null)}>
                  Back to Courses
                </button>
                {adminToken && (
                  <div className="learn-inline-actions">
                    <button
                      className="learn-ghost-btn"
                      onClick={() => openTrackEditor(selectedTrack)}
                    >
                      Edit Course
                    </button>
                    <button
                      className="learn-danger-btn"
                      onClick={() => deleteTrack(selectedTrack.id)}
                    >
                      Delete Course
                    </button>
                  </div>
                )}
              </div>
              <div
                className="learn-course-hero"
                style={{
                  "--learn-accent": selectedTrack.color || "var(--violet)",
                }}
              >
                <div className="learn-course-hero-copy">
                  <span className="learn-course-kind">
                    {selectedTrack.kind === "tree" ? "Learning Tree" : "Course"}
                  </span>
                  <h3>{selectedTrack.title}</h3>
                  <AuthorBadge selectedTrack={selectedTrack} />
                  <p>{selectedTrack.description}</p>
                  <div className="learn-tag-row">
                    {(selectedTrack.tags || []).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="learn-course-hero-side">
                  <div className="learn-course-stats">
                    <div className="learn-stat-card">
                      <span>Completed</span>
                      <strong>
                        {countStatus(selectedTrack.topics || [], progressMap, "completed")}
                      </strong>
                    </div>
                    <div className="learn-stat-card">
                      <span>In Progress</span>
                      <strong>
                        {countStatus(
                          selectedTrack.topics || [],
                          progressMap,
                          "in_progress",
                        )}
                      </strong>
                    </div>
                    <div className="learn-stat-card">
                      <span>Total Topics</span>
                      <strong>{selectedTrack.topics?.length || 0}</strong>
                    </div>
                  </div>
                  <div className="learn-hero-progress">
                    <div className="learn-hero-progress-copy">
                      <span className="learn-section-kicker">Your Progress</span>
                      <h4>{trackProgress}% course completion</h4>
                    </div>
                    <div className="learn-wide-progress">
                      <div style={{ width: `${trackProgress}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="learn-workspace">
                <aside className="learn-topics-pane">
                  <div className="learn-pane-head">
                    <div>
                      <span className="learn-section-kicker">Topic Order</span>
                      <h4>Follow the branch</h4>
                    </div>
                    {adminToken && (
                      <button
                        className="learn-primary-btn small"
                        onClick={() => openTopicEditor()}
                      >
                        Add Topic
                      </button>
                    )}
                  </div>
                  <div className="learn-topic-tree">
                    {orderedTopics.map((topic, index) => {
                      const status = progressMap[String(topic.id)] || "pending";
                      const meta = STATUS_META[status] || STATUS_META.pending;
                      return (
                        <button
                          key={topic.id}
                          className={`learn-topic-node ${
                            topic.id === selectedTopicId ? "active" : ""
                          }`}
                          style={{ "--depth": topic.depth }}
                          onClick={() => setSelectedTopicId(topic.id)}
                        >
                          <div className="learn-topic-node-index">{index + 1}</div>
                          <div className="learn-topic-node-copy">
                            <strong>{topic.title}</strong>
                            <span className={`learn-status-pill ${meta.tone}`}>
                              {meta.label}
                            </span>
                          </div>
                          {adminToken && (
                            <div className="learn-topic-node-actions">
                              <span
                                className="learn-inline-link"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openTopicEditor(topic);
                                }}
                              >
                                Edit
                              </span>
                              <span
                                className="learn-inline-link danger"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  deleteTopic(topic.id);
                                }}
                              >
                                Delete
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </aside>

                <div className="learn-topic-detail">
                  {selectedTopic ? (
                    <>
                      <div className="learn-topic-card">
                        <div className="learn-topic-card-head">
                          <div>
                            <span className="learn-section-kicker">Selected Topic</span>
                            <h4>{selectedTopic.title}</h4>
                          </div>
                          <span
                            className={`learn-status-pill ${
                              STATUS_META[selectedProgress]?.tone || "muted"
                            }`}
                          >
                            {STATUS_META[selectedProgress]?.label || "Pending"}
                          </span>
                        </div>

                        <p className="learn-topic-description">
                          {selectedTopic.description ||
                            "Add a description for this topic so learners can understand the why and what to study here."}
                        </p>

                        <div className="learn-topic-actions">
                          {Object.entries(STATUS_META).map(([status, meta]) => (
                            <button
                              key={status}
                              className={`learn-status-btn ${
                                selectedProgress === status ? "active" : ""
                              }`}
                              onClick={() => setTopicStatus(selectedTopic.id, status)}
                            >
                              {meta.label}
                            </button>
                          ))}
                        </div>

                        <div className="learn-topic-links">
                          <div className="learn-topic-links-head">
                            <span className="learn-section-kicker">Helpful Links</span>
                            <h5>Resources for this topic</h5>
                          </div>
                          {selectedTopic.links?.length ? (
                            <div className="learn-resource-list">
                              {selectedTopic.links.map((link, index) => (
                                <a
                                  key={`${link.url}-${index}`}
                                  href={link.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="learn-resource-card"
                                >
                                  <strong>{link.label || "Open Resource"}</strong>
                                  <span>{link.url}</span>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <p className="learn-muted-note">
                              No links added yet for this topic.
                            </p>
                          )}
                        </div>
                      </div>

                    </>
                  ) : (
                    <div className="learn-empty-detail">
                      <h3>No topic selected</h3>
                      <p>Add the first topic to this course to start shaping the tree.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="learn-interaction-section">
                <button
                  className={`learn-interaction-toggle ${
                    showInteraction ? "active" : ""
                  }`}
                  onClick={() => setShowInteraction((current) => !current)}
                >
                  <div>
                    <span className="learn-section-kicker">Course Interaction</span>
                    <h4>Open interaction area</h4>
                  </div>
                  <span>{showInteraction ? "Hide" : "Open"}</span>
                </button>

                {showInteraction && (
                  <div className="learn-discussion-card">
                    <div className="learn-pane-head">
                      <div>
                        <span className="learn-section-kicker">Interaction</span>
                        <h4>Chat with the course writer</h4>
                      </div>
                      {adminToken ? (
                        <span className="learn-author-badge">Author mode</span>
                      ) : null}
                    </div>

                    <div className="learn-comment-form">
                      {!adminToken && (
                        <input
                          value={viewerName}
                          onChange={(event) => setViewerName(event.target.value)}
                          placeholder="Your name is required for questions"
                          maxLength={40}
                        />
                      )}
                      {replyTarget ? (
                        <div className="learn-reply-banner">
                          <span>Replying to a discussion thread</span>
                          <button
                            className="learn-inline-link"
                            onClick={() => setReplyTarget(null)}
                          >
                            Cancel reply
                          </button>
                        </div>
                      ) : null}
                      <textarea
                        rows={4}
                        value={commentDraft}
                        onChange={(event) => setCommentDraft(event.target.value)}
                        placeholder="Ask a question, share progress, or reply to the writer..."
                        maxLength={700}
                      />
                      <div className="learn-comment-form-foot">
                        <span>
                          {adminToken
                            ? "Posting as the course author"
                            : "Your name + this browser fingerprint identify your thread"}
                        </span>
                        <button
                          className="learn-primary-btn"
                          disabled={
                            postingComment ||
                            !commentDraft.trim() ||
                            (!adminToken && !viewerName.trim())
                          }
                          onClick={submitComment}
                        >
                          {postingComment ? "Posting..." : "Post Message"}
                        </button>
                      </div>
                    </div>
                    {commentsLoading ? (
                      <p className="learn-muted-note">Loading discussion...</p>
                    ) : commentTree.length === 0 ? (
                      <p className="learn-muted-note">
                        No questions yet. Start the first conversation for this course.
                      </p>
                    ) : (
                      <div className="learn-comment-thread">
                        {commentTree.map((comment) => (
                          <CommentNode
                            key={comment.id}
                            comment={comment}
                            onReply={setReplyTarget}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          </section>
        )}
      </div>
    </div>
  );
}
