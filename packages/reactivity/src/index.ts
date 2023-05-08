import { reactive } from "./reactive"

const proxy1 = reactive({"name": "Alice"})
console.log(`proxy1: ${JSON.stringify(proxy1)}`)