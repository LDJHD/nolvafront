export function accountDisplayName(user: any): string {
  if (!user) return "Mon compte";

  if (user.role === "provider") {
    const provider = user.serviceProvider || user.service_provider;
    const businessName = provider?.businessName || provider?.business_name;
    if (businessName) return businessName;
  }

  const fullName = [user.firstName || user.first_name, user.lastName || user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.firstName || user.first_name || "Mon compte";
}
