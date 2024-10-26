export interface userObj {
  id: string;
  profileImage: string;
  name: string;
  username: string;
  bio?: string;
  _count: {
    followers: number;
    followings: number;
  };
}

export interface PostType {
  id: string;
  content: string;
  author: {
    name: string;
    profileImage: string;
    id: string;
  };
  img_url?: string;
  createdAt: string;
  updatedAt: string;
  _count: { likes: number; comments: number };
  shareCount?: number;
  onLike: () => void; // Function to handle liking the post
  onShare: () => void; // Function to handle sharing the post
  isDarkMode: boolean;
  isLikedByUser: boolean;
}

// export interface SidebarProps {
//   selectedPage: string;
//   setSelectedPage: (page: string) => void;
// }

export interface Person {
  id: string;
  name: string;
  username: string;
  profileImage: string | null; // Since profileImage can be null
}

export interface Message {
  sender_id: string;
  reciever_id: string;
  content: string;
  createdAt: Date;
}
