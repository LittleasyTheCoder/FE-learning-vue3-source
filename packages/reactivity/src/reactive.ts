import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers';


export const enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive",
    IS_READONLY = "__v_isReadonly",
    RAW = "__v_raw",
}

export const reactiveMap = new WeakMap()
export const readonlyMap = new WeakMap()
export const shallowReadonlyMap = new WeakMap()

export function reactive(target) {
    return createReactiveObject(target, reactiveMap, mutableHandlers)
}
export function readonly(target) {
    return createReactiveObject(target, readonlyMap, readonlyHandlers)
}
export function shallowReadonly(target) {
    return createReactiveObject(target, shallowReadonlyMap, shallowReadonlyHandlers)
}
function createReactiveObject(target, proxyMap, baseHandler) {

    const existingProxyMap = proxyMap.get(target);
    if (existingProxyMap) return existingProxyMap;

    const proxy = new Proxy(target, baseHandler)
    proxyMap.set(target, proxy)
    return proxy
}