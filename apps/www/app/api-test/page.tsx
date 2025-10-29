'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Code } from '@/components/ui/code';
import type { Post } from '@/models/api/types';
import { ApiService } from '@/services/api';

export default function ApiTestPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const api = new ApiService('https://jsonplaceholder.typicode.com');

    const fetchPost = async () => {
      try {
        const data = await api.getTestPost(1);
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);

    const api = new ApiService('https://jsonplaceholder.typicode.com');
    try {
      const data = await api.getTestPost(Math.floor(Math.random() * 10) + 1);
      setPost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>API Test</CardTitle>
          <CardDescription>
            Example of type-safe API integration with error handling
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Code>
            {`// 1. Create API service instance
const api = new ApiService('https://jsonplaceholder.typicode.com')

// 2. Define type-safe endpoint
async getTestPost(id: number): Promise<Post> {
  return this.fetch<Post>(\`/posts/\${id}\`)
}

// 3. Use in component with hooks
const [post, setPost] = useState<Post | null>(null)
const data = await api.getTestPost(1)
setPost(data)

// 4. Type-safe response
interface Post {
  id: number
  title: string
  body: string
  userId: number
}`}
          </Code>

          <div className="flex gap-2">
            <Button
              className="w-fit"
              disabled={loading}
              onClick={handleRefresh}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Fetch Random Post'
              )}
            </Button>
          </div>

          {loading && !post ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="py-4 text-center text-red-500">{error}</div>
          ) : post ? (
            <motion.article
              animate={{ y: 0, opacity: 1 }}
              className="rounded-lg border p-4"
              initial={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-xl">Post #{post.id}</h2>
                <span className="text-muted-foreground text-sm">
                  User: {post.userId}
                </span>
              </div>
              <h3 className="mb-2 font-medium text-lg capitalize">
                {post.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{post.body}</p>
            </motion.article>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
