import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface EntryDoc extends BaseDoc {
  author: ObjectId;
  prompt: string;
  response: string;
}

export default class EntryConcept {
  public readonly entries = new DocCollection<EntryDoc>("entries");

  async addEntry(author: ObjectId, prompt: string, response: string) {
    const _id = await this.entries.createOne({ author, prompt, response });
    return { msg: "Entry successfully created!", entry: await this.entries.readOne({ _id }) };
  }

  async getEntries(query: Filter<EntryDoc>) {
    const entries = await this.entries.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return entries;
  }

  async getByAuthor(author: ObjectId) {
    return this.getEntries({ author });
  }

  async getById(_id: ObjectId) {
    const entry = await this.entries.readOne({ _id });
    if (entry === null) {
      throw new NotFoundError(`Entry ${_id} does not exist!`);
    }
    return entry;
  }

  async removeEntry(entryId: ObjectId) {
    await this.entries.deleteOne({ _id: entryId });
    return { msg: "Entry deleted successfully!" };
  }

  async editEntry(entryId: ObjectId, response: string) {
    this.sanitizeUpdate({ response });
    await this.entries.updateOne({ _id: entryId }, { response });
    return { msg: "Entry response edited successfully!", entry: await this.getById(entryId) };
  }

  async isAuthor(user: ObjectId, _id: ObjectId) {
    const entry = await this.entries.readOne({ _id });
    if (!entry) {
      throw new NotFoundError(`Entry ${_id} does not exist!`);
    }
    if (entry.author.toString() !== user.toString()) {
      throw new EntryAuthorNotMatchError(user, _id);
    }
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
