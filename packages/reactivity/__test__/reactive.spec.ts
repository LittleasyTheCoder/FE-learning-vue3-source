import { reactive } from '../src/reactive';


describe("reactive", ()=>{
  test("object", ()=>{
    const originalObj = {"name": "Alice"};
    const reactiveObj = reactive(originalObj)
    expect(reactiveObj).not.toBe(originalObj)
  })
})
