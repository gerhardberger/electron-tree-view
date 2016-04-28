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
  var selected = null

  // injecting css
  const browser = opts.browser || electron.remote.getCurrentWindow()
  const data = fs.readFileSync(`${__dirname}/style.css`, 'utf8')
  browser.webContents.insertCSS(data)

  const traverse = data => {
    const children = opts.children ? opts.children(data) : (data.children || [])
    var elem = null

    var LoadHook = function () {}
    LoadHook.prototype.hook = function (node) { elem = node }

    const clickelem = event => {
      if (selected === data) {
        elem.classList.remove('selected')

        self.emit('deselected', data)

        selected = null
      } else {
        elem.classList.add('selected')

        self.emit('selected', data)
        if (selected) self.emit('deselected', selected)

        selected = data
      }

      const elems = opts.container.querySelectorAll('.tree-view .elem')
      for (let i = 0; i < elems.length; ++i) {
        elems[i].classList.remove('active')
      }

      elem.classList.add('active')

      /* if (elem.classList.contains('selected')) {
        self.emit('selected', data)
      } else {
        self.emit('deselected', data)
      }*/
    }

    const createChild = c => hx`<li>${traverse(c)}</li>`

    return hx`<div class="elem" loaded=${new LoadHook()}>
      <a href="#" class="header" onclick=${clickelem}>
        <div>
          ${children.length === 0 ? '' : hx`
            <img src="${__dirname + '/images/chevron.png'}" class="chevron" />`}
          <span>${opts.label ? opts.label(data) : data.name}</span>
        </div>
      </a>
      <ul>${children.map(createChild)}</ul>
    </div>`
  }

  const render = self.render = state => {
    return hx`<div class="tree-view">${traverse(state.root)}</div>`
  }

  const loop = self.loop = main({ root }, render, vdom)
  opts.container.appendChild(loop.target)

  return self
}
