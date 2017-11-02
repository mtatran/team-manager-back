// import * as _ from 'lodash'
// import Populater, { PopulatePair, PopulateOptions } from '../../utils/populater'

// export default abstract class PopulateService<Type, Key> {
//   abstract async findNeededObjects (ids: Key[]): Promise<Type[]>
//   abstract idToString (id: Key): string

//   async populate (docs: Object | Object[], paths: PopulatePair[], options: Partial<PopulateOptions> = {}) {
//     const populater = new Populater(docs, paths, options)
//     const neededIds = _.uniqBy(populater.neededIds, (id: Key) => this.idToString(id))

//     const results: Type[] = await this.findNeededObjects(neededIds)

//     /**
//      * @todo: Maybe optimize this by using a hashmap
//      */
//     // const resolveObjectArray: ResolveObjects[] = results.map(res => ({
//     //   id: res.id,
//     //   payload: res
//     // }))

//     // populater.resolve(resolveObjectArray, (a: ObjectID, b: ObjectID) => a.equals(b))
//   }
// }
