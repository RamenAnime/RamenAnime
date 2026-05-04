#!/usr/bin/perl
use strict;
use warnings;

sub read_file {
    my ($path) = @_;
    open(my $fh, '<:encoding(UTF-8)', $path) or return undef;
    local $/;
    my $content = <$fh>;
    close($fh);
    return $content;
}

sub write_file {
    my ($path, $content) = @_;
    open(my $fh, '>:encoding(UTF-8)', $path) or die "Cannot write $path: $!";
    print $fh $content;
    close($fh);
}

sub fix {
    my ($path, $old, $new, $label) = @_;
    my $content = read_file($path);
    if (!defined $content) {
        print "[MISSING] $path\n";
        return;
    }
    if (index($content, $old) != -1) {
        $content =~ s/\Q$old\E/$new/s;
        write_file($path, $content);
        print "[OK] $path - $label\n";
    } else {
        print "[SKIP] $path - $label (already fixed or not found)\n";
    }
}

# 1. Login.tsx - add useTranslation import
fix('src/pages/Login.tsx',
    "import { useState } from \"react\";",
    "import { useState } from \"react\";\nimport { useTranslation } from \"react-i18next\";",
    "added useTranslation import");

# 2. TosGate.tsx - replace return null with spinner
fix('src/components/TosGate.tsx',
    "  if (!isAuthenticated) {\n    return null;\n  }",
    "  if (!isAuthenticated) {\n    return (\n      <div className=\"min-h-screen flex items-center justify-center\">\n        <div className=\"animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full\" />\n      </div>\n    );\n  }",
    "added spinner for unauthenticated");

# 3. Social.tsx - fix useQuery + remove TosGate
fix('src/pages/Social.tsx',
    "import TosGate from \"@/components/TosGate\";\n",
    "",
    "removed TosGate import");

fix('src/pages/Social.tsx',
    "  const { data: _postsData, isLoading } = trpc.social.listPosts.useQuery({\n    category: activeCategory, limit: PAGE_SIZE, offset, sort,\n  }, { onSuccess: (data) => { if (offset === 0) setAllPosts(data); else setAllPosts((prev) => [...prev, ...data]); setHasMore(data.length === PAGE_SIZE); } });",
    "  const { data: _postsData, isLoading } = trpc.social.listPosts.useQuery({\n    category: activeCategory, limit: PAGE_SIZE, offset, sort,\n  });\n\n  useEffect(() => {\n    if (_postsData) {\n      if (offset === 0) setAllPosts(_postsData);\n      else setAllPosts((prev) => [...prev, ..._postsData]);\n      setHasMore(_postsData.length === PAGE_SIZE);\n    }\n  }, [_postsData, offset]);",
    "fixed useQuery v5 onSuccess");

fix('src/pages/Social.tsx',
    "export default function Social() { return (<TosGate><ForumContent /></TosGate>); }",
    "export default function Social() { return <ForumContent />; }",
    "removed TosGate wrapper");

# 4. ForumPost.tsx - remove TosGate
fix('src/pages/ForumPost.tsx',
    "import TosGate from \"@/components/TosGate\";\n",
    "",
    "removed TosGate import");

fix('src/pages/ForumPost.tsx',
    "export default function ForumPost() { return (<TosGate><PostContent /></TosGate>); }",
    "export default function ForumPost() { return <PostContent />; }",
    "removed TosGate wrapper");

# 5. ListingDetail.tsx - fix CountdownTimer + buttons
fix('src/pages/ListingDetail.tsx',
    "import { useState } from \"react\";",
    "import { useState, useEffect } from \"react\";",
    "added useEffect import");

fix('src/pages/ListingDetail.tsx',
    "function CountdownTimer({ endTime }: { endTime: string }) {\n  const [timeLeft, setTimeLeft] = useState(\"\");\n  const end = new Date(endTime).getTime();\n\n  setInterval(() => {\n    const now = Date.now();\n    const diff = end - now;\n    if (diff <= 0) { setTimeLeft(\"Ended\"); return; }\n    const days = Math.floor(diff / 86400000);\n    const hours = Math.floor((diff % 86400000) / 3600000);\n    const mins = Math.floor((diff % 3600000) / 60000);\n    const secs = Math.floor((diff % 60000) / 1000);\n    setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);\n  }, 1000);\n\n  return <span className=\"font-mono text-lg\">{timeLeft}</span>;\n}",
    "function CountdownTimer({ endTime }: { endTime: string }) {\n  const [timeLeft, setTimeLeft] = useState(\"\");\n\n  useEffect(() => {\n    const end = new Date(endTime).getTime();\n    const update = () => {\n      const now = Date.now();\n      const diff = end - now;\n      if (diff <= 0) { setTimeLeft(\"Ended\"); return; }\n      const days = Math.floor(diff / 86400000);\n      const hours = Math.floor((diff % 86400000) / 3600000);\n      const mins = Math.floor((diff % 3600000) / 60000);\n      const secs = Math.floor((diff % 60000) / 1000);\n      setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);\n    };\n    update();\n    const id = setInterval(update, 1000);\n    return () => clearInterval(id);\n  }, [endTime]);\n\n  return <span className=\"font-mono text-lg\">{timeLeft}</span>;\n}",
    "fixed CountdownTimer freeze");

fix('src/pages/ListingDetail.tsx',
    "                          <Button className=\"w-full\" size=\"sm\" onClick={() => payDeposit.mutate({ listingId })}>\n                            Pay \$\${(parseFloat(listing.startPrice || \"0\") * 0.05).toFixed(2)} Deposit\n                          </Button>",
    "                          <Button className=\"w-full\" size=\"sm\" disabled={payDeposit.isPending} onClick={() => payDeposit.mutate({ listingId })}>\n                            {payDeposit.isPending ? \"Processing...\" : \`Pay \$\${(parseFloat(listing.startPrice || \"0\") * 0.05).toFixed(2)} Deposit\`}\n                          </Button>",
    "fixed deposit button loading state");

fix('src/pages/ListingDetail.tsx',
    "                        <Button onClick={() => placeBid.mutate({ listingId, amount: bidAmount })} disabled={!bidAmount}>\n                          <Gavel className=\"w-4 h-4 mr-1\" />Bid\n                        </Button>",
    "                        <Button onClick={() => placeBid.mutate({ listingId, amount: bidAmount })} disabled={!bidAmount || placeBid.isPending}>\n                          {placeBid.isPending ? \"Bidding...\" : <><Gavel className=\"w-4 h-4 mr-1\" />Bid</>}\n                        </Button>",
    "fixed bid button loading state");

print "\nDone! Run: git diff --stat\n";
