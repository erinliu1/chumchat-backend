import { Filter, ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

// T is the generic type parameter for the content that messages will send
export interface MessageDoc<T> extends BaseDoc {
  sender: ObjectId;
  recipient: ObjectId;
  content: T;
}

export default class MessageConcept<T> {
  public readonly messages = new DocCollection<MessageDoc<T>>("messages");

  async sendMessage(sender: ObjectId, recipient: ObjectId, content: T) {
    const _id = await this.messages.createOne({ sender, recipient, content });
    const message = await this.messages.readOne({ _id });
    return { msg: "Message successfully sent!", message };
  }

  async getSentMessages(sender: ObjectId) {
    const query: Filter<MessageDoc<T>> = { sender };
    return this.getMessages(query);
  }

  async getReceivedMessages(recipient: ObjectId) {
    const query: Filter<MessageDoc<T>> = { recipient };
    return this.getMessages(query);
  }

  private async getMessages(query: Filter<MessageDoc<T>>) {
    const messages = await this.messages.readMany(query);
    return messages;
  }
}
