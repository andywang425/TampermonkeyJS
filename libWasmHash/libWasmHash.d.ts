interface InitOutput {
  readonly memory: WebAssembly.Memory
  readonly hash: (a: number, b: number, c: number, d: number, e: number) => void
  readonly __wbindgen_export_0: WebAssembly.Global
  readonly __wbindgen_malloc: (a: number) => number
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number
  readonly __wbindgen_free: (a: number, b: number) => void
}
export { InitOutput }