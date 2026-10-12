import type { Metadata } from 'next';
import { ChatWindow } from '../components/ChatWindow';

interface Props {
  params: { id: string };
}

export const metadata: Metadata = { title: 'Conversation' };

export default function ConversationPage({ params }: Props) {
  return (
    <div className="h-[calc(100vh-180px)] animate-fade-in">
      <ChatWindow conversationId={params.id} />
    </div>
  );
}