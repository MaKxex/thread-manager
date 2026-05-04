import Link from "next/link";

interface ThreadCardProps {
  thread: {
    id: number;
    number: number;
    hasBeen: boolean;
    items: { id: number; type: string; threadId: number }[];
  };
  view: "color" | "traffic";
  color: string;
}

export function ThreadCard({ thread, view, color }: ThreadCardProps) {
  const totalItems = thread.items.length;

  if (view === "color") {
    const bg = color?.trim() || "#cccccc";
    return (
      <Link
        href={`/thread/${thread.id}`}
        className="flex flex-col items-center justify-center p-1.5 rounded-md text-xs border border-black/10 transition-opacity hover:opacity-80"
        style={{ backgroundColor: bg }}
        title={`#${thread.number} — ${bg}`}
      >
        <span className="font-mono font-medium">{thread.number}</span>
      </Link>
    );
  }

  let cardClass =
    "flex flex-col items-center justify-center p-1.5 rounded-md text-xs transition-colors border ";

  if (!thread.hasBeen) {
    cardClass +=
      "bg-muted border-transparent text-muted-foreground hover:bg-muted/80";
  } else if (totalItems === 0) {
    cardClass += "bg-red-50 border-red-400 text-red-700";
  } else if (totalItems <= 2) {
    cardClass += "bg-yellow-50 border-yellow-400 text-yellow-700";
  } else {
    cardClass += "bg-green-50 border-green-400 text-green-700";
  }

  return (
    <Link href={`/thread/${thread.id}`} className={cardClass}>
      <span className="font-mono font-medium">{thread.number}</span>
    </Link>
  );
}
