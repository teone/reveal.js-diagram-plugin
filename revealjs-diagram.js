(function (window) {

  // Configurations
  var duration = 750;
  var margin = {top: 20, right: 200, bottom: 20, left: 200};
  var padding = 10;
  var radius = 10;
  var width;
  var height;
  var tree;
  var svg;
  var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });


  $('document').ready(function() {

    Object.keys(registered).forEach(function (k) {
      registered[k].cb();
    });

  });

  var registered = {};
  function register(name, cb) {
    console.log('register', name)
    registered[name] = {
      name: name,
      cb: cb
    }
  }

  function init(treeData) {
    width = window.parent.document.body.clientWidth - margin.right - margin.left;
    height = window.parent.document.body.clientHeight - margin.top - margin.bottom;

    tree = d3.layout.tree()
      .size([height, width]);

    svg = d3.select("body").append("svg")
      .attr({
        width: width + margin.right + margin.left,
        height: height + margin.top + margin.bottom
      })
      .append("g")
      .attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
      });

    if (treeData) {
      update(treeData)
    }
  }

  // Private methods
  function findNode(name, nodes) {
    var node = nodes.shift();
    if (node.name === name) {
      return node;
    }
    if (node.children) {
      nodes = nodes.concat(node.children);
    }
    return findNode(name, nodes)
  }

  // D3 helpers
  function renderNodes(nodes, data) {
    var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.name });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
      .attr({
        class: "node",
        transform: function(d) {
          var x = d.parent !== undefined ? d.parent.y0 : data.y0;
          var y = d.parent !== undefined ? d.parent.x0 : data.x0;
          return "translate(" + x + "," + y + ")";
        }
      });

    nodeEnter.append("rect")
      .attr({
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        rx: radius,
        ry: radius
      });

    var text = nodeEnter.append('text')
      .attr({
        'text-anchor': 'middle',
        'alignment-baseline': 'middle',
        opacity: 0
      })
      .style({
        'font-size': '20px'
      })
      .text(function (d) {return d.name.toUpperCase()});

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("rect")
      .attr({
        width: function (d) {
          return getSiblingTextSize(this).width + (padding * 2);
        },
        height: 50,
        x: function (d) {
          return - ((getSiblingTextSize(this).width + (padding * 2))/2);
        },
        y: -25
      });

    nodeUpdate.select("text")
      .attr({
        opacity: 1
      });

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
        var x = d.parent !== undefined ? d.parent.y : data.y0;
        var y = d.parent !== undefined ? d.parent.x : data.x0;
        return "translate(" + x + "," + y + ")";
      })
      .remove();

    nodeExit.select("rect")
      .attr({
        width: 0,
        height: 0,
        x: 0,
        y: 0
      });

    nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  }

  function getSiblingTextSize(node) {
    return  d3.select(node.parentNode).select('text').node().getBBox();
  }

  // Public methods
  function addItem(name, parent, root) {
    if (!parent) {
      throw Error('You need to specify a parent to add a node in the Tree!')
    }
    return function() {
      var parentNode = findNode(parent, [root]);
      if (!parentNode.children) {
        parentNode.children = []
      }
      parentNode.children.push({
        name: name
      })
      update(root);
    }
  }

  function removeItem(name, root) {
    return function() {
      var node = findNode(name, [root]);
      var siblings = node.parent.children;

      var idx = siblings.findIndex(function(i) {
        return i.name === name;
      });

      siblings.splice(idx, 1);
      update(root);
    }
  }

  function update(data) {
    // create the tree
    var nodes = tree.nodes(treeData);
    var links = tree.links(nodes);

    renderNodes(nodes, data);

    // update links
    var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.name; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: d.source.x0, y: d.source.y0};
        return diagonal({source: o, target: o});
      });

    // Transition links to their new position.
    link.transition()
      .duration(duration)
      .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: d.source.x, y: d.source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

    // transition standalone links
    renderStandaloneLinks(_randomLinks);

    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });

  }

  function renderStandaloneLinks(links) {
    var link = svg.selectAll("path.link-alone")
      .data(links, function(d) { return 'standalone' + d.key });


    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
      .attr("class", "link-alone")
      .attr("d", function(d) {
        // calculate source/target diagonals
        var s = {x: d.source.x, y: d.source.y};
        return diagonal({source: s, target: s});
      });

    // Transition links to their new position.
    link.transition()
      .duration(duration)
      .attr("d", function(d) {
        var s = {x: d.source.x, y: d.source.y};
        var t = {x: d.target.x, y: d.target.y};
        return diagonal({source: s, target: t});
      });

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var s = {x: d.source.x, y: d.source.y};
        return diagonal({source: s, target: s});
      })
      .remove();
  }

  // store all the random links added
  var _randomLinks = [];

  function addLink(source, target, tree) {
    return function() {
      var key = source + '~' + target;
      var link = {
        source: findNode(source, [tree]),
        target: findNode(target, [tree]),
        key: key
      }

      var existing = _randomLinks.findIndex(function(i) {
        return i.key === key;
      });
      // var existing = _.findIndex(_randomLinks, {key: key});
      if (existing === -1) {
        _randomLinks.push(link);
        update(tree);
      }
    }

  }

  function removeLink(source, target, tree) {
    return function() {
      var key = source + '~' + target;
      var existing = _randomLinks.findIndex(function(i) {
        return i.key === key;
      });
      if (existing > -1) {
        _randomLinks.splice(existing, 1);
        update(tree);
      }
    }
  }

  window.diagram = {
    register: register,
    init: init,
    addItem: addItem,
    removeItem: removeItem,
    update: update,
    addLink: addLink,
    removeLink: removeLink,
    width: width,
    heigth: height
  };
})(window);