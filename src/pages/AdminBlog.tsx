import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Save, X } from "lucide-react";
import { getStoredPosts, savePosts, BlogPost, BlogContentBlock } from "../services/blogStore";
import { servicesData } from "../data/servicesData";

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    setPosts(getStoredPosts());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    let updated: BlogPost[];
    if (posts.some((p) => p.id === editingPost.id)) {
      updated = posts.map((p) => (p.id === editingPost.id ? editingPost : p));
    } else {
      updated = [editingPost, ...posts];
    }

    setPosts(updated);
    savePosts(updated);
    setEditingPost(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    const updated = posts.filter((p) => p.id !== id);
    setPosts(updated);
    savePosts(updated);
  };

  const startNewPost = () => {
    setEditingPost({
      id: Date.now().toString(),
      slug: "",
      title: "",
      excerpt: "",
      serviceSlug: servicesData[0]?.slug || "",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      readTime: "5 min read",
      author: "RaahX Team",
      content: [{ type: "paragraph", text: "" }]
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-body">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-secondary">Blog Manager (Admin)</h1>
        <button
          onClick={startNewPost}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-primary/90 transition"
        >
          <Plus size={18} /> Create Post
        </button>
      </div>

      {editingPost && (
        <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-gray-200 mb-12 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold text-secondary">
              {posts.some((p) => p.id === editingPost.id) ? "Edit Post" : "New Post"}
            </h2>
            <button type="button" onClick={() => setEditingPost(null)} className="text-gray-400 hover:text-secondary">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-secondary mb-2">Title</label>
              <input
                type="text"
                required
                value={editingPost.title}
                onChange={(e) =>
                  setEditingPost({
                    ...editingPost,
                    title: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
                  })
                }
                className="w-full p-3 border rounded-xl outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-secondary mb-2">Slug</label>
              <input
                type="text"
                required
                value={editingPost.slug}
                onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                className="w-full p-3 border rounded-xl outline-none focus:border-primary bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-secondary mb-2">Category Service</label>
              <select
                value={editingPost.serviceSlug}
                onChange={(e) => setEditingPost({ ...editingPost, serviceSlug: e.target.value })}
                className="w-full p-3 border rounded-xl outline-none focus:border-primary"
              >
                {servicesData.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-secondary mb-2">Author</label>
              <input
                type="text"
                value={editingPost.author}
                onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                className="w-full p-3 border rounded-xl outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-secondary mb-2">Excerpt</label>
            <textarea
              rows={2}
              value={editingPost.excerpt}
              onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
              className="w-full p-3 border rounded-xl outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-secondary mb-2">Content Blocks</label>
            {editingPost.content.map((block, idx) => (
              <div key={idx} className="flex items-start gap-3 mb-3">
                <select
                  value={block.type}
                  onChange={(e) => {
                    const content = [...editingPost.content];
                    content[idx].type = e.target.value as any;
                    setEditingPost({ ...editingPost, content });
                  }}
                  className="p-3 border rounded-xl text-sm"
                >
                  <option value="paragraph">Paragraph</option>
                  <option value="heading">Heading</option>
                  <option value="quote">Quote</option>
                </select>
                <textarea
                  rows={2}
                  value={block.text || ""}
                  onChange={(e) => {
                    const content = [...editingPost.content];
                    content[idx].text = e.target.value;
                    setEditingPost({ ...editingPost, content });
                  }}
                  className="flex-1 p-3 border rounded-xl text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    const content = editingPost.content.filter((_, i) => i !== idx);
                    setEditingPost({ ...editingPost, content });
                  }}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setEditingPost({
                  ...editingPost,
                  content: [...editingPost.content, { type: "paragraph", text: "" }]
                })
              }
              className="text-xs font-semibold text-primary mt-2"
            >
              + Add Content Block
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setEditingPost(null)}
              className="px-5 py-2.5 rounded-xl border font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold"
            >
              <Save size={16} /> Save Article
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
              <th className="p-4 pl-6">Article</th>
              <th className="p-4">Category</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50">
                <td className="p-4 pl-6">
                  <div className="font-bold text-secondary">{p.title}</div>
                  <div className="text-xs text-gray-400">/{p.slug}</div>
                </td>
                <td className="p-4 text-sm">{p.serviceSlug}</td>
                <td className="p-4 text-sm text-gray-500">{p.date}</td>
                <td className="p-4 text-right pr-6 space-x-2">
                  <button
                    onClick={() => setEditingPost(p)}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg inline-block"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg inline-block"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}