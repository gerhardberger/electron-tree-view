# electron tree view
A very minimal tree viewer for [electron](http://electron.atom.io/) webviews with [virtual dom](https://github.com/Matt-Esch/virtual-dom).

![](https://media.giphy.com/media/3o6ozmXesqgxoS4n0A/giphy.gif)

## install
```
$ npm i electron-tree-view
```

## usage
``` js
const root = {
  name: 'foo',
  children: [{
    name: 'bar',
    children: [{
      name: 'bar',
      children: []
    }, {
      name: 'baz',
      children: []
    }]
  }]
}

const tree = require('electron-tree-view')({
  root,
  container: document.querySelector('.container'),
  children: c => c.children,
  label: c => c.name
})

tree.on('selected', item => {
  // adding a new children to every selected item
  item.children.push({ name: 'foo', children: [] })

  tree.loop.update({ root })

  console.log('item selected')
})
```

## api
#### `const tree = require('electron-tree-view')(opts)`
creates a new tree view. the `opts` object can contain:
- `root`: the root node of the tree data structure. **required**
- `container`: a DOM node to which the tree will be appended. **required**
- `children`: by default the program checks for the `children` property of a tree node to add children, but if it called something else, or you want custom behaviour, then implement this `function` that returns the children as an `array`.
- `label`: by default the program checks for the `name` property of a tree node to display a text for a node, but if it called something else, or you want custom behaviour, then implement this `function` that returns a `string` to display.
- `filter`: a function (`Child => Boolean`) that can determine which child element to let through to display. This can be used to hide certain children nodes.
- overwrite rendering of nodes - see [overwriting rendering](#overwriting-rendering) below.

#### `tree.on('selected', item => {})`
fires when an `item` has been clicked.

#### `tree.on('deselected', item => {})`
fires when an `item` has been clicked again and it closed.

#### `tree.select(node)`
selects `node` of the tree programatically.

## overwriting rendering

#### `opts.renderRoot = (hx, children) => {}`
overwrite the rendering of the root element.
- `hx` template string function used for rendering dom nodes
- `children` string containing traversed children

default:
``` js
(hx, children) => {
  return hx`<div class="tree-view">${children}</div>`
}
```

notes:
* make sure you include the `tree-view` class

#### `opts.renderItem = (hx, data, children, loadHook, clickElem, createChild) => {}`
overwrite the rendering of each node.
- `hx` template string function used for rendering dom nodes
- `data` data for the current node being rendered
- `children` array of children below the current node
- `loadHook` hook to setup the click handler properly
- `clickElem` click handler to attach to the anchor
- `createChild` function used to render child nodes

default:
``` js
(hx, data, children, loadHook, clickElem, createChild) => {
  return hx`<div class="elem" loaded=${loadHook}>
    <a href="#" class="header" onclick=${clickElem}>
      <div>
        ${children.length === 0 ? '' : hx`<img src="${__dirname + '/images/chevron.png'}" class="chevron" />`}
        <span>${opts.label ? opts.label(data) : data.name}</span>
      </div>
    </a>
    <ul>
      ${children.map(createChild)}
    </ul>
  </div>`
}
```

notes:
* make sure the parent element includes the `loaded` attribute set to `loadHook`
* make sure a clickable element has `onclick` attribute set to `clickElem`
* make sure the parent element has the class `elem`
* you can't use `opts` here; label function will not be used

#### `opts.renderChild = (hx, children) => {}`
overwrite the rendering of a child node.
- `hx` template string function used for rendering dom nodes
- `children` string containing traversed child

default:
``` js
(hx, children) => {
  return hx`<li>${children}</li>`
}
```
