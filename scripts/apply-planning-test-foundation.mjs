import { readFile, writeFile } from 'node:fs/promises'

async function replaceOnce(path, from, to) {
  const source = await readFile(path, 'utf8')
  const first = source.indexOf(from)
  const last = source.lastIndexOf(from)
  if (first < 0 || first !== last) {
    throw new Error(`${path}: expected exactly one match`)
  }
  await writeFile(path, source.replace(from, to))
}

async function replacePattern(path, pattern, to) {
  const source = await readFile(path, 'utf8')
  if (!pattern.test(source)) {
    throw new Error(`${path}: pattern was not found`)
  }
  pattern.lastIndex = 0
  await writeFile(path, source.replace(pattern, to))
}

await replaceOnce(
  'src/data/sharedContent.ts',
  "const noteTitlePattern = /^__note__:(candidate|fact|question|todo):(open|resolved|reflected|dismissed):(.*)$/s\n",
  "const noteTitlePattern = /^__note__:(candidate|fact|question|todo):(open|resolved|reflected|dismissed):(.*)$/s\nconst pageDescriptionPattern = /^__planmeta__:(general|usj|dining|kyoto|transport):(draft|active|backup|archived)\\n([\\s\\S]*)$/\n"
)

await replacePattern(
  'src/data/sharedContent.ts',
  /const basePlanTitles: Record<SharedPageSlug, string> = \{[\s\S]*?\n\}\n\n/,
  ''
)

await replacePattern(
  'src/data/sharedContent.ts',
  /export function pageToPlan\(page: SharedPage\): SharedPlan \{[\s\S]*?\n\}\n\nexport function memoToPlan/,
  `export function encodePageDescription(
  description: string,
  category: MemoCategory,
  status: PlanStatus
) {
  return '__planmeta__:' + category + ':' + status + '\\n' + description
}

export function decodePageDescription(
  description: string,
  fallbackCategory: MemoCategory
) {
  const match = description.match(pageDescriptionPattern)
  if (!match) {
    return {
      category: fallbackCategory,
      status: 'active' as PlanStatus,
      description
    }
  }

  return {
    category: match[1] as MemoCategory,
    status: match[2] as PlanStatus,
    description: match[3]
  }
}

export function pageToPlan(page: SharedPage): SharedPlan {
  const metadata = decodePageDescription(page.description, page.slug)
  return {
    id: 'page:' + page.slug,
    category: metadata.category,
    title: page.title,
    description: metadata.description,
    content: page.content,
    status: metadata.status,
    author: page.updated_by,
    created_at: page.updated_at,
    updated_at: page.updated_at,
    source: 'page',
    pageSlug: page.slug
  }
}

export function memoToPlan`
)

await replaceOnce(
  'src/hooks/useSharedContent.ts',
  "  defaultSharedPages,\n  encodeNoteTitle,\n",
  "  defaultSharedPages,\n  encodeNoteTitle,\n  encodePageDescription,\n"
)

await replacePattern(
  'src/hooks/useSharedContent.ts',
  /  const updatePage = async \(slug: SharedPageSlug, content: string, updatedBy: string\) => \{[\s\S]*?\n  \}\n\n  const createMemo/,
  `  const updatePage = async (plan: SharedPlan, input: PlanInput) => {
    const client = supabase
    if (!client) throw new Error('Supabase同期が未設定のため、保存できません。')
    if (!plan.pageSlug) throw new Error('基本作戦の識別情報がありません。')

    const slug = plan.pageSlug
    setSaving(true)
    setError(null)
    try {
      const { data, error: updateError } = await client
        .from('shared_pages')
        .update({
          title: input.title,
          description: encodePageDescription(plan.description, input.category, input.status),
          content: input.content,
          updated_by: input.author
        })
        .eq('slug', slug)
        .select('*')
        .single()
      if (updateError) throw updateError
      const updated = data as SharedPage
      setPages((current) => ({ ...current, [slug]: updated }))
      return updated
    } catch (updateError) {
      const message = errorMessage(updateError)
      setError(message)
      throw new Error(message)
    } finally {
      setSaving(false)
    }
  }

  const createMemo`
)

