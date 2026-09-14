import { useState } from 'react';
import { MessageCircle, Send, ThumbsUp, User } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Textarea } from '@/components/common/Textarea';
import { Avatar } from '@/components/common/Avatar';
import { EmptyState } from '@/components/common/EmptyState';
import { timeAgo } from '@/utils/formatDate';
import { useAuth } from '@/context/AuthContext';

interface ForumPost {
  id: string;
  author: {
    id: string;
    nom: string;
    prenom: string;
    photoUrl?: string;
  };
  content: string;
  likes: number;
  likedBy: string[];
  replies: Array<{
    id: string;
    author: { nom: string; prenom: string; photoUrl?: string };
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
}

interface DiscussionForumProps {
  posts?: ForumPost[];
  onSubmitPost?: (content: string) => Promise<void>;
  onSubmitReply?: (postId: string, content: string) => Promise<void>;
  onLike?: (postId: string) => void;
}

export function DiscussionForum({
  posts = [],
  onSubmitPost,
  onSubmitReply,
  onLike,
}: DiscussionForumProps) {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitPost = async () => {
    if (!newPost.trim()) return;
    setSubmitting(true);
    try {
      await onSubmitPost?.(newPost.trim());
      setNewPost('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (postId: string) => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await onSubmitReply?.(postId, replyContent.trim());
      setReplyContent('');
      setReplyTo(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Nouveau post */}
      <Card>
        <div className="flex gap-3">
          <Avatar
            name={`${user?.prenom} ${user?.nom}`}
            size="md"
            className="flex-shrink-0"
          />
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Partagez une idée, posez une question..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={3}
              maxLength={1000}
              showCount
            />
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                icon={<Send size={14} />}
                onClick={handleSubmitPost}
                disabled={!newPost.trim()}
                loading={submitting}
              >
                Publier
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Posts */}
      {posts.length === 0 ? (
        <EmptyState
          icon={<MessageCircle size={48} />}
          title="Aucune discussion"
          description="Soyez le premier à partager une idée !"
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isLiked = post.likedBy.includes(user?.id || '');
            const isMyPost = post.author.id === user?.id;

            return (
              <Card key={post.id}>
                {/* Author */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar
                    src={post.author.photoUrl}
                    name={`${post.author.prenom} ${post.author.nom}`}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-odc-text-light dark:text-odc-text-dark">
                        {post.author.prenom} {post.author.nom}
                      </span>
                      {isMyPost && (
                        <span className="text-[10px] font-semibold text-odc-primary bg-odc-primary-soft px-1.5 py-0.5 rounded">
                          Vous
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                      {timeAgo(post.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-odc-text-light dark:text-odc-text-dark whitespace-pre-wrap mb-3">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-3 border-t border-odc-border-light dark:border-odc-border-dark">
                  <button
                    onClick={() => onLike?.(post.id)}
                    className={`flex items-center gap-1 text-xs transition-colors ${
                      isLiked
                        ? 'text-odc-primary font-semibold'
                        : 'text-odc-text-muted-light dark:text-odc-text-muted-dark hover:text-odc-primary'
                    }`}
                  >
                    <ThumbsUp size={14} />
                    {post.likes}
                  </button>
                  <button
                    onClick={() => setReplyTo(replyTo === post.id ? null : post.id)}
                    className="flex items-center gap-1 text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark hover:text-odc-primary transition-colors"
                  >
                    <MessageCircle size={14} />
                    Répondre ({post.replies.length})
                  </button>
                </div>

                {/* Replies */}
                {post.replies.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-odc-primary-soft space-y-3">
                    {post.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2">
                        <Avatar
                          src={reply.author.photoUrl}
                          name={`${reply.author.prenom} ${reply.author.nom}`}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-odc-text-light dark:text-odc-text-dark">
                            {reply.author.prenom} {reply.author.nom}
                            <span className="ml-2 font-normal text-odc-text-muted-light dark:text-odc-text-muted-dark">
                              {timeAgo(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-odc-text-light dark:text-odc-text-dark mt-0.5">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                {replyTo === post.id && (
                  <div className="mt-3 flex gap-2">
                    <Textarea
                      placeholder="Écrire une réponse..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                      maxLength={500}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSubmitReply(post.id)}
                      disabled={!replyContent.trim()}
                      loading={submitting}
                    >
                      <Send size={14} />
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}