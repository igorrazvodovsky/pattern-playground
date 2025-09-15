import React from 'react';
import type { RichContent } from '../../../stories/data/index.js';

// TipTap content node types
interface ContentNode {
  type: string;
  content?: ContentNode[];
  text?: string;
  marks?: ContentMark[];
}

interface ContentMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface CommentRendererProps {
  content: RichContent | string;
  author: string;
  timestamp: string | Date;
  className?: string;
}

/**
 * Renders rich comment content from TipTap JSON structure
 * Handles both rich content objects and plain text fallbacks
 * Content only - layout is handled by parent component
 */
export const CommentRenderer: React.FC<CommentRendererProps> = ({
  content,
  className = ''
}) => {
  // Debug logging
  console.log('CommentRenderer - content:', content, typeof content);

  const renderRichContent = (richContent: RichContent | string): React.ReactNode => {
    // Handle plain string content (backward compatibility)
    if (typeof richContent === 'string') {
      return richContent;
    }

    // Handle RichContent objects
    const content = richContent.richContent;

    // Fallback to plain text if rich content is not available
    if (!content || !content.content) {
      return richContent.plainText || 'No content';
    }

    const renderContentNodes = (contentArray: ContentNode[]): React.ReactNode[] => {
      return contentArray.map((node, index) => {
        switch (node.type) {
          case 'paragraph':
            return (
              <p key={index} className="comment-paragraph">
                {node.content ? renderContentNodes(node.content) : ''}
              </p>
            );

          case 'bulletList':
            return (
              <ul key={index} className="comment-list">
                {node.content ? renderContentNodes(node.content) : ''}
              </ul>
            );

          case 'listItem':
            return (
              <li key={index} className="comment-list-item">
                {node.content ? renderContentNodes(node.content) : ''}
              </li>
            );

          case 'text':
            const text = node.text || '';
            let element: React.ReactNode = text;

            // Apply marks if they exist
            if (node.marks) {
              node.marks.forEach((mark: ContentMark) => {
                switch (mark.type) {
                  case 'bold':
                    element = <strong key={`bold-${index}`}>{element}</strong>;
                    break;
                  case 'italic':
                    element = <em key={`italic-${index}`}>{element}</em>;
                    break;
                  case 'highlight':
                    element = <mark key={`highlight-${index}`}>{element}</mark>;
                    break;
                  // Add more mark types as needed for comment formatting
                  default:
                    break;
                }
              });
            }

            return <React.Fragment key={index}>{element}</React.Fragment>;

          default:
            // Unknown node type - render as text content if available
            if (node.content) {
              return (
                <div key={index} className="comment-unknown">
                  {renderContentNodes(node.content)}
                </div>
              );
            }
            return null;
        }
      });
    };

    return renderContentNodes(content.content);
  };

  return (
    <div className={className}>
      {renderRichContent(content)}
    </div>
  );
};