await replaceOnce(
  'src/hooks/useSharedContent.ts',
  "    if (plan.source === 'page') {\n      if (!plan.pageSlug) throw new Error('基本作戦の識別情報がありません。')\n      return updatePage(plan.pageSlug, input.content, input.author)\n    }\n",
  "    if (plan.source === 'page') return updatePage(plan, input)\n"
)

await replaceOnce('src/pages/PlanningPage.tsx', "  Wifi,\n", '')
await replaceOnce(
  'src/pages/PlanningPage.tsx',
  "type Filter = 'all' | MemoCategory\n",
  "type Filter = 'all' | MemoCategory\n\ntype SharedContentHook = typeof useSharedContent\n\ntype PlanningPageProps = {\n  useSharedContentHook?: SharedContentHook\n}\n"
)
await replaceOnce(
  'src/pages/PlanningPage.tsx',
  'export function PlanningPage() {\n',
  'export function PlanningPage({ useSharedContentHook = useSharedContent }: PlanningPageProps = {}) {\n'
)
await replaceOnce(
  'src/pages/PlanningPage.tsx',
  '  } = useSharedContent()\n',
  '  } = useSharedContentHook()\n'
)
await replacePattern(
  'src/pages/PlanningPage.tsx',
  /        <div className=\{`shared-sync-state \$\{configured \? 'is-online' : 'is-offline'\}`\}>[\s\S]*?        <\/div>\n/,
  ''
)
await replaceOnce(
  'src/pages/PlanningPage.tsx',
  '基本作戦は本文と編集者を更新できます。別案は「作戦を追加」で作成してください。',
  '基本作戦は削除できません。カテゴリー、タイトル、状態、本文、編集者を更新できます。'
)
await replacePattern(
  'src/pages/PlanningPage.tsx',
  /\n\s+disabled=\{editingBasePlan\}/g,
  ''
)

await replaceOnce(
  'src/pages/HomePage.tsx',
  "function PreTripHome({ now }: { now: Date }) {\n  const { plans, planningNotes, configured, loading } = useSharedContent();\n",
  "type PreTripHomeProps = {\n  now: Date;\n  useSharedContentHook?: typeof useSharedContent;\n};\n\nexport function PreTripHome({\n  now,\n  useSharedContentHook = useSharedContent,\n}: PreTripHomeProps) {\n  const { plans, planningNotes, configured, loading } = useSharedContentHook();\n"
)
await replacePattern(
  'src/pages/HomePage.tsx',
  /  const syncLabel = loading[\s\S]*?      : "共有設定待ち";\n/,
  ''
)
await replacePattern(
  'src/pages/HomePage.tsx',
  /          <span className=\{configured \? "is-online" : "is-offline"\}>[\s\S]*?          <\/span>\n/,
  ''
)

const cssPath = 'src/index.css'
const css = await readFile(cssPath, 'utf8')
if (!css.includes('/* planning-edit-regression:start */')) {
  await writeFile(
    cssPath,
    css + `\n\n/* planning-edit-regression:start */\n.cinema-tab-strip button {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n}\n.cinema-tab-strip button small {\n  display: block;\n  margin-top: 4px;\n  font-size: 16px;\n  font-weight: 800;\n  line-height: 1.1;\n  text-align: center;\n}\n/* planning-edit-regression:end */\n`
  )
}

const packagePath = 'package.json'
const packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
packageJson.scripts['test:e2e'] = 'playwright test'
packageJson.devDependencies['@playwright/test'] = '^1.61.1'
await writeFile(packagePath, JSON.stringify(packageJson, null, 2) + '\n')

await replaceOnce(
  '.github/workflows/ci.yml',
  '      - name: Build\n        run: npm run build\n',
  `      - name: Build
        run: npm run build

      - name: Install Playwright Chromium
        run: npx playwright install --with-deps chromium

      - name: Browser integration test
        run: npm run test:e2e

      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report
          if-no-files-found: ignore
`
)

await replaceOnce(
  'docs/chatgpt-github-workflow.md',
  'npm test\nnpm run lint\nnpm run build\n',
  'npm test\nnpm run lint\nnpm run build\nnpm run test:e2e\n'
)
await replaceOnce(
  'docs/chatgpt-github-workflow.md',
  '- `test`、`lint`、`build`が成功している。\n',
  '- `test`、`lint`、`build`、`test:e2e`が成功している。\n'
)
