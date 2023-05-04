import { createDep } from "./dep";

let shouldTrack = false;
let activeEffect = void 0;
const targetMap = new WeakMap();

export function isTracking() {
    return shouldTrack && activeEffect !== undefined
}
// @ts-ignore
export function track(target, type, key) {
    if (!isTracking()) return
    console.log(`触发track --> target: ${target}, type: ${type}, key: ${key}`)

    let depsMap = targetMap.get(target);
    if(!depsMap) {
        // 初始化depsMap
        depsMap = new Map()
        targetMap.set(target,depsMap)
    }

    let dep = depsMap.get(key);

    if (!dep) {
        dep = createDep();
        depsMap.set(key, dep)
    }
    trackEffects(dep)
}

// @ts-ignore
export function trackEffects (dep) {
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect)
        (activeEffect as any).deps.push(dep)
    }
}