
const get = createGetter()
const set = createSetter()


function isObject (val) {
	return val !== null && typeof val === "object"
}
function createGetter() {
	return function get(target, key, receiver) {
		const result = Reflect.get(target,key, receiver)
		// console.log('执行了get')

		// 收集依赖
		track(target);

		if (isObject(result)) {
			return reactive(result)
		}
		return result
	}
}

function createSetter () {
	return function set(target, key, value, receiver) {
		const result = Reflect.set(target, key, value, receiver)
		// console.log('执行了set')
		trigger(target,key);
		return result
	}
}


const mutableHandlers = {
	get,
	set
}

function createReactiveObject(target, handlers) {
	const proxy = new Proxy(target, handlers)

	return proxy
}

function reactive (target) {
	return createReactiveObject(target, mutableHandlers)
}


// result.profile.age = 10
// console.log(result)


// console.log('---------------------')
// result.profile.child = 'Danana'
// console.log(result)

// 上面实现了对数据的监听


// 收集依赖

// 数据结构
// targetMap: WeakMap<target, depsMap: Map<key, deps: Set<T: effectsType>>>


const targetMap = new WeakMap();
let activeEffect = void 0;


function track(target,key) {
	if (activeEffect === undefined) return;

	var depsMap = targetMap.get(target);
	if (!depsMap) {
		depsMap = new Map();
		targetMap.set(target, depsMap);
	}

	var dep = depsMap.get(key);
	if (!dep) {
		dep = new Set();
		depsMap.set(key, dep);
	}


    // 副作用函数effect
	if (!dep.has(activeEffect)) {
		dep.add(activeEffect);
		activeEffect.deps.push(dep);
	}

}

// publish 发布

// 修改对象，执行副作用函数
// target ----通过target，找到depsMap, depsMap中通过key，找到dep，dep是这个key对应的副作用函数的集合
function trigger (target, key) {
	const depsMap = targetMap.get(target);
	if (!depsMap) return;
	const dep = depsMap.get(key); // dep: Set<effects>
	console.log(depsMap)


	// 这里为啥要定义一个新的effects，将dep中的副作用函数都放到effects中呢，
	// 为啥不直接执行
	const effects = new Set();


	const add = effectsToAdd =>{
		if (effectsToAdd && effectsToAdd.iterator) {
			effectsToAdd.forEach(effect=>{
				effects.add(effect)
			})
		}
		
	}

	add(dep)

	// 执行副作用函数
	const run = effect => {
		effect()
	}
	effects.forEach(run)

}



/**
 * 监测响应式对象并执行对应的副作用函数
 * @param {*} effect 副作用函数
 */
function watchEffect(effect){
    return doWatch(effect);
}

function doWatch(fn){
    // 包装处理
    const getter = () => {
        // 永远不要相信程序员的代码不会报错
        return callWithErrorHandling(fn);
    }
    // 执行器
    const runner = effect(getter);
    // 立即执行一次以收集依赖
    runner();
    // 返回一个函数以清除副作用函数 --- 清除effect.deps中的所有effect
    return ()=>{
        stop(runner)
    }
}

// 执行函数并对报错进行处理
function callWithErrorHandling(fn){
    var res;
    try {
        res = fn();


    } catch (error) {
        // 报错处理
        // throw new Error(error);
        console.log('error')
    }
    return res;
}

/**
 * 创建effect
 * @param {*} fn 函数
 */
function effect(fn){
    const effect = createReactiveEffect(fn);
    return effect;
}

// effect标识id
let uid = 0;

function createReactiveEffect(fn){
    const effect = function reactiveEffect(){
        try {
            activeEffect = effect;
            return fn();
        } finally {
            // 及时释放，避免造成污染
            activeEffect = undefined;
        }
    }
    // 标识
    effect.id = uid++;
    // 被收集在set的数组，以便清除
    effect.deps = []
    return effect;
}


function stop(effect){
    cleanup(effect)
}

// 清除副作用函数
function cleanup(effect){
    const { deps } = effect;
    if(deps.length){
        for(var i =0; i<deps.length; i++){
            deps[i].delete(effect)
        }
    }
}

// var result = reactive({
// 	name: 'Alice',
// 	profile: {
// 		age: 20,
// 		child: 'Cathy'
// 	}
// })
// result.name = 'David'
// result.name = 'Dave'
