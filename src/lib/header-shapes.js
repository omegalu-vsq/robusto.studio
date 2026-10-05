const contours = {
  brand: {
    start: [100, 0],
    startHandle: [0, 25],
    nodes: [
      { point: [84, 73], handle: [-9, 17] },
      { point: [39, 87], handle: [-20, -6] },
    ],
    end: [0, 100],
    endHandle: [18, 0],
    amplitude: [1.8, 2],
    verticalAmplitude: [1.8, 3.4],
    phase: 0,
  },
  nav: {
    start: [0, 0],
    startHandle: [0, 16],
    nodes: [
      { point: [20, 40], handle: [0, 16] },
      { point: [17, 74], handle: [-1, 17] },
    ],
    end: [100, 100],
    endHandle: [-36, 0],
    amplitude: [3.2, 1.6],
    verticalAmplitude: [2, 1.5],
    phase: 1.4,
  },
}

const coordinates = (point) => point.map((value) => value.toFixed(2)).join(' ')
const offset = (point, vector, direction = 1) =>
  point.map((value, axis) => value + vector[axis] * direction)

export function createHeaderContour(side, scrollY = 0, progress = 0) {
  const contour = contours[side]
  const phase = scrollY / 190 + contour.phase
  const nodes = contour.nodes.map((node, index) => ({
    ...node,
    point: [
      node.point[0] +
        Math.sin(phase + index * 1.9) * contour.amplitude[index] +
        Math.sin(index * 1.7 + contour.phase) * progress * 1.2,
      node.point[1] +
        Math.sin(phase * 0.8 + index * 2.2) * contour.verticalAmplitude[index],
    ],
  }))
  let previous = { point: contour.start, handle: contour.startHandle }
  const curves = nodes.map((node) => {
    const curve = `C${coordinates(offset(previous.point, previous.handle))} ${coordinates(offset(node.point, node.handle, -1))} ${coordinates(node.point)}`
    previous = node
    return curve
  })
  curves.push(
    `C${coordinates(offset(previous.point, previous.handle))} ${coordinates(offset(contour.end, contour.endHandle))} ${coordinates(contour.end)}`,
  )
  const curve = curves.join(' ')

  return {
    edge: `M${coordinates(contour.start)} ${curve}`,
    fill: `${side === 'brand' ? 'M0 0 H100' : 'M100 0 H0'} ${curve} Z`,
  }
}
