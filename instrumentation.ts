export async function register() {
  const origError = console.error
  console.error = (...args: any[]) => {
    const first = args[0]
    const msg = typeof first === "string" ? first : ""
    if (
      msg.includes("Invalid source map") ||
      msg.includes("sourceMapURL could not be parsed") ||
      msg.includes("baseline-browser-mapping")
    ) {
      return
    }
    origError(...args)
  }
}
