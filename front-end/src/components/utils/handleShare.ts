interface handleShareProps {
  postId: string;
  setLinkCopied: React.Dispatch<React.SetStateAction<boolean>>;
}

const handleShare = async ({ postId, setLinkCopied }: handleShareProps) => {
  console.log(`Shared post ${postId}`);
  const postUrl = `${window.location.origin}/posts/${postId}`;

  try {
    await navigator.clipboard.writeText(postUrl);
    setLinkCopied(true);

    setTimeout(() => setLinkCopied(false), 2000); // Reset after 2 seconds
  } catch (error) {
    console.error("Failed to copy link: ", error);
  }
};

export default handleShare;
