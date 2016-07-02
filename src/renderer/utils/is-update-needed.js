export default function isUpdateNeeded(component, nextProps, nextState) {
  return !(isEqualObject(component.props, nextProps)
    && isEqualObject(component.state, nextState))
}

function isEqualObject(a, b, keys) {
  const newA = Object.assign({}, a)
  const newB = Object.assign({}, b)
  delete newA.children
  delete newB.children
  return JSON.stringify(newA) === JSON.stringify(newB)
}