import * as _ from 'lodash'
import Populater, { PopulatePair, PopulateOptions, ResolveHashMap } from '../../utils/populater'

export default abstract class PopulateService<Type, Key> {

  async populate (docs: Object | Object[], paths: PopulatePair[], options: Partial<PopulateOptions> = {}) {
    const populater = new Populater(docs, paths, options)
    const neededIds = _.uniqBy(populater.neededIds, (id: Key) => this.idToString(id))

    const results: Type[] = await this.findNeededObjects(neededIds)

    /**
     * @todo: Maybe optimize this by using a hashmap
     */
    const resolveHashMap: ResolveHashMap = results.reduce((pre: ResolveHashMap, curr) => ({
      ...pre,
      [this.idToString(this.objectToId(curr))]: curr
    }), {})

    populater.resolve(resolveHashMap, this.idToString)
  }

  protected abstract async findNeededObjects (ids: Key[]): Promise<Type[]>
  protected abstract objectToId (obj: Type): Key
  protected abstract idToString (id: Key): string
}
