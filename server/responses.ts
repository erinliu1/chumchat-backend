import { User } from "./app";
import { Entry } from "./app";
import { AlreadyFriendsError, FriendNotFoundError, FriendRequestAlreadyExistsError, FriendRequestDoc, FriendRequestNotFoundError } from "./concepts/friend";
import { PostAuthorNotMatchError, PostDoc } from "./concepts/post";
import { EntryAuthorNotMatchError, EntryDoc } from "./concepts/entry";
import { MessageDoc } from "./concepts/message";
import { ProfileDoc } from "./concepts/profile";
import { Router } from "./framework/router";

/**
 * This class does useful conversions for the frontend.
 * For example, it converts a {@link EntryDoc} into a more readable format for the frontend.
 */
export default class Responses {
  static async profile(profile: ProfileDoc | null) {
    if (!profile) {
      return profile;
    }
    const owner = await User.getUserById(profile.owner);
    return { ...profile, owner: owner.username };
  }

  static async profiles(profiles: ProfileDoc[]) {
    const result = [];
    for (const profile of profiles) {
      result.push(await this.profile(profile));
    }
    return result;
  }

  static async message(message: MessageDoc | null) {
    if (!message) {
      return message;
    }
    const sender = await User.getUserById(message.sender);
    const recipient = await User.getUserById(message.recipient);
    const entry = await this.entry(await Entry.getById(message.content));
    return { ...message, sender: sender.username, recipient: recipient.username, content: entry };
  }

  static async messages(messages: MessageDoc[]) {
    const result = [];
    for (const message of messages) {
      result.push(await this.message(message));
    }
    return result;
  }

  /**
   * Convert PostDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async post(post: PostDoc | null) {
    if (!post) {
      return post;
    }
    const author = await User.getUserById(post.author);
    return { ...post, author: author.username };
  }

  /**
   * Same as {@link post} but for an array of PostDoc for improved performance.
   */
  static async posts(posts: PostDoc[]) {
    const authors = await User.idsToUsernames(posts.map((post) => post.author));
    return posts.map((post, i) => ({ ...post, author: authors[i] }));
  }

  /**
   * Convert EntryDoc into more readable format for the frontend by converting the author id into a username.
   */
  static async entry(entry: EntryDoc | null) {
    if (!entry) {
      return entry;
    }
    const author = await User.getUserById(entry.author);
    return { ...entry, author: author.username };
  }

  /**
   * Same as {@link entry} but for an array of EntryDoc for improved performance.
   */
  static async entries(entries: EntryDoc[]) {
    const authors = await User.idsToUsernames(entries.map((entry) => entry.author));
    return entries.map((entry, i) => ({ ...entry, author: authors[i] }));
  }

  /**
   * Convert FriendRequestDoc into more readable format for the frontend
   * by converting the ids into usernames.
   */
  static async friendRequests(requests: FriendRequestDoc[]) {
    const from = requests.map((request) => request.from);
    const to = requests.map((request) => request.to);
    const usernames = await User.idsToUsernames(from.concat(to));
    return requests.map((request, i) => ({ ...request, from: usernames[i], to: usernames[i + requests.length] }));
  }
}
Router.registerError(EntryAuthorNotMatchError, async (e) => {
  const username = (await User.getUserById(e.author)).username;
  return e.formatWith(username, e._id);
});

Router.registerError(PostAuthorNotMatchError, async (e) => {
  const username = (await User.getUserById(e.author)).username;
  return e.formatWith(username, e._id);
});

Router.registerError(FriendRequestAlreadyExistsError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.from), User.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.user1), User.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(FriendRequestNotFoundError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.from), User.getUserById(e.to)]);
  return e.formatWith(user1.username, user2.username);
});

Router.registerError(AlreadyFriendsError, async (e) => {
  const [user1, user2] = await Promise.all([User.getUserById(e.user1), User.getUserById(e.user2)]);
  return e.formatWith(user1.username, user2.username);
});
