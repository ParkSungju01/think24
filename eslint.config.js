import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // supabase/functions는 Vite 앱 번들이 아니라 Supabase Edge Function(Deno 런타임) 코드라
  // 브라우저 전역(globals.browser)/tsconfig 프로젝트(src만 include)와 맞지 않는다.
  // 이슈 #29(ai-generate-questions/ai-generate-verdict)에서 처음 추가됨.
  globalIgnores(['dist', 'supabase/functions']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
])
