import React from 'react';
import { motion } from 'framer-motion';
import { AgentMessage as AgentMessageType } from '@/types';

interface AgentMessageProps {
  message: AgentMessageType;
  agentName: string;
  index: number;
}

// Lightweight markdown renderer: bold, numbered lists, bullet lists, line breaks
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (!line.trim()) {
      elements.push(<br key={`br-${i}`} />);
      return;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      elements.push(
        <div key={i} className="flex gap-2 items-start my-0.5">
          <span className="text-[#FF1E56] font-bold text-xs shrink-0 mt-0.5">{numMatch[1]}.</span>
          <span>{renderInline(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Bullet list
    const bulletMatch = line.match(/^[•·-]\s+(.+)/);
    if (bulletMatch) {
      elements.push(
        <div key={i} className="flex gap-2 items-start my-0.5">
          <span className="text-[#A855F7] font-bold shrink-0">•</span>
          <span>{renderInline(bulletMatch[1])}</span>
        </div>
      );
      return;
    }

    // Regular paragraph
    elements.push(<span key={i}>{renderInline(line)}{i < lines.length - 1 ? ' ' : ''}</span>);
  });

  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold text-white">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export const AgentMessage: React.FC<AgentMessageProps> = ({ message, agentName, index }) => {
  const isUser = message.role === 'user';

  const variants = {
    hidden: { opacity: 0, x: isUser ? 20 : -20, y: 6 },
    visible: {
      opacity: 1, x: 0, y: 0,
      transition: { delay: index * 0.02, duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  const timeStr = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isUser) {
    return (
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        className="flex justify-end gap-2 group"
      >
        <div className="max-w-[78%] flex flex-col items-end gap-1">
          <div className="bg-[#1E1E2E] border border-white/10 text-[#E8E8F0] text-sm leading-relaxed rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-md">
            {message.content}
          </div>
          <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity px-1">
            {timeStr}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className="flex gap-2.5 group"
    >
      <div className="max-w-[84%] flex flex-col gap-1">
        <div
          className="text-[#E8E8F0] text-sm leading-relaxed rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-md relative"
          style={{
            background: 'linear-gradient(135deg, rgba(20,8,32,0.95) 0%, rgba(12,4,22,0.98) 100%)',
            border: '1px solid rgba(157,78,221,0.35)',
            boxShadow: message.isStreaming
              ? '0 0 12px rgba(157,78,221,0.25), inset 0 0 20px rgba(255,30,86,0.04)'
              : '0 0 8px rgba(157,78,221,0.15)',
          }}
        >
          {/* Agent name badge */}
          <div className="text-[10px] font-bold text-[#A855F7] mb-1.5 tracking-wide uppercase opacity-80">
            {agentName}
          </div>

          <div className="space-y-0.5">
            {renderMarkdown(message.content)}
            {message.isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-1.5 h-4 bg-[#FF1E56] rounded-sm ml-0.5 align-middle"
              />
            )}
          </div>
        </div>
        <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity px-1">
          {timeStr}
        </span>
      </div>
    </motion.div>
  );
};
