import { creators as demoCreators } from "../data/creatorsData";
import type { CreatorRecord } from "./creatorStore";

export function getDemoCreators(): CreatorRecord[] {
  return demoCreators.map((creator, index) => ({
    id: String(creator.id),
    display_name: creator.name,
    name: creator.name,
    slug: creator.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    profile_image_url: creator.image,
    short_bio: creator.shortBio,
    about: creator.about,
    city: creator.city,
    region: creator.region,
    followers: creator.followers,
    followers_calculated: creator.followers,
    engagement_rate: creator.engagement,
    compatibility_score: creator.compatibility,
    is_verified: true,
    status: "published",
    display_order: index,
    approved_at: null,
    socials: creator.socials.filter((social) => Boolean(social.profile_url)).map((social, socialIndex) => ({
      platform: social.platform,
      handle: social.handle,
      profile_url: social.profile_url!,
      follower_count: social.platform === "Instagram" ? creator.followers : 0,
      display_order: socialIndex,
    })),
    categories: creator.categories,
    expertise: creator.expertise,
    collaboration_types: ["Sponsored Posts", "Brand Campaigns", "Content Production"],
    featured_work: [],
  }));
}
