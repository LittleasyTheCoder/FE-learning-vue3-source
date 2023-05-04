import { isObject } from '../../shared/src';
import { track } from './effect';
import { reactive, ReactiveFlags, reactiveMap, readonly, readonlyMap, shallowReadonlyMap } from './reactive';

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        const isExistInReactiveMap = () => key === ReactiveFlags.RAW && receiver === reactiveMap.get(target)
        const isExistInReadonlyMap = () => key === ReactiveFlags.RAW && receiver === readonlyMap.get(target)
        const isExistInShallowReadonlyMap = () => key === ReactiveFlags.RAW && receiver === shallowReadonlyMap.get(target)

        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        } else if (isExistInReactiveMap() || isExistInReadonlyMap() || isExistInShallowReadonlyMap()) {
            return target
        }
        const res = Reflect.get(target, key, receiver)

        if (!isReadonly) {
            // 依赖收集
            track(target, "get", key)
        }
        if (shallow) {
            return res
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res)
        }
        return res
    }
}
function createSetter() {

}
export const mutableHandlers = {
    get,
    set
}

export const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`Set operation on "${String(key)}" failed: target is readonly`);
        return true
    }
}
export const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set(target, key) {
        console.warn(`Set operation on "${String(key)}" failed: target is readonly`);
        return true
    }
}