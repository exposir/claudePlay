import { useState, useMemo } from 'react';
import { Conversation } from '../types/chat';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onTogglePin,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and group conversations
  const { pinnedConversations, groupedConversations } = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;

    const filtered = conversations.filter(conv =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pinned = filtered.filter(conv => conv.pinned);
    const unpinned = filtered.filter(conv => !conv.pinned);

    const grouped: Record<string, Conversation[]> = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Older': [],
    };

    unpinned.forEach(conv => {
      const diff = now - conv.updatedAt;
      if (diff < oneDay) {
        grouped['Today'].push(conv);
      } else if (diff < 2 * oneDay) {
        grouped['Yesterday'].push(conv);
      } else if (diff < sevenDays) {
        grouped['Previous 7 Days'].push(conv);
      } else {
        grouped['Older'].push(conv);
      }
    });

    return { pinnedConversations: pinned, groupedConversations: grouped };
  }, [conversations, searchQuery]);
  const renderConversation = (conversation: Conversation) => (
    <div
      key={conversation.id}
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        conversation.id === activeConversationId
          ? 'bg-gray-700'
          : 'hover:bg-gray-800'
      }`}
      onClick={() => onSelectConversation(conversation.id)}
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
      <span className="flex-1 text-sm truncate">
        {conversation.title}
      </span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(conversation.id);
          }}
          className="p-1 hover:bg-gray-600 rounded"
          title={conversation.pinned ? 'Unpin' : 'Pin'}
        >
          <svg className="w-4 h-4" fill={conversation.pinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteConversation(conversation.id);
          }}
          className="p-1 hover:bg-gray-600 rounded"
          title="Delete"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen">
      {/* New Chat Button */}
      <div className="p-3 border-b border-gray-700">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-gray-700">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full px-3 py-2 pl-9 bg-gray-800 text-white text-sm rounded-lg focus:ring-2 focus:ring-gray-600 outline-none"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3">
        {conversations.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-8">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pinned Conversations */}
            {pinnedConversations.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 px-3 mb-2">PINNED</h3>
                <div className="space-y-1">
                  {pinnedConversations.map(renderConversation)}
                </div>
              </div>
            )}

            {/* Grouped Conversations */}
            {Object.entries(groupedConversations).map(([group, convs]) => (
              convs.length > 0 && (
                <div key={group}>
                  <h3 className="text-xs font-semibold text-gray-400 px-3 mb-2">{group.toUpperCase()}</h3>
                  <div className="space-y-1">
                    {convs.map(renderConversation)}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
