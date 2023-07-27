class SelfTypingElement extends HTMLSpanElement {
  static #observer = new IntersectionObserver(SelfTypingElement.#IntersectionObserverCallback, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 1.0
  })

  static async #IntersectionObserverCallback(event) {
    for (const entry of event) {
      if (entry.isIntersecting) {
        this.unobserve(entry.target)
        entry.target.init()
      }
    }
  }

  static get typeInterval() {
    const randomMs = 1000 * Math.random()
    return randomMs < 500 ? 100 : randomMs
  }

  static sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time))
  }

  connectedCallback() {
    this.text_node = this.childNodes[0]
    this.queue_node = document.createElement('span')
    this.cursor_node = document.createElement('span')

    this.queue_node.textContent = this.text_node.textContent
    this.queue_node.style.color = 'transparent'
    this.cursor_node.textContent = this.dataset.cursor || '|'
    this.cursor_node.classList = 'type-async--cursor'
    this.text_node.textContent = ''

    this.parentNode.style.setProperty('position', 'relative')
    this.parentNode.insertBefore(this.queue_node, this.nextSibling)
    SelfTypingElement.#observer.observe(this)
  }

  disconnectedCallback() {
    SelfTypingElement.#observer.unobserve(this)
  }

  async init() {
    await SelfTypingElement.sleep(SelfTypingElement.typeInterval)
    this.parentNode.appendChild(this.cursor_node)
    return this.type()
  }

  async type() {
    if (this.queue_node.textContent == '') {
      await SelfTypingElement.sleep(this.typeInterval)
      return this.destroy()
    }

    this.text_node.textContent += this.queue_node.textContent.substring(0, 1)
    this.queue_node.textContent = this.queue_node.textContent.substring(1)

    this.#updateCursorPosition()
    await SelfTypingElement.sleep(SelfTypingElement.typeInterval/this.queue_node.textContent.length)

    return this.type()
  }

  destroy() {
    this.text_node.textContent += this.queue_node.textContent

    this.queue_node.remove()

    if (this.dataset.remove == "false")
      return

    const text_node = document.createTextNode(this.text_node.textContent)

    this.parentNode.insertBefore(text_node, this)
    this.cursor_node.remove()
    this.remove()
  }

  #updateCursorPosition() {
    const rects = this.getClientRects()
    const lastRect = rects[rects.length - 1]
    const parentRect = this.getBoundingClientRect()

    this.cursor_node.style.left = `${lastRect.right - parentRect.left}px`
    this.cursor_node.style.top = `${lastRect.top - parentRect.top}px`
  }
}

customElements.define('self-typing', SelfTypingElement, { extends: 'span' })
