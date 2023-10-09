import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface MessageDoc extends BaseDoc {
  sender: ObjectId;
  recipient: ObjectId;
  content: ObjectId;
}

export default class MessageConcept {
  public readonly messages = new DocCollection<MessageDoc>("messages");

  async sendMessage(sender: ObjectId, recipient: ObjectId, content: ObjectId) {
    if (sender.equals(recipient)) {
      throw new NotAllowedError(`You cannot send a message to yourself!`);
    }
    const _id = await this.messages.createOne({ sender, recipient, content });
    const message = await this.messages.readOne({ _id });
    return { msg: "Message successfully sent!", message: message };
  }

  async getSentMessages(sender: ObjectId) {
    return this.getMessages({ sender });
  }

  async getReceivedMessages(recipient: ObjectId) {
    return this.getMessages({ recipient });
  }

  async getMessages(query: Filter<MessageDoc>) {
    const messages = await this.messages.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return messages;
  }
}
