export type ExamState =
  | "PREPARATION"
  | "INTRODUCTION"
  | "USER_SPEECH"
  | "INVIGILATOR_QUESTIONS"
  | "PARTNER_SPEECH"
  | "USER_TO_PARTNER"
  | "DEBATE"
  | "EVALUATION"
  | "COMPLETED"

export class ExamEngine {
  state: ExamState = "PREPARATION"

  next() {
    switch (this.state) {
      case "PREPARATION":
        this.state = "INTRODUCTION"
        break

      case "INTRODUCTION":
        this.state = "USER_SPEECH"
        break

      case "USER_SPEECH":
        this.state = "INVIGILATOR_QUESTIONS"
        break

      case "INVIGILATOR_QUESTIONS":
        this.state = "PARTNER_SPEECH"
        break

      case "PARTNER_SPEECH":
        this.state = "USER_TO_PARTNER"
        break

      case "USER_TO_PARTNER":
        this.state = "DEBATE"
        break

      case "DEBATE":
        this.state = "EVALUATION"
        break

      case "EVALUATION":
        this.state = "COMPLETED"
        break
    }

    return this.state
  }
}
