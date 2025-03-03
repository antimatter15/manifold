import * as _ from 'lodash'

export const removeUndefinedProps = <T>(obj: T): T => {
  let newObj: any = {}

  for (let key of Object.keys(obj)) {
    if ((obj as any)[key] !== undefined) newObj[key] = (obj as any)[key]
  }

  return newObj
}

export const addObjects = <T extends { [key: string]: number }>(
  obj1: T,
  obj2: T
) => {
  const keys = _.union(Object.keys(obj1), Object.keys(obj2))
  const newObj = {} as any

  for (let key of keys) {
    newObj[key] = (obj1[key] ?? 0) + (obj2[key] ?? 0)
  }

  return newObj as T
}
