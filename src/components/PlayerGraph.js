import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PlayerGraph = ({ data, strongestPlayer, strongestPair }) => {
  const svgRef = useRef();

  useEffect(() => {
    // Set dimensions and margins for the graph
    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 20 };

    // Remove any existing SVG to avoid overlapping
    d3.select(svgRef.current).selectAll("*").remove();

    // Create an SVG element
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Increase the node size dynamically or to a fixed value larger than 5
    const nodeRadius = 25;  // Or make it dynamic based on data
    const minValue = 0;
    const maxValue = data.topScore;
    // Normalize your values (example function, you'll need to adjust this to your data)
    function normalizeValue(value) {
      // Example normalization that you might need to adjust according to your data range
      return (value - minValue) / (maxValue - minValue);
    }

    // Adjust link distance based on normalized value
    const linkDistance = (d) => {
      const normalizedValue = normalizeValue(d.value);
      // Set a base distance and adjust it according to your normalized value
      const baseDistance = 30; // The base distance for a value of 1
      return baseDistance * (1 / normalizedValue);
    };

    const strokeWidth = (d) => {
      const normalizedValue = normalizeValue(d.value);
      const baseWidth = 30;
      return baseWidth * normalizedValue;
    }

    // Adjust forceManyBody strength for more reasonable repulsion
    const repulsionStrength = -30;

    const getGroupCenters = () => {
      const numGroups = data.nodes.reduce((prev, curr) => curr.group > prev ? curr.group : prev, 0) + 1;
      const numCols = Math.ceil(Math.sqrt(numGroups));
      const numRows = Math.ceil(numGroups / numCols);
      const groupCenters = {};
      for (let i = 0; i < numRows; i++) {
        for (let j = 0; (j < numCols) && (i * numCols + j < numGroups); j++) {
          groupCenters[i * numCols + j] = {
            x: ((j + 1) * width) / (numCols + 1),
            y: ((i + 1) * height) / (numRows + 1)
          }
        }
      }
      return groupCenters;
    }

    // Define a function that calculates the total connection strength for a node
    function calculateTotalConnectionStrength(node, links) {
      // Sum the strength of all connections where this node is the source or target
      const strength = links.reduce((acc, link) => {
        if (link.source.id === node.id || link.target.id === node.id) {
          return acc + link.value; // Assuming 'value' is the strength of the connection
        }
        return acc;
      }, 0);

      return strength / 10;
    }

    // Assume you have functions to determine these:
    const isStrongestPair = d => {
      return (d.source.id === strongestPair.source && d.target.id === strongestPair.target) ||
        (d.source.id === strongestPair.target && d.target.id === strongestPair.source)
    }

    // Create a simulation for positioning nodes with adjusted forces
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id(d => d.id).distance(linkDistance))
      .force("charge", d3.forceManyBody().strength(d => -calculateTotalConnectionStrength(d, data.links)))
      .force("x", d3.forceX().x(d => getGroupCenters()[d.group].x))
      .force("y", d3.forceY().y(d => getGroupCenters()[d.group].y))
      // .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(nodeRadius * 2)) // Add collision force
      .alphaDecay(0.01)
      .velocityDecay(0.4);

    // Run the simulation for a set number of ticks to stabilize
    const numTicks = 150;
    for (let i = 0; i < numTicks; ++i) {
      simulation.tick();
    }

    // Stop the simulation from automatically running
    // simulation.stop();

    // Draw lines for the links between the nodes
    const link = svg.append("g")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", d => isStrongestPair(d) ? "darkgreen" : "#bbb")
      .attr("stroke-width", d => isStrongestPair(d) ? strokeWidth(d) : strokeWidth(d));


    // ...

    // Draw circles for the nodes with increased radius
    const node = svg.append("g")
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", d => d.id === strongestPlayer ? nodeRadius + 8 : nodeRadius)
      .attr("fill", colorNode)
      .attr("stroke-width", d => d.id === strongestPlayer ? 8 : 2)
      .attr("stroke", d => d.id === strongestPlayer ? "gold" : "#2c3e50")
      .call(drag(simulation));
    // .transition().duration(1000);

    // Add labels to the nodes
    const labels = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .attr("x", 0)
      .attr("y", 0)
      .text(d => d.id);

    // Style labels to be inside and centered in the nodes
    labels.attr("text-anchor", "middle") // Center the text horizontally
      .attr("dy", "-0.5em")
      .attr("fill", "white") // Set the text color to white
      .style("font-size", "14px") // Adjust font size to fit inside the nodes
      .style("pointer-events", "none"); // Ignore pointer events for text elements

    // Update and restart the simulation when nodes change
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
        .attr("x", d => d.x)
        .attr("y", d => d.y + nodeRadius / 2); // Adjust label position based on node size
    });

    // Function to color nodes
    function colorNode(d) {
      const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'brown', 'gray']
      const darkColors = [
        "#34568B", // Dark blue
        "#6B5B95", // Dark purple
        "#88B04B", // Olive green
        "#955251", // Dark red
        "#6A4E42", // Dark brown
        "#2A4B7C", // Navy blue
        "#4F644E", // Dark green
        "#3E4444", // Dark slate
      ];

      return darkColors[d.group];
    }

    // Drag functionality
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default PlayerGraph;
