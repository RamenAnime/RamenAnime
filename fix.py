#!/usr/bin/env python3
import os

def fix_file(filepath, replacements):
    if not os.path.exists(filepath):
        print(f"[MISSING] {filepath}")
        return
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    changed = False
    for old, new, label in replacements:
        if old in content:
            content = content.replace(old, new)
            print(f"[OK] {filepath} - {label}")
            changed = True
        else:
            print(f"[SKIP] {filepath} - {label} (already fixed or not found)")
    if changed:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

# 1. Login.tsx - add import
fix_file("src/pages/Login.tsx", [
    ("import { useState } from \"react\";", "import { useState } from \"react\";\nimport { useTranslation } from \"react-i18next\";", "added useTranslation import"),
])

# Remove footer manually with line-by-line to avoid corrupting backticks
with open("src/pages/Login.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip_until_cardcontent = False
for line in lines:
    if skip_until_cardcontent:
        if "</CardContent>" in line:
            new_lines.append("          </CardContent>\n")
            skip_until_cardcontent = False
        continue
    if "512-bit scrypt" in line or "Secure session cookies" in line:
        continue
    if "mt-6 pt-4 border-t" in line and "text-muted-foreground" in line:
        skip_until_cardcontent = True
        continue
    if "Shield className" in line or "MessageCircle className" in line:
        continue
    if "span>|</span>" in line and "text-muted-foreground" not in line:
        continue
    new_lines.append(line)

with open("src/pages/Login.tsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
print("[OK] src/pages/Login.tsx - removed security footer")

# 2. TosGate.tsx
fix_file("src/components/TosGate.tsx", [
    ("  if (!isAuthenticated) {\n    return null;\n  }", "  if (!isAuthenticated) {\n    return (\n      <div className=\"min-h-screen flex items-center justify-center\">\n        <div className=\"animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full\" />\n      </div>\n    );\n  }", "added spinner for unauthenticated"),
])

# 3. Social.tsx
fix_file("src/pages/Social.tsx", [
    ("import TosGate from \"@/components/TosGate\";\n", "", "removed TosGate import"),
    ("  const { data: _postsData, isLoading } = trpc.social.listPosts.useQuery({\n    category: activeCategory, limit: PAGE_SIZE, offset, sort,\n  }, { onSuccess: (data) => { if (offset === 0) setAllPosts(data); else setAllPosts((prev) => [...prev, ...data]); setHasMore(data.length === PAGE_SIZE); } });", "  const { data: _postsData, isLoading } = trpc.social.listPosts.useQuery({\n    category: activeCategory, limit: PAGE_SIZE, offset, sort,\n  });\n\n  useEffect(() => {\n    if (_postsData) {\n      if (offset === 0) setAllPosts(_postsData);\n      else setAllPosts((prev) => [...prev, ..._postsData]);\n      setHasMore(_postsData.length === PAGE_SIZE);\n    }\n  }, [_postsData, offset]);", "fixed useQuery v5 onSuccess"),
    ("export default function Social() { return (<TosGate><ForumContent /></TosGate>); }", "export default function Social() { return <ForumContent />; }", "removed TosGate wrapper"),
])

# 4. ForumPost.tsx
fix_file("src/pages/ForumPost.tsx", [
    ("import TosGate from \"@/components/TosGate\";\n", "", "removed TosGate import"),
    ("export default function ForumPost() { return (<TosGate><PostContent /></TosGate>); }", "export default function ForumPost() { return <PostContent />; }", "removed TosGate wrapper"),
])

# 5. ListingDetail.tsx
fix_file("src/pages/ListingDetail.tsx", [
    ("import { useState } from \"react\";", "import { useState, useEffect } from \"react\";", "added useEffect import"),
    ("function CountdownTimer({ endTime }: { endTime: string }) {\n  const [timeLeft, setTimeLeft] = useState(\"\");\n  const end = new Date(endTime).getTime();\n\n  setInterval(() => {\n    const now = Date.now();\n    const diff = end - now;\n    if (diff <= 0) { setTimeLeft(\"Ended\"); return; }\n    const days = Math.floor(diff / 86400000);\n    const hours = Math.floor((diff % 86400000) / 3600000);\n    const mins = Math.floor((diff % 3600000) / 60000);\n    const secs = Math.floor((diff % 60000) / 1000);\n    setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);\n  }, 1000);\n\n  return <span className=\"font-mono text-lg\">{timeLeft}</span>;\n}", "function CountdownTimer({ endTime }: { endTime: string }) {\n  const [timeLeft, setTimeLeft] = useState(\"\");\n\n  useEffect(() => {\n    const end = new Date(endTime).getTime();\n    const update = () => {\n      const now = Date.now();\n      const diff = end - now;\n      if (diff <= 0) { setTimeLeft(\"Ended\"); return; }\n      const days = Math.floor(diff / 86400000);\n      const hours = Math.floor((diff % 86400000) / 3600000);\n      const mins = Math.floor((diff % 3600000) / 60000);\n      const secs = Math.floor((diff % 60000) / 1000);\n      setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);\n    };\n    update();\n    const id = setInterval(update, 1000);\n    return () => clearInterval(id);\n  }, [endTime]);\n\n  return <span className=\"font-mono text-lg\">{timeLeft}</span>;\n}", "fixed CountdownTimer freeze"),
    ("                          <Button className=\"w-full\" size=\"sm\" onClick={() => payDeposit.mutate({ listingId })}>\n                            Pay ${(parseFloat(listing.startPrice || \"0\") * 0.05).toFixed(2)} Deposit\n                          </Button>", "                          <Button className=\"w-full\" size=\"sm\" disabled={payDeposit.isPending} onClick={() => payDeposit.mutate({ listingId })}>\n                            {payDeposit.isPending ? \"Processing...\" : `Pay ${(parseFloat(listing.startPrice || \"0\") * 0.05).toFixed(2)} Deposit`}\n                          </Button>", "fixed deposit button loading"),
    ("                        <Button onClick={() => placeBid.mutate({ listingId, amount: bidAmount })} disabled={!bidAmount}>\n                          <Gavel className=\"w-4 h-4 mr-1\" />Bid\n                        </Button>", "                        <Button onClick={() => placeBid.mutate({ listingId, amount: bidAmount })} disabled={!bidAmount || placeBid.isPending}>\n                          {placeBid.isPending ? \"Bidding...\" : <><Gavel className=\"w-4 h-4 mr-1\" />Bid</>}\n                        </Button>", "fixed bid button loading"),
])

# 6. auth-router.ts
fix_file("api/auth-router.ts", [
    ("import { randomBytes, scrypt, createHash } from \"crypto\";", "import { randomBytes, scrypt, createHash } from \"crypto\";\nimport { createTransport } from \"nodemailer\";", "added nodemailer import"),
    ("async function sendEmail(to: string, subject: string, html: string) {\n  const apiKey = process.env.RESEND_API_KEY;\n  if (!apiKey) {\n    logger.info(\"No RESEND_API_KEY set, skipping email\", { to, subject });\n    return;\n  }\n  try {\n    const resp = await fetch(\"https://api.resend.com/emails\", {\n      method: \"POST\",\n      headers: { Authorization: `Bearer ${apiKey}`, \"Content-Type\": \"application/json\" },\n      body: JSON.stringify({ from: \"\\u30e9\\u30fc\\u30e1\\u30f3\\u30a2\\u30cb\\u30e1 <noreply@ramenanime.com>\", to, subject, html }),\n    });\n    if (!resp.ok) {\n      const text = await resp.text();\n      logger.error(\"Resend email error\", { status: resp.status, text, to });\n    } else {\n      logger.info(\"Email sent\", { to, subject });\n    }\n  } catch (err) {\n    logger.error(\"Email send failed\", { to, subject, error: (err as Error).message });\n  }\n}", "const transporter = process.env.SMTP_HOST\n  ? createTransport({\n      host: process.env.SMTP_HOST,\n      port: Number(process.env.SMTP_PORT || 587),\n      secure: Number(process.env.SMTP_PORT || 587) === 465,\n      auth: {\n        user: process.env.SMTP_USER || \"\",\n        pass: process.env.SMTP_PASS || \"\",\n      },\n    })\n  : null;\n\nasync function sendEmail(to: string, subject: string, html: string) {\n  if (!transporter) {\n    logger.info(\"No SMTP configured, skipping email\", { to, subject });\n    return;\n  }\n  try {\n    const from = process.env.SMTP_FROM || process.env.SMTP_USER || \"noreply@ramenanime.com\";\n    await transporter.sendMail({ from, to, subject, html });\n    logger.info(\"Email sent\", { to, subject });\n  } catch (err) {\n    logger.error(\"Email send failed\", { to, subject, error: (err as Error).message });\n  }\n}", "switched to nodemailer SMTP"),
])

print("\nDone! Check with: git diff --stat")
