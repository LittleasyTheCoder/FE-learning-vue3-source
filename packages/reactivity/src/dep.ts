// store all the effect objects
// @ts-ignore
export function createDep (effects?) {
    const dep = new Set(effects)
    return dep
}