const fs = require('fs');

function fixFile(filepath, replacements) {
  if (!fs.existsSync(filepath)) {
    console.log('[MISSING] ' + filepath);
    return;
  }
  let content = fs.readFileSync(filepath, 'utf8');
  let changed = false;
  for (const [oldStr, newStr, label] of replacements) {
    if (content.includes(oldStr)) {
      content = content.replace(oldStr, newStr);
      console.log('[OK] ' + filepath + ' - ' + label);
      changed = true;
    } else {
      console.log('[SKIP] ' + filepath + ' - ' + label + ' (already fixed or not found)');
    }
  }
  if (changed) {
    fs.writeFileSync(filepath, content, 'utf8');
  }
}

fixFile('src/pages/Login.tsx', [
  [
    'import { useState } from "react";',
    'import { useState } from "react";\nimport { useTranslation } from "react-i18next";',
    'added useTranslation import'
  ]
]);

fixFile('src/components/TosGate.tsx', [
  [
    '  if (!isAuthenticated) {\n    return null;\n  }',
    '  if (!isAuthenticated) {\n    return (\n      <div className="min-h-screen flex items-center justify-center">\n        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />\n      </div>\n    );\n  }',
    'added spinner for unauthenticated'
  ]
]);

fixFile('src/pages/Social.tsx', [
  [
    'import TosGate from "@/components/TosGate";\n',
    '',
    'removed TosGate import'
  ],
  [
    '  const { data: _postsData, isLoading } = trpc.social.listPosts.useQuery({\n    category: activeCategory, limit: PAGE_SIZE, offset, sort,\n  }, { onSuccess: (data) => { if (offset === 0) setAllPosts(data); else setAllPosts((prev) => [...prev, ...data]); setHasMore(data.length === PAGE_SIZE); } });',
    '  const { data: _postsData, isLoading } = trpc.social.listPosts.useQuery({\n    category: activeCategory, limit: PAGE_SIZE, offset, sort,\n  });\n\n  useEffect(() => {\n    if (_postsData) {\n      if (offset === 0) setAllPosts(_postsData);\n      else setAllPosts((prev) => [...prev, ..._postsData]);\n      setHasMore(_postsData.length === PAGE_SIZE);\n    }\n  }, [_postsData, offset]);',
    'fixed useQuery v5 onSuccess'
  ],
  [
    'export default function Social() { return (<TosGate><ForumContent /></TosGate>); }',
    'export default function Social() { return <ForumContent />; }',
    'removed TosGate wrapper'
  ]
]);

fixFile('src/pages/ForumPost.tsx', [
  [
    'import TosGate from "@/components/TosGate";\n',
    '',
    'removed TosGate import'
  ],
  [
    'export default function ForumPost() { return (<TosGate><PostContent /></TosGate>); }',
    'export default function ForumPost() { return <PostContent />; }',
    'removed TosGate wrapper'
  ]
]);

fixFile('src/pages/ListingDetail.tsx', [
  [
    'import { useState } from "react";',
    'import { useState, useEffect } from "react";',
    'added useEffect import'
  ],
  [
    'function CountdownTimer({ endTime }: { endTime: string }) {\n  const [timeLeft, setTimeLeft] = useState("");\n  const end = new Date(endTime).getTime();\n\n  setInterval(() => {\n    const now = Date.now();\n    const diff = end - now;\n    if (diff <= 0) { setTimeLeft("Ended"); return; }\n    const days = Math.floor(diff / 86400000);\n    const hours = Math.floor((diff % 86400000) / 3600000);\n    const mins = Math.floor((diff % 3600000) / 60000);\n    const secs = Math.floor((diff % 60000) / 1000);\n    setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);\n  }, 1000);\n\n  return <span className="font-mono text-lg">{timeLeft}</span>;\n}',
    'function CountdownTimer({ endTime }: { endTime: string }) {\n  const [timeLeft, setTimeLeft] = useState("");\n\n  useEffect(() => {\n    const end = new Date(endTime).getTime();\n    const update = () => {\n      const now = Date.now();\n      const diff = end - now;\n      if (diff <= 0) { setTimeLeft("Ended"); return; }\n      const days = Math.floor(diff / 86400000);\n      const hours = Math.floor((diff % 86400000) / 3600000);\n      const mins = Math.floor((diff % 3600000) / 60000);\n      const secs = Math.floor((diff % 60000) / 1000);\n      setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);\n    };\n    update();\n    const id = setInterval(update, 1000);\n    return () => clearInterval(id);\n  }, [endTime]);\n\n  return <span className="font-mono text-lg">{timeLeft}</span>;\n}',
    'fixed CountdownTimer freeze'
  ],
  [
    '                          <Button className="w-full" size="sm" onClick={() => payDeposit.mutate({ listingId })}>\n                            Pay ${(parseFloat(listing.startPrice || "0") * 0.05).toFixed(2)} Deposit\n                          </Button>',
    '                          <Button className="w-full" size="sm" disabled={payDeposit.isPending} onClick={() => payDeposit.mutate({ listingId })}>\n                            {payDeposit.isPending ? "Processing..." : `Pay $${(parseFloat(listing.startPrice || "0") * 0.05).toFixed(2)} Deposit`}\n                          </Button>',
    'fixed deposit button loading state'
  ],
  [
    '                        <Button onClick={() => placeBid.mutate({ listingId, amount: bidAmount })} disabled={!bidAmount}>\n                          <Gavel className="w-4 h-4 mr-1" />Bid\n                        </Button>',
    '                        <Button onClick={() => placeBid.mutate({ listingId, amount: bidAmount })} disabled={!bidAmount || placeBid.isPending}>\n                          {placeBid.isPending ? "Bidding..." : <><Gavel className="w-4 h-4 mr-1" />Bid</>}\n                        </Button>',
    'fixed bid button loading state'
  ]
]);

console.log('\nDone! Run: git diff --stat');
