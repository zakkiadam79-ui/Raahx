import React, { useEffect, useState } from "react";
import { Edit3, Plus, Save, Trash2, X } from "lucide-react";
import {
  fetchServicesFromApi,
  getStoredServices,
  isServiceApiConfigured,
} from "../services/serviceStore";
import type { ServiceData } from "../data/servicesData";
import {
  blogApiErrorMessage,
  createBlogViaApi,
  deleteBlogViaApi,
  fetchBlogsFromApi,
  getStoredPosts,
  isBlogApiConfigured,
  normalizeBlogSlug,
  savePosts,
  BlogApiError,
  type BlogContentBlock,
  type BlogContentBlockType,
  type BlogPost,
  updateBlogViaApi,
} from "../services/blogStore";

const fieldClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary placeholder:text-gray-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClassName = "block text-sm font-semibold text-secondary";
const helpTextClassName = "mt-1.5 text-xs leading-relaxed text-gray-500";
const sectionClassName = "rounded-2xl border border-gray-200 bg-gray-50/70 p-5 md:p-6 space-y-5";

interface FormSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className={sectionClassName}>
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-primary">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function makeDefaultDate(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function blockEditorValue(block: BlogContentBlock): string {
  return block.type === "list" ? (block.items ?? []).join("\n") : block.text ?? "";
}

