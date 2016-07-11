'use strict'

const electron = require('electron')
const fs = require('fs')
const events = require('events')
const vdom = require('virtual-dom')
const hyperx = require('hyperx')
const main = require('main-loop')

const hx = hyperx(vdom.h)

module.exports = function (opts) {
  const self = new events.EventEmitter()
  const root = opts.root
  const filter = opts.filter

  const renderRoot = opts.renderRoot || ((hx, children) => {
    return hx`<div class="tree-view">${children}</div>`
  })

  const renderItem = opts.renderItem || ((hx, data, children, loadHook, clickElem, createChild) => {
    return hx`<div class="elem" loaded=${loadHook}>
      <a href="#" class="header" onclick=${clickElem}>
        <div>
         ${children.length === 0 ? '' : hx`<img src="${__dirname + '/images/chevron.png'}" class="chevron" />`}
         <span>${opts.label ? opts.label(data) : data.name}</span>
        </div>
      </a>
      <ul>${children.map(createChild)}</ul>
    </div>`
  })

  const renderChild = opts.renderChild || ((hx, children) => {
    return hx`<li>${children}</li>`
  })

  var selected = null
  var selectedDom = null

  // injecting css
  const browser = opts.browser || electron.remote.getCurrentWindow()
  const data = fs.readFileSync(`${__dirname}/style.css`, 'utf8')
  browser.webContents.insertCSS(data)

  const traverse = data => {
    let children = opts.children ? opts.children(data) : (data.children || [])
    if (filter) {
      children = children.filter(filter)
    }
    var elem = null

    var LoadHook = function () {}
    LoadHook.prototype.hook = function (node) { elem = node }

    const clickElem = event => {
      if (selected === data) {
        elem.classList.remove('selected')

        self.emit('deselected', data)

        selected = null
        selectedDom = null
      } else {
        elem.classList.add('selected')

        self.emit('selected', data)
        if (selected) self.emit('deselected', selected)

        selected = data
        selectedDom = elem
      }

      const elems = opts.container.querySelectorAll('.tree-view .elem')
      for (let i = 0; i < elems.length; ++i) {
        elems[i].classList.remove('active')
      }

      elem.classList.add('active')
    }

    return createItem()

    function createItem () {
      const loadHook = new LoadHook()
      return renderItem(hx, data, children, loadHook, clickElem, createChild)
    }

    function createChild (c) {
      return renderChild(hx, traverse(c))
    }
  }

  const render = self.render = state => {
    return renderRoot(hx, traverse(state.root))
  }

  const loop = self.loop = main({ root }, render, vdom)
  opts.container.appendChild(loop.target)

  const selectTraverse = (current, node, dom) => {
    if (current === node) {
      dom.classList.add('selected')
      dom.classList.add('active')

      self.emit('selected', node)
      if (selected) {
        self.emit('deselected', selected)
        selectedDom.classList.remove('active')
        selectedDom.classList.remove('selected')
      }
      selected = node
      selectedDom = dom

      return true
    }

    let children = opts.children ? opts.children(current)
      : (current.children || [])
    if (filter) {
      children = children.filter(filter)
    }

    if (children) {
      var shouldSelect = false
      children.forEach((c, ix) => {
        const didFound = selectTraverse(c, node
          , dom.querySelectorAll(':scope > ul > li > .elem')[ix])
        if (didFound) shouldSelect = true
      })

      if (shouldSelect) {
        dom.classList.add('selected')
      }
      return shouldSelect
    }
  }

  self.select = node => {
    selectTraverse(root, node
      , opts.container.querySelector('.tree-view > .elem'))
  }

  return self
}
