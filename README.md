# reveal.js-diagram-plugin

See live [demo here](https://teone.github.io/reveal.js-diagram-plugin/demo/#/)

## Installation

Install as first [Reveal.js plugin - d3js](https://github.com/jlegewie/reveal.js-d3js-plugin)

Download `revealjs-diagram.js` and `revealjs-diagram.css` into the plugin folder of your reveal.js presentation ((i.e. `plugin/diagram`).

## Adding a diagram to your presentation

To add a diagram to your presentation you need to include a D3 visualization in your slide:

```
<section>
    <div class="fig-container"
        data-fig-id="fig-collision-detection"
        data-file="diagram.html"></div>
</section>
```
_For more information refer to the `d3js` plugin_

### Defining the diagram

In the file `diagram.html`:

```html
<!DOCTYPE html>
<meta charset="utf-8">
<head>
  <link rel="stylesheet" href="plugin/diagram/revealjs-diagram.css">
</head>
<body>
  <script src="https://d3js.org/d3.v3.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
  <script src="plugin/diagram/revealjs-diagram.js"></script>
  <script>

    var treeData = {
      name: 'A',
      x0: window.diagram.height / 2,
      y0: 0,
      children: []
    };

    var _transitions = [
      window.diagram.addItem('B', 'A', treeData),
    ];

    var _inverse_transitions = [
      window.diagram.removeItem('B', treeData),
    ];

    // register the diagram
    window.diagram.register('intro', function() {
      window.diagram.init(treeData);
    });
  </script>
</body>
```

## APIs

`window.diagram.addItem(newNode, parentNode, treeData)`: Add a `newNode` to an existing `parentNode`

`window.diagram.removeItem(node, treeData)`: Remove a `node` element

`window.diagram.addLink(sourceNode, targetNode, treeData)`: Add a link between two existing nodes

`window.diagram.removeLink(sourceNode, targetNode, treeData)`: Remove a link between two existing nodes

`window.diagram.register(name, callback)`: Register a diagram, tipically the callback will invoke `window.diagram.init`

`window.diagram.init(treeData)`: Initialize the rendering of a diagram 