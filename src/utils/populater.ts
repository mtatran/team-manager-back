import * as _ from 'lodash'

export interface PopulatePair {
  path: string
  idField: string
  valueField: string
}

interface ParentIdPair {
  parent: Object
  id: any
}

interface FinishedPair extends ParentIdPair {
  resolve: Function
}

export interface PopulateOptions {
  strict: boolean
}

export interface ResolveHashMap {
  [key: string]: any
}

export default class Populater {
  private objs: Object[]
  private paths: PopulatePair[]
  private finishedPairs: FinishedPair[]
  private strict: boolean

  constructor (obj: Object | Object[], paths: PopulatePair[], options: Partial<PopulateOptions> = {}) {
    this.objs = Array.isArray(obj) ? obj : [obj]
    this.paths = paths

    this.finishedPairs = this.getAllInternalPairs()
  }

  resolve (resolveHashMap: ResolveHashMap, idToString: (id: any) => string) {
    this.finishedPairs.forEach(pair => {
      const obj = resolveHashMap[idToString(pair.id)]
      if (obj) pair.resolve(obj)
      else if (this.strict) {
        throw new Error(`Pair with id ${pair.id} could not be populated`)
      }
    })
  }

  private getAllInternalPairs (): FinishedPair[] {
    const internalPairs: FinishedPair[] = []
    this.objs.forEach(obj => {
      this.paths.forEach(path => {
        let pathToId = [...path.path.split('.'), path.idField]
        const newPairs = this.fieldsFromPath(obj, {}, pathToId, this.strict)

        const finishedPairs: FinishedPair[] = newPairs.map(pip => ({
          ...pip,
          resolve: function (obj: Object) {
            this.parent[path.valueField] = obj
          }
        }))

        internalPairs.push(...finishedPairs)
      })
    })

    return internalPairs
  }

  private fieldsFromPath (obj: Object, parent: Object, path: string[], strict: boolean): ParentIdPair[] {
    if (path.length === 0) return [{ id: obj, parent }]

    let field = obj[path[0]]

    if (!field) {
      if (strict) throw new Error(`Field ${path[0]} not found`)
      return []
    }

    if (Array.isArray(field)) {
      const results = field.map(f => this.fieldsFromPath(f, obj, path.slice(1), strict))
      const items = _.concat([], ...results)
      return items
    } else {
      return this.fieldsFromPath(field, obj, path.slice(1), strict)
    }
  }

  get neededIds (): any[] {
    return this.finishedPairs.map(p => p.id)
  }

}
