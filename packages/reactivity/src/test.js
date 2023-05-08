const proxy = new Proxy({
    name: 'Alice',
    age: 20
}, {
    get (target, key, receive) {
        if (key && key in target) {
            return Reflect.get(target, key, receive)
        }
        return new Error('invalid refference')
    }
})
