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

#### `tree.on('selected', item => {})`
fires when an `item` has been clicked.

#### `tree.on('deselected', item => {})`
fires when an `item` has been clicked again and it closed.

#### `tree.select(node)`
selects `node` of the tree programatically.
