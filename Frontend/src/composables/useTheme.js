import { ref, watch, onMounted } from 'vue'

const THEME_KEY = 'shop365-theme'

const theme = ref('system')

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(mode) {
  const resolved = mode === 'system' ? getSystemTheme() : mode
  const html = document.documentElement

  if (resolved === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }

  html.style.colorScheme = resolved
}

export function useTheme() {
  onMounted(() => {
    const saved = localStorage.getItem(THEME_KEY)
    theme.value = saved || 'system'
    applyTheme(theme.value)

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme('system')
      }
    })
  })

  watch(theme, (val) => {
    localStorage.setItem(THEME_KEY, val)
    applyTheme(val)
  })

  function setTheme(val) {
    theme.value = val
  }

  function toggleTheme() {
    const current = theme.value === 'dark' ? 'light' : 'dark'
    setTheme(current)
  }

  return { theme, setTheme, toggleTheme }
}
