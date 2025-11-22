import { createBlogHelpers } from "@recurse/blog";
import { blog } from "@/.source";

const helpers = createBlogHelpers(blog);

export const blogSource = helpers.blogSource;
export const getAllBlogPosts = helpers.getAllBlogPosts;
export const getBlogPage = helpers.getBlogPage;
export const findBlogPost = helpers.findBlogPost;
export const generateBlogParams = helpers.generateBlogParams;

