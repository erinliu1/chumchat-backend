import FriendConcept from "./concepts/friend";
import PostConcept from "./concepts/post";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";
import EntryConcept from "./concepts/entry";
import PromptConcept from "./concepts/prompt";
import MessageConcept from "./concepts/message";
import ProfileConcept from "./concepts/profile";
import VisibilityConcept from "./concepts/visibility";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Entry = new EntryConcept();
export const Prompt = new PromptConcept();
export const Message = new MessageConcept();
export const Profile = new ProfileConcept();
export const Visibility = new VisibilityConcept();
