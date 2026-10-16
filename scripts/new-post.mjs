#!/usr/bin/env node
// 从 templates/post.md 生成一篇文章骨架。
// 用法：pnpm new <路径>   例：pnpm new a/b/my-post.md
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, isAbsolute, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const POSTS_DIR = join(ROOT, "src/content/posts")
const TEMPLATE = join(ROOT, "templates/post.md")

const USAGE = `用法：pnpm new <路径>

  pnpm new my-post
  pnpm new a/b/my-post.md      # 子目录不存在会自动创建

生成 src/content/posts/<路径>，文章 URL 为 /posts/<路径>/。`

const fail = (message) => {
  console.error(`✗ ${message}`)
  process.exit(1)
}

const args = process.argv.slice(2)

if (args.includes("-h") || args.includes("--help")) {
  console.log(USAGE)
  process.exit(0)
}
if (args.length === 0) fail(`缺少参数。\n\n${USAGE}`)
if (args.length > 1) fail(`只接受一个参数，收到 ${args.length} 个：${args.join(" ")}`)

const input = args[0]
const withMdx = /\.mdx$/i.test(input)
const slug = input.replace(/\.(md|mdx)$/i, "").replace(/^\/+|\/+$/g, "")

if (slug === "") fail("路径为空。")
if (slug.includes("\\")) fail("用 / 分隔目录，不要用反斜杠。")
if (/\s/.test(slug)) fail("路径里不要有空白字符，用 - 连接单词。")
if (!/^[a-zA-Z0-9._/-]+$/.test(slug)) fail("路径只允许字母、数字、-、_、. 和目录分隔符 /。")

const segments = slug.split("/")
if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
  fail(`非法路径：${input}`)
}

const ext = withMdx ? ".mdx" : ".md"
const filePath = join(POSTS_DIR, ...segments) + ext
const relPath = relative(ROOT, filePath)

if (relative(POSTS_DIR, filePath).startsWith("..") || isAbsolute(relative(POSTS_DIR, filePath))) {
  fail(`路径越界，必须写在 ${relative(ROOT, POSTS_DIR)} 内。`)
}
if (existsSync(filePath)) fail(`已存在，未覆盖：${relPath}`)

if (!existsSync(TEMPLATE)) fail(`模板缺失：${relative(ROOT, TEMPLATE)}`)

// 标题由文件名反推（kebab-case → Title Case），中文标题生成后自己改
const title = segments[segments.length - 1]
  .replace(/[-_]+/g, " ")
  .replace(/\b[a-z]/g, (char) => char.toUpperCase())

const now = new Date()
const pad = (value) => String(value).padStart(2, "0")
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

const content = readFileSync(TEMPLATE, "utf8")
  .replaceAll("{{title}}", JSON.stringify(title))
  .replaceAll("{{date}}", date)

mkdirSync(dirname(filePath), { recursive: true })
writeFileSync(filePath, content, { flag: "wx" })

console.log(`✓ 已创建 ${relPath}`)
console.log(`  URL: /posts/${segments.join("/")}/`)
console.log("  下一步：改 title，然后 pnpm dev")
