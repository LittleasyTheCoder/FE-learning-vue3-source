import { extend } from "../../shared/src/index";
import { createDep } from "./dep";

let shouldTrack = false;
let activeEffect = void 0;
const targetMap = new WeakMap();

export function isTracking() {
    return shouldTrack && activeEffect !== undefined
}

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

// 用于依赖收集
export class ReactiveEffect {
    active = true;
    deps = [];
    public onStop?: () => void;
    constructor(public fn, public scheduler?) {
      console.log("创建 ReactiveEffect 对象");
    }
  
    run() {
      console.log("run");
      // 运行 run 的时候，可以控制 要不要执行后续收集依赖的一步
      // 目前来看的话，只要执行了 fn 那么就默认执行了收集依赖
      // 这里就需要控制了
  
      // 是不是收集依赖的变量
  
      // 执行 fn  但是不收集依赖
      if (!this.active) {
        return this.fn();
      }
  
      // 执行 fn  收集依赖
      // 可以开始收集依赖了
      shouldTrack = true;
  
      // 执行的时候给全局的 activeEffect 赋值
      // 利用全局属性来获取当前的 effect
      activeEffect = this as any;
      // 执行用户传入的 fn
      console.log("执行用户传入的 fn");
      const result = this.fn();
      // 重置
      shouldTrack = false;
      activeEffect = undefined;
  
      return result;
    }
  
    stop() {
      if (this.active) {
        // 如果第一次执行 stop 后 active 就 false 了
        // 这是为了防止重复的调用，执行 stop 逻辑
        cleanupEffect(this);
        if (this.onStop) {
          this.onStop();
        }
        this.active = false;
      }
    }
  }

  function cleanupEffect(effect) {
    // 找到所有依赖这个 effect 的响应式对象
    // 从这些响应式对象里面把 effect 给删除掉
    effect.deps.forEach((dep) => {
      dep.delete(effect);
    });
  
    effect.deps.length = 0;
  }

  export function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn);
  
    // 把用户传过来的值合并到 _effect 对象上去
    // 缺点就是不是显式的，看代码的时候并不知道有什么值
    extend(_effect, options);
    _effect.run();
  
    // 把 _effect.run 这个方法返回
    // 让用户可以自行选择调用的时机（调用 fn）
    const runner: any = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
  }
  
  export function stop(runner) {
    runner.effect.stop();
  }