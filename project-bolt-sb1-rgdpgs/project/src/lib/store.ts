import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  isAdult: boolean;
}

interface Post {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: Comment[];
  createdAt: Date;
  isAdultContent: boolean;
}

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

interface AppState {
  user: User | null;
  posts: Post[];
  setUser: (user: User | null) => void;
  addPost: (post: Post) => void;
  addComment: (postId: string, comment: Comment) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  posts: [],
  setUser: (user) => set({ user }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  addComment: (postId, comment) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post
      ),
    })),
}));