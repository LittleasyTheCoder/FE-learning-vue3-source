
import { isObject } from '../../../oldpackages/packages/shared/src/index';
import { track, trigger } from './effect';
import { reactive, ReactiveFlags, reactiveMap, readonly, readonlyMap, shallowReadonlyMap } from './reactive';

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {

        // 这部分代码用于./reactive.ts中的toRaw方法，返回原始对象
        const isExistInReactiveMap = () => key === ReactiveFlags.RAW && receiver === reactiveMap.get(target)
        const isExistInReadonlyMap = () => key === ReactiveFlags.RAW && receiver === readonlyMap.get(target)
        const isExistInShallowReadonlyMap = () => key === ReactiveFlags.RAW && receiver === shallowReadonlyMap.get(target)

        // 这部分的代码用于判断某个对象是不是reactive或者readonly，详见./reactive中的方法isReactive()等
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        } else if (isExistInReactiveMap() || isExistInReadonlyMap() || isExistInShallowReadonlyMap()) {
            return target
        }
        // 这部分的代码用于判断某个对象是不是reactive或者readonly，详见./reactive中的方法isReactive()等
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
    return function (target, key, value, receiver) {
        const result = Reflect.set(target, key, value, receiver)
        trigger(target, "set", key)
        return result
    }
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