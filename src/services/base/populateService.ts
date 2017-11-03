import * as _ from 'lodash'
import Populater, { PopulatePair, PopulateOptions, ResolveObjects } from '../../utils/populater'

export default abstract class PopulateService<Type, Key> {
  abstract async findNeededObjects (ids: Key[]): Promise<Type[]>
  abstract objectToId (obj: Type): Key
  abstract idToString (id: Key): string
  abstract idEquals (id1: Key, id2: Key): boolean

  async populate (docs: Object | Object[], paths: PopulatePair[], options: Partial<PopulateOptions> = {}) {
    const populater = new Populater(docs, paths, options)
    const neededIds = _.uniqBy(populater.neededIds, (id: Key) => this.idToString(id))

    const results: Type[] = await this.findNeededObjects(neededIds)

    /**
     * @todo: Maybe optimize this by using a hashmap
     */
    const resolveObjectArray: ResolveObjects[] = results.map(res => ({
      id: this.idToString(this.objectToId(res)),
      payload: res
    }))

    populater.resolve(resolveObjectArray, this.idEquals)
  }
}
