//#region Types
/** @typedef {(timestep: number) => void} _fn */
//#endregion
const isFunc = fn => typeof fn === "function"
const raf = requestAnimationFrame
export class Loop {
  #key = 0
  #fn = () => void 0
  #update
  /**
   * @param {_fn} fn
   * @param {Object} [opt]
   * @param {number} [opt.maxOffsetInterval]
   * @param {boolean} [opt.play]
   */
  constructor(fn, opt) {
    if (!isFunc(fn)) throw new TypeError("Bad argument")
    if (typeof opt !== "object") opt = {}
    const { maxOffsetInterval: max, play } = opt
    let dT = 0, lT = 0
    const m = typeof max === "number" ? max : 40;
    this.#update = fn
    this.#fn = (T = 0) => {
      this.#key = raf(this.#fn)
      if ((dT = T - lT) < m)
        fn(dT / 1000)
      lT = T
    }
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
    if (!Array.isArray(fnList)) throw new Error("Bad argument")
    fnList.forEach(x => isFunc(x) && list.push(x))
    super(T => list.forEach(x => x(T)), opt)
    this.#list = list
  }
  /** @param {_fn} value */
  add(value) {
    if (isFunc(value)) this.#list.push(value)
    return this
  }
  /** @param {_fn} value */
  has(value) {
    if (isFunc(value)) return !!this.#list.indexOf(value)
    return false
  }
  /** @param {_fn} value */
  delete(value) {
    if (isFunc(value)) {
      const index = this.#list.indexOf(value)
      if (index !== -1) this.#list.splice(index, 1)
    }
    return this
  }
  clear() {
    this.#list.length = 0
    return this
  }
}