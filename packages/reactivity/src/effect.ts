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
    if (!depsMap) {
        // 初始化depsMap
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key);

    if (!dep) {
        dep = createDep();
        depsMap.set(key, dep)
    }
    trackEffects(dep)
}

export function trackEffects(dep) {
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect);
        (activeEffect as any).deps.push(dep)
    }
}

export function trigger(target, type, key) {
    let deps: Array<any> = [];

    const depsMap = targetMap.get(target);
    if (!depsMap) return
    const dep = depsMap.get(key);
    deps.push(dep);
    const effects: Array<any> = [];
    deps.map(value => {
        // ???这里解构 dep 得到的是 dep 内部存储的 effect
        effects.push(...value)
    })
    triggerEffects(createDep(effects))
}

export function triggerEffects(dep) {
    for (const effect of dep) {
        // scheduler 可以让用户自己选择调用的时机
        // 这样就可以灵活的控制调用了
        // 在 runtime-core 中，就是使用了 scheduler 实现了在 next ticker 中调用的逻辑
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}