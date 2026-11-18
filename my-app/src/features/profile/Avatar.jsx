export default function Avatar({ user, size = "large" }) {
  const className = size === "small" ? "avatar small" : "avatar";

  if (user?.avatar) {
    return <img className={className} src={user.avatar} alt={`${user.name}'s avatar`} />;
  }
  return <span className={className}>{user?.name?.[0]?.toUpperCase() ?? "?"}</span>;
}