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
    // 存储创建完成的proxy到相应的weakMap中，如reactiveMap等
    proxyMap.set(target, proxy)
    return proxy
}

export function isProxy(value) {
    return isReactive(value) || isReadonly(value)
}

export function isReactive(value) {
    // 如果 value 是 proxy 的话
    // 会触发 get 操作，而在 createGetter 里面会判断
    // 如果 value 是普通对象的话
    // 那么会返回 undefined ，那么就需要转换成布尔值
    return !!value[ReactiveFlags.IS_REACTIVE]
}
export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY]
}


// mini-vue原作者在此处表示和原vue源码实现不同
export function toRaw(value) {
    if (!value[ReactiveFlags.RAW]) return value
    // 如果是proxy的话，触发createGetter，返回原对象
    return value[ReactiveFlags.RAW]
}