import { createDep } from './dep';
import { reactive } from './reactive';
import { isTracking, trackEffects, triggerEffects } from './effect';
import { hasChanged, isObject } from '../../shared/src/index';

export class RefImpl {
    private _rawValue: any;
    private _value: any;
    public dep;
    public __v_isRef = true;

    constructor(value) {
        this._rawValue = value;
        this._value = convert(value);
        this.dep = createDep()
    }

    get value() {
        // 依赖收集
        trackRefValue(this)
        return this._value
    }

    set value(newValue) {
        if (hasChanged(newValue, this._rawValue)) {
            this._value = convert(newValue);
            this._rawValue = newValue;
            // 触发依赖
            triggerRefValue(this)
        }
    }
}

// value如果是一个对象的话，使用reactive进行包装，否则直接返回
export function convert(value) {
    return isObject(value) ? reactive(value) : value
}

export function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep)
    }
}
export function triggerRefValue(ref) {
    triggerEffects(ref.dep)
}
export function ref(value) {
    return createRef(value)
}

export function createRef(value) {
    const refImpl = new RefImpl(value)
    return refImpl
}
// 这里没有处理 objectWithRefs 是 reactive 类型的时候
// TODO reactive 里面如果有 ref 类型的 key 的话， 那么也是不需要调用 ref.value 的
// （but 这个逻辑在 reactive 里面没有实现）
export function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
// 这个函数的目的是
// 帮助解构 ref
// 比如在 template 中使用 ref 的时候，直接使用就可以了
// 例如： const count = ref(0) -> 在 template 中使用的话 可以直接 count
// 解决方案就是通过 proxy 来对 ref 做处理

const shallowUnwrapHandlers = {
    get(target, key, receiver) {
        // 如果里面是一个 ref 类型的话，那么就返回 .value
        // 如果不是的话，那么直接返回value 就可以了
        return unRef(Reflect.get(target, key, receiver));
    },
    set(target, key, value, receiver) {
        const oldValue = target[key];
        if (isRef(oldValue) && !isRef(value)) {
            return (target[key].value = value);
        } else {
            return Reflect.set(target, key, value, receiver);
        }
    },
};
export function unRef(val) {
    return isRef(val) ? val.value : val
}

export function isRef(val) {
    return !!val.__v_isRef
}