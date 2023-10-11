export default class PromptConcept {
  public readonly prompts = [
    "this is prompt 1",
    "this is prompt 2",
    "this is prompt 3",
    "this is prompt 4",
    "this is prompt 5",
    "this is prompt 6",
    "this is prompt 7",
    "this is prompt 8",
    "this is prompt 9",
    "this is prompt 10",
  ];

  async getRandomPrompt() {
    const randomIndex = Math.floor(Math.random() * this.prompts.length);
    return this.prompts[randomIndex];
  }
}
