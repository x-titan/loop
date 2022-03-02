//#region Types
/** @typedef {number} n */
/** @typedef {(timestep: n) => void} _fn */
/**
 * @typedef {{
 * start: boolean,
 * maxOffsetInterval: n,
 * }} _p
 */
//#endregion
const isFunc = fn => typeof fn === "function"
const raf = requestAnimationFrame
export class Loop {
  #key = 0
  #fn = () => void 0
  #update
  /**
   * @param {Function} fn
   * @param {Object} [opt]
   * @param {n} [opt.maxOffsetInterval]
   * @param {boolean} [opt.play]
   */
  constructor(fn, opt) {
    if (!isFunc(fn)) throw new TypeError("Bad argument")
    if (typeof opt !== "object") opt = {}
    const { maxOffsetInterval: max, play } = opt
    let dT = 0, lT = 0
    const m = typeof max === "number" ? max : 40;
    this.#update = fn
    this.#fn = (T = 0) => { this.#key = raf(this.#fn); if ((dT = T - lT) < m) fn(dT / 1000); lT = T }
    if (play) this.play()
  }
  set update(value) { if (isFunc(value)) this.#update = update }
  get update() { return this.#update }
  play() { if (!this.#key) this.#key = raf(this.#fn) }
  pause() {
    if (this.#key) cancelAnimationFrame(this.#key)
    this.#key = 0
  }
  isRunning() { return !!this.#key }
}
export class LoopMachine extends Loop {
  #list
  constructor(fnList = [], opt) {
    const list = []
    if (typeof fnList === "function") fnList = [fnList]
    if(!Array.isArray(fnList)) throw new Error("Bad argument")
    fnList.forEach(x => isFunc(x) && list.push(x))
    super(T => list.forEach(x => x(T)), opt)
    this.#list = list
  }
  set update(value) { if (isFunc(value)) this.#list.push(value) }
  get update() { return [...this.#list] }
  add(fn) {
    this.update = fn
    return this
  }
  has(fn) {
    if (isFunc(fn)) return !!this.#list.indexOf(fn)
    return false
  }
  delete(fn) {
    if (isFunc(fn)) {
      const index = this.#list.indexOf(fn)
      if (index !== -1) this.#list.splice(index, 1)
    }
    return this
  }
  clear() {
    this.#list.length = 0
    return this
  }
}