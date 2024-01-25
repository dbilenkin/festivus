import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const RADIUS = 40; // Radius of the nodes

// const darkColors = [
//   "#7F0000", // Dark red
//   "#8C3700", // Dark orange
//   "#7F6A00", // Dark yellow
//   "#2E7D32", // Dark green
//   "#0057A8", // Dark blue
//   "#4B0082", // Indigo
//   "#6B5B95", // Dark violet
//   "#3E4444", // Dark slate
// ];

// const darkColors = [
//   "#34568B", // Dark blue
//   "#6B5B95", // Dark purple
//   "#88B04B", // Olive green
//   "#955251", // Dark red
//   "#6A4E42", // Dark brown
//   "#4B0082", // Indigo
//   "#4F644E", // Dark green
//   "#3E4444", // Dark slate
// ];

const darkColors = [
  "#2E4A62", // Dark cerulean
  "#546A7B", // Steel blue
  "#6D597A", // Dark mauve
  "#355E3B", // Dark moss green
  "#5D5C61", // Dark lavender gray
  "#813F4C", // Wine red
  "#7F4F24", // Sienna
  "#4B3F72", // Dark indigo (replacing Dark slate gray)
];




const getNodeX = (d, numNodes, width) => {
  const spaceBetween = Math.random() * 10 + 40
  const x = (d.id * spaceBetween) + ((width + spaceBetween / 2) / 2 - (numNodes * spaceBetween / 2));
  // console.log(`Position for player ${d.id}: ${position}`); // Log the position for debugging
  return x;
}

const getFontSize = (d) => {
  const size = 24 - d.name.length;
  return size + 'px';
}

const getSpace = (d) => {
  return Math.random() * .7 + 1.1;
}

const PlayerJoinGraph = ({ players, width, height }) => {

  // const canvasRef = useRef(null);
  const svgRef = useRef();
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    if (!nodes || nodes.length === 0) {
      const positionedPlayers = players.map(p => ({
        ...p,
        x: width / 2,
        y: height / 2
      }))
      setNodes(positionedPlayers);
    } else {
      let newNodes = [];
      for (let player of players) {
        if (!nodes.find(n => n.id === player.id)) {
          const newNode = players[player.id];
          newNode.x = width / 2;
          newNode.y = height / 2;
          newNodes.push(newNode);
        }
      }

      setNodes([...nodes, ...newNodes]);
    }

    // setTimeout(() => {
    //   setLinks([{ source: 0, target: 5, value: 10 }])
    // }, 2000);
  }, [players]);


  useEffect(() => {
    if (nodes.length === 0) return;

    const svg = d3.select(svgRef.current);

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("x", d3.forceX((d) => getNodeX(d, players.length, width)).strength(0.2))
      .force("y", d3.forceY(height / 2).strength(0.2))
      .force("collide", d3.forceCollide((d) => RADIUS * getSpace(d)))
      .alpha(1)
      .alphaDecay(0.01)
      .velocityDecay(0.5);

    simulation.on('tick', () => {

      svg.selectAll('circle')
        .data(nodes)
        .join(
          enter => enter.append('circle')
            .attr('r', 0) // start with radius 0
            .attr('fill', d => darkColors[d.id])
            .attr("stroke-width", d => d.id === 0 ? 4 : 2)
            .attr("stroke", d => d.id === 0 ? "gold" : "#2c3e50")
            .transition() // begin a transition
            .duration(300) // duration of 500ms
            .attr('r', RADIUS), // transition to the actual radius
          update => update,
          exit => exit.remove()
        )
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      svg.selectAll('text')
        .data(nodes)
        .join(
          enter => enter.append('text')
            .style('fill-opacity', 0)
            .text(d => d.name)
            .transition()
            .duration(500)
            .style('fill-opacity', 1),
          update => update,
          exit => exit.remove()
        )
        .attr('x', d => d.x)
        .attr('y', d => d.y + 1)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('fill', 'rgb(229, 231, 235)')
        .style('font-size', getFontSize)
        .style('font-weight', 'bold');
    });

  }, [width, height, nodes, links]);

  return (
    <svg ref={svgRef} width={width} height={height} />
  );
};

export default PlayerJoinGraph;