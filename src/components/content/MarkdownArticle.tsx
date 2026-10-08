import React from 'react'

// Renders the Markdown syntax accepted by the admin editor without injecting HTML.
// Inline HTML is treated as text, so content cannot execute scripts.
function inlineTokens(value: string): React.ReactNode[] {
  const regex = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|`[^`\n]+`)/g;
  return value.split(regex).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={index}>{part.slice(2,-2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={index}>{part.slice(1,-1)}</em>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={index}>{part.slice(1,-1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (link) return <a key={index} href={link[2]} rel="noopener noreferrer" target="_blank" className="underline">{link[1]}</a>;
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export default function MarkdownArticle({content}:{content:string}) {
  const lines = content.replace(/\r\n/g,'\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let paragraph: string[] = [];
  let bullets: string[] = [];
  function flushParagraph() {
    if (paragraph.length) {
      blocks.push(<p key={'p'+blocks.length} className="mb-5 leading-relaxed">{inlineTokens(paragraph.join(' '))}</p>);
      paragraph = [];
    }
  }
  function flushBullets() {
    if (bullets.length) {
      blocks.push(<ul key={'ul'+blocks.length} className="list-disc pl-6 mb-5 space-y-2">
        {bullets.map((v,i)=><li key={i}>{inlineTokens(v)}</li>)}
      </ul>);
      bullets = [];
    }
  }
  for(const raw of lines) {
    const line = raw.trim();
    if (!line) { flushParagraph();flushBullets();continue; }
    const title = line.match(/^(#{1,3})\s+(.+)$/);
    if(title) {
      flushParagraph();flushBullets();
      const classes = 'font-display font-semibold text-[var(--noir)] mt-10 mb-4';
      if(title[1].length===1)blocks.push(<h2 key={blocks.length} className={classes+' text-3xl'}>{inlineTokens(title[2])}</h2>);
      else if(title[1].length===2)blocks.push(<h3 key={blocks.length} className={classes+' text-2xl'}>{inlineTokens(title[2])}</h3>);
      else blocks.push(<h4 key={blocks.length} className={classes+' text-xl'}>{inlineTokens(title[2])}</h4>);
      continue;
    }
    const bullet=line.match(/^[-*]\s+(.+)$/);
    if(bullet){flushParagraph();bullets.push(bullet[1]);continue;}
    flushBullets();
    paragraph.push(line);
  }
  flushParagraph();flushBullets();
  return <div className="prose prose-lg max-w-none text-[var(--charcoal)]">{blocks}</div>;
}
