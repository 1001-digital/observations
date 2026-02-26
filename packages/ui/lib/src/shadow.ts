/**
 * Shadow DOM encapsulation for the artifact widget.
 *
 * Prevents library styles (:root, html, body resets, component CSS)
 * from leaking into the host page by mounting inside a shadow root.
 */

/**
 * Remap document-level selectors to shadow-compatible equivalents.
 * :root → :host, html {} → :host {}, body {} → :host {}
 */
function adaptStyles(css: string): string {
  return css
    .replace(/:root/g, ':host')
    .replace(/\bhtml\s*\{/g, ':host {')
    .replace(/\bbody\s*\{/g, ':host {')
}

/**
 * Attach a shadow root to the host element with an inner mount
 * point and a teleport target for dialogs/overlays.
 */
export function createShadowRoot(host: Element) {
  const shadow = host.attachShadow({ mode: 'open' })

  const root = document.createElement('div')
  shadow.appendChild(root)

  // Teleport target — dialogs/overlays render here instead of <body>
  const teleportTarget = document.createElement('div')
  teleportTarget.id = 'teleports'
  shadow.appendChild(teleportTarget)

  return { shadow, root, teleportTarget }
}

/**
 * Inject a CSS string into the shadow root via a <style> element.
 * Uses <style> rather than adoptedStyleSheets so that @layer ordering
 * is shared with component <style> blocks captured by captureDevStyles.
 * Remaps :root/html/body selectors to :host so custom properties
 * and base styles apply within the shadow tree.
 */
export function injectStyles(shadow: ShadowRoot, css: string) {
  const style = document.createElement('style')
  style.textContent = adaptStyles(css)
  shadow.appendChild(style)
}

/**
 * In dev mode, Vite injects Vue SFC <style> blocks into document.head
 * as <style data-vite-dev-id="..."> elements. This observer intercepts
 * them and moves them into the shadow root so they:
 *   1. Don't leak into the host page
 *   2. Actually apply inside the shadow tree
 *
 * On HMR updates, Vite can't find the moved style (shadow DOM is
 * encapsulated from document.querySelector), so it creates a fresh
 * <style> — we deduplicate by removing the old one first.
 *
 * Returns a cleanup function to disconnect the observer.
 */
export function captureDevStyles(shadow: ShadowRoot): () => void {
  function capture(style: HTMLStyleElement) {
    const id = style.getAttribute('data-vite-dev-id')
    if (id) {
      shadow.querySelector(`style[data-vite-dev-id="${id}"]`)?.remove()
    }

    if (style.textContent) {
      style.textContent = adaptStyles(style.textContent)
    }

    shadow.appendChild(style)
  }

  // Move existing Vite-injected styles
  for (const el of [...document.head.querySelectorAll('style[data-vite-dev-id]')]) {
    capture(el as HTMLStyleElement)
  }

  // Watch for new injections (HMR updates, lazy-loaded component styles)
  const observer = new MutationObserver((mutations) => {
    for (const { addedNodes } of mutations) {
      for (const node of addedNodes) {
        if (
          node instanceof HTMLStyleElement &&
          node.hasAttribute('data-vite-dev-id')
        ) {
          capture(node)
        }
      }
    }
  })
  observer.observe(document.head, { childList: true })

  return () => observer.disconnect()
}
