#!/bin/sh
# Run from the root of your repo: sh REMOVE_BLOG.sh
git rm -r src/app/blog
git rm --cached tsconfig.tsbuildinfo next-env.d.ts 2>/dev/null
echo "Blog removed. Now: git add . && git commit -m 'Remove blog, add products admin' && git push"
