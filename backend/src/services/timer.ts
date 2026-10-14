export class ExamTimer {
  duration: number
  remaining: number
  interval: Timer | null = null

  constructor(minutes: number) {
    this.duration = minutes * 60
    this.remaining = this.duration
  }

  start(onEnd: () => void) {
    this.interval = setInterval(() => {
      this.remaining--

      console.log("Time Left:", this.remaining)

      if (this.remaining <= 0) {
        clearInterval(this.interval!)
        onEnd()
      }
    }, 1000)
  }
}
