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

export function convert(value) {
    return isObject(value) ? reactive(value) : value
}

export function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep)
    }
}
export function triggerRefValue (ref) {
    triggerEffects(ref.dep)
}
export function ref(value) {
    return createRef(value)
}

export function createRef(value) {
    const refImpl = new RefImpl(value)
    return refImpl
}

export function unRef (val) {
    return isRef(val) ? val.value : val
}

export function isRef (val) {
    return !!val.__v_isRef
}