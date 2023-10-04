import FriendConcept from "./concepts/friend";
import PostConcept from "./concepts/post";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";
import EntryConcept from "./concepts/entry";
import MessageConcept from "./concepts/message";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Entry = new EntryConcept();
export const Message = new MessageConcept();
