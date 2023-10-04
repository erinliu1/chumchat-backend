import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface EntryDoc extends BaseDoc {
  author: ObjectId;
  prompt: string; // Assuming that 'prompt' will be randomly generated from another databse
  response: string;
}

export default class EntryConcept {
  public readonly entries = new DocCollection<EntryDoc>("entries");

  // Create a new journal entry for a specified author with a prompt and the provided response.
  async addEntry(author: ObjectId, response: string) {
    const prompt = await this.fetchPrompt(); // Fetch a prompt
    const _id = await this.entries.createOne({ author, prompt, response });
    return { msg: "Entry successfully created!", entry: await this.entries.readOne({ _id }) };
  }

  // Fetch a prompt from a separate database TBD
  async fetchPrompt() {
    // TBD need to figure out how to retrieve journal prompts from another databse
    // Return the fetched prompt.
    const prompt = "This is a placeholder prompt... i'll figure out how to retrieve real prompts later";
    return prompt;
  }

  // Helper function to return entries based on a filter
  private async getEntries(query: Filter<EntryDoc>) {
    const entries = await this.entries.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return entries;
  }

  // Get entries by author
  async getEntriesByAuthor(author: ObjectId) {
    const query: Filter<EntryDoc> = { author };
    return this.getEntries(query);
  }

  // Remove an entry
  async removeEntry(entryId: ObjectId) {
    await this.entries.deleteOne({ _id: entryId });
    return { msg: "Entry deleted successfully!" };
  }

  // Edit an entry's response
  async editEntry(entryId: ObjectId, response: string) {
    this.sanitizeUpdate({ response });
    await this.entries.updateOne({ _id: entryId }, { response });
    return { msg: "Entry response edited successfully!" };
  }

  private sanitizeUpdate(update: Partial<EntryDoc>) {
    // Make sure the update cannot change the prompt or the author.
    const allowedUpdates = ["response"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}

export class EntryAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of entry {1}!", author, _id);
  }
}
