import os

with open('src/pages/Login.tsx', 'r') as f:
    c = f.read()

# Add import
c = c.replace('import { useState } from "react";', 'import { useState } from "react";\nimport { useTranslation } from "react-i18next";')

# Remove footer
old_footer = '''            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>512-bit scrypt password hashing</span>
              <span>|</span>
              <MessageCircle className="h-3 w-3" />
              <span>Secure session cookies</span>
            </div>
          </CardContent>'''

c = c.replace(old_footer, '          </CardContent>')

with open('src/pages/Login.tsx', 'w') as f:
    f.write(c)

print('Login.tsx fixed')
