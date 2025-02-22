// @flow
import type { MutableState, Mutator, Tools } from 'final-form'
import moveFieldState from './moveFieldState'

const move: Mutator<any> = (
  [name, from, to]: any[],
  state: MutableState<any>,
  { changeValue }: Tools<any>
) => {
  if (from === to) {
    return
  }
  changeValue(state, name, (array: ?(any[])): any[] => {
    const copy = [...(array || [])]
    const value = copy[from]
    copy.splice(from, 1)
    copy.splice(to, 0, value)
    return copy
  })
  const fromPrefix = `${name}[${from}]`
  Object.keys(state.fields).forEach(key => {
    if (key.substring(0, fromPrefix.length) === fromPrefix) {
      const suffix = key.substring(fromPrefix.length)
      const fromKey = fromPrefix + suffix
      const backup = state.fields[fromKey]
      if (from < to) {
        // moving to a higher index
        // decrement all indices between from and to
        for (let i = from; i < to; i++) {
          const destKey = `${name}[${i}]${suffix}`
          moveFieldState(
            state,
            state.fields[`${name}[${i + 1}]${suffix}`],
            destKey
          )
        }
      } else {
        // moving to a lower index
        // increment all indices between to and from
        for (let i = from; i > to; i--) {
          const destKey = `${name}[${i}]${suffix}`
          moveFieldState(
            state,
            state.fields[`${name}[${i - 1}]${suffix}`],
            destKey
          )
        }
      }
      const toKey = `${name}[${to}]${suffix}`
      moveFieldState(state, backup, toKey)
    }
  })
}

export default move
