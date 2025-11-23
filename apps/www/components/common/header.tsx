import { getAllBlogPosts } from "@/lib/blog";
import { createBlogNavItems } from "@/content/navigation";
import { HeaderClient } from "./header-client";

export function Header() {
	// Fetch blog posts server-side
	const blogPosts = getAllBlogPosts();
	
	// Create serializable blog navigation items (no React components)
	const blogItems = createBlogNavItems(blogPosts.map(post => ({
		title: post.title,
		description: post.description,
		url: post.url,
		heroImage: post.heroImage,
	})));

	return <HeaderClient blogItems={blogItems} />;
}