function blockHelpText(type: BlogContentBlockType): string {
  if (type === "heading") return "Displayed as a section heading in the article.";
  if (type === "quote") return "Displayed as emphasized article text using the existing detail layout.";
  if (type === "list") return "Enter one list item per line.";
  return "Displayed as normal article paragraph text.";
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>(() => getStoredPosts());
  const [services, setServices] = useState<ServiceData[]>(() => getStoredServices());
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);
  const [formError, setFormError] = useState("");
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fallbackPosts = getStoredPosts();
    const fallbackServices = getStoredServices();
    setPosts(fallbackPosts);
    setServices(fallbackServices);

    if (isServiceApiConfigured()) {
      fetchServicesFromApi()
        .then((remoteServices) => {
          if (!isMounted) return;
          if (remoteServices.length > 0 || fallbackServices.length === 0) {
            setServices(remoteServices);
          } else {
            setApiError("The Services API returned no records. Run the additive CMS migration before creating a blog.");
          }
        })
        .catch((error) => {
          if (isMounted) setApiError(blogApiErrorMessage(error));
        });
    }

    if (isBlogApiConfigured()) {
      fetchBlogsFromApi()
        .then((remotePosts) => {
          if (isMounted && (remotePosts.length > 0 || fallbackPosts.length === 0)) {
            setPosts(remotePosts);
          }
        })
        .catch((error) => {
          if (isMounted) setApiError(blogApiErrorMessage(error));
        });
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const updateEditingPost = (changes: Partial<BlogPost>) => {
    setEditingPost((current) => (current ? { ...current, ...changes } : current));
    setFormError("");
  };

  const startNewPost = () => {
    setEditingPost({
      id: `draft-${Date.now()}`,
      slug: "",
      title: "",
      excerpt: "",
      serviceSlug: services[0]?.slug || "",
      date: makeDefaultDate(),
      readTime: "5 min read",
      author: "RaahX Team",
      content: [{ type: "paragraph", text: "" }],
    });
    setSlugManuallyEdited(false);
    setImagePreviewFailed(false);
    setFormError("");
  };

  const startEdit = (post: BlogPost) => {
    setEditingPost({
      ...post,
      content: post.content.map((block) => ({
        ...block,
        items: block.items ? [...block.items] : undefined,
      })),
    });
    setSlugManuallyEdited(true);
    setImagePreviewFailed(false);
    setFormError("");
  };

  const updateContentBlock = (index: number, changes: Partial<BlogContentBlock>) => {
    if (!editingPost) return;
    const content = editingPost.content.map((block, blockIndex) => (
      blockIndex === index ? { ...block, ...changes } : block
    ));
    updateEditingPost({ content });
  };

  const changeContentBlockType = (index: number, type: BlogContentBlockType) => {
    if (!editingPost) return;
    const block = editingPost.content[index];
    const existingValue = blockEditorValue(block);
    const nextBlock: BlogContentBlock = type === "list"
      ? { type, items: existingValue ? existingValue.split("\n") : [] }
      : { type, text: existingValue };
    updateContentBlock(index, nextBlock);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    const title = editingPost.title.trim();
    const slug = normalizeBlogSlug(editingPost.slug || title);
    const excerpt = editingPost.excerpt.trim();
    const author = editingPost.author.trim();
    const date = editingPost.date.trim();
    const readTime = editingPost.readTime.trim();
    const image = typeof editingPost.image === "string" ? editingPost.image.trim() : "";
    const hasContent = editingPost.content.some((block) => Boolean(blockEditorValue(block).trim()));

    if (!title) {
      setFormError("Blog title is required.");
      return;
    }
    if (!slug) {
      setFormError("URL slug is required and must contain letters or numbers.");
      return;
    }
    if (!editingPost.serviceSlug) {
      setFormError("Category is required. Choose the service category for this blog.");
      return;
    }
    if (!author) {
      setFormError("Author is required.");
      return;
    }
    if (!date || Number.isNaN(Date.parse(date))) {
      setFormError("Publication date is required. Use a readable date such as Jul 22, 2026.");
      return;
    }
    if (!excerpt) {
      setFormError("Excerpt is required for the public blog card.");
      return;
    }
    if (!hasContent) {
      setFormError("Add at least one article content block.");
      return;
    }

    const duplicate = posts.find((post) =>
      post.id !== editingPost.id && (
        post.slug === slug || post.legacySlugs?.includes(slug)
      ),
    );
    if (duplicate) {
      setFormError(`This URL slug is already used by “${duplicate.title}”. Choose a unique slug.`);
      return;
    }

    const previousPost = posts.find((post) => post.id === editingPost.id);
    const previousSlugs = previousPost && previousPost.slug !== slug
      ? Array.from(new Set([...(previousPost.legacySlugs ?? []), previousPost.slug]))
      : previousPost?.legacySlugs;

    const postToSave: BlogPost = {
      ...editingPost,
      title,
      slug,
      excerpt,
      author,
      date,
      readTime: readTime || "5 min read",
      image: image || undefined,
      legacySlugs: previousSlugs,
    };

    const existingPost = posts.find((post) => post.id === editingPost.id);
    const updated = existingPost
      ? posts.map((post) => (post.id === editingPost.id ? postToSave : post))
      : [postToSave, ...posts];

    setApiError("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      if (isBlogApiConfigured()) {
        if (existingPost) {
          if (!existingPost.id) {
            throw new BlogApiError(400, "MISSING_BLOG_ID", "This blog has no API ID. Reload the Blog list before editing it.");
          }
          const updatedPost = await updateBlogViaApi(existingPost.id, postToSave, existingPost.display_order as number | undefined);
          setPosts((current) => current.map((post) => post.id === existingPost.id ? updatedPost : post));
          setSuccessMessage("Blog updated in the PHP API and MySQL.");
        } else {
          const createdPost = await createBlogViaApi(postToSave, posts.length);
          setPosts((current) => [createdPost, ...current]);
          setSuccessMessage("Blog created in the PHP API and MySQL.");
        }
      } else {
        setPosts(savePosts(updated));
        setSuccessMessage("Blog saved to the local fallback. Configure VITE_API_BASE_URL to use MySQL.");
      }

      setEditingPost(null);
      setSlugManuallyEdited(false);
      setFormError("");
    } catch (error) {
      setApiError(blogApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Delete “${post.title}”?\n\nThis action cannot be undone.`)) return;

    setApiError("");
    setSuccessMessage("");
    setIsSaving(true);
    try {
      if (isBlogApiConfigured()) {
        if (!post.id) {
          throw new BlogApiError(400, "MISSING_BLOG_ID", "This blog has no API ID. Reload the Blog list before deleting it.");
        }
        await deleteBlogViaApi(post.id);
        setPosts((current) => current.filter((item) => item.id !== post.id));
        setSuccessMessage("Blog deleted from the PHP API and MySQL.");
      } else {
        setPosts(savePosts(posts.filter((item) => item.id !== post.id)));
        setSuccessMessage("Blog deleted from the local fallback. Configure VITE_API_BASE_URL to use MySQL.");
      }

      if (editingPost?.id === post.id) {
        setEditingPost(null);
        setFormError("");
      }
    } catch (error) {
      setApiError(blogApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 font-body sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary">Blog Manager</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
            Create and update the articles shown on the public Blog index and detail pages.
          </p>
        </div>
        <button
          type="button"
          onClick={startNewPost}
          className="flex w-fit items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <Plus size={18} /> Create Post
        </button>
      </div>

      {apiError && (
        <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {apiError}
        </p>
      )}
      {successMessage && (
        <p role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </p>
      )}

      {editingPost && (
        <form onSubmit={handleSave} className="mb-12 space-y-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-secondary md:text-2xl">
                {posts.some((post) => post.id === editingPost.id) ? "Edit Blog Post" : "New Blog Post"}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">Fields marked <span className="font-bold text-primary">*</span> are required.</p>
            </div>
            <button
              type="button"
              onClick={() => setEditingPost(null)}
              aria-label="Close blog editor"
              className="w-fit rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <X size={20} />
            </button>
          </div>

          {formError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {formError}
            </p>
          )}

          <FormSection
            title="Blog Basic Information"
            description="These fields identify the article and appear in the blog header or listing metadata."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="blog-title" className={labelClassName}>Blog Title <span className="text-primary" aria-hidden="true">*</span></label>
                <p className={helpTextClassName}>Appears as the main title on cards, the Blog index, and the detail page.</p>
                <input
                  id="blog-title"
                  type="text"
                  required
                  placeholder="e.g. 10 Digital Marketing Trends for 2026"
                  value={editingPost.title}
                  onChange={(e) => {
                    const nextTitle = e.target.value;
                    updateEditingPost({
                      title: nextTitle,
                      ...(!slugManuallyEdited ? { slug: normalizeBlogSlug(nextTitle) } : {}),
                    });
                  }}
                  className={`${fieldClassName} mt-2`}
                />
              </div>

              <div>
                <label htmlFor="blog-slug" className={labelClassName}>URL Slug <span className="text-primary" aria-hidden="true">*</span></label>
                <p className={helpTextClassName}>Becomes the URL, for example <code className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700">/blog/seo-fundamentals-2026</code>.</p>
                <input
                  id="blog-slug"
                  type="text"
                  required
                  placeholder="seo-fundamentals-2026"
                  value={editingPost.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    updateEditingPost({ slug: e.target.value });
                  }}
                  className={`${fieldClassName} mt-2 bg-gray-50`}
                />
              </div>

              <div>
                <label htmlFor="blog-category" className={labelClassName}>Category / Service <span className="text-primary" aria-hidden="true">*</span></label>
                <p className={helpTextClassName}>Displayed with the blog where the public design supports a category label.</p>
                <select
                  id="blog-category"
                  required
                  value={editingPost.serviceSlug}
                  onChange={(e) => updateEditingPost({ serviceSlug: e.target.value })}
                  className={`${fieldClassName} mt-2 cursor-pointer`}
                >
                  <option value="" className="bg-white text-secondary">Choose a category</option>
                  {editingPost.serviceSlug && !services.some((service) => service.slug === editingPost.serviceSlug) && (
                    <option value={editingPost.serviceSlug} className="bg-white text-secondary">
                      Existing category: {editingPost.serviceSlug}
                    </option>
                  )}
                  {services.map((service) => (
                    <option key={service.slug} value={service.slug} className="bg-white text-secondary">{service.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="blog-author" className={labelClassName}>Author <span className="text-primary" aria-hidden="true">*</span></label>
                <p className={helpTextClassName}>Appears beside the author initials on cards and the detail page.</p>
                <input
                  id="blog-author"
                  type="text"
                  required
                  placeholder="e.g. RaahX Team"
                  value={editingPost.author}
                  onChange={(e) => updateEditingPost({ author: e.target.value })}
                  className={`${fieldClassName} mt-2`}
                />
              </div>

              <div>
                <label htmlFor="blog-date" className={labelClassName}>Publication Date <span className="text-primary" aria-hidden="true">*</span></label>
                <p className={helpTextClassName}>Shown as the publication date in the public blog metadata. Use a readable date such as Jul 22, 2026.</p>
                <input
                  id="blog-date"
                  type="text"
                  required
                  placeholder="Jul 22, 2026"
                  value={editingPost.date}
                  onChange={(e) => updateEditingPost({ date: e.target.value })}
                  className={`${fieldClassName} mt-2`}
                />
              </div>

              <div>
                <label htmlFor="blog-read-time" className={labelClassName}>Read Time</label>
                <p className={helpTextClassName}>Shown beside the date on public blog cards and the detail page.</p>
                <input
                  id="blog-read-time"
                  type="text"
                  placeholder="5 min read"
                  value={editingPost.readTime}
                  onChange={(e) => updateEditingPost({ readTime: e.target.value })}
                  className={`${fieldClassName} mt-2`}
                />
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Blog Image"
            description="Optionally replace the existing service-based default cover art for this blog."
          >
            <div>
              <label htmlFor="blog-image" className={labelClassName}>Custom Blog Image</label>
              <p className={helpTextClassName}>
                Optional. If you provide an image URL, it will be used for this blog. If you leave it empty, the website will use the existing default image based on the blog's service type.
              </p>
              <input
                id="blog-image"
                type="text"
                placeholder="https://example.com/blog-image.jpg"
                value={editingPost.image ?? ""}
                onChange={(e) => {
                  updateEditingPost({ image: e.target.value });
                  setImagePreviewFailed(false);
                }}
                className={`${fieldClassName} mt-2`}
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              {editingPost.image && !imagePreviewFailed ? (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">Custom Image Preview</div>
                  <div className="h-44 overflow-hidden rounded-xl bg-gray-100">
                    <img
                      src={editingPost.image}
                      alt="Custom blog preview"
                      onError={() => setImagePreviewFailed(true)}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-2 text-xs text-emerald-700">Custom image will be used when this blog is displayed publicly.</p>
                </div>
              ) : (
                <div className="flex min-h-24 items-center rounded-xl bg-gray-50 px-4 py-4 text-sm text-gray-600">
                  {editingPost.image
                    ? "This image could not be loaded. The public Blog will use the existing default image instead."
                    : "No custom image — the existing automatic blog image will be used."}
                </div>
              )}
            </div>
          </FormSection>

          <FormSection
            title="Blog Card Preview Content"
            description="This content is used when the article appears in the public Blog listing and card layouts."
          >
            <div>
              <label htmlFor="blog-excerpt" className={labelClassName}>Excerpt / Short Description <span className="text-primary" aria-hidden="true">*</span></label>
              <p className={helpTextClassName}>Short preview text shown below the title on public blog cards. Do not paste the full article here.</p>
              <textarea
                id="blog-excerpt"
                required
                rows={4}
                placeholder="A concise summary that makes visitors want to read the full article..."
                value={editingPost.excerpt}
                onChange={(e) => updateEditingPost({ excerpt: e.target.value })}
                className={`${fieldClassName} mt-2 resize-y`}
              />
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-800">
              <span className="font-semibold">Featured image:</span> the current Blog model does not store image uploads. Public blog cards and detail pages use the existing service-based cover art, so no image field is required here.
            </div>
          </FormSection>

          <FormSection
            title="Article Content"
            description="Build the full article using the same structured paragraph and heading blocks rendered by the public detail page."
          >
            <div className="space-y-4">
              {editingPost.content.map((block, index) => (
                <div key={index} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="sm:w-48">
                      <label htmlFor={`blog-block-type-${index}`} className={labelClassName}>Block {index + 1} Type</label>
                      <select
                        id={`blog-block-type-${index}`}
                        value={block.type}
                        onChange={(e) => changeContentBlockType(index, e.target.value as BlogContentBlockType)}
                        className={`${fieldClassName} mt-2 cursor-pointer`}
                      >
                        <option value="paragraph" className="bg-white text-secondary">Paragraph</option>
                        <option value="heading" className="bg-white text-secondary">Heading</option>
                        <option value="quote" className="bg-white text-secondary">Quote</option>
                        <option value="list" className="bg-white text-secondary">List</option>
                      </select>
                    </div>
                    <p className="flex-1 text-xs leading-relaxed text-gray-500">{blockHelpText(block.type)}</p>
                    <button
                      type="button"
                      onClick={() => updateEditingPost({ content: editingPost.content.filter((_, blockIndex) => blockIndex !== index) })}
                      aria-label={`Remove article block ${index + 1}`}
                      className="w-fit rounded-lg p-2 text-red-500 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <textarea
                    aria-label={`Content for article block ${index + 1}`}
                    rows={block.type === "heading" ? 2 : 5}
                    placeholder={block.type === "list" ? "First list item\nSecond list item" : block.type === "heading" ? "Section heading" : "Write the article content here..."}
                    value={blockEditorValue(block)}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateContentBlock(index, block.type === "list" ? { items: value.split("\n"), text: undefined } : { text: value, items: undefined });
                    }}
                    className={`${fieldClassName} mt-3 resize-y`}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => updateEditingPost({ content: [...editingPost.content, { type: "paragraph", text: "" }] })}
              className="inline-flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <Plus size={15} /> Add Content Block
            </button>
          </FormSection>

          <FormSection
            title="Public Publishing"
            description="Saved posts are immediately available to the public Blog in the current browser/localStorage architecture."
          >
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-600">
              The current Blog model does not include separate draft, featured, or SEO fields. The newest saved article is placed first and is used as the highlighted “Latest Article” on the homepage. Every saved article uses the existing public card, index, and detail layouts.
            </div>
          </FormSection>

          <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={() => setEditingPost(null)}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-secondary transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} /> {isSaving ? "Saving..." : "Save Article"}
            </button>
          </div>
        </form>
      )}

      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          <h2 className="font-heading text-lg font-bold text-secondary">Existing Articles</h2>
          <p className="mt-1 text-sm text-gray-500">These posts are the same records used by the public Blog index and detail pages.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                <th className="p-4 pl-6">Article</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date / Author</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/60">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-secondary">{post.title}</div>
                    <div className="text-xs text-gray-400">/blog/{post.slug}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{post.serviceSlug || "Uncategorized"}</td>
                  <td className="p-4 text-sm text-gray-500">
                    <div>{post.date || "No date"}</div>
                    <div className="text-xs text-gray-400">{post.author || "RaahX Team"}</div>
                  </td>
                  <td className="space-x-2 p-4 pr-6 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(post)}
                      aria-label={`Edit ${post.title}`}
                      className="inline-block rounded-lg p-2 text-primary transition hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post)}
                      aria-label={`Delete ${post.title}`}
                      className="inline-block rounded-lg p-2 text-red-500 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
