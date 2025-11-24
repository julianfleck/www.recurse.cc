import { getAllBlogPosts } from "@/lib/blog";
import { BlogClient } from "./blog-client";

export const revalidate = 3600;

export default function BlogIndexPage() {
	const posts = getAllBlogPosts();
	return <BlogClient posts={posts} />;
}
