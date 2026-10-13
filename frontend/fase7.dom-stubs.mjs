// Stubs de APIs de navegador (FASE 7): compartidos por las pruebas Node
// (SSR e interacción) para poder cargar el build client de Quasar en Node.
//
// Nota: el cliente de Quasar (build browser) se evalúa en Node, así que se
// dejan mínimos stubs de window/document para que el módulo pueda cargarse.
const win = {
  navigator: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0',
    maxTouchPoints: 0,
    platform: 'MacIntel',
    language: 'es-CO'
  },
  location: {
    hash: '',
    href: 'http://localhost/',
    pathname: '/',
    search: '',
    origin: 'http://localhost'
  },
  history: {
    state: null,
    back() {},
    forward() {},
    pushState() {},
    replaceState() {}
  },
  screen: { width: 1024, height: 768 },
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  addEventListener() {},
  removeEventListener() {},
  matchMedia() {
    return {
      matches: false,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {}
    }
  },
  getComputedStyle() {
    return { getPropertyValue: () => '' }
  },
  requestAnimationFrame: (cb) => setTimeout(cb, 0),
  cancelAnimationFrame: clearTimeout,
  performance: { now: () => Date.now() }
}
win.window = win
win.self = win
win.top = win

const atributos = () => {
  const mapa = new Map()
  return {
    setAttribute(nombre, valor) { mapa.set(nombre, String(valor)) },
    getAttribute(nombre) { return mapa.has(nombre) ? mapa.get(nombre) : null },
    removeAttribute(nombre) { mapa.delete(nombre) },
    hasAttribute(nombre) { return mapa.has(nombre) }
  }
}

const nodoStub = () => ({
  dataset: {},
  style: {},
  offsetWidth: 0,
  offsetHeight: 0,
  offsetTop: 0,
  offsetLeft: 0,
  scrollWidth: 0,
  scrollHeight: 0,
  clientWidth: 1024,
  clientHeight: 768,
  innerHTML: '',
  tabIndex: 0,
  disabled: false,
  value: '',
  classList: { add() {}, remove() {}, toggle() {}, contains() { return false } },
  children: [],
  childNodes: [],
  appendChild(hijo) { this.children.push(hijo); return hijo },
  append(...nodos) { this.children.push(...nodos) },
  prepend(...nodos) { this.children.unshift(...nodos) },
  removeChild(hijo) { return hijo },
  remove() {},
  replaceChildren() {},
  insertBefore(hijo) { return hijo },
  cloneNode() { return nodoStub() },
  contains() { return false },
  setAttribute() {},
  getAttribute() { return null },
  removeAttribute() {},
  addEventListener() {},
  removeEventListener() {},
  focus() {},
  blur() {},
  click() {},
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementsByTagName: () => [],
  getBoundingClientRect() {
    return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }
  }
})

const doc = {
  location: win.location,
  body: Object.assign(nodoStub(), atributos(), {
    dataset: {},
    appendChild(hijo) { return hijo },
    removeChild(hijo) { return hijo },
    classList: { add() {}, remove() {}, toggle() {} }
  }),
  documentElement: Object.assign(nodoStub(), atributos(), {
    clientWidth: 1024,
    clientHeight: 768
  }),
  head: Object.assign(nodoStub(), atributos()),
  addEventListener() {},
  removeEventListener() {},
  createElement() {
    return Object.assign(nodoStub(), atributos())
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  // SweetAlert2 consulta document.getElementsByTagName(...) al montarse
  getElementsByTagName: () => [],
  visibilityState: 'visible',
  activeElement: null
}
doc.defaultView = win
// SweetAlert2 inyecta sus estilos al cargar: document.getElementsByTagName('head')[0]
doc.getElementsByTagName = (tag) => (tag === 'head' ? [doc.head] : [])

function def(name, value) {
  try {
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true })
  } catch {
    // si el entorno ya lo define como solo-lectora, se ignora
  }
}

def('window', win)
def('document', doc)
def('navigator', win.navigator)
def('location', win.location)
def('history', win.history)
def('screen', win.screen)
def('matchMedia', win.matchMedia)
def('getComputedStyle', win.getComputedStyle)
def('requestAnimationFrame', win.requestAnimationFrame)
def('cancelAnimationFrame', win.cancelAnimationFrame)

// Stubs mínimos de APIs de navegador que el build client de Quasar referencia
class Dummy {}
def('XMLHttpRequest', Dummy)
def('WebSocket', Dummy)
def('FileReader', Dummy)
def('Image', Dummy)
def('DOMParser', class {
  parseFromString() { return { body: {}, documentElement: {} } }
})
def('ResizeObserver', class {
  observe() {} unobserve() {} disconnect() {}
})
def('IntersectionObserver', class {
  observe() {} unobserve() {} disconnect() {}
})
def('MutationObserver', class {
  observe() {} disconnect() {} takeRecords() { return [] }
})

// Elementos y eventos del DOM (el build de Quasar los referencia en la carga)
class ElementStub {
  constructor() {
    this.style = {}
    this.dataset = {}
    this.classList = {
      add() {}, remove() {}, toggle() {}, contains() { return false }
    }
  }
  matches() { return false }
  closest() { return null }
  setAttribute() {}
  getAttribute() { return null }
  appendChild(hijo) { return hijo }
  removeChild(hijo) { return hijo }
  addEventListener() {}
  removeEventListener() {}
  getBoundingClientRect() {
    return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }
  }
}
def('Element', ElementStub)
def('HTMLElement', ElementStub)
def('HTMLInputElement', ElementStub)
def('HTMLDivElement', ElementStub)
def('HTMLCanvasElement', ElementStub)
def('SVGElement', ElementStub)
def('Node', ElementStub)
def('Event', Dummy)
def('CustomEvent', class extends Dummy {
  constructor(tipo, opciones) {
    super()
    this.type = tipo
    Object.assign(this, opciones || {})
  }
})
def('KeyboardEvent', Dummy)
def('MouseEvent', Dummy)
def('PointerEvent', Dummy)
def('FocusEvent', Dummy)
def('InputEvent', Dummy)
def('Touch', Dummy)
def('TouchEvent', Dummy)
def('DragEvent', Dummy)
def('PopStateEvent', Dummy)
def('getSelection', () => null)

// Más constructores del DOM referenciados por Quasar en tiempo de carga
for (const nombre of [
  'FileList', 'File', 'Blob', 'DataTransfer', 'Range', 'Text',
  'DocumentFragment', 'HTMLFormElement', 'HTMLTextAreaElement',
  'HTMLSelectElement', 'HTMLOptionElement', 'HTMLIFrameElement',
  'HTMLVideoElement', 'HTMLAudioElement', 'HTMLImageElement',
  'HTMLAnchorElement', 'HTMLLabelElement', 'HTMLSpanElement',
  'CSSStyleDeclaration', 'StyleSheet', 'MediaList', 'FormData',
  'ValidityState', 'ShadowRoot', 'Document', 'Window'
]) {
  if (typeof globalThis[nombre] === 'undefined') {
    def(nombre, Dummy)
  }
}